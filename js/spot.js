/* Spot it: a drill. A real chart is frozen at one moment (no peeking ahead). You tap where the pattern is BEFORE being told, then it grades you and shows the answer with the guide. */
W.spot=el=>{
  if(!RD){box(el,"Spot it",'<div class="warn">The real-data file did not load. Refresh the page.</div>');return}
  const KEY="wick_spot";
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}};
  const T=Object.assign({n:0,ok:0,streak:0,best:0,by:{},hard:false},load());
  const save=()=>localStorage.setItem(KEY,JSON.stringify(T));
  const b=box(el,"Spot it: find the pattern",`
  <div class="note" style="margin-top:0"><b>How it works.</b> Learn to spot the setup before it sets you up. You get a real chart (NQ futures, 5-minute candles, date hidden), frozen at one moment with nothing after it. Read the question, then <b>tap the chart</b> where the pattern is. Then Fox grades you, shows the answer and points you to the guide. Dashed lines are yesterday's and the overnight highs and lows.</div>
  <div class="ctrl"><label style="flex-direction:row;align-items:center;gap:8px;min-width:0;flex:1 1 100%"><input type="checkbox" id="shd"> Hard mode: do not tell me which pattern to find. Tap the most important pattern you can see from the Watch &amp; learn guides.</label></div>
  <div class="kpis" id="sk"></div>
  <div class="ctxcard" id="sq"></div>
  <div id="sg"></div>
  <div class="out" id="so">Tap the chart where you think it is.</div>
  <div class="ctrl"><button class="btn alt sm" id="sh">Hint</button><button class="btn alt sm" id="ss">Show me the answer</button><button class="btn sm" id="sn" style="display:none">Next chart</button></div>
  <div class="cap">Patterns are found by plain rules on the real candles and are named ideas, not guarantees. Spotting them is a skill, but spotting is not the same as having an edge.</div>`);
  const q=s=>b.querySelector(s);
  const ch=mkChart(q("#sg"),{height:340});
  q("#shd").checked=!!T.hard;
  let sc=null,pats=[],pat=null,a0=0,done=false;
  const WIN=80;
  const usdp=x=>RD.f2(x);
  const stats=()=>{const acc=T.n?Math.round(T.ok/T.n*100):0;
    const rows=Object.entries(T.by).sort((x,y)=>y[1].n-x[1].n).slice(0,4).map(([id,v])=>`${v.t||id}: ${v.ok}/${v.n}`).join(" &middot; ");
    q("#sk").innerHTML=`<div class="kpi"><small>Rounds</small><b>${T.n}</b></div><div class="kpi"><small>Accuracy</small><b>${acc}%</b></div><div class="kpi"><small>Streak</small><b>${T.streak}</b></div><div class="kpi"><small>Best streak</small><b>${T.best}</b></div>${rows?`<div class="cap" style="flex:1 1 100%;margin:4px 0 0">By pattern: ${rows}</div>`:""}`};
  const draw=(reveal,tap)=>{
    const end=sc.k,a=Math.max(0,end-WIN+1);a0=a;
    const cs=[];for(let i=a;i<=end;i++)cs.push({o:RD.o[i],h:RD.h[i],l:RD.l[i],c:RD.c[i],v:RD.v[i]});
    const times=[];for(let i=a;i<=end;i++){const mm=RD.m[i]%60;times.push(mm===0||mm===30?RD.hhmm(RD.m[i]):"")}
    const levels=[{y:sc.PDH,label:"yesterday high",color:"#ffd166",noscale:true},{y:sc.PDL,label:"yesterday low",color:"#ffd166",left:true,noscale:true},{y:sc.ONH,label:"overnight high",color:"#5aa9ff99",left:true,noscale:true},{y:sc.ONL,label:"overnight low",color:"#5aa9ff99",noscale:true}];
    let boxes=[],markers=[],vl=[];
    if(sc.s>=a&&sc.s<=end)vl.push({i:sc.s-a,label:"9:30 open",color:"#ffffff66"});
    if(reveal){
      pats.filter(p=>p.tap).forEach(p=>{
        const hot=p===pat;
        p.boxes.forEach(bx=>boxes.push({...bx,i0:Math.max(0,bx.i0-a),i1:bx.i1==null?null:bx.i1-a,stroke:hot?"#26dfa3":bx.stroke,color:hot?"#26dfa340":bx.color,label:hot?"ANSWER: "+bx.label:bx.label}));
        p.markers.forEach(m=>{const i=m.i-a;if(i>=0)markers.push({...m,i,color:hot?"#26dfa3":m.color})});
        p.levels.forEach(lv=>levels.push(lv));
      });
      if(pat&&pat.tap.kind!=="zone"){const t=pat.tap;markers.push({i:t.i-a,y:t.y!=null?t.y:(pat.markers[0]?pat.markers[0].y:RD.h[t.i]),color:"#26dfa3",text:"answer",shape:"dot"})}
    }
    if(tap)markers.push({i:tap.i-a,y:tap.price,color:"#5aa9ff",text:"you",shape:"dot"});
    ch.set(cs,{levels,boxes,markers,vlines:vl,times,title:"Real NQ futures, 5-minute candles (date hidden). The last candle is now."});
  };
  const newRound=()=>{
    done=false;q("#sn").style.display="none";q("#ss").style.display="";q("#sh").style.display="";
    let tries=0;pat=null;
    while(tries++<120){
      sc=RD.pickScenario("any");if(!sc)continue;
      pats=findPatterns(sc,sc.k);const cand=pats.filter(p=>p.tap);if(!cand.length)continue;
      pat=cand[Math.floor(Math.random()*cand.length)];break;
    }
    if(!pat){q("#so").textContent="Could not build a round. Try again.";return}
    q("#sq").innerHTML=T.hard?`<b>Hard mode.</b> Find the most important pattern on this chart and tap it. Look for a gap, a sweep of a marked level, a swing point, or a pullback.`:`<b>Your task:</b> ${pat.tap.prompt}`;
    q("#so").innerHTML="Tap the chart where you think it is.";draw(false);stats();
    if(window.foxSay)foxSay(T.n?"New chart. Take your time, nothing is moving.":"Tap the chart where you think the pattern is. No clock, no penalty for being wrong, that is how you learn it.",{ms:8000});
  };
  const hit=(p,i,price)=>{const t=p.tap,A=sc.ATR;
    if(t.kind==="zone")return i>=t.i0-1&&price>=t.y0-.2*A&&price<=t.y1+.2*A;
    if(t.kind==="candle")return Math.abs(i-t.i)<=1;
    if(t.kind==="point")return Math.abs(i-t.i)<=2&&Math.abs(price-t.y)<=.9*A;
    return false};
  const record=(p,ok)=>{T.n++;if(ok){T.ok++;T.streak++;T.best=Math.max(T.best,T.streak)}else T.streak=0;const v=T.by[p.id]=T.by[p.id]||{n:0,ok:0,t:p.title};v.n++;if(ok)v.ok++;save()};
  const finishRound=(ok,found,tap,note)=>{
    done=true;
    const show=pat;
    draw(true,tap);
    q("#sn").style.display="";q("#ss").style.display="none";q("#sh").style.display="none";
    const guide=p=>`<a href="#/see/${p.guide}" target="_blank" rel="noopener">&#9654; Watch the guide: ${p.title}</a>`;
    q("#so").innerHTML=`${ok?'<b class="up">Got it!</b>':'<b class="dn">Not quite.</b>'} ${note||""}<div class="foxnote"><span class="fx">${fox(ok?"happy":"think")}</span><div><b>Fox says:</b> ${found.pre}<br><i>What happened next:</i> ${found.post}<br>${guide(found)}</div></div>`;
    stats();
    if(window.foxSay)foxSay(ok?"Yes. You found it. Do it again on a different chart so it sticks.":"Close, and now you have seen it. Look at the green answer on the chart, then try the next one.",{mood:ok?"happy":"think",ms:9000});
  };
  ch.onClick=(i,price)=>{
    if(done||!sc)return;
    const abs=a0+i,tap={i:abs,price};
    if(T.hard){
      const found=pats.filter(p=>p.tap&&hit(p,abs,price))[0];
      if(found){pat=found;record(found,true);finishRound(true,found,tap,`You found the <b>${found.title.toLowerCase()}</b>.`)}
      else{const any=pats.filter(p=>p.tap)[0];record(any,false);pat=any;finishRound(false,any,tap,"Nothing matched where you tapped. Here is what was on the chart.")}
      return}
    const ok=hit(pat,abs,price);record(pat,ok);finishRound(ok,pat,tap,"");
  };
  q("#ss").onclick=()=>{if(done||!sc)return;record(pat,false);finishRound(false,pat,null,"Here is the answer.")};
  q("#sh").onclick=()=>{if(done||!sc)return;q("#so").innerHTML=`Hint: this is the <b>${pat.title.toLowerCase()}</b> idea. <a href="#/see/${pat.guide}" target="_blank" rel="noopener">&#9654; Open the guide in a new tab</a>, then come back and tap.`};
  q("#sn").onclick=newRound;
  q("#shd").onchange=()=>{T.hard=q("#shd").checked;save();newRound()};
  newRound();
};
