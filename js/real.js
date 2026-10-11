/* Real-data helpers for the practice game: decode the NQ dataset, pick a scenario, and write a plain-language context summary from the numbers (nothing is invented). */
const RD=(()=>{
  const D=window.NQDATA;if(!D)return null;
  const n=D.c.length,t=new Array(n),o=new Float64Array(n),h=new Float64Array(n),l=new Float64Array(n),c=new Float64Array(n),v=new Float64Array(n),m=D.m;
  let pc=0,tt=0;
  for(let k=0;k<n;k++){const[do_,dc,uh,lw,vol]=D.c[k];const O=k===0?do_:pc+do_,C=O+dc;o[k]=O/4;c[k]=C/4;h[k]=(Math.max(O,C)+uh)/4;l[k]=(Math.min(O,C)-lw)/4;v[k]=vol;tt=k===0?D.t[0]:tt+D.t[k];t[k]=tt;pc=C}
  const days=D.days.map(([d,i0,cnt])=>({d,i0,cnt,rth:[]}));
  days.forEach(dy=>{for(let k=dy.i0;k<dy.i0+dy.cnt;k++)if(m[k]>=570&&m[k]<960)dy.rth.push(k)});
  const skip=new Set(D.skip);
  const eligible=[];days.forEach((dy,i)=>{if(skip.has(dy.d)||dy.rth.length<70)return;let p=i-1;while(p>=0&&days[p].rth.length<70)p--;if(p<0)return;dy.prev=p;eligible.push(i)});
  const hhmm=min=>{const x=((min%1440)+1440)%1440;return String(Math.floor(x/60)).padStart(2,"0")+":"+String(x%60).padStart(2,"0")};
  const f2=x=>Number(x).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  const f0=x=>Number(x).toLocaleString(undefined,{maximumFractionDigits:0});
  const sgn=x=>(x>=0?"+":"-")+f2(Math.abs(x));
  const atr=(k,len=14)=>{let s=0;for(let j=k-len+1;j<=k;j++){s+=Math.max(h[j]-l[j],Math.abs(h[j]-c[j-1]),Math.abs(l[j]-c[j-1]))}return s/len};
  const maxOf=(a,b,fn)=>{let r=-1e18;for(let k=a;k<=b;k++)r=Math.max(r,fn(k));return r};
  const minOf=(a,b,fn)=>{let r=1e18;for(let k=a;k<=b;k++)r=Math.min(r,fn(k));return r};
  function pivots(a,b,w=3){const hi=[],lo=[];for(let k=a+w;k<=b-w;k++){let ih=true,il=true;for(let j=1;j<=w;j++){if(h[k]<=h[k-j]||h[k]<=h[k+j])ih=false;if(l[k]>=l[k-j]||l[k]>=l[k+j])il=false}if(ih)hi.push(k);if(il)lo.push(k)}return{hi,lo}}
  function pickScenario(win){
    const ranges={any:[575,870],open:[575,660],mid:[660,810],pm:[810,930]};const[a,b]=ranges[win]||ranges.any;
    for(let tries=0;tries<200;tries++){
      const di=eligible[Math.floor(Math.random()*eligible.length)],dy=days[di];
      const cand=dy.rth.filter(k=>m[k]>=a&&m[k]<=b&&k+60<n);if(!cand.length)continue;
      return build(di,cand[Math.floor(Math.random()*cand.length)]);
    }
    return null;
  }
  function build(di,k){
    const dy=days[di],pd=days[dy.prev],s=dy.rth[0],lastPd=pd.rth[pd.rth.length-1];
    const PDH=maxOf(pd.rth[0],lastPd,x=>h[x]),PDL=minOf(pd.rth[0],lastPd,x=>l[x]),PDC=c[lastPd];
    const ONH=maxOf(lastPd+1,s-1,x=>h[x]),ONL=minOf(lastPd+1,s-1,x=>l[x]);
    const OPEN=o[s],P=c[k],dayH=maxOf(s,k,x=>h[x]),dayL=minOf(s,k,x=>l[x]);
    let pv=0,vv=0;const vw=[];for(let x=s;x<=k;x++){const tp=(h[x]+l[x]+c[x])/3;pv+=tp*(v[x]||1);vv+=(v[x]||1);vw.push(pv/vv)}
    const VWAP=vw[vw.length-1],A=atr(k);
    const orEnd=Math.min(k,s+5),ORH=maxOf(s,orEnd,x=>h[x]),ORL=minOf(s,orEnd,x=>l[x]),orDone=k>=s+5;
    const barsSince=k-s+1,gap=OPEN-PDC;
    // five prior session closes for the bigger picture
    const closes=[];let q=dy.prev,cnt=0;while(q>=0&&cnt<5){if(days[q].rth.length>=70){closes.unshift(c[days[q].rth[days[q].rth.length-1]]);cnt++}q--}
    const pdRange=PDH-PDL,posInPd=pdRange?(PDC-PDL)/pdRange:.5;
    // recent structure
    const pv5=pivots(Math.max(s-10,1),k,3);const lastHi=pv5.hi.slice(-2),lastLo=pv5.lo.slice(-2);
    const struct=[];if(lastHi.length===2)struct.push(h[lastHi[1]]>h[lastHi[0]]?"higher high":"lower high");if(lastLo.length===2)struct.push(l[lastLo[1]]>l[lastLo[0]]?"higher low":"lower low");
    // sweeps and untouched levels in the last 24 candles
    const sweeps=[];const lv=[["yesterday's high",PDH,1],["overnight high",ONH,1],["yesterday's low",PDL,-1],["overnight low",ONL,-1]];
    for(const[name,L,dir]of lv){for(let x=Math.max(s,k-23);x<=k;x++){if(dir>0&&h[x]>L&&c[x]<L&&c[k]<L){sweeps.push("price poked above "+name+" ("+f2(L)+") and closed back below it");break}if(dir<0&&l[x]<L&&c[x]>L&&c[k]>L){sweeps.push("price poked below "+name+" ("+f2(L)+") and closed back above it");break}}}
    const untouched=[];for(const[name,L,dir]of lv){const touched=dir>0?dayH>=L:dayL<=L;if(!touched)untouched.push(name+" "+f2(L))}
    const vol1=(()=>{let a=0,b=0;for(let x=k-5;x<=k;x++)a+=v[x];for(let x=k-11;x<=k-6;x++)b+=v[x];return b?a/b:1})();
    const net12=c[k]-c[Math.max(0,k-12)];
    const ctx={di,k,s,date:dy.d,time:hhmm(m[k]+5),timeStart:hhmm(m[k]),minute:m[k],PDH,PDL,PDC,ONH,ONL,OPEN,P,dayH,dayL,VWAP,ATR:A,ORH,ORL,orDone,barsSince,gap,closes,posInPd,struct,sweeps,untouched,vol1,net12,pdRange,dayRange:dayH-dayL};
    return ctx;
  }
  function beginner(x){
    const up=x.P>=x.OPEN,tr=Math.abs(x.P-x.OPEN)<x.ATR*1.2?"gone mostly sideways":up?"climbed":"fallen";
    let s=`<p>It is about <b>${x.time}</b> New York time on a normal trading day. You are looking at <b>Nasdaq-100 futures</b> in 5-minute candles. Yesterday's regular session ended at <b>${f2(x.PDC)}</b>.</p>`;
    s+=`<p>Overnight and into the opening bell, price ${x.gap>=0?"rose":"fell"} <b>${f0(Math.abs(x.gap))} points</b> and the day opened ${x.gap>=0?"above":"below"} yesterday's close. Since the open it has <b>${tr}</b> and now trades ${x.P>=x.VWAP?"above":"below"} the day's average price ({{vwap|VWAP}}), which usually means ${x.P>=x.VWAP?"buyers":"sellers"} have been slightly in charge today.</p>`;
    const dH=x.PDH-x.P,dL=x.P-x.PDL;
    let lv;
    if(dH<0)lv=`Price is already <b>${f0(-dH)} points above</b> yesterday's high (${f2(x.PDH)}), so that old ceiling is now underneath and may act as a floor. Yesterday's low is far below at ${f2(x.PDL)}.`;
    else if(dL<0)lv=`Price has already dropped <b>${f0(-dL)} points below</b> yesterday's low (${f2(x.PDL)}), so that old floor is now overhead and may act as a ceiling. Yesterday's high is far above at ${f2(x.PDH)}.`;
    else lv=`Yesterday's high (${f2(x.PDH)}) is <b>${f0(dH)} points above</b> price and yesterday's low (${f2(x.PDL)}) is <b>${f0(dL)} points below</b>. Price tends to react when it reaches places traders remember. ({{support|Support and resistance}} are zones where that happens.)`;
    s+=`<p>${lv}</p>`;
    s+=`<p>A normal 5-minute candle right now is about <b>${f0(x.ATR)} points</b> tall. If your stop is much smaller than that, ordinary wiggles will knock you out.</p><p><b>Your job:</b> pick Buy, Sell or Skip. Skipping is a real choice, and most good traders skip a lot.</p>`;
    return s;
  }
  function advanced(x){
    const dAtr=(L)=>{const d=L-x.P;return (d>=0?"+":"")+f0(d)+" pts ("+(Math.abs(d)/x.ATR).toFixed(1)+" ATR)"};
    const htf=x.closes.length>=2?(()=>{const up=x.closes.filter((c0,i)=>i&&c0>x.closes[i-1]).length,tot=x.closes.length-1,chg=x.closes[x.closes.length-1]-x.closes[0];return `last ${x.closes.length} sessions closed higher ${up} of ${tot} times, net ${sgn(chg)} pts (${(chg/x.closes[0]*100).toFixed(2)}%)`})():"n/a";
    const rows=[
      ["Time",`${x.time} ET (about ${x.barsSince*5} minutes after the 9:30 open)`],
      ["Gap",`${sgn(x.gap)} pts vs yesterday's RTH close ${f2(x.PDC)}. Open ${f2(x.OPEN)}.`],
      ["Opening range",x.orDone?`First 30 min: high ${f2(x.ORH)}, low ${f2(x.ORL)}. Price is ${x.P>x.ORH?"above the range":x.P<x.ORL?"below the range":"inside the range"}.`:`Still forming. High so far ${f2(x.ORH)}, low ${f2(x.ORL)}.`],
      ["Key levels",`Yesterday high ${f2(x.PDH)} (${dAtr(x.PDH)}). Yesterday low ${f2(x.PDL)} (${dAtr(x.PDL)}). Overnight high ${f2(x.ONH)} (${dAtr(x.ONH)}). Overnight low ${f2(x.ONL)} (${dAtr(x.ONL)}).`],
      ["VWAP",`${f2(x.VWAP)}. Price is ${sgn(x.P-x.VWAP)} pts ${x.P>=x.VWAP?"above":"below"} it.`],
      ["Today so far",`High ${f2(x.dayH)}, low ${f2(x.dayL)}, range ${f0(x.dayRange)} pts vs yesterday's range ${f0(x.pdRange)} pts.`],
      ["Volatility",`ATR(14) on 5m = ${f2(x.ATR)} pts (about $${f0(x.ATR*2)} per MNQ contract). Last 6 candles' volume is ${(x.vol1*100).toFixed(0)}% of the 6 before.`],
      ["Recent structure",x.struct.length?`Last two 5-minute swings: ${x.struct.join(", ")}. Net move over the last hour: ${sgn(x.net12)} pts.`:`Not enough clean swings yet. Net move over the last hour: ${sgn(x.net12)} pts.`],
      ["Bigger picture",`Yesterday closed in the ${x.posInPd>.66?"top third":x.posInPd<.34?"bottom third":"middle"} of its range. Prior sessions: ${htf}.`],
      ["Liquidity",`${x.sweeps.length?x.sweeps.join("; ")+".":"No recent sweep of the major levels."} ${x.untouched.length?"Not yet traded today: "+x.untouched.join(", ")+".":"All four reference levels have been touched today."}`]
    ];
    return `<div>${rows.map(r=>`<div class="ar"><b>${r[0]}</b><span>${r[1]}</span></div>`).join("")}</div><p style="color:var(--mut);font-size:14px;margin-top:10px"><b>Ask yourself:</b> Which side is in control? Where would I be wrong? Is there room to the next level for at least 2R?</p>`;
  }
  return{n,t,o,h,l,c,v,m,days,eligible,meta:D.meta,pickScenario,build,beginner,advanced,hhmm,atr,f2,f0,sgn};
})();
