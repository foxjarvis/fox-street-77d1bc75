/* Chart engine + simulated data. Every chart on this site is SIMULATED unless a lesson says otherwise. */
const UP="#26dfa3",DN="#ff5d7c";
function RNG(seed){let s=(seed>>>0)||1;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
function gauss(r){let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
const fmt=(n,d=2)=>Number(n).toLocaleString(undefined,{minimumFractionDigits:d,maximumFractionDigits:d});

/* a candle series that follows waypoints: pts=[price,...], per=candles per leg */
function legs(pts,{per=8,noise=1.2,wick=.8,seed=1,vol=1000}={}){
  const r=RNG(seed),out=[];let prev=pts[0];
  for(let l=0;l<pts.length-1;l++){
    const a=pts[l],b=pts[l+1],n=Array.isArray(per)?per[l]:per;
    for(let k=1;k<=n;k++){
      const tgt=a+(b-a)*k/n,c=tgt+gauss(r)*noise,o=prev;
      const h=Math.max(o,c)+Math.abs(gauss(r))*wick,lo=Math.min(o,c)-Math.abs(gauss(r))*wick;
      out.push({o,h,l:lo,c,v:Math.round(vol*(.5+r())*(1+Math.abs(c-o)/(noise+.5)))});prev=c;
    }
  }
  return out;
}
function walk(n,{start=100,drift=0,vol=1,wick=.6,seed=1,volume=1000}={}){
  const r=RNG(seed),out=[];let p=start;
  for(let i=0;i<n;i++){
    const o=p,c=o+drift+gauss(r)*vol;
    const h=Math.max(o,c)+Math.abs(gauss(r))*vol*wick,l=Math.min(o,c)-Math.abs(gauss(r))*vol*wick;
    out.push({o,h,l,c,v:Math.round(volume*(.5+r())*(1+Math.abs(c-o)/vol))});p=c;
  }
  return out;
}
function aggregate(cs,k){const out=[];for(let i=0;i<cs.length;i+=k){const g=cs.slice(i,i+k);if(!g.length)break;out.push({o:g[0].o,h:Math.max(...g.map(x=>x.h)),l:Math.min(...g.map(x=>x.l)),c:g[g.length-1].c,v:g.reduce((a,x)=>a+x.v,0)})}return out}
function sma(cs,n){return cs.map((_,i)=>i<n-1?null:cs.slice(i-n+1,i+1).reduce((a,x)=>a+x.c,0)/n)}
function vwapSeries(cs){let pv=0,vv=0;return cs.map(x=>{const tp=(x.h+x.l+x.c)/3;pv+=tp*x.v;vv+=x.v;return pv/vv})}

class Chart{
  constructor(canvas,opt={}){
    this.cv=canvas;this.ctx=canvas.getContext("2d");this.h=opt.height||260;this.pad=Object.assign({l:8,r:58,t:14,b:22},opt.pad||{});
    this.candles=[];this.timeLabels=null;this.vlines=[];this.levels=[];this.boxes=[];this.markers=[];this.lines=[];this.hover=-1;this.onClick=null;this.vol=!!opt.volume;this.title="";
    const redraw=()=>this.draw();
    new ResizeObserver(redraw).observe(canvas);
    const idx=e=>{const r=canvas.getBoundingClientRect(),x=(e.touches?e.touches[0].clientX:e.clientX)-r.left,y=(e.touches?e.touches[0].clientY:e.clientY)-r.top;return{i:this.idxAt(x),price:this.priceAt(y),x,y}};
    canvas.addEventListener("mousemove",e=>{this.hover=idx(e).i;this.draw()});
    canvas.addEventListener("mouseleave",()=>{this.hover=-1;this.draw()});
    canvas.addEventListener("click",e=>{if(this.onClick){const p=idx(e);this.onClick(p.i,p.price)}});
    canvas.addEventListener("touchstart",e=>{this.hover=idx(e).i;this.draw()},{passive:true});
  }
  set(candles,o={}){this.timeLabels=o.times||null;this.vlines=o.vlines||[];this.candles=candles;this.levels=o.levels||[];this.boxes=o.boxes||[];this.markers=o.markers||[];this.lines=o.lines||[];this.title=o.title||"";this.hover=-1;this.draw();return this}
  geo(){
    const W=this.cv.clientWidth||600,H=this.h,p=this.pad,cs=this.candles;
    let hi=-1e9,lo=1e9;
    cs.forEach(c=>{if(c.ghost)return;hi=Math.max(hi,c.h);lo=Math.min(lo,c.l)});
    this.levels.forEach(l=>{if(l.y!=null&&!l.noscale){hi=Math.max(hi,l.y);lo=Math.min(lo,l.y)}});
    this.boxes.forEach(b=>{hi=Math.max(hi,b.y0,b.y1);lo=Math.min(lo,b.y0,b.y1)});
    if(hi<lo){hi=1;lo=0}const m=(hi-lo)*.08||1;hi+=m;lo-=m;if(this.fixed){hi=this.fixed.hi;lo=this.fixed.lo}
    const volH=this.vol?46:0;
    return{W,H,p,hi,lo,plotH:H-p.t-p.b-volH,volH,n:Math.max(cs.length,1),bw:(W-p.l-p.r)/Math.max(cs.length,1)};
  }
  xAt(i,g){return g.p.l+(i+.5)*g.bw}
  yAt(v,g){return g.p.t+(g.hi-v)/(g.hi-g.lo)*g.plotH}
  idxAt(x){const g=this.geo();return Math.max(0,Math.min(this.candles.length-1,Math.floor((x-g.p.l)/g.bw)))}
  priceAt(y){const g=this.geo();return g.hi-(y-g.p.t)/g.plotH*(g.hi-g.lo)}
  draw(){
    const cv=this.cv,dpr=window.devicePixelRatio||1,g=this.geo();
    cv.style.height=g.H+"px";cv.width=Math.round(g.W*dpr);cv.height=Math.round(g.H*dpr);
    const c=this.ctx;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,g.W,g.H);
    // grid + axis
    c.font="11px ui-monospace,Menlo,Consolas,monospace";c.textBaseline="middle";
    const steps=5;
    for(let k=0;k<=steps;k++){const v=g.lo+(g.hi-g.lo)*k/steps,y=this.yAt(v,g);c.strokeStyle="#1a2c47";c.lineWidth=1;c.beginPath();c.moveTo(g.p.l,y);c.lineTo(g.W-g.p.r,y);c.stroke();c.fillStyle="#6f86a8";c.textAlign="left";c.fillText(fmt(v,v>1000?0:2),g.W-g.p.r+6,y)}
    // time axis and vertical markers
    if(this.timeLabels){c.fillStyle="#6f86a8";c.textAlign="center";let lastX=-99;this.candles.forEach((k,i)=>{const lab=this.timeLabels[i];if(!lab)return;const x=this.xAt(i,g);if(x-lastX<54)return;lastX=x;c.strokeStyle="#16273f";c.beginPath();c.moveTo(x,g.p.t);c.lineTo(x,g.H-g.p.b-g.volH);c.stroke();c.fillText(lab,x,g.H-6)})}
    this.vlines.forEach(v=>{if(v.i<0||v.i>=this.candles.length)return;const x=this.xAt(v.i,g);c.strokeStyle=v.color||"#ffffff55";c.setLineDash([4,4]);c.beginPath();c.moveTo(x,g.p.t);c.lineTo(x,g.H-g.p.b-g.volH);c.stroke();c.setLineDash([]);if(v.label){c.fillStyle=v.color||"#9fb4d1";c.textAlign="left";c.fillText(v.label,x+4,g.p.t+8)}});
    // boxes
    this.boxes.forEach(b=>{const x0=this.xAt(b.i0,g)-g.bw/2,x1=b.i1==null?g.W-g.p.r:this.xAt(b.i1,g)+g.bw/2,y0=this.yAt(Math.max(b.y0,b.y1),g),y1=this.yAt(Math.min(b.y0,b.y1),g);
      c.fillStyle=b.color||"#5aa9ff33";c.fillRect(x0,y0,x1-x0,y1-y0);if(b.stroke){c.strokeStyle=b.stroke;c.lineWidth=1;c.strokeRect(x0,y0,x1-x0,y1-y0)}
      if(b.label){c.fillStyle=b.text||"#cfe0ff";c.textAlign="left";c.fillText(b.label,x0+5,y0+10)}});
    // volume
    if(this.vol){const mv=Math.max(...this.candles.map(x=>x.v),1);this.candles.forEach((k,i)=>{const h=k.v/mv*(g.volH-6);c.fillStyle=k.c>=k.o?"#26dfa355":"#ff5d7c55";c.fillRect(this.xAt(i,g)-g.bw*.35,g.H-g.p.b-h,g.bw*.7,h)})}
    // candles
    this.candles.forEach((k,i)=>{
      if(k.ghost)return;
      const x=this.xAt(i,g),up=k.c>=k.o,col=up?UP:DN,yo=this.yAt(k.o,g),yc=this.yAt(k.c,g),yh=this.yAt(k.h,g),yl=this.yAt(k.l,g);
      c.strokeStyle=col;c.fillStyle=col;c.lineWidth=Math.max(1,Math.min(2,g.bw*.12));
      c.beginPath();c.moveTo(x,yh);c.lineTo(x,yl);c.stroke();
      const bw=Math.max(2,g.bw*.66),top=Math.min(yo,yc),hh=Math.max(1.5,Math.abs(yc-yo));
      c.fillRect(x-bw/2,top,bw,hh);
    });
    // overlay lines
    this.lines.forEach(L=>{c.strokeStyle=L.color||"#ffd166";c.lineWidth=L.w||1.6;c.setLineDash(L.dash||[]);c.beginPath();let on=false;L.data.forEach((v,i)=>{if(v==null)return;const x=this.xAt(i,g),y=this.yAt(v,g);on?c.lineTo(x,y):c.moveTo(x,y);on=true});c.stroke();c.setLineDash([]);if(L.label){const lastI=L.data.map(v=>v!=null).lastIndexOf(true);if(lastI>=0){c.fillStyle=L.color||"#ffd166";c.textAlign="left";c.fillText(L.label,this.xAt(lastI,g)+6,this.yAt(L.data[lastI],g)-8)}}});
    // levels
    this.levels.forEach(l=>{if(l.y==null)return;const y=this.yAt(l.y,g);if(l.noscale&&(y<g.p.t||y>g.H-g.p.b-g.volH))return;c.strokeStyle=l.color||"#ffd166";c.lineWidth=l.w||1.2;c.setLineDash(l.dash===false?[]:[6,4]);c.beginPath();c.moveTo(g.p.l,y);c.lineTo(g.W-g.p.r,y);c.stroke();c.setLineDash([]);
      if(l.label){c.fillStyle=l.color||"#ffd166";c.textAlign="left";const w=c.measureText(l.label).width;c.fillText(l.label,l.left?g.p.l+4:Math.max(g.p.l+4,g.W-g.p.r-w-6),y-8)}});
    // markers
    this.markers.forEach(m=>{const x=this.xAt(m.i,g),y=this.yAt(m.y,g);c.fillStyle=m.color||"#ffd166";c.strokeStyle="#0a1322";c.lineWidth=2;
      if(m.shape==="up"){c.beginPath();c.moveTo(x,y);c.lineTo(x-6,y+11);c.lineTo(x+6,y+11);c.closePath();c.fill()}
      else if(m.shape==="down"){c.beginPath();c.moveTo(x,y);c.lineTo(x-6,y-11);c.lineTo(x+6,y-11);c.closePath();c.fill()}
      else{c.beginPath();c.arc(x,y,5,0,7);c.fill();c.stroke()}
      if(m.text){c.fillStyle=m.color||"#ffd166";c.textAlign=m.align||"center";c.font="bold 11px ui-monospace,Menlo,Consolas,monospace";c.fillText(m.text,x,m.shape==="up"?y+24:y-(m.shape==="down"?20:12));c.font="11px ui-monospace,Menlo,Consolas,monospace"}});
    // title
    if(this.title){c.fillStyle="#8aa2c4";c.textAlign="left";c.font="bold 12px system-ui,sans-serif";c.fillText(this.title,g.p.l+4,10);c.font="11px ui-monospace,Menlo,Consolas,monospace"}
    // crosshair
    if(this.hover>=0&&this.candles[this.hover]&&!this.candles[this.hover].ghost){const k=this.candles[this.hover],x=this.xAt(this.hover,g);c.strokeStyle="#ffffff44";c.setLineDash([3,3]);c.beginPath();c.moveTo(x,g.p.t);c.lineTo(x,g.H-g.p.b);c.stroke();c.setLineDash([]);
      const t=`O ${fmt(k.o)}  H ${fmt(k.h)}  L ${fmt(k.l)}  C ${fmt(k.c)}`;c.font="bold 11px ui-monospace,Menlo,Consolas,monospace";const w=c.measureText(t).width+14;const bx=Math.min(Math.max(g.p.l,x-w/2),g.W-g.p.r-w);c.fillStyle="#0a1322ee";c.fillRect(bx,g.H-g.p.b-20,w,18);c.fillStyle=k.c>=k.o?UP:DN;c.textAlign="left";c.fillText(t,bx+7,g.H-g.p.b-10)}
  }
}
function mkChart(el,opt){const cv=document.createElement("canvas");cv.className="chart";el.appendChild(cv);return new Chart(cv,opt)}
