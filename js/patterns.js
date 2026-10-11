/* Pattern spotter for the practice game. Looks ONLY at candles up to the decision point to say what was visible, then at what came after to say what happened. Plain rules, nothing invented; spotting a pattern is not the same as having an edge. */
(function(){
  const f2=x=>RD.f2(x),tm=i=>RD.hhmm(RD.m[i]);
  function pivots(a,b,w=2){const hi=[],lo=[];for(let i=Math.max(w,a+w);i<=b-w;i++){let ih=true,il=true;for(let j=1;j<=w;j++){if(RD.h[i]<=RD.h[i-j]||RD.h[i]<=RD.h[i+j])ih=false;if(RD.l[i]>=RD.l[i-j]||RD.l[i]>=RD.l[i+j])il=false}if(ih)hi.push(i);if(il)lo.push(i)}return{hi,lo}}
  window.findPatterns=function(sc,k){
    const A=sc.ATR,n=RD.n,H=RD.h,L=RD.l,C=RD.c,out=[],fut=Math.min(n-1,k+36),w0=Math.max(2,k-90);
    const piv=pivots(w0,k,2);
    const add=o=>out.push(Object.assign({boxes:[],markers:[],levels:[]},o));
    const upTo=(a,b,fn)=>{for(let j=a;j<=b;j++){const r=fn(j);if(r)return r}return null};

    /* 1. fair value gaps and inverse fair value gaps */
    const gaps=[];
    for(let i=Math.max(1,k-60);i<=k-1;i++){
      const a=i-1,c3=i+1;
      if(L[c3]>H[a]&&L[c3]-H[a]>=.5*A)gaps.push({i,dir:1,lo:H[a],hi:L[c3]});
      else if(H[c3]<L[a]&&L[a]-H[c3]>=.5*A)gaps.push({i,dir:-1,lo:H[c3],hi:L[a]});
    }
    gaps.forEach(g=>{g.touched=false;g.closed=false;
      for(let j=g.i+2;j<=k;j++){
        if(g.dir>0){if(L[j]<=g.hi)g.touched=true;if(C[j]<g.lo){g.closed=true;break}}
        else{if(H[j]>=g.lo)g.touched=true;if(C[j]>g.hi){g.closed=true;break}}
      }});
    const open=gaps.filter(g=>!g.closed&&!g.touched).pop();
    if(open){
      const g=open,bull=g.dir>0,r=upTo(k+1,fut,j=>(bull?L[j]<=g.hi:H[j]>=g.lo)?j:0);
      let post;
      if(!r)post="Price never came back to it in the next three hours.";
      else{const after=upTo(r,Math.min(fut,r+3),j=>(bull?C[j]<g.lo:C[j]>g.hi)?"through":null),end=C[Math.min(fut,r+3)];
        post=`Price came back to it ${r-k} candle${r-k>1?"s":""} later (${tm(r)}) and `+(after?"closed straight through it, which would turn it into an inverse fair value gap.":((bull?end>g.hi:end<g.lo)?"bounced out of it, the textbook reaction.":"chopped around inside it without a clear reaction."))}
      add({id:"fvg",guide:"fvg",title:"Fair value gap",dir:g.dir,score:80-(k-g.i)/10,
        pre:`A ${bull?"bullish":"bearish"} fair value gap (a gap where nobody got served) sat between ${f2(g.lo)} and ${f2(g.hi)} (formed at ${tm(g.i)}) and had not been touched yet.`,post,
        boxes:[{i0:g.i-1,i1:null,y0:g.lo,y1:g.hi,color:"#ffd16630",stroke:"#ffd166",label:"fair value gap"}],
        tap:{kind:"zone",i0:g.i-1,y0:g.lo,y1:g.hi,prompt:"Tap the "+(bull?"bullish":"bearish")+" fair value gap that price has not touched yet: the empty space left between candle 1 and candle 3 of a fast move."}});
    }
    const inv=gaps.filter(g=>g.closed).pop();
    if(inv&&k-inv.i<=30){
      const g=inv,bull=g.dir>0;
      const r=upTo(k+1,fut,j=>(bull?H[j]>=g.lo:L[j]<=g.hi)?j:0);
      add({id:"ifvg",guide:"ifvg",title:"Inverse fair value gap",dir:-g.dir,score:70-(k-g.i)/10,
        pre:`A ${bull?"bullish":"bearish"} gap between ${f2(g.lo)} and ${f2(g.hi)} had been closed through, so the zone flips: it can now act as ${bull?"resistance":"support"}.`,
        post:r?`Price revisited that zone ${r-k} candle${r-k>1?"s":""} later (${tm(r)}) and ${(bull?C[Math.min(fut,r+3)]<g.lo:C[Math.min(fut,r+3)]>g.hi)?"was rejected by it.":"pushed back through it."}`:"Price did not revisit that zone in the next three hours.",
        boxes:[{i0:g.i-1,i1:null,y0:g.lo,y1:g.hi,color:"#a78bfa30",stroke:"#a78bfa",label:"inverse FVG"}],
        tap:{kind:"zone",i0:g.i-1,y0:g.lo,y1:g.hi,prompt:"A fair value gap in this area was closed through by price, which flips it into an inverse fair value gap. Tap that zone."}});
    }

    /* 2. structure (higher highs / lower lows) and pullbacks */
    const hs=piv.hi.filter(i=>i<=k-2).slice(-3),ls=piv.lo.filter(i=>i<=k-2).slice(-3);
    let trend=0;
    if(hs.length===3&&ls.length===3){
      if(H[hs[0]]<H[hs[1]]&&H[hs[1]]<H[hs[2]]&&L[ls[0]]<L[ls[1]]&&L[ls[1]]<L[ls[2]])trend=1;
      else if(H[hs[0]]>H[hs[1]]&&H[hs[1]]>H[hs[2]]&&L[ls[0]]>L[ls[1]]&&L[ls[1]]>L[ls[2]])trend=-1;
    }
    if(trend){
      const lastH=hs[2],lastL=ls[2],up=trend>0;
      const brokeWith=upTo(k+1,fut,j=>(up?H[j]>H[lastH]:L[j]<L[lastL])?j:0),brokeAgainst=upTo(k+1,fut,j=>(up?C[j]<L[lastL]:C[j]>H[lastH])?j:0);
      add({id:"structure",guide:"structure",title:up?"Higher highs and higher lows":"Lower highs and lower lows",dir:trend,score:65,
        pre:up?`Structure was an uptrend: three rising swing highs and three rising swing lows (latest high ${f2(H[lastH])} at ${tm(lastH)}, latest low ${f2(L[lastL])} at ${tm(lastL)}).`:`Structure was a downtrend: three falling swing highs and three falling swing lows (latest high ${f2(H[lastH])} at ${tm(lastH)}, latest low ${f2(L[lastL])} at ${tm(lastL)}).`,
        post:brokeAgainst&&(!brokeWith||brokeAgainst<brokeWith)?`The trend structure broke first: price closed ${up?"below the last higher low":"above the last lower high"} at ${tm(brokeAgainst)} (a change of character).`:brokeWith?`The trend continued: price made a new ${up?"high":"low"} at ${tm(brokeWith)} (a break of structure).`:"Price did neither within three hours: it stayed inside the last swing range.",
        markers:[...hs.map((i,x)=>({i,y:H[i],text:up?"HH":"LH",color:"#ffd166",shape:"down"})),...ls.map((i,x)=>({i,y:L[i],text:up?"HL":"LL",color:"#5aa9ff",shape:"up"}))].slice(0,6),
        tap:{kind:"point",i:lastH,y:H[lastH],prompt:"The market was making "+(up?"higher highs and higher lows":"lower highs and lower lows")+". Tap the most recent swing high: the last peak with lower candles on both sides."}});
      // pullback: swing high then a swing low after it, price turning back
      const ph=up?hs[2]:ls[2],pl=up?ls.filter(i=>i>ph).pop():hs.filter(i=>i>ph).pop();
      if(pl!=null){
        const depth=up?H[ph]-L[pl]:H[pl]-L[ph],turned=up?C[k]>=L[pl]+.3*A:C[k]<=H[pl]-.3*A;
        if(depth>=.8*A&&turned&&k-pl<=14){
          const hit=upTo(k+1,fut,j=>(up?H[j]>H[ph]:L[j]<L[ph])?j:0);
          add({id:"pullback",guide:"pullback",title:"Pullback in a trend",dir:trend,score:62,
            pre:`In that ${up?"uptrend":"downtrend"} price pulled back ${f2(depth)} points (from ${tm(ph)} to ${tm(pl)}) and was turning back with the trend.`,
            post:hit?`Price went on to retake the old ${up?"high":"low"} at ${tm(hit)}.`:`Price did not retake the old ${up?"high":"low"} within three hours.`,
            markers:[{i:pl,y:up?L[pl]:H[pl],text:"pullback "+(up?"low":"high"),color:"#26dfa3",shape:up?"up":"down"}],
            tap:{kind:"point",i:pl,y:up?L[pl]:H[pl],prompt:"This "+(up?"uptrend":"downtrend")+" paused and pulled back. Tap the "+(up?"low":"high")+" of that pullback, where it turned back with the trend."}});
        }
      }
    }

    /* 3. liquidity sweeps (key levels, equal highs and lows) and fakeouts */
    const key=[{y:sc.PDH,name:"yesterday's high",t:1},{y:sc.PDL,name:"yesterday's low",t:-1},{y:sc.ONH,name:"the overnight high",t:1},{y:sc.ONL,name:"the overnight low",t:-1}];
    if(sc.orDone){key.push({y:sc.ORH,name:"the opening range high",t:1,or:1},{y:sc.ORL,name:"the opening range low",t:-1,or:1})}
    const piv4=pivots(Math.max(2,k-70),k,4);
    piv4.hi.filter(i=>i<=k-8).forEach(i=>key.push({y:H[i],name:"the swing high from "+tm(i),t:1,sw:i}));
    piv4.lo.filter(i=>i<=k-8).forEach(i=>key.push({y:L[i],name:"the swing low from "+tm(i),t:-1,sw:i}));
    let sw=null;
    for(let j=Math.max(w0+1,k-6);j<=k;j++)key.forEach(lv=>{
      if(lv.sw!=null&&(j-lv.sw<8||j<k-6))return;
      const high=lv.t>0;
      const pk=high?H[j]-lv.y:lv.y-L[j];if(pk<.2*A||pk>2.5*A)return;
      if(high?(C[j]<lv.y-.15*A&&C[j-1]<=lv.y):(C[j]>lv.y+.15*A&&C[j-1]>=lv.y)){
        const poke=high?H[j]-lv.y:lv.y-L[j];
        if(!sw||j>sw.j||(j===sw.j&&poke>sw.poke))sw={j,lv,poke,high};
      }});
    if(sw){
      const lv=sw.lv,high=sw.high;
      let mv=0,ag=0;for(let j=k+1;j<=Math.min(n-1,k+12);j++){mv=Math.max(mv,high?lv.y-L[j]:H[j]-lv.y);ag=Math.max(ag,high?H[j]-lv.y:lv.y-L[j])}
      add({id:"sweep",guide:high?"sweep":"sweepdown",title:"Liquidity sweep "+(high?"of a high":"of a low"),dir:high?-1:1,score:90,
        pre:`At ${tm(sw.j)} price poked ${f2(sw.poke)} points ${high?"above":"below"} ${lv.name} (${f2(lv.y)}) and closed back ${high?"under":"over"} it: the stops there got taken. That is getting set up and robbed on your stop.`,
        post:`In the next hour price ${mv>=1?"moved up to "+f2(mv)+" points "+(high?"below":"above")+" that level":"never got "+(high?"below":"above")+" that level"}${ag>=1?" and went up to "+f2(ag)+" points "+(high?"above":"below")+" it":" and never went back "+(high?"above":"below")+" it"}. ${mv>ag*1.5?"The reversal idea worked here.":ag>mv*1.5?"It kept going the other way, which is exactly the sweep's weakness: pokes are often real breakouts.":"It chopped, so it was not a clean call either way."}`,
        levels:[{y:lv.y,label:"swept "+(high?"high":"low")+" "+f2(lv.y),color:"#ff8a3d"}],
        markers:[{i:sw.j,y:high?H[sw.j]:L[sw.j],text:"sweep",color:"#ff8a3d",shape:high?"down":"up"}],
        tap:lv.sw==null?{kind:"candle",i:sw.j,y:high?H[sw.j]:L[sw.j],prompt:"In the last few candles price took out the stops "+(high?"above":"below")+" a marked level (the dashed lines) and then closed back. Tap the candle that did the sweep."}:undefined});
    }

    /* 4. opening range breakout or fakeout */
    if(sc.orDone){
      const ORH=sc.ORH,ORL=sc.ORL;let ev=null;
      for(let j=sc.s+6;j<=k;j++){
        const up=C[j]>ORH,dn=C[j]<ORL;
        if((up||dn)&&!(C[j-1]>ORH&&up)&&!(C[j-1]<ORL&&dn)){
          const back=upTo(j+1,Math.min(k,j+3),x=>(up?C[x]<=ORH:C[x]>=ORL)?x:0);
          ev={j,up,back};
        }
      }
      if(ev&&k-ev.j<=30){
        const up=ev.up,lvl=up?ORH:ORL;
        const cont=upTo(k+1,fut,x=>(up?C[x]>lvl+A:C[x]<lvl-A)?x:0),ret=upTo(k+1,fut,x=>(up?C[x]<lvl:C[x]>lvl)?x:0);
        if(ev.back){
          add({id:"fakeout",guide:"fakeout",title:"Fakeout (failed breakout)",dir:up?-1:1,score:85,
            pre:`At ${tm(ev.j)} price closed ${up?"above":"below"} the opening range (${f2(ORL)} to ${f2(ORH)}), but within a few candles it closed back inside: a failed breakout, a setup that pulled the buyers in.`,
            post:cont&&(!ret||cont<ret)?`After that it broke out again at ${tm(cont)}, so the first failure did not stop it.`:ret?`Price then stayed back inside the range by ${tm(ret)}.`:"Price stayed around the range edge for the next three hours.",
            levels:[{y:lvl,label:"opening range "+(up?"high":"low"),color:"#ffd166"}]});
        }else{
          add({id:"orb",guide:"orb",title:"Opening range breakout",dir:up?1:-1,score:60,
            pre:`The first 30 minutes set a range of ${f2(ORL)} to ${f2(ORH)}. At ${tm(ev.j)} a candle closed ${up?"above":"below"} it and has held since.`,
            post:cont&&(!ret||cont<ret)?`It extended: price got more than one ATR (${RD.f0(A)} points) beyond the range by ${tm(cont)}.`:ret?`It failed to hold: price closed back inside the range at ${tm(ret)}.`:"Price stayed near the edge without extending or failing.",
            levels:[{y:lvl,label:"opening range "+(up?"high":"low"),color:"#ffd166"}]});
        }
      }
    }

    /* 5. VWAP */
    {let pv=0,vv=0,vw=C[k];for(let x=sc.s;x<=k;x++){const tp=(H[x]+L[x]+C[x])/3;pv+=tp*(RD.v[x]||1);vv+=(RD.v[x]||1)}if(vv)vw=pv/vv;
      const dist=(C[k]-vw)/A;
      let far=0;for(let x=Math.max(sc.s,k-25);x<=k;x++){let p2=0,v2=0;for(let y=sc.s;y<=x;y++){const tp=(H[y]+L[y]+C[y])/3;p2+=tp*(RD.v[y]||1);v2+=(RD.v[y]||1)}const d2=(C[x]-p2/v2)/A;if(Math.abs(d2)>Math.abs(far))far=d2}
      if(Math.abs(dist)>=2.2){
        const side=dist>0?1:-1;
        const back=upTo(k+1,fut,j=>(side>0?L[j]<=vw+.3*A:H[j]>=vw-.3*A)?j:0);
        add({id:"vwaprev",guide:"vwaprev",title:"Stretched from VWAP",dir:-side,score:55,
          pre:`Price (${f2(C[k])}) was ${dist>0?"above":"below"} VWAP (${f2(vw)}) by ${Math.abs(dist).toFixed(1)} ATR, a big stretch, like a rubber band pulled tight.`,
          post:back?`Price did snap back to VWAP at ${tm(back)}, ${back-k} candle${back-k>1?"s":""} later.`:"Price never got back to VWAP in the next three hours: on trend days a stretch can last.",
          levels:[{y:vw,label:"VWAP "+f2(vw),color:"#a78bfa"}]});
      }else if(Math.abs(dist)<.5&&Math.abs(far)>=1.5&&Math.sign(far)!==0){
        const side=far>0?1:-1;
        const res=upTo(k+1,Math.min(n-1,k+12),j=>(side>0?H[j]>C[k]+A:L[j]<C[k]-A)?j:0);
        add({id:"vwaptrend",guide:"vwaptrend",title:"Dip back to VWAP",dir:side,score:55,
          pre:`Price had been ${far>0?"above":"below"} VWAP and was now back at it (${f2(vw)}), the spot a VWAP trend trader waits for.`,
          post:res?`It bounced: price moved more than one ATR in that direction by ${tm(res)}.`:"There was no quick bounce in the next hour.",
          levels:[{y:vw,label:"VWAP "+f2(vw),color:"#a78bfa"}]});
      }}

    /* 6. support and resistance on a key level */
    {let best=null;
      [{y:sc.PDH,name:"yesterday's high"},{y:sc.PDL,name:"yesterday's low"},{y:sc.ONH,name:"the overnight high"},{y:sc.ONL,name:"the overnight low"}].forEach(lv=>{const d=Math.abs(C[k]-lv.y);if(d<=.6*A&&(!best||d<best.d))best={lv,d}});
      if(best&&!out.some(o=>o.id==="sweep")){
        const y=best.lv.y,above=C[k]>=y;
        const res=upTo(k+1,fut,j=>(above?C[j]<y-.5*A:C[j]>y+.5*A)?{j,broke:1}:(above?C[j]>y+A:C[j]<y-A)?{j,broke:0}:null);
        add({id:"sr",guide:"srtrade",title:"A key level",dir:0,score:50,
          pre:`Price was sitting right on ${best.lv.name} (${f2(y)}), a level lots of traders watch, a spot with a history.`,
          post:res?(res.broke?`Price then broke through it at ${tm(res.j)}.`:`Price then moved away from it, holding it, at ${tm(res.j)}.`):"Price hung around the level without a decisive move.",
          levels:[{y,label:best.lv.name+" "+f2(y),color:"#ffd166"}]});
      }}

    /* 7. session timing */
    {const open=sc.s,mins=RD.m[k];let rng=0;for(let x=k-11;x<=k;x++)rng+=H[x]-L[x];rng/=12;let r0=0;for(let x=open;x<open+12;x++)r0+=H[x]-L[x];r0/=12;
      if(k>open+36&&rng<.55*r0)add({id:"timing",guide:"sessiontime",title:"A dead block",dir:0,score:35,pre:`It was ${tm(k)} and candles were about ${Math.round(rng/r0*100)}% as big as the opening hour's. A dead block is where the tax (spread and fees) eats the setup.`,post:"Whether a quiet stretch is worth trading depends on your own data, but a session filter would have kept you out."});
      else if(mins<=630)add({id:"timing",guide:"sessiontime",title:"The busy open",dir:0,score:30,pre:`It was ${tm(k)}, inside the busy first hour after the open, when volume and volatility are highest and the block is loud.`,post:"Fast markets give faster results in both directions, so how much weight you carry and where you walk matter even more."});}

    out.sort((a,b)=>b.score-a.score);
    return out.slice(0,3);
  };
})();
