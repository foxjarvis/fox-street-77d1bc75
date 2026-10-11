/* Visual explainers: small animated "videos" drawn in the browser (no video files), with pointers, captions, step controls and optional read-aloud.
   A scene is a data object: candles that form over time, plus boxes, lines, arrows, rings, order dots and tags that appear at set times. */
window.EX=window.EX||{};window.EXORDER=window.EXORDER||[];
const exAdd=def=>{EX[def.id]=def;EXORDER.push(def.id)};
const clamp01=x=>Math.max(0,Math.min(1,x));
const easeOut=x=>1-Math.pow(1-clamp01(x),3);
/* build candles from [o,h,l,c] arrays, one new candle every `step` ms starting at t0 */
const seqC=(arr,t0,step,extra={})=>arr.map((a,i)=>({o:a[0],h:a[1],l:a[2],c:a[3],at:t0+i*step,...extra}));
/* build candles from waypoints using the same generator as the lessons, then time them */

function pill(ctx,txt,x,y,col,align,fs){ctx.font=`bold ${fs}px system-ui,sans-serif`;const w=ctx.measureText(txt).width+10,bx=align==="right"?x-w+3:x-3;ctx.fillStyle="#0a1322dd";ctx.fillRect(bx,y-fs,w,fs+6);ctx.fillStyle=col;ctx.textAlign="left";ctx.fillText(txt,bx+5,y)}
function drawScene(def,ctx,Wc,Hc,t,opt={}){
  ctx.clearRect(0,0,Wc,Hc);
  ctx.fillStyle="#0a1322";ctx.fillRect(0,0,Wc,Hc);
  const fs=Math.max(11,Math.min(15,10+Wc/80)),u={clamp01,easeOut,fs};
  ctx.font=`bold ${fs}px system-ui,sans-serif`;
  if(def.custom){def.custom(ctx,Wc,Hc,t,u);return}
  const padL=14,padR=14,padT=26,padB=14,n=def.n,[y0,y1]=def.yr;
  const X=i=>padL+(i+.5)*(Wc-padL-padR)/n,Y=v=>padT+(y1-v)/(y1-y0)*(Hc-padT-padB),bw=Math.max(5,(Wc-padL-padR)/n*.56);
  // soft grid
  ctx.strokeStyle="#14253f";ctx.lineWidth=1;for(let k=1;k<5;k++){const y=padT+k*(Hc-padT-padB)/5;ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(Wc-padR,y);ctx.stroke()}
  const alpha=it=>{if(t<it.at)return 0;const a=clamp01((t-it.at)/260);return it.end!=null?a*clamp01(1-(t-it.end)/260):a};
  const xi=(i)=>i==="end"?Wc-padR:X(i);
  // boxes behind candles
  (def.items||[]).filter(it=>it.k==="box").forEach(it=>{const a=alpha(it);if(!a)return;ctx.globalAlpha=a;const xa=it.i0==="start"?padL:X(it.i0)-bw/2,xb=it.i1==="end"?Wc-padR:X(it.i1)+bw/2,ya=Y(Math.max(it.y0,it.y1)),yb=Y(Math.min(it.y0,it.y1));
    const grow=it.grow?easeOut((t-it.at)/it.grow):1;ctx.fillStyle=it.col||"#5aa9ff30";ctx.fillRect(xa,ya,(xb-xa)*grow,yb-ya);if(it.stroke){ctx.strokeStyle=it.stroke;ctx.lineWidth=1.4;ctx.setLineDash(it.dash?[6,4]:[]);ctx.strokeRect(xa,ya,(xb-xa)*grow,yb-ya);ctx.setLineDash([])}
    if(it.label&&!opt.thumb){pill(ctx,it.label,xa+8,it.labelBottom?yb-8:ya+fs+4,it.text||"#cfe0ff","left",fs-1)}ctx.globalAlpha=1});
  // horizontal lines
  (def.items||[]).filter(it=>it.k==="hline").forEach(it=>{const a=alpha(it);if(!a)return;ctx.globalAlpha=a;const y=Y(it.y),xa=it.i0==null?padL:X(it.i0),xb=it.i1==null?Wc-padR:X(it.i1);ctx.strokeStyle=it.col||"#ffd166";ctx.lineWidth=1.6;ctx.setLineDash(it.solid?[]:[7,5]);ctx.beginPath();ctx.moveTo(xa,y);ctx.lineTo(xa+(xb-xa)*easeOut((t-it.at)/500),y);ctx.stroke();ctx.setLineDash([]);
    if(it.label&&!opt.thumb){pill(ctx,it.label,it.right?Wc-padR-4:padL+8,y-9,it.col||"#ffd166",it.right?"right":"left",fs-1)}ctx.globalAlpha=1});
  // overlay lines (like VWAP) drawn up to the visible candle
  (def.lines||[]).forEach(L=>{ctx.strokeStyle=L.col||"#a78bfa";ctx.lineWidth=2;ctx.beginPath();let on=false;L.data.forEach((v,i)=>{const cd=def.candles[i];if(v==null||!cd||t<cd.at+200)return;const x=X(i),y=Y(v);on?ctx.lineTo(x,y):ctx.moveTo(x,y);on=true});ctx.stroke();if(L.label){const last=L.data.map((v,i)=>v!=null&&def.candles[i]&&t>=def.candles[i].at+200?i:-1).reduce((a,b)=>Math.max(a,b),-1);if(last>=0){ctx.fillStyle=L.col||"#a78bfa";ctx.textAlign="left";ctx.fillText(L.label,X(last)+8,Y(L.data[last])-8)}}});
  // candles
  (def.candles||[]).forEach((c,i)=>{if(t<c.at)return;const f=easeOut((t-c.at)/(def.cf||420)),x=X(c.slot??i),o=c.o,cl=o+(c.c-o)*f,hi=o+(c.h-o)*f,lo=o+(c.l-o)*f,up=cl>=o,col=c.col||(up?"#26dfa3":"#ff5d7c");
    if(c.glow&&t>=c.glow.at){const ga=clamp01((t-c.glow.at)/300)*(c.glow.end!=null?clamp01(1-(t-c.glow.end)/300):1);ctx.globalAlpha=ga;ctx.strokeStyle=c.glow.col||"#ffd166";ctx.lineWidth=2.6;ctx.strokeRect(x-bw/2-4,Y(c.h)-5,bw+8,Y(c.l)-Y(c.h)+10);ctx.globalAlpha=1}
    ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=Math.max(1.5,bw*.12);ctx.beginPath();ctx.moveTo(x,Y(hi));ctx.lineTo(x,Y(lo));ctx.stroke();const top=Math.min(Y(o),Y(cl)),hh=Math.max(2,Math.abs(Y(cl)-Y(o)));ctx.fillRect(x-bw/2,top,bw,hh)});
  // paths (swing lines)
  (def.items||[]).filter(it=>it.k==="path").forEach(it=>{const a=alpha(it);if(!a)return;ctx.globalAlpha=a;ctx.strokeStyle=it.col||"#ffd166";ctx.lineWidth=it.w||2;ctx.setLineDash(it.dash?[5,5]:[]);const pr=easeOut((t-it.at)/(it.dur||700));const pts=it.pts.map(([i,v])=>[X(i),Y(v)]);let tot=0;for(let k=1;k<pts.length;k++)tot+=Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]);let need=tot*pr;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let k=1;k<pts.length;k++){const d=Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]);if(need>=d){ctx.lineTo(pts[k][0],pts[k][1]);need-=d}else{const r=need/d;ctx.lineTo(pts[k-1][0]+(pts[k][0]-pts[k-1][0])*r,pts[k-1][1]+(pts[k][1]-pts[k-1][1])*r);break}}ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1});
  // order dots
  (def.items||[]).filter(it=>it.k==="dots").forEach(it=>{const a0=t<it.at?0:clamp01((t-it.at)/300);if(!a0)return;let burst=0;if(it.pop!=null&&t>=it.pop)burst=clamp01((t-it.pop)/700);if(burst>=1)return;const cnt=it.n||12;for(let d=0;d<cnt;d++){const r1=((d*7919)%97)/97,r2=((d*104729)%89)/89;const i=it.i0+(it.i1-it.i0)*r1,v=it.y+(it.spread||2)*(r2-.5)*2+(it.dy||0);const px=X(i),py=Y(v);ctx.globalAlpha=a0*(1-burst);ctx.fillStyle=it.col||"#ff5d7c";ctx.beginPath();ctx.arc(px+burst*(r1-.5)*60,py-burst*30*r2,4+burst*6,0,7);ctx.fill()}ctx.globalAlpha=1;
    if(it.label&&burst<.3){ctx.globalAlpha=a0*(1-burst*3);ctx.fillStyle=it.col||"#ff5d7c";ctx.textAlign="center";ctx.font=`bold ${fs-1}px system-ui,sans-serif`;ctx.fillText(it.label,X((it.i0+it.i1)/2),Y(it.y+(it.dy||0))-(it.labelUp||18));ctx.globalAlpha=1}});
  // rings, arrows, tags, text
  (def.items||[]).forEach(it=>{
    if(!["ring","arrow","tag","text"].includes(it.k))return;if(opt.thumb&&(it.k==="arrow"||it.k==="text"))return;const a=alpha(it);if(!a)return;ctx.globalAlpha=a;
    const tx=xi(it.i),ty=Y(it.y);
    if(it.k==="ring"){const r=(it.r||14)+3*Math.sin(t/160);ctx.strokeStyle=it.col||"#ffd166";ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(tx,ty,r,0,7);ctx.stroke()}
    if(it.k==="arrow"){const dx=(it.dx??-60)*(Wc/760+.35),dy=(it.dy??-46)*(Wc/760+.35),sx=tx+dx,sy=ty+dy,col=it.col||"#ffd166",ang=Math.atan2(ty-sy,tx-sx),pulse=1+.06*Math.sin(t/170),ex=tx-Math.cos(ang)*10,ey=ty-Math.sin(ang)*10;
      ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();ctx.beginPath();ctx.moveTo(ex+Math.cos(ang)*10,ey+Math.sin(ang)*10);ctx.lineTo(ex-Math.cos(ang-.5)*11*pulse,ey-Math.sin(ang-.5)*11*pulse);ctx.lineTo(ex-Math.cos(ang+.5)*11*pulse,ey-Math.sin(ang+.5)*11*pulse);ctx.closePath();ctx.fill();
      if(it.text){ctx.font=`bold ${fs}px system-ui,sans-serif`;const w=ctx.measureText(it.text).width+14,bx=Math.min(Math.max(4,sx-w/2),Wc-w-4),by=sy-(dy<0?fs+10:-4);ctx.fillStyle="#0a1322ee";ctx.fillRect(bx,by,w,fs+10);ctx.strokeStyle=col;ctx.lineWidth=1.2;ctx.strokeRect(bx,by,w,fs+10);ctx.fillStyle=col;ctx.textAlign="left";ctx.fillText(it.text,bx+7,by+fs+2)}}
    if(it.k==="tag"){ctx.font=`bold ${fs-1}px system-ui,sans-serif`;const w=ctx.measureText(it.text).width+12,bx=tx-w/2,by=ty-(it.below?-8:fs+12);ctx.fillStyle=it.bg||"#ffd166";ctx.beginPath();ctx.roundRect?ctx.roundRect(bx,by,w,fs+6,8):ctx.rect(bx,by,w,fs+6);ctx.fill();ctx.fillStyle=it.fg||"#101827";ctx.textAlign="center";ctx.fillText(it.text,tx,by+fs+1)}
    if(it.k==="text"){ctx.font=`bold ${it.size||fs}px system-ui,sans-serif`;ctx.fillStyle=it.col||"#eaf2ff";ctx.textAlign=it.align||"center";ctx.fillText(it.text,tx,ty)}
    ctx.globalAlpha=1});
  if(def.title2){ctx.fillStyle="#6f86a8";ctx.textAlign="left";ctx.font=`bold ${fs-1}px system-ui,sans-serif`;ctx.fillText(def.title2,padL+2,fs+2)}
}

