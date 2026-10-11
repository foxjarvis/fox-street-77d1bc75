/* Intro video: a narrated, animated introduction to trading for people who know nothing. Narration audio and its real lengths come from js/introdata.js (built by tools/build_intro_audio.py); the pictures are drawn here as SVG and timed to the sentences, so no video file is needed. */
(function(){
  const G="#26dfa3",RD="#ff5d7c",Y="#ffd166",B="#5aa9ff",P="#a78bfa",INK="#eaf2ff",MUT="#8aa2c4",DK="#0d1a2e";
  const f1=n=>(+n).toFixed(2);
  const A=(cls,d,extra="")=>` class="${cls}" style="animation-delay:${f1(d)}s;${extra}"`;
  const tx=(x,y,t,s=28,fill=INK,d=0,anc="middle",w=800)=>`<text x="${x}" y="${y}" font-size="${s}" fill="${fill}" text-anchor="${anc}" font-weight="${w}" font-family="system-ui,Segoe UI,sans-serif"${A("vf",d)}>${t}</text>`;
  const rc=(x,y,w,h,fill,d=0,r=12,stroke="none",sw=2)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${A("vf",d)}/>`;
  const ln=(x1,y1,x2,y2,col,w=3,d=0,dash="")=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" ${dash?`stroke-dasharray="${dash}"`:""}${A("vf",d)}/>`;
  const pa=(dd,col,w=5,d=0,dur=1.4)=>`<path d="${dd}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" pathLength="1000"${A("vd",d,`animation-duration:${dur}s`)}/>`;
  const ci=(x,y,r,fill,d=0,pop=false)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"${A(pop?"vp":"vf",d)}/>`;
  const em=(x,y,t,s,d=0)=>`<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle"${A("vp",d)}>${t}</text>`;
  // candle: y values in pixels (smaller y = higher price)
  const cd=(x,yo,yh,yl,yc,w,d)=>{const up=yc<yo,col=up?G:RD,top=Math.min(yo,yc),h=Math.max(4,Math.abs(yc-yo));return `<g${A("vf",d)}><line x1="${x}" y1="${yh}" x2="${x}" y2="${yl}" stroke="${col}" stroke-width="${Math.max(3,w*.14)}" stroke-linecap="round"/><rect x="${x-w/2}" y="${top}" width="${w}" height="${h}" rx="3" fill="${col}"/></g>`};
  const foxAt=(x,y,w,mood,d=0)=>`<g${A("vp",d)}>${foxF(mood).replace("<svg ",`<svg x="${x}" y="${y}" width="${w}" height="${w*1.4}" `)}</g>`;
  const tmp=(d,dur,inner)=>`<g class="vtmp" style="animation-delay:${f1(d)}s;animation-duration:${f1(dur)}s">${inner.replace(/animation-delay:([\d.]+)s/g,(m,v)=>"animation-delay:"+f1(+v+d)+"s")}</g>`;
  const pill=(x,y,w,h,txt,fill,d,tc="#06121f",s=24)=>rc(x,y,w,h,fill,d,h/2)+tx(x+w/2,y+h/2+s*.35,txt,s,tc,d+.05);

  // VIS[id](at, D) returns the inside of the 960x540 picture. at(k) = seconds when sentence k starts.
  const VIS={
    welcome:(at)=>foxAt(50,70,280,"happy",0.2)+tx(640,150,"Trader Fox's Trading School",42,INK,0.4)+tx(640,196,"learn trading the street way",28,Y,0.7)+tx(640,232,"with Mrs. Francis, Trader Fox's partner",24,INK,at(0)+1.6)+
      [["What trading is",G],["How prices move",B],["Reading a chart",P],["Risk, the real game",Y]].map((c,i)=>pill(450,262+i*56,380,44,c[0],c[1],at(1)+i*.7)).join("")+
      tx(640,505,"No hype. No promises. Nobody running game.",26,MUT,at(2)),

    what:(at)=>em(130,150,"📦",84,at(1))+tx(130,225,"pick up a unit",26,MUT,at(1))+tx(130,262,"40¢",44,RD,at(1)+.2)+
      tx(305,170,"→",64,MUT,at(1)+.8)+em(480,150,"💵",84,at(1)+1.0)+tx(480,225,"move it",26,MUT,at(1)+1.0)+tx(480,262,"60¢",44,G,at(1)+1.2)+
      tx(750,170,"+20¢",72,G,at(2))+tx(750,215,"profit",26,MUT,at(2)+.2)+
      rc(70,310,820,64,"#10233d",at(4),14,B)+tx(480,352,"TRADE:  buy at 100  →  sell at 120  =  +20",28,INK,at(4)+.1)+
      rc(70,400,820,64,"#10233d",at(5),14,Y)+tx(480,442,"SHORT:  sell at 120  →  buy back at 100  =  +20",28,INK,at(5)+.1)+
      tx(480,510,"You only profit if price moves your way.",26,Y,at(6)),

    why:(at)=>
      rc(40,120,170,90,"#134a3a",at(2)-.6,16,G)+tx(125,178,"BUYERS",32,G,at(2)-.5)+rc(380,120,170,90,"#4a1a28",at(3)-.6,16,RD)+tx(465,178,"SELLERS",32,RD,at(3)-.5)+
      ln(215,165,375,165,MUT,8,at(1),"14 10")+
      tmp(at(2),at(3)-at(2),ci(330,165,26,G,0)+tx(330,220,"buyers pull: price rises",24,G,0.1))+tmp(at(3),at(4)-at(3),ci(260,165,26,RD,0)+tx(260,220,"sellers pull: price falls",24,RD,0.1))+
      rc(590,70,330,300,"#0a1424",at(1)+.4,16,"#1d3354")+pa("M610 300 L680 250 L735 270 L800 190 L860 150",G,6,at(2),1.6)+pa("M860 150 L880 210 L900 260",RD,6,at(3),1.2)+
      tx(755,350,"price",24,MUT,at(2))+
      tx(480,470,"A chart is the record of the tug of war.",30,Y,at(4)),

    nasdaq:(at)=>em(110,150,"🏦",90,at(1))+tx(110,215,"NASDAQ",30,B,at(1)+.2)+tx(110,246,"a stock exchange",20,MUT,at(1)+.4)+tx(110,270,"in New York",20,MUT,at(1)+.5)+
      (()=>{let s="";for(let i=0;i<100;i++){const x=250+(i%10)*34,y=100+Math.floor(i/10)*30;s+=`<circle cx="${x}" cy="${y}" r="9" fill="${i===9||i===49||i===89?Y:"#2a4468"}"${A("vp",at(2)+i*.03)}/>`}return s})()+
      tx(578,107,"Apple",24,Y,at(2)+1.4,"start")+tx(578,227,"Microsoft",24,Y,at(2)+1.8,"start")+tx(578,347,"Nvidia",24,Y,at(2)+2.2,"start")+
      tx(480,420,"NASDAQ 100: 100 of its biggest non-financial companies",24,INK,at(3))+
      pill(60,455,250,56,"Exchange",B,at(4),"#06121f",24)+pill(355,455,250,56,"Composite (3,000+)",P,at(4)+.5,"#06121f",22)+pill(650,455,250,56,"Nasdaq 100 (100)",G,at(4)+1,"#06121f",22),

    futures:(at)=>rc(40,70,430,360,"#0a1424",at(1)-1,18,"#1d3354")+tx(255,130,"MNQ",56,Y,at(1))+tx(255,168,"Micro E-mini Nasdaq 100 future",20,MUT,at(1)+.2)+
      tx(255,240,"1 point = $2",42,G,at(3))+tx(255,300,"¼ point = $0.50",34,B,at(3)+1.2)+tx(255,370,"(per contract)",22,MUT,at(3)+1.6)+
      ln(560,100,560,430,"#2a4468",3,at(4)-1)+(()=>{let s="";for(let k=0;k<=5;k++)s+=tx(545,430-k*66,String(100+k*2),20,MUT,at(4)-.8,"end",600);return s})()+
      tmp(at(4),at(5)-at(4),`<g>${pa("M620 430 L620 100",G,10,0.1,1.6)}${tx(740,120,"+10 points",30,G,.2)}${tx(740,170,"= +$20",44,G,.5)}</g>`)+
      tmp(at(5),at(6)-at(5)+3.5,`<g>${pa("M620 100 L620 430",RD,10,0.1,1.6)}${tx(740,380,"-10 points",30,RD,.2)}${tx(740,430,"= -$20",44,RD,.5)}</g>`),

    candle:(at)=>{const x=250;return cd(x,330,130,390,200,90,at(1)-.2)+
      tx(x+120,134,"HIGH",24,Y,at(1)+.3,"start")+ln(x+46,130,x+112,130,Y,3,at(1)+.3)+
      tx(x+120,336,"OPEN",24,B,at(1)+1.4,"start")+ln(x+46,330,x+112,330,B,3,at(1)+1.4)+
      tx(x+120,206,"CLOSE",24,G,at(1)+2.6,"start")+ln(x+46,200,x+112,200,G,3,at(1)+2.6)+
      tx(x+120,394,"LOW",24,P,at(1)+3.8,"start")+ln(x+46,390,x+112,390,P,3,at(1)+3.8)+
      pill(40,452,290,44,"GREEN: closed higher",G,at(2))+
      cd(700,180,130,340,300,90,at(3)-.2)+pill(560,452,290,44,"RED: closed lower",RD,at(3),"#06121f",22)+
      tmp(at(4),at(5)-at(4),tx(700,95,"wicks: how far price went",24,Y,0.1)+ln(700,100,700,128,Y,3,.3))+

      tx(480,515,"One candle: little. Many in a row: a story.",26,INK,at(5)+.2)},

    frames:(at)=>(()=>{let s="";for(let i=0;i<12;i++){const o=330-i*6+(i%3)*10,c=o-(i%2?-14:22);s+=cd(70+i*44,o,Math.min(o,c)-12,Math.max(o,c)+12,c,22,at(0)+.2+i*.25)}return s})()+
      tx(300,430,"12 five-minute candles",24,MUT,at(0)+1)+tx(640,300,"=",56,Y,at(1))+
      cd(780,330,170,370,200,110,at(1)+.3)+tx(780,430,"one 1-hour candle",24,MUT,at(1)+.6)+
      [["1 min",B],["5 min",G],["1 hour",Y],["1 day",P]].map((c,i)=>pill(80+i*210,60+0,180,40,c[0],c[1],at(1)+i*.4)).join("")+
      tmp(at(2),at(3)-at(2),rc(250,470,460,56,"#134a3a",0,14,G)+tx(480,508,"ZOOM OUT: trend and big levels",28,G,.1))+
      tmp(at(3),at(4)-at(3),rc(250,470,460,56,"#1a2c4a",0,14,B)+tx(480,508,"ZOOM IN: timing your entry",28,B,.1))+
      tmp(at(4),at(4)+9,rc(190,470,580,56,"#2a2440",0,14,Y)+tx(480,508,"The practice game has these same buttons",26,Y,.1)),

    structure:(at)=>pa("M60 400 L150 330 L210 360 L320 270 L380 300 L500 200 L560 230 L690 130",G,7,at(1)-.2,3)+
      tx(320,258,"HH",26,Y,at(1)+1.2)+tx(500,188,"HH",26,Y,at(1)+2)+tx(210,392,"HL",26,B,at(1)+.8)+tx(380,334,"HL",26,B,at(1)+1.6)+tx(690,118,"higher highs, higher lows",24,G,at(1)+3,"middle")+
      tmp(at(2),at(3)-at(2),pa("M730 160 L800 230 L840 210 L900 300",RD,7,0.1,1.4)+tx(815,340,"downtrend: the opposite",22,RD,.5))+
      ln(40,460,920,460,G,4,at(3),"12 8")+tx(900,448,"support (floor)",22,G,at(3)+.2,"end")+ln(40,95,920,95,RD,4,at(3)+.8,"12 8")+tx(900,84,"resistance (ceiling)",22,RD,at(3)+1,"end")+
      pill(200,495,560,40,"Mark levels BEFORE the session starts",Y,at(4),"#06121f",24),

    patterns:(at)=>rc(30,100,290,280,"#0a1424",at(1),16,"#1d3354")+cd(80,300,250,330,280,36,at(1)+.3)+cd(140,255,180,265,200,36,at(1)+.5)+cd(200,205,160,215,170,36,at(1)+.7)+rc(100,215,120,50,"#ffd16633",at(1)+1,6,Y)+tx(175,360,"Fair value gap",24,Y,at(1)+1.1)+
      rc(345,100,290,280,"#0a1424",at(1)+.5,16,"#1d3354")+ln(370,210,610,210,Y,3,at(1)+.8,"10 8")+cd(400,300,230,320,260,36,at(1)+.9)+cd(470,260,150,275,160,36,at(1)+1.1)+cd(540,170,180,290,260,36,at(1)+1.3)+tx(490,360,"Liquidity sweep",24,B,at(1)+1.4)+
      rc(660,100,270,280,"#0a1424",at(1)+1,16,"#1d3354")+ln(680,230,910,230,P,3,at(1)+1.2,"10 8")+cd(720,300,250,320,275,34,at(1)+1.3)+cd(780,270,240,285,255,34,at(1)+1.5)+cd(840,250,170,255,180,34,at(1)+1.7)+tx(795,360,"Breakout",24,P,at(1)+1.8)+
      tmp(at(2),at(3)-at(2)+1,rc(210,410,540,70,"#4a3510",0,16,Y)+tx(480,455,"Evidence: thin. Be skeptical.",34,Y,.1))+
      tmp(at(3),at(4)-at(3),rc(210,410,540,70,"#134a3a",0,16,G)+tx(480,455,"Spot it, then TEST it. Costs included.",28,G,.1))+
      tx(480,520,"A pattern is a question to ask, not a promise.",28,INK,at(4)),

    risk:(at)=>ln(130,270,830,270,B,5,at(1))+tx(130,255,"ENTRY",24,B,at(1)+.1,"start")+
      rc(130,270,700,110,"#4a1a2899",at(2),0,RD)+tx(480,335,"STOP: where you're wrong   (lose 1R)",28,RD,at(2)+.2)+
      rc(130,50,700,220,"#134a3a99",at(4),0,G)+tx(480,170,"TARGET: where you take profit   (win 2R)",28,G,at(4)+.2)+
      pill(150,410,660,56,"Risk $1 to make $2: win ~1 in 3 to break even",Y,at(5),"#06121f",26)+
      tx(480,510,"Size it so a loss is small enough to take again and again.",26,INK,at(6)),

    truth:(at)=>(()=>{let s="";for(let i=0;i<100;i++){const x=60+(i%10)*30,y=90+Math.floor(i/10)*30;s+=`<circle cx="${x}" cy="${y}" r="10" fill="${i<97?RD:G}"${A("vp",at(1)+i*.04)}/>`}return s})()+
      tx(560,200,"97%",120,RD,at(1)+.6,"start",900)+tx(560,236,"of Brazilian futures day traders who kept",20,MUT,at(1)+1,"start",600)+tx(560,262,"going for 300+ days lost money (one study)",20,MUT,at(1)+1.1,"start",600)+
      tmp(at(2),at(3)-at(2)+2,rc(540,290,390,150,"#10233d",0,16,Y)+tx(735,360,"under 1%",56,Y,.1)+tx(735,400,"predictably profitable after costs (Taiwan study)",19,MUT,.3))+
      pill(120,470,720,50,"Never trade money you can't afford to lose.",RD,at(4),"#fff",26),

    prop:(at)=>[["Pay a fee",B],["Pass the evaluation",Y],["Get fronted: trade the firm's money",G]].map((c,i)=>pill(30+i*310,70,290,60,c[0],c[1],at(1)+i*.9,"#06121f",22)).join("")+tx(320,108,"→",36,MUT,at(1)+.6)+tx(630,108,"→",36,MUT,at(1)+1.5)+
      rc(110,170,740,230,"#0a1424",at(2)-.6,18,"#1d3354")+tx(480,212,"Example: $50,000 evaluation",26,INK,at(2))+
      rc(150,250,660,26,"#16273f",at(2)+.3,13)+rc(150,250,264,26,"#4a1a28",at(2)+.5,13)+rc(414,250,396,26,"#134a3a",at(2)+.5,13)+
      ln(414,238,414,288,INK,4,at(2)+.8)+tx(414,310,"start",20,INK,at(2)+.9)+tx(414,332,"$50,000",20,MUT,at(2)+.9)+
      ln(150,238,150,288,RD,5,at(2)+1.1)+tx(150,310,"max loss limit",20,RD,at(2)+1.2,"start")+tx(150,332,"touch it and it's over",18,MUT,at(2)+1.3,"start")+
      ln(810,238,810,288,G,5,at(2)+1.4)+tx(810,310,"profit target",20,G,at(2)+1.5,"end")+tx(810,332,"hit it to pass",18,MUT,at(2)+1.6,"end")+
      tx(480,375,"Rules differ by firm and change. Read them line by line.",22,Y,at(2)+1.9)+
      pill(150,415,660,56,"The practice game copies one popular rule set",P,at(3),"#06121f",26),

    next:(at)=>foxAt(40,90,250,"happy",0.2)+
      [["📚","Lessons, in order"],["🎮","Practice game on real history"],["🎯","Spot it: train your eyes"],["🪞","My habits: see your mistakes"],["📓","Keep a journal"]].map((r,i)=>em(380,180+i*56,r[0],38,at(1)+i*.7)+tx(430,190+i*56,r[1],28,INK,at(1)+i*.7,"start")).join("")+
      tmp(at(4),at(5)-at(4)+.5,rc(130,470,700,50,"#2a2440",0,14,Y)+tx(480,504,"Education only, not financial advice.",26,Y,.1))+
      tx(480,520,"Welcome to Trader Fox's Trading School",32,G,at(5))
  };

  window.introPage=function(){
    const D=window.INTRO;
    const app=document.getElementById("app");
    if(!D||!D.scenes||!D.scenes.length){app.innerHTML='<div class="ch"><div class="warn">The intro video data is missing. Refresh the page.</div></div>';return}
    const fmt=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
    const starts=[];let acc=0;D.scenes.forEach(s=>{starts.push(acc);acc+=s.dur+.7});const total=acc;
    app.innerHTML=`<div class="ch"><div class="chhead"><div class="em">▶️</div><div><h1>Intro to trading</h1><p>A short, narrated introduction for people who know nothing yet. About ${Math.round(total/60)} minutes. Come back to it any time.</p></div></div>
    <div class="vwrap"><div class="vstage vposter" id="vst"><svg id="vsvg" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid meet"></svg><button class="vbig" id="vbig" aria-label="Play">&#9654;</button><div class="vhint" id="vhint">Press the big play button. The picture and the voice start together. Turn your volume up.</div></div><div class="vcap" id="vcap"><span class="vva">${foxF("happy")}</span><span id="vct" class="vct"></span></div>
    <div class="vbar" id="vbar"><div class="vfill" id="vfill"></div>${starts.map((s,i)=>`<i class="vtick" style="left:${(s/total*100).toFixed(2)}%"></i>`).join("")}</div>
    <div class="vctl"><button class="btn sm" id="vpp">Play</button><button class="btn alt sm" id="vrep">Restart</button><span id="vtime" class="vtime">0:00 / ${fmt(total)}</span><label class="vopt">Volume <input type="range" id="vvol" min="0" max="1" step="0.05" value="1"></label><label class="vopt" style="margin-left:0"><input type="checkbox" id="vcc" checked> Captions</label></div><div class="cap" id="vstat" style="min-height:1.4em"></div>
    <div class="vchap" id="vchap">${D.scenes.map((s,i)=>`<button class="chip" data-i="${i}">${i+1}. ${s.title}</button>`).join("")}</div>
    <div class="cap">Education only, not financial advice. Figures come from the lessons and the sources on the Resources page. Every example price is made up.</div></div>
    <div class="pager"><span></span><a class="btn" href="#/ch/welcome">Start lesson 1</a></div></div>`;
    const $=id=>document.getElementById(id),svg=$("vsvg"),stage=$("vst");
    const audio=new Audio();audio.preload="auto";
    let idx=0,playing=false,raf=null,t0=0,tPause=0,fallback=false,ended=false,gap=null,sents=[],lastCap=-1;
    const say=txt=>{try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(txt);u.rate=1;u.volume=+$("vvol").value;speechSynthesis.speak(u)}catch(e){}};
    const toFallback=why=>{if(fallback)return;fallback=true;t0=performance.now();$("vstat").textContent=why+" Captions and your browser's own voice are on instead.";say(scene().text)};
    const sentences=t=>t.split(/(?<=[.?!])\s+/).filter(Boolean);
    const scene=()=>D.scenes[idx];
    function atFn(sc){const ss=sentences(sc.text),tot=ss.join(" ").length;let cum=0;const starts=ss.map(s=>{const v=cum/tot;cum+=s.length+1;return v});return k=>Math.min(sc.dur*.92,Math.max(0,(starts[Math.min(k,starts.length-1)]||0)*sc.dur+.2))}
    function cur(){return fallback?(performance.now()-t0)/1000:audio.currentTime}
    function draw(){const sc=scene();svg.innerHTML=(VIS[sc.id]?VIS[sc.id](atFn(sc),sc.dur):"")+"";sents=sentences(sc.text);lastCap=-1;$("vct").textContent="";
      document.querySelectorAll("#vchap .chip").forEach((b,i)=>b.classList.toggle("on",i===idx))}
    function tick(){
      const sc=scene(),t=Math.min(cur(),sc.dur);
      $("vfill").style.width=((starts[idx]+t)/total*100).toFixed(2)+"%";
      $("vtime").textContent=fmt(starts[idx]+t)+" / "+fmt(total);
      if($("vcc").checked){const tot=sents.join(" ").length;let cum=0,k=0;for(let j=0;j<sents.length;j++){if(t>=cum/tot*sc.dur-.05)k=j;cum+=sents[j].length+1}if(k!==lastCap){lastCap=k;$("vct").textContent=sents[k]}}else $("vct").textContent="";
      if(fallback&&t>=sc.dur-.01)return sceneEnd();
      raf=requestAnimationFrame(tick)}
    function sceneEnd(){cancelAnimationFrame(raf);if(idx>=D.scenes.length-1)$("vcap").classList.remove("speak");if(idx<D.scenes.length-1){gap=setTimeout(()=>{idx++;start(true)},700)}else{playing=false;ended=true;$("vpp").textContent="Watch again";$("vbig").style.display="";$("vbig").innerHTML="&#8635;";$("vfill").style.width="100%";if(window.foxSay)foxSay("That's the intro. Ready? Start with lesson one, or jump into the practice game.",{ms:9000})}}
    function start(auto){
      clearTimeout(gap);cancelAnimationFrame(raf);ended=false;draw();stage.classList.remove("paused");
      const sc=scene();audio.src=sc.audio;audio.currentTime=0;fallback=false;
      const go=()=>{playing=true;$("vcap").classList.add("speak");$("vpp").textContent="Pause";$("vbig").style.display="none";$("vhint").style.display="none";stage.classList.remove("vposter");raf=requestAnimationFrame(tick)};
      try{speechSynthesis.cancel()}catch(e){}
      audio.volume=+$("vvol").value;$("vstat").textContent="";
      const p=audio.play();
      if(p&&p.then)p.then(go).catch(()=>{toFallback("Your browser blocked the narration audio.");go()});else go();
    }
    audio.onended=()=>{if(!fallback)sceneEnd()};
    audio.onerror=()=>{if(playing&&!fallback)toFallback("The narration audio could not load.")};
    $("vvol").oninput=()=>{audio.volume=+$("vvol").value};
    function pause(){playing=false;$("vcap").classList.remove("speak");cancelAnimationFrame(raf);audio.pause();try{speechSynthesis.pause()}catch(e){}tPause=performance.now();stage.classList.add("paused");$("vpp").textContent="Play";$("vbig").style.display="";$("vbig").innerHTML="&#9654;"}
    function resume(){if(ended){idx=0;return start()}$("vcap").classList.add("speak");stage.classList.remove("paused");if(fallback){t0+=performance.now()-tPause;try{speechSynthesis.resume()}catch(e){}}else audio.play().catch(()=>{});playing=true;$("vpp").textContent="Pause";$("vbig").style.display="none";raf=requestAnimationFrame(tick)}
    const toggle=()=>{if(!audioStarted){audioStarted=true;return start()}playing?pause():resume()};
    let audioStarted=false;
    $("vpp").onclick=toggle;$("vbig").onclick=toggle;
    $("vrep").onclick=()=>{idx=0;audioStarted=true;start()};
    document.querySelectorAll("#vchap .chip").forEach(b=>b.onclick=()=>{idx=+b.dataset.i;audioStarted=true;start()});
    $("vbar").onclick=e=>{const r=$("vbar").getBoundingClientRect(),x=(e.clientX-r.left)/r.width*total;let k=0;starts.forEach((s,i)=>{if(x>=s)k=i});idx=k;audioStarted=true;start()};
    const key=e=>{if(e.code==="Space"&&!/INPUT|TEXTAREA|SELECT|BUTTON/.test((document.activeElement||{}).tagName||"")){e.preventDefault();toggle()}};
    document.addEventListener("keydown",key);
    addEventListener("hashchange",()=>{try{speechSynthesis.cancel()}catch(e){}cancelAnimationFrame(raf);clearTimeout(gap);audio.pause();audio.removeAttribute("src");document.removeEventListener("keydown",key)},{once:true});
    draw();stage.classList.add("paused"); // first frame shown, waiting for Play
    scrollTo(0,0);
  };
})();