const EX_PACES={relaxed:{label:"Relaxed",mult:1.3,wps:2.1,pause:1500,rate:.88},normal:{label:"Normal",mult:1.05,wps:2.7,pause:900,rate:.97},quick:{label:"Quick",mult:.85,wps:3.4,pause:450,rate:1.08}};
const plain=h=>String(h).replace(/\{\{[a-z0-9\-]+\|?([^}]*)\}\}/gi,(m,x)=>x||"").replace(/<[^>]+>/g,"");
function exVoice(){if(!window.speechSynthesis)return null;const want=localStorage.getItem("wick_ex_voice"),vs=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang));if(want){const v=vs.find(v=>v.name===want);if(v)return v}
  for(const re of[/natural|online/i,/aria|jenny|guy|libby|sonia|ryan|emma|brian/i,/google us english/i,/samantha|ava|allison|daniel|karen|moira|serena|zira|david/i]){const v=vs.find(v=>re.test(v.name));if(v)return v}return vs[0]||null}

/* The player is paced by the words, not by a fixed clock. Each caption is a step. A step lasts as long as the animation needs or the time it takes to read (or speak) the caption, whichever is longer, then pauses briefly. With Read aloud on, the next step waits until the voice has finished. */
class ExPlayer{
  constructor(root,def,opt={}){
    this.def=def;this.root=root;this.playing=false;this.say=localStorage.getItem("wick_ex_say")!=="0";this.seg=0;this.el=0;this.spoken=true;this.shown=-1;this.shownLv="";
    this.level=localStorage.getItem("wick_ex_level")||"simple";this.pace=localStorage.getItem("wick_ex_pace")||"relaxed";this.auto=localStorage.getItem("wick_ex_auto")!=="0";
    const caps=def.caps;this.segs=caps.map((c,i)=>({a:c.at,b:i+1<caps.length?caps[i+1].at:def.dur}));
    root.innerHTML=`<div class="exp" tabindex="0"><canvas class="excv"></canvas>
    <div class="exdots" aria-label="Steps"></div>
    <div class="excaprow"><div class="exva" aria-hidden="true">${typeof foxF==="function"?foxF("happy"):""}</div><div class="excap" id="cap" aria-live="polite"></div></div><div class="exread"><i></i></div>
    <div class="exbar"><button class="exb" data-a="rew" title="Restart">⏮</button><button class="exb" data-a="prev" title="Previous step">◀</button><button class="exb big" data-a="play" title="Play or pause">▶</button><button class="exb" data-a="next" title="Next step">▶|</button><input type="range" class="exscr" min="0" max="1000" value="0" aria-label="Scrub"></div>
    <div class="exbar2"><div class="modes exmodes"><button data-lv="simple">Simple</button><button data-lv="adv">Advanced</button></div>
    <label class="exlab">Pace <select class="expace">${Object.entries(EX_PACES).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join("")}</select></label>
    <button class="exb autob" data-a="auto" title="Continue to the next step automatically, or wait for you">Auto</button>
    <button class="exb narr" data-a="say" title="Read aloud">🔊 Read aloud</button></div>
    <div class="exbar2 exvrow" style="display:none"><label class="exlab">Voice <select class="exvoice"></select></label></div>
    <div class="exhint">A gold ring or arrow marks the thing being explained. Use Step mode to go at your own speed.</div></div>`;
    this.cv=root.querySelector("canvas");this.ctx=this.cv.getContext("2d");this.cap=root.querySelector("#cap");this.scr=root.querySelector(".exscr");this.pb=root.querySelector("[data-a=play]");this.bar=root.querySelector(".exread i");this.dots=root.querySelector(".exdots");
    this.dots.innerHTML=caps.map((c,i)=>`<button data-s="${i}" aria-label="Step ${i+1}">${i+1}</button>`).join("");
    this.dots.querySelectorAll("button").forEach(b=>b.onclick=()=>{this.jump(+b.dataset.s);if(this.say&&this.playing)this.speak()});
    new ResizeObserver(()=>this.size()).observe(this.cv);this.size();
    root.querySelectorAll(".exb").forEach(b=>b.onclick=()=>this.act(b.dataset.a));
    root.querySelectorAll("[data-lv]").forEach(b=>b.onclick=()=>{this.level=b.dataset.lv;localStorage.setItem("wick_ex_level",this.level);this.paintCtl();this.caption(true)});
    const pe=root.querySelector(".expace");pe.value=this.pace;pe.onchange=()=>{this.pace=pe.value;localStorage.setItem("wick_ex_pace",this.pace)};
    this.scr.oninput=()=>{this.pause();const t=this.scr.value/1000*def.dur;const k=this.segOf(t);this.seg=k;const sg=this.segs[k];this.el=(t-sg.a)/Math.max(1,sg.b-sg.a)*this.animMs(k);this.render()};
    const kb=root.querySelector(".exp");kb.onkeydown=e=>{if(e.key===" "){e.preventDefault();this.act("play")}else if(e.key==="ArrowRight")this.act("next");else if(e.key==="ArrowLeft")this.act("prev")};
    this.fillVoices();if(window.speechSynthesis)speechSynthesis.onvoiceschanged=()=>this.fillVoices();
    this.paintCtl();
    {const nb=root.querySelector(".narr");nb.classList.toggle("on",this.say);nb.textContent=this.hasAudio()?"🔊 Voice":"🔊 Read aloud";root.querySelector(".exvrow").style.display=(this.say&&!this.hasAudio())?"":"none"}
    if(opt.startAtEnd){this.seg=caps.length-1;this.el=this.animMs(this.seg)+1}
    this.render();
    if(opt.auto!==false&&!opt.startAtEnd)setTimeout(()=>{if(document.body.contains(root))this.play()},600);
  }
  fillVoices(){const sel=this.root.querySelector(".exvoice");if(!sel||!window.speechSynthesis)return;const vs=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang));if(!vs.length)return;const cur=exVoice();sel.innerHTML=vs.map(v=>`<option value="${v.name}" ${cur&&cur.name===v.name?"selected":""}>${v.name}</option>`).join("");sel.onchange=()=>{localStorage.setItem("wick_ex_voice",sel.value);if(this.say&&this.playing)this.speak()}}
  size(){const w=this.cv.clientWidth||600,h=Math.max(Math.round(w*this.def.H/this.def.W),Math.min(Math.round(w*.85),330)),dpr=devicePixelRatio||1;this.Wc=w;this.Hc=h;this.cv.style.height=h+"px";this.cv.width=Math.round(w*dpr);this.cv.height=Math.round(h*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);this.render()}
  paintCtl(){this.root.querySelectorAll("[data-lv]").forEach(b=>b.classList.toggle("on",b.dataset.lv===this.level));const a=this.root.querySelector(".autob");a.textContent=this.auto?"Auto-play":"Step mode";a.classList.toggle("on",!this.auto)}
  text(i){const c=this.def.caps[i];return plain(this.level==="adv"&&c.adv?c.adv:c.text)}
  words(i){return this.text(i).split(/\s+/).filter(Boolean).length}
  readMs(i){return this.words(i)/EX_PACES[this.pace].wps*1000}
  animMs(i){const sg=this.segs[i];return Math.max((sg.b-sg.a)*EX_PACES[this.pace].mult,this.readMs(i))}
  segOf(t){let k=0;for(let i=0;i<this.segs.length;i++)if(t>=this.segs[i].a)k=i;return k}
  tAuth(){const sg=this.segs[this.seg],f=Math.min(1,this.el/Math.max(1,this.animMs(this.seg)));return sg.a+(sg.b-sg.a)*f}
  jump(k){const was=this.playing;this.stopSpeech();this.seg=Math.max(0,Math.min(this.segs.length-1,k));this.el=0;this.spoken=!this.say;this.render();if(was&&!this.playing)this.play()}
  act(a){
    if(a==="play")return this.playing?this.pause():this.play();
    if(a==="rew"){this.stopSpeech();this.seg=0;this.el=0;this.shown=-1;this.spoken=!this.say;this.render();return this.play()}
    if(a==="prev"){this.pause();this.jump(this.el>1500?this.seg:this.seg-1)}
    if(a==="next"){this.pause();this.jump(this.seg+1);this.el=this.animMs(this.seg)*.02}
    if(a==="auto"){this.auto=!this.auto;localStorage.setItem("wick_ex_auto",this.auto?"1":"0");this.paintCtl()}
    if(a==="say"){this.say=!this.say;localStorage.setItem("wick_ex_say",this.say?"1":"0");this.root.querySelector(".narr").classList.toggle("on",this.say);this.root.querySelector(".exvrow").style.display=(this.say&&!this.hasAudio())?"":"none";if(!this.say)this.stopSpeech();else{this.fillVoices();this.spoken=false;this.speak()}}}
  stopSpeech(){this.root.classList.remove("speaking");if(this.aud){this.aud.onended=null;this.aud.pause();this.aud=null}if(window.speechSynthesis)speechSynthesis.cancel();this.spoken=true}
  hasAudio(){return !!(window.EXAUDIO&&EXAUDIO[this.def.id])}
  audioKey(k){const c=this.def.caps[k];return k+((this.level==="adv"&&c&&c.adv)?"a":"s")}
  clip(k){const A=window.EXAUDIO&&EXAUDIO[this.def.id],key=this.audioKey(k);return A&&A[key]?"audio/ex/"+this.def.id+"/"+key+".mp3":null}
  speak(){if(!this.say)return;
    const url=this.clip(this.seg);
    if(url){this.stopSpeech();const a=this.aud=new Audio(url),id=this.seg,R={relaxed:.95,normal:1,quick:1.15};a.playbackRate=R[this.pace]||1;this.spoken=false;
      a.onended=()=>{this.root.classList.remove("speaking");if(this.seg===id)this.spoken=true};a.onerror=()=>{this.root.classList.remove("speaking");this.spoken=true};
      const p=a.play();this.root.classList.add("speaking");if(p&&p.catch)p.catch(e=>{this.root.classList.remove("speaking");if(e&&e.name==="NotAllowedError"){this.pause();const h=this.root.querySelector(".exhint");if(h)h.textContent="Your browser wants a tap before it plays sound. Press play to hear her."}else this.spoken=true});
      const nx=this.clip(this.seg+1);if(nx){const w=new Audio();w.preload="auto";w.src=nx}return}
    if(!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(this.text(this.seg)),v=exVoice();if(v)u.voice=v;u.rate=EX_PACES[this.pace].rate;u.pitch=1;this.spoken=false;const id=this.seg;u.onend=()=>{if(this.seg===id)this.spoken=true};u.onerror=()=>{this.spoken=true};speechSynthesis.speak(u)}
  play(){const last=this.segs.length-1,P=EX_PACES[this.pace];
    if(this.seg>=last&&this.el>=this.animMs(last)+P.pause-5){this.seg=0;this.el=0;this.shown=-1}
    else if(this.el>=this.animMs(this.seg)+P.pause-5){this.seg=Math.min(last,this.seg+1);this.el=0}
    this.playing=true;this.pb.textContent="⏸";this.last=performance.now();this.spoken=!this.say;if(this.say)this.speak();
    const loop=now=>{if(!this.playing)return;if(!document.body.contains(this.root)){this.pause();return}
      const dt=Math.min(100,now-this.last);this.last=now;this.el+=dt;
      const Q=EX_PACES[this.pace],end=this.animMs(this.seg)+Q.pause;
      if(this.el>=end&&(this.spoken||this.el>end+9000)){
        if(this.seg>=this.segs.length-1||!this.auto){this.el=end;this.playing=false;this.pb.textContent="▶";this.render();return}
        this.seg++;this.el=0;this.spoken=!this.say;if(this.say)this.speak()}
      this.render();requestAnimationFrame(loop)};
    requestAnimationFrame(loop)}
  pause(){this.root.classList.remove("speaking");this.playing=false;this.pb.textContent="▶";if(this.say){if(this.aud)this.aud.pause();if(window.speechSynthesis)speechSynthesis.cancel();this.spoken=false}}
  caption(force){const k=this.seg;if(k===this.shown&&!force&&this.shownLv===this.level)return;this.shown=k;this.shownLv=this.level;const c=this.def.caps[k];if(!c)return;const txt=this.level==="adv"&&c.adv?c.adv:c.text;this.cap.innerHTML=`<span class="exn">${k+1}/${this.def.caps.length}</span> ${typeof gl==="function"?gl(txt):txt}`;this.dots.querySelectorAll("button").forEach((b,i)=>{b.classList.toggle("on",i===k);b.classList.toggle("done",i<k)})}
  render(){const t=this.tAuth();drawScene(this.def,this.ctx,this.Wc,this.Hc,t);this.scr.value=Math.round(t/this.def.dur*1000);this.caption();const rd=this.readMs(this.seg);this.bar.style.width=Math.round(Math.min(1,this.el/Math.max(1,rd))*100)+"%"}
}

function exThumb(def,cv,w=300){const h=Math.round(w*def.H/def.W),dpr=devicePixelRatio||1;cv.style.width="100%";cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);cv.style.height="auto";cv.style.aspectRatio=def.W+"/"+def.H;const c=cv.getContext("2d");c.setTransform(dpr,0,0,dpr,0,0);drawScene(def,c,w,h,def.thumbAt??def.dur*.8,{thumb:true})}

/* lesson embeds and full pages: data-w="ex:ID" */
window.W=window.W||{};
W.ex=(el,c,id)=>{const d=EX[id];if(!d){el.innerHTML='<div class="widget"><div class="warn">Missing visual guide: '+id+'</div></div>';return}
  const full=!!el.dataset.full;
  el.innerHTML=`<div class="widget watch"><h4>${full?"Watch it explained":"Watch: "+d.title}</h4><div class="exhost"></div>${full?"":`<div class="cap">Press play to watch it step by step. <a href="#/see/${id}">Open full page</a> · <a href="#/cheat">All visual guides</a></div>`}</div>`;
  window.__exp=new ExPlayer(el.querySelector(".exhost"),d,{auto:full,startAtEnd:!full})};
