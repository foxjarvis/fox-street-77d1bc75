/* Practice game on REAL history: 5-minute candles of E-mini Nasdaq-100 futures (NQ). You get a context summary, make a call, and the trade plays out until the stop or the target is actually hit. */
W.practice=el=>{
  if(!RD){box(el,"Practice game",'<div class="warn">The real-data file did not load. Refresh the page.</div>');return}
  /* LucidFlex evaluation rules, from Lucid's own support pages (checked 2026-10-10): profit target, max loss limit (end-of-day trailing), max size. trail = initial trail balance, after which the loss limit locks at size + $100. Firms change rules: always check theirs. */
  const L={25000:{mll:1000,tgt:1250,cap:20,trail:26100},50000:{mll:2000,tgt:3000,cap:40,trail:52100},100000:{mll:3000,tgt:6000,cap:60,trail:103100},150000:{mll:4500,tgt:9000,cap:100,trail:154600}};
  const fresh=sz=>({size:sz,n:0,w:0,r:0,curve:[0],skips:0,log:[],bal:sz,eq:[sz],peak:sz,hwm:sz,days:{},status:"active",p:0,f:0});
  const load=()=>{try{return JSON.parse(localStorage.getItem("wick_practice4"))||null}catch(e){return null}};
  const all=Object.assign({cur:50000,a:{}},load()||{});
  const getAcct=sz=>{all.a[sz]=Object.assign(fresh(sz),all.a[sz]||{});return all.a[sz]};
  let st=getAcct(all.cur);
  const persist=()=>{all.a[st.size]=st;all.cur=st.size;localStorage.setItem("wick_practice4",JSON.stringify(all))};
  const cfg=()=>L[st.size],mllLevel=()=>Math.min(st.hwm-cfg().mll,st.size+100);
  const bigDay=()=>Math.max(0,...Object.values(st.days));
  let level=localStorage.getItem("wick_ctx_level")||"beginner";
  const meta=RD.meta;
  const b=box(el,"Trade a real day (practice game)",`
  <div class="note" style="margin-top:0"><b>How it works.</b> Think of it as running the route empty before you carry anything. Every chart is <b>real history</b> of Nasdaq-100 futures (NQ), 5-minute candles, from ${meta.start} to ${meta.end}. Switch the chart between 5 minute, 15 minute, 30 minute, 1 hour, 4 hour and daily candles (all built from the same real data, with no peeking ahead: the last candle is still forming). The date stays hidden until you finish, so you cannot look it up. You get a summary of what was going on, make a call (Buy, Sell or Skip), set your own stop and target by dragging the lines on the chart (or typing prices) on a simulated <b>prop firm evaluation account</b> that follows <b>Lucid's LucidFlex rules</b> (pick 25K, 50K, 100K or 150K), and then the candles play out <b>until your stop or your target is actually hit</b>. Your score is in <b>R</b> (1R = what you risked) and in dollars on the account (MNQ, $2 per point per contract).</div>
  <div class="modes" id="pl" role="group" aria-label="Summary level"><button data-l="beginner">Beginner summary</button><button data-l="advanced">Advanced summary</button></div>
  <div class="ctxcard" id="pctx"></div>
  <div id="pfs" class="pfs">
  <div id="pg"><div class="ovl" id="povl"><div class="ovrow" id="ptf" role="group" aria-label="Chart timeframe"><button class="chip on" data-tf="5">5m</button><button class="chip" data-tf="15">15m</button><button class="chip" data-tf="30">30m</button><button class="chip" data-tf="60">1H</button><button class="chip" data-tf="240">4H</button><button class="chip" data-tf="1440">D</button></div><div class="ovrow" id="pvw" role="group" aria-label="Chart view"><button class="chip" id="pspd" style="display:none" title="Replay speed: tap to change"></button><button class="chip" data-v="out" aria-label="Zoom out" title="Zoom out">&minus;</button><button class="chip" data-v="in" aria-label="Zoom in" title="Zoom in">+</button><button class="chip" data-v="reset" aria-label="Reset view" title="Reset view">&#10227;</button><button class="chip" data-v="fs" aria-label="Full screen" title="Full screen">&#9974;</button></div></div></div>
  <div class="cap" id="ptfn" style="margin:2px 0 6px"></div>
  <div id="s2" style="display:none"><div class="cap" id="p2t" style="margin:0 0 4px"></div><div class="ctrl cmp"><label>Stop<input type="number" id="pstp" step="0.25"></label><label>Target<input type="number" id="ptgp" step="0.25"></label><label>Contracts<input type="number" id="pn2" min="1" max="20" step="1" value="1"></label></div>
    <div class="gauge" id="pgauge"></div>
    <details class="moreopt"><summary>More options and tips</summary><div class="ctrl"><label style="flex-direction:row;align-items:center;gap:8px;min-width:0;flex:1 1 100%"><input type="checkbox" id="pc" checked> Include trading costs (0.5 point, about $1 on one MNQ, per trade)</label></div><div class="ctrl"><label style="flex-direction:row;align-items:center;gap:8px;min-width:0;flex:1 1 100%"><input type="checkbox" id="pe"> Close the trade at 4:00 PM if it is still open (day trader rule)</label></div><div class="cap">Drag the red STOP and green TARGET lines on the chart, or type prices. Distances are measured from the last price; your real fill is the next candle's open. Drag the chart in any direction to look around, use the + and minus buttons (or Ctrl and the mouse wheel) to zoom, and the corner button for full screen.</div></details></div>
  <div id="s2go" style="display:none" class="ctrl"><button class="btn sm" id="pgo">Start the trade</button><button class="btn alt sm" id="pback">Back</button></div>
  <div id="s1" class="ctrl"><button class="btn sm" id="pb">Buy (long)</button><button class="btn red sm" id="ps">Sell (short)</button><button class="btn alt sm" id="px">Skip</button><label style="min-width:150px;flex:none">Time of day<select id="pw"><option value="any">Any time</option><option value="open">Opening hour</option><option value="mid">Midday</option><option value="pm">Afternoon</option></select></label><button class="btn alt sm" id="pn">New chart</button></div>
  <div id="s3" style="display:none" class="ctrl"><span class="cap" style="flex:1 1 100%;margin:0"><b>Replay speed</b> (time one 5-minute candle takes to play). Slower is better for learning.</span><button class="chip" data-sp="10000">Very slow 10s</button><button class="chip" data-sp="5000">Slow 5s</button><button class="chip" data-sp="2000">Medium 2s</button><button class="chip" data-sp="600">Fast 0.6s</button><button class="chip" data-sp="0">Skip to the end</button><button class="chip" id="ppause">Pause</button></div>
  <div class="out" id="po">Read the summary, look at the chart, then choose.</div>
  </div>
  <div class="ctrl"><label>Account size (Lucid LucidFlex evaluation rules)<select id="psz"><option value="25000">$25,000</option><option value="50000">$50,000</option><option value="100000">$100,000</option><option value="150000">$150,000</option></select></label><button class="btn alt sm" id="pr" style="align-self:flex-end">Reset account</button></div>
  <div id="pacct"></div>
  <div class="kpis" id="pk2"></div><canvas class="chart" id="pcv" style="height:90px"></canvas>
  <div class="ctrl" style="margin:6px 0"><label style="flex-direction:row;align-items:center;gap:8px;min-width:0;flex:1 1 100%"><input type="checkbox" id="pk" checked> Show key levels (yesterday's high and low, overnight high and low, VWAP)</label></div>
  <div class="ctrl" style="margin:0 0 6px"><label style="flex-direction:row;align-items:center;gap:8px;min-width:0;flex:1 1 100%"><input type="checkbox" id="pmk" checked> After the trade, let Fox mark the patterns he finds on the chart</label></div>

  <div class="tblwrap" id="plog" style="max-height:280px;overflow:auto;border:1px solid #1d3354;border-radius:10px"></div>
  <div class="cap">Real prices, so luck still matters: judge yourself over 50 or more trades, not three. Costs are an assumption. The account rules follow Lucid's published LucidFlex evaluation (profit target, end-of-day trailing max loss limit that locks, 50% consistency, size limits); Lucid's optional daily loss limit and any minimum-days rule are not modeled, and each trade counts as one trading day. Firms change their rules, so always read theirs. Futures contract rolls may leave small price jumps. Past prices never guarantee anything.</div>`);
  const q=s=>b.querySelector(s);
  const s2show=on=>{q("#s2").style.display=on?"":"none";q("#s2go").style.display=on?"":"none"};
  const ch=mkChart(q("#pg"),{height:340});
  let sc=null,side=0,busy=false,pick={ref:0,stop:0,tgt:0},speed=+(localStorage.getItem("wick_play_ms2")||5000),timer=null,curStep=null,paused=false,runToken=0,fsOn=false;
  const WIN=100;
  const mk=(a,z)=>{const out=[];for(let i=a;i<=z;i++)out.push({o:RD.o[i],h:RD.h[i],l:RD.l[i],c:RD.c[i],v:RD.v[i]});return out};
  const labels=(a,z)=>{const out=[];for(let i=a;i<=z;i++){const mm=RD.m[i]%60;out.push(mm===0||mm===30?RD.hhmm(RD.m[i]):"")}return out};
  const vwapLine=(a,z)=>{const out=[];let pv=0,vv=0;for(let i=a;i<=z;i++){if(i<sc.s){out.push(null);continue}const tp=(RD.h[i]+RD.l[i]+RD.c[i])/3;pv+=tp*(RD.v[i]||1);vv+=(RD.v[i]||1);out.push(pv/vv)}return out};
  /* timeframes: every view is aggregated from the same real 5-minute candles, anchored at the 6 PM New York session start like futures platforms, and never includes a candle after the current one */
  const TFN={5:"5-minute",15:"15-minute",30:"30-minute",60:"1-hour",240:"4-hour",1440:"daily"};
  let tf=5,lastDraw=null,vis=100,off=0,tall=false,userScale=null;const MAXB=400;
  const tfKey=k=>Math.floor((RD.t[k]+(((RD.m[k]-RD.t[k])%1440)+1440)%1440-1080)/tf);
  const bars=(a,z,ovr)=>{
    const H_=i=>ovr&&i===ovr.i?ovr.h:RD.h[i],L_=i=>ovr&&i===ovr.i?ovr.l:RD.l[i],C_=i=>ovr&&i===ovr.i?ovr.c:RD.c[i];
    if(tf>5){a=Math.max(0,Math.min(a,z-Math.round(MAXB*tf/5)));while(a>0&&tfKey(a-1)===tfKey(a))a--}
    let cs=[],st=[],en=[],key=null;
    for(let i=a;i<=z;i++){
      if(tf===5){cs.push({o:RD.o[i],h:H_(i),l:L_(i),c:C_(i),v:RD.v[i]});st.push(i);en.push(i);continue}
      const kk=tfKey(i);
      if(kk!==key){key=kk;cs.push({o:RD.o[i],h:H_(i),l:L_(i),c:C_(i),v:RD.v[i]});st.push(i);en.push(i)}
      else{const bb=cs[cs.length-1];bb.h=Math.max(bb.h,H_(i));bb.l=Math.min(bb.l,L_(i));bb.c=C_(i);bb.v+=RD.v[i];en[en.length-1]=i}
    }
    const cut=Math.max(0,cs.length-(tf===5?z-a+1:MAXB));if(cut){cs=cs.slice(cut);st=st.slice(cut);en=en.slice(cut)}
    const barOf=i=>{let r=-1;for(let b=0;b<st.length;b++){if(st[b]<=i)r=b;else break}return r>=0&&i<=en[r]?r:-1};
    const labels=st.map((s0,b)=>{if(tf===1440)return b===st.length-1?"today":((st.length-1-b)%5===0?"-"+(st.length-1-b)+"d":"");const mm=RD.m[s0]%60;return tf===5?(mm===0||mm===30?RD.hhmm(RD.m[s0]):""):(tf>=60||mm===0||mm===30?RD.hhmm(RD.m[s0]):"")});
    const vwap=()=>{if(!sc)return[];let pv=0,vv=0;const byIdx={};for(let i=sc.s;i<=z;i++){const tp=(RD.h[i]+RD.l[i]+RD.c[i])/3;pv+=tp*(RD.v[i]||1);vv+=(RD.v[i]||1);byIdx[i]=pv/vv}return en.map(e2=>byIdx[e2]==null?null:byIdx[e2])};
    return{cs,labels,barOf,vwap}};
  const view=(a,z,o={})=>{const B=bars(a,z,o.ovr);
    const total=B.cs.length,v=Math.max(15,Math.min(vis,total+Math.round(vis*.7)));off=Math.max(-Math.floor(v*.7),Math.min(off,total-Math.min(v,total)));
    const pad=Math.max(0,-off),real=Math.max(10,v-pad),e2=total-Math.max(0,off),s0=Math.max(0,e2-real);
    const cs=B.cs.slice(s0,e2),times=B.labels.slice(s0,e2);
    let vw=o.vwap&&tf<=60?B.vwap().slice(s0,e2):null;
    if(pad){const lc=cs[cs.length-1]||{c:0};for(let g=0;g<pad;g++){cs.push({ghost:true,o:lc.c,h:lc.c,l:lc.c,c:lc.c,v:0});times.push("");if(vw)vw.push(null)}}
    const lines=vw?[{data:vw,color:"#a78bfa",label:"VWAP",w:1.8}]:[];
    const bo=i=>{const r=B.barOf(i);return r<0?-1:r-s0};
    const vl=[];const bi=bo(sc.s);if(tf<=60&&bi>=0&&bi<cs.length)vl.push({i:bi,label:"9:30 open",color:"#ffffff66"});
    ch.h=fsOn?Math.max(240,Math.round(innerHeight*.52)):(innerWidth<600?300:340);if(!drag)ch.fixed=userScale;
    const boxes=(o.boxes||[]).map(bx=>{const a=Math.max(0,bo(bx.i0)),b2=bx.i1==null?cs.length-1:bo(bx.i1);return{...bx,i0:a,i1:b2<0?-1:Math.min(b2,cs.length-1)}}).filter(bx=>bx.i1>=0&&bx.i0<cs.length);
    ch.set(cs,{boxes,levels:o.levels||[],lines,times,vlines:vl,markers:(o.markers||[]).map(mm=>({...mm,i:bo(mm.i)})).filter(mm=>mm.i>=0&&mm.i<cs.length),title:o.title||("Real NQ futures, "+TFN[tf]+" candles (date hidden)"+(off>0?" - looking back "+off+" candles":""))});
    q("#ptfn").textContent=tf===5?"":"The last "+TFN[tf]+" candle is still forming: it only holds the 5-minute candles up to now. Your stop and target distances are the same on every timeframe.";
  };
  const drawChart=(end,extra={})=>{
    lastDraw=()=>drawChart(end,extra);
    const levels=[];
    if(q("#pk").checked){levels.push({y:sc.PDH,label:"yesterday high "+RD.f2(sc.PDH),color:"#ffd166",noscale:true},{y:sc.PDL,label:"yesterday low "+RD.f2(sc.PDL),color:"#ffd166",left:true,noscale:true},{y:sc.ONH,label:"overnight high",color:"#5aa9ff99",left:true,noscale:true},{y:sc.ONL,label:"overnight low",color:"#5aa9ff99",noscale:true})}
    (extra.levels||[]).forEach(x=>levels.push(x));
    view(Math.max(0,end-MAXB+1),end,{levels,vwap:q("#pk").checked,markers:extra.markers,ovr:extra.ovr});
  };
  const ctxHtml=()=>{q("#pctx").innerHTML=gl(level==="advanced"?RD.advanced(sc):RD.beginner(sc));b.querySelectorAll("#pl button").forEach(x=>x.classList.toggle("on",x.dataset.l===level))};
  const acctPanel=()=>{const c=cfg(),tg=st.size+c.tgt,lvl=mllLevel(),room=st.bal-lvl,prof=st.bal-st.size,pct=Math.max(0,Math.min(100,prof/c.tgt*100)),bd=bigDay(),cons=prof>0?bd/prof*100:0,lock=st.hwm-c.mll>=st.size+100;
    q("#pr").className=st.status==="active"?"btn alt sm":"btn sm";q("#pr").textContent=st.status==="active"?"Reset account":"Start a new evaluation";
    const stat=st.status==="passed"?'<b class="up">PASSED</b>':st.status==="failed"?'<b class="dn">BREACHED</b>':"in progress";
    q("#pacct").innerHTML=`<div class="note" style="margin-top:0"><b>${usd(st.size)} evaluation:</b> ${stat}. Hit <b>${usd(tg)}</b> (profit target ${usd(c.tgt)}) without your balance touching the breach level, and keep your biggest winning day to 50% or less of your total profit. Max size ${c.cap} micros.${prof>=c.tgt&&cons>50?`<br><b class="dn">Target reached, but your biggest day is over 50% of your profit. Keep trading until your profit reaches ${usd(bd*2)}.</b>`:""}
    <div style="height:14px;background:#16273f;border-radius:7px;overflow:hidden;margin:8px 0"><div style="height:100%;width:${pct}%;background:#26dfa3"></div></div>
    <div class="kpis"><div class="kpi"><small>Profit target</small><b>${usd(tg)}</b></div><div class="kpi"><small>Breach level ${lock?"(locked)":"(trails your best close)"}</small><b class="dn">${usd(lvl)}</b></div><div class="kpi"><small>Room before breach</small><b class="${room<c.mll*.35?"dn":""}">${usd(room)}</b></div><div class="kpi"><small>Biggest day / profit</small><b class="${cons>50?"dn":""}">${prof>0?cons.toFixed(0)+"%":"n/a"}</b></div><div class="kpi"><small>Passes / breaches</small><b>${st.p} / ${st.f}</b></div></div></div>`};
  const stats=()=>{acctPanel();const n=st.n,wr=n?Math.round(st.w/n*100):0;
    q("#pk2").innerHTML=`<div class="kpi"><small>Account balance</small><b class="${st.bal>=st.size?"up":"dn"}">${usd(st.bal)}</b></div><div class="kpi"><small>Profit / loss</small><b class="${st.bal>=st.size?"up":"dn"}">${usd(st.bal-st.size)}</b></div><div class="kpi"><small>Down from peak</small><b class="dn">${usd(-(st.peak-st.bal))}</b></div><div class="kpi"><small>Trades</small><b>${n}</b></div><div class="kpi"><small>Win rate</small><b>${wr}%</b></div><div class="kpi"><small>Total</small><b class="${st.r>=0?"up":"dn"}">${st.r>=0?"+":""}${st.r.toFixed(1)}R</b></div><div class="kpi"><small>Avg per trade</small><b class="${st.r>=0?"up":"dn"}">${n?(st.r/n).toFixed(2):"0.00"}R</b></div><div class="kpi"><small>Skipped</small><b>${st.skips||0}</b></div>`;
    const c2=q("#pcv"),dpr=devicePixelRatio||1,W2=c2.clientWidth||300,H2=90;c2.width=W2*dpr;c2.height=H2*dpr;const cc=c2.getContext("2d");cc.setTransform(dpr,0,0,dpr,0,0);cc.clearRect(0,0,W2,H2);
    const cur=st.eq,hi=Math.max(...cur,st.size+cfg().tgt),lo=Math.min(...cur,mllLevel()),X=i=>8+i/Math.max(1,cur.length-1)*(W2-16),Y=v=>8+(hi-v)/(hi-lo)*(H2-24);cc.strokeStyle="#27426a";cc.beginPath();cc.moveTo(8,Y(st.size));cc.lineTo(W2-8,Y(st.size));cc.stroke();cc.setLineDash([5,4]);cc.strokeStyle="#26dfa3";cc.beginPath();cc.moveTo(8,Y(st.size+cfg().tgt));cc.lineTo(W2-8,Y(st.size+cfg().tgt));cc.stroke();cc.strokeStyle="#ff5d7c";cc.beginPath();cc.moveTo(8,Y(mllLevel()));cc.lineTo(W2-8,Y(mllLevel()));cc.stroke();cc.setLineDash([]);cc.strokeStyle="#ffd166";cc.strokeStyle="#ffd166";cc.lineWidth=2;cc.beginPath();cur.forEach((v,i)=>i?cc.lineTo(X(i),Y(v)):cc.moveTo(X(i),Y(v)));cc.stroke();cc.fillStyle="#6f86a8";cc.font="11px ui-monospace,monospace";cc.fillText("balance (green: profit target, red: breach level)",10,H2-4);
    q("#plog").innerHTML=st.log.length?`<table><tr style="position:sticky;top:0;background:#0f1d33"><th>#</th><th>Day (revealed)</th><th>Time</th><th>Side</th><th>Result</th><th>P&amp;L</th></tr>${st.log.map((x,i)=>({...x,n:i+1})).reverse().map(x=>`<tr><td>${x.n}</td><td>${x.d}</td><td>${x.t}</td><td>${x.s}</td><td class="${x.r>=0?"up":"dn"}">${x.r>=0?"+":""}${x.r.toFixed(2)}R</td><td class="${(x.u||0)>=0?"up":"dn"}">${x.u==null?"":usd(x.u)}</td></tr>`).join("")}</table>`:""};
  const show1=()=>{ch.cv.style.touchAction="pan-y";q("#s1").style.display="";s2show(false);q("#s3").style.display="none"};
  const newChart=()=>{clearTimeout(timer);runToken++;busy=false;paintSpd();side=0;off=0;userScale=null;sc=RD.pickScenario(q("#pw").value);if(!sc){q("#po").textContent="Could not find a chart for that time of day. Try Any time.";return}
    ctxHtml();drawChart(sc.k);show1();q("#po").innerHTML="Read the summary, look at the chart, then choose Buy, Sell or Skip.";stats()};
  const peek=()=>{drawChart(Math.min(RD.n-1,sc.k+24));q("#po").innerHTML=`Here is what happened over the next two hours. This was <b>${sc.date}</b> at <b>${sc.time} ET</b>. (No score for skipped charts.)${peekWhy()}<br><button class="btn sm" id="pnext" style="margin-top:8px">Next chart</button>`;q("#pnext").onclick=newChart};
  const peekWhy=()=>{const a=sc.k+1,z=Math.min(RD.n-1,sc.k+24);if(a>z)return"";let hi=-1e9,lo=1e9;for(let j=a;j<=z;j++){hi=Math.max(hi,RD.h[j]);lo=Math.min(lo,RD.l[j])}const c0=RD.c[sc.k],cz=RD.c[z],up=hi-c0,dn=c0-lo;return` <br><b>What happened:</b> from the last candle you saw, price pushed up as far as ${RD.f0(up)} points and down as far as ${RD.f0(dn)} points, and the two hours ended ${RD.f0(Math.abs(cz-c0))} points ${cz>=c0?"higher":"lower"}. ${up>dn*1.5?"Buyers had the better of it.":dn>up*1.5?"Sellers had the better of it.":"It chopped both ways, a dead block with no clear winner."}`};
  const tradeWhy=(why,r,mfe,mae,risk,rr,n,sd)=>{const mins=n*5,dir=sd>0?"buy":"sell",fav=(mfe/risk).toFixed(1),adv=(mae/risk).toFixed(1);
    if(why==="target")return`Price moved your way and reached your ${(+rr).toFixed(1)}R target after about ${mins} minutes. The worst dip against you on the way was ${adv}R, so the line where you walk was never close to being hit.`;
    if(why==="stop")return`Price went against your ${dir} and hit your stop after about ${mins} minutes.${mfe/risk>=1?` It first went ${fav}R in your favor, so it came close to paying before reversing.`:` It never got far in your favor (best ${fav}R).`} A stop-out is a normal cost of doing business. You walked at the line you picked, like you planned. What matters is the average over many trades.`;
    if(why==="close")return`Neither your stop nor your target was hit before 4:00 PM, so the trade was closed at the bell for ${r>=0?"+":""}${r.toFixed(2)}R. It ranged from ${fav}R in your favor to ${adv}R against you.`;
    if(why==="breach")return`This trade took your balance to the max loss limit, so the firm would cut you off. Your stop was farther away than your remaining room, so the limit, not your stop, ended the trade.`;
    return`The data ran out before your stop or target was hit, so the trade closed at the last price.`};
  const say=(t,mood,ms)=>{if(window.foxSay)foxSay(t,{mood,ms:ms||9000})};
  const coachLine=(why,r,N)=>{if(why==="breach")return["The loss limit is the line the plug draws, the firm\'s seatbelt. Next time size down so one bad trade can\'t take most of it.","oops"];
    if(r>=1.5)return["Nice one. Now ask the honest question: was that your plan working, or luck? Check your log over 50 trades, not one.","happy"];
    if(r>0)return["A win is a win, but look at the R. Small wins and big losses is how accounts die.","happy"];
    if(why==="stop")return["A stop-out is the cost of doing business. If you followed your plan, that was a fine trade that lost.","think"];
    return["Not every trade pays. Review it: was the stop where the idea was wrong?","think"]};
  const TICK=.25,snap=v=>Math.round(v/TICK)*TICK;
  const nct=()=>Math.max(1,Math.min(cfg().cap,Math.round(+q("#pn2").value)||1));
  const setStop=v=>{v=snap(v);if(side*(pick.ref-v)<TICK)v=pick.ref-side*TICK;pick.stop=v};
  const setTgt=v=>{v=snap(v);if(side*(v-pick.ref)<TICK)v=pick.ref+side*TICK;pick.tgt=v};
  const planLv=()=>[{y:pick.ref,label:"last price "+RD.f2(pick.ref),color:"#5aa9ff",dash:false,w:1.2},{y:pick.stop,label:"STOP "+RD.f2(pick.stop)+" (drag me)",color:"#ff5d7c",dash:false,w:2.6},{y:pick.tgt,label:"TARGET "+RD.f2(pick.tgt)+" (drag me)",color:"#26dfa3",dash:false,w:2.6}];
  const usd=v=>(v<0?"-":"")+"$"+Math.abs(v).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  const gauge=()=>{const n=nct(),risk=Math.abs(pick.ref-pick.stop),rew=Math.abs(pick.tgt-pick.ref),rr=rew/risk,rd=risk*2*n,wd=rew*2*n,be=Math.round(100/(1+rr)),A=sc.ATR,w=[];
    if(risk<A*.75)w.push("Your stop is tighter than a normal 5-minute candle (about "+RD.f0(A)+" points). Ordinary noise can hit it before the idea plays out.");
    if(risk>A*3)w.push("That is a wide stop. Each contract risks a lot, so think about fewer contracts, which means carrying less weight.");
    if(rr<1)w.push("Your target is closer than your stop, so you would need to win more than half your trades just to break even.");
    if(rr>4)w.push("A target that far away is rarely reached. Check it is realistic for the day.");
    const room=st.bal-mllLevel();if(rd>room)w.push("If this stop is hit you lose "+usd(rd)+", which is MORE than your "+usd(room)+" of room. That would breach the account and you would be cut off.");else if(rd>room*.5)w.push("This stop risks "+Math.round(rd/room*100)+"% of the room you have left before breach.");
    if(rd/st.bal>.02)w.push("This trade risks "+(rd/st.bal*100).toFixed(1)+"% of your account. A common rule of thumb is 1% or less.");
    q("#pgauge").innerHTML=`<div style="display:flex;height:16px;border-radius:8px;overflow:hidden;margin:6px 0"><div style="flex:${risk};background:#ff5d7c"></div><div style="flex:${rew};background:#26dfa3"></div></div>
    <div class="kpis sm"><div class="kpi"><small>Risk</small><b class="dn">${RD.f2(risk)} pts<br>${usd(rd)}</b></div><div class="kpi"><small>Reward</small><b class="up">${RD.f2(rew)} pts<br>${usd(wd)}</b></div><div class="kpi"><small>Reward : risk</small><b>${rr.toFixed(2)} : 1</b></div><div class="kpi"><small>Break-even win rate</small><b>${be}%</b></div><div class="kpi"><small>Account risked</small><b>${(rd/st.bal*100).toFixed(2)}%</b></div><div class="kpi"><small>Room before breach</small><b>${usd(room)}</b></div></div>${w.length?`<div class="warn" style="margin-top:6px">${w.join("<br>")}</div>`:""}`};
  const updatePlan=()=>{q("#pstp").value=pick.stop.toFixed(2);q("#ptgp").value=pick.tgt.toFixed(2);gauge();drawChart(sc.k,{levels:planLv()})};
  const pickSide=sd=>{if(busy)return;if(st.status!=="active"){q("#po").innerHTML="This evaluation is over ("+(st.status==="passed"?"passed":"breached")+"). Use <b>Start a new evaluation</b> below to try again.";return}side=sd;q("#s1").style.display="none";s2show(true);ch.cv.style.touchAction="none";pick.ref=RD.c[sc.k];const r0=Math.max(1,Math.round(sc.ATR*1.5*4)/4);pick.stop=pick.ref-sd*r0;pick.tgt=pick.ref+sd*r0*2;
    q("#p2t").innerHTML=`<b>${sd>0?"BUY":"SELL"}</b>: filled at the next candle's open. Drag the red STOP and green TARGET lines, or type them. A normal 5-minute candle is about ${RD.f0(sc.ATR)} points.`;
    updatePlan();if(innerWidth>=600)say("Put the stop where your idea is WRONG, the line where you walk, not where it feels comfortable. Then check the gauge: risk, reward and room before breach.","think")};
  q("#pstp").onchange=()=>{setStop(+q("#pstp").value);updatePlan()};q("#ptgp").onchange=()=>{setTgt(+q("#ptgp").value);updatePlan()};q("#pn2").onchange=()=>{q("#pn2").value=nct();if(side)gauge()};
  let drag=null;const cv=ch.cv;
  const pY=e=>e.clientY-cv.getBoundingClientRect().top;
  const near=y=>{if(!side||busy||q("#s2").style.display==="none")return null;const g=ch.geo(),a=Math.abs(ch.yAt(pick.stop,g)-y),b2=Math.abs(ch.yAt(pick.tgt,g)-y);return Math.min(a,b2)<=14?(a<=b2?"stop":"tgt"):null};
  let pan=null;
  cv.addEventListener("pointerdown",e=>{const k=near(pY(e));
    if(!k){if(!sc)return;const g0=ch.geo();pan={x:e.clientX,y:e.clientY,off0:off,bw:g0.bw,g0,us0:userScale,vOn:false};cv.setPointerCapture(e.pointerId);return}
    drag=k;const g=ch.geo();ch.fixed={hi:g.hi,lo:g.lo};cv.setPointerCapture(e.pointerId);e.preventDefault()});
  cv.addEventListener("pointermove",e=>{const y=pY(e);
    if(pan){const d=Math.round((e.clientX-pan.x)/pan.bw),dy=e.clientY-pan.y;if(Math.abs(dy)>8)pan.vOn=true;cv.style.cursor="grabbing";
      off=Math.max(-Math.floor(vis*.7),pan.off0+d);
      if(pan.vOn){const g0=pan.g0,dp=dy*(g0.hi-g0.lo)/g0.plotH,b0=pan.us0||{hi:g0.hi,lo:g0.lo};userScale={hi:b0.hi+dp,lo:b0.lo+dp}}
      if(lastDraw)lastDraw();return}
    if(!drag){cv.style.cursor=near(y)?"ns-resize":"grab";return}const g=ch.geo();const v=Math.min(g.hi,Math.max(g.lo,ch.priceAt(y)));drag==="stop"?setStop(v):setTgt(v);updatePlan()});
  const endDrag=()=>{if(!drag)return;drag=null;ch.fixed=null;updatePlan()};
  const endPan=()=>{pan=null;cv.style.cursor="grab"};
  cv.addEventListener("pointerup",()=>{endDrag();endPan()});cv.addEventListener("pointercancel",()=>{endDrag();endPan()});
  const pfs=q("#pfs");
  const setFS=on=>{fsOn=on;pfs.classList.toggle("fson",on);document.documentElement.classList.toggle("pfs-lock",on);const fb=q('#pvw [data-v="fs"]');if(fb){fb.innerHTML=on?"&#10005;":"&#9974;";fb.title=on?"Exit full screen":"Full screen"}
    if(on){if(pfs.requestFullscreen)pfs.requestFullscreen().catch(()=>{})}else if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});
    if(sc&&lastDraw)lastDraw()};
  const toggleFS=()=>setFS(!fsOn);
  document.addEventListener("fullscreenchange",()=>{if(!document.body.contains(pfs))return;if(!document.fullscreenElement&&fsOn)setFS(false)});
  addEventListener("resize",()=>{if(fsOn&&document.body.contains(pfs)&&sc&&lastDraw)lastDraw()});
  addEventListener("hashchange",()=>{if(fsOn){fsOn=false;document.documentElement.classList.remove("pfs-lock");if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{})}},{once:true});
  const zoom=f=>{vis=Math.max(15,Math.min(MAXB,Math.round(vis*f)));if(sc&&lastDraw)lastDraw()};
  cv.addEventListener("wheel",e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();zoom(e.deltaY>0?1.2:1/1.2)},{passive:false});
  b.querySelectorAll("#pvw .chip").forEach(x=>x.onclick=()=>{const v=x.dataset.v;
    if(v==="in")zoom(1/1.3);else if(v==="out")zoom(1.3);
    else if(v==="left"){off+=Math.max(5,Math.round(vis/2));if(sc&&lastDraw)lastDraw()}
    else if(v==="right"){off=Math.max(0,off-Math.max(5,Math.round(vis/2)));if(sc&&lastDraw)lastDraw()}
    else if(v==="reset"){vis=100;off=0;userScale=null;if(sc&&lastDraw)lastDraw()}
    else if(v==="fs")toggleFS()});
  cv.style.touchAction="pan-y";cv.style.cursor="grab";
    const verdict=breached=>{if(breached){st.status="failed";st.f++;return"failed"}
    const c=cfg(),prof=st.bal-st.size;if(prof>=c.tgt&&bigDay()<=prof*.5){st.status="passed";st.p++;return"passed"}return null};
  const closeModal=()=>{const m=document.querySelector(".pmodal");if(m)m.remove()};
  const resetAcct=()=>{const p=st.p,f=st.f;st=Object.assign(fresh(st.size),{p,f});all.a[st.size]=st;persist();stats();newChart()};
  const celebrate=kind=>{closeModal();const o=document.createElement("div");o.className="pmodal";o.style.cssText="position:fixed;inset:0;z-index:80;background:#050b16ee;display:flex;align-items:flex-start;justify-content:center;padding:16px;overflow:auto";
    const prof=st.bal-st.size,wr=st.n?Math.round(st.w/st.n*100):0,col=kind==="passed"?"#26dfa3":"#ff5d7c";
    let body="";
    if(kind==="passed"){body=`<div style="font-size:64px">🏆</div><h2 style="margin:6px 0">EVALUATION PASSED!</h2><p>You grew a <b>${usd(st.size)}</b> account to <b>${usd(st.bal)}</b> (${usd(prof)} profit) in <b>${st.n} trade${st.n===1?"":"s"}</b> without ever touching the breach level, with a ${wr}% win rate and your biggest day at ${Math.round(bigDay()/prof*100)}% of your profit. Real firms would now front you. That is the exact bar this practice account copies.</p><p style="color:var(--mut);font-size:14px">Honest note: this is a simulation on past prices. Real money adds nerves, and firms change their rules, so check theirs. Passing here is practice, not a promise.</p>`}
    else{const ls=st.log.map(x=>x.u),worst=Math.min(0,...ls);let run=0,mx=0;ls.forEach(u=>{run=u<0?run+1:0;mx=Math.max(mx,run)});const mll=cfg().mll,tips=[];
      if(-worst>mll*.4)tips.push("One trade lost "+usd(-worst)+", that is "+Math.round(-worst/mll*100)+"% of your whole loss limit. Size and stop distance decide how many mistakes you survive.");
      if(mx>=3)tips.push("You had a streak of "+mx+" losers in a row. Streaks happen to everyone, so your size has to survive them.");
      if(st.log.length&&st.log.reduce((a,x)=>a+(x.rk||0),0)/st.log.length>mll*.25)tips.push("Your average planned risk was "+usd(st.log.reduce((a,x)=>a+(x.rk||0),0)/st.log.length)+" per trade, a big bite of a "+usd(mll)+" loss limit. Smaller size buys more tries.");
      if(!tips.length)tips.push("A slow bleed: many small losses added up. Review your log for the setups that cost the most.");
      body=`<div style="font-size:56px">🛑</div><h2 style="margin:6px 0">Account breached</h2><p>Your balance hit the max loss limit of <b>${usd(mll)}</b> on the ${usd(st.size)} account after <b>${st.n} trade${st.n===1?"":"s"}</b> (${wr}% win rate). This is exactly why prop firms use that limit, and why failing a practice one costs you nothing.</p><div style="text-align:left;background:#0a1322;border-radius:12px;padding:10px 14px;margin:10px 0"><b>What to learn from it</b><ul style="margin:6px 0 0 18px">${tips.map(t=>"<li>"+t+"</li>").join("")}</ul></div>`}
    o.innerHTML=`<div style="max-width:540px;width:100%;margin:auto;background:#0f1d33;border:2px solid ${col};border-radius:18px;padding:22px;text-align:center">${body}<div class="ctrl" style="justify-content:center"><button class="btn sm" id="pm1">Start a new evaluation</button><button class="btn alt sm" id="pm2">Look at my results</button></div></div>`;
    document.body.appendChild(o);o.querySelector("#pm1").onclick=()=>{closeModal();resetAcct()};o.querySelector("#pm2").onclick=closeModal;
    say(kind==="passed"?"You passed! Now do it again on another account size. One pass can be luck, ten starts to look like skill.":"Breached. Good, it cost you nothing, and that is the cheap way to learn it. Read the recap and try again with lighter weight.",kind==="passed"?"wow":"oops",12000);
    if(kind==="passed"&&typeof confetti==="function"){confetti(260);setTimeout(()=>confetti(160),900)}};
  const tallyText=p=>{const t=(all.pat||{})[p.id]||{s:0,m:0},n=t.s+t.m;return n?`You have spotted ${t.s} of ${n} "${p.title.toLowerCase()}" patterns so far.`:""};
  const wirePats=pats=>{b.querySelectorAll("#po .pat").forEach(div=>{const p=pats[+div.dataset.i],lab=div.querySelector(".pattally");lab.textContent=tallyText(p);
    div.querySelectorAll(".patbtns .chip").forEach(btn=>btn.onclick=()=>{all.pat=all.pat||{};const t=all.pat[p.id]=all.pat[p.id]||{s:0,m:0};if(div.dataset.done)return;div.dataset.done="1";t[btn.dataset.a]++;persist();btn.classList.add("on");lab.textContent=tallyText(p)})})};
  const SPD=[10000,5000,2000,600,0],SPDN={10000:"Very slow",5000:"Slow",2000:"Medium",600:"Fast",0:"Skip"};
  const paintSpd=()=>{const el=q("#pspd");el.textContent="⏩ "+(SPDN[speed]||(speed/1000)+"s");el.style.display=busy?"":"none"};
  const setSpeed=v=>{speed=v;localStorage.setItem("wick_play_ms2",speed);q("#s3").querySelectorAll(".chip[data-sp]").forEach(x=>x.classList.toggle("on",+x.dataset.sp===speed));paintSpd()};
  const run=()=>{
    if(busy)return;busy=true;const e=sc.k+1,entry=RD.o[e],risk=Math.abs(pick.ref-pick.stop),tdist=Math.abs(pick.tgt-pick.ref),rr=tdist/risk,N=nct(),cost=q("#pc").checked?.5:0,eod=q("#pe").checked;
    const stop0=entry-side*risk,tgt=entry+side*tdist,room0=st.bal-mllLevel(),breachPx=entry+side*((-room0)/(2*N)+cost),stop=side>0?Math.max(stop0,breachPx):Math.min(stop0,breachPx),isBreach=stop!==stop0;
    const lv=[{y:entry,label:"entry "+RD.f2(entry),color:"#5aa9ff"},{y:stop,label:isBreach?"BREACH level":"stop",color:"#ff5d7c"},{y:tgt,label:"target "+rr.toFixed(1)+"R",color:"#26dfa3"}];
    ch.cv.style.touchAction="pan-y";s2show(false);q("#s3").style.display="";runToken++;paused=false;q("#ppause").textContent="Pause";q("#s3").querySelectorAll(".chip[data-sp]").forEach(x=>x.classList.toggle("on",+x.dataset.sp===speed));paintSpd();
    q("#po").innerHTML="The trade is live. Watch the candle form: your stop and target are drawn on the chart, and the white line is the price right now. Pick a faster speed any time.";
    let i=e,res=null,why="",exitPx=entry,mfe=0,mae=0;
    const outcome=k=>{const o=RD.o[k],hi=RD.h[k],lo=RD.l[k],hitS=side>0?lo<=stop:hi>=stop,hitT=side>0?hi>=tgt:lo<=tgt;
      if(hitS)return{why:isBreach?"breach":"stop",px:side>0?Math.min(stop,o):Math.max(stop,o)};
      if(hitT)return{why:"target",px:side>0?Math.max(tgt,o):Math.min(tgt,o)};
      if(eod&&RD.m[k]>=955)return{why:"close",px:RD.c[k]};
      return null};
    /* intra-candle price path: open, then the two extremes in the order that matches what the data says happened first, then close, with a little wiggle (seeded, so it is the same every time) */
    const pathFor=k=>{const o=RD.o[k],hi=RD.h[k],lo=RD.l[k],c=RD.c[k],hitS=side>0?lo<=stop:hi>=stop,hitT=side>0?hi>=tgt:lo<=tgt;
      const lowFirst=(hitS&&hitT)||hitS?side>0:hitT?side<0:c>=o,w=lowFirst?[o,lo,hi,c]:[o,hi,lo,c];
      let seed=k*7919+13;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296},pts=[],per=40;
      for(let sg=0;sg<3;sg++)for(let j=0;j<per;j++){const f=j/per,base=w[sg]+(w[sg+1]-w[sg])*f,wig=Math.sin(f*Math.PI)*(hi-lo)*.16*(rnd()-.5)*2;pts.push(Math.min(hi,Math.max(lo,Math.round((base+wig)*4)/4)))}
      pts.push(c);return pts};
    const advance=()=>{
      while(true){
        const k=i;if(k>=RD.n){exitPx=RD.c[RD.n-1];why="data";return finish(k-1)}
        const hi=RD.h[k],lo=RD.l[k];mfe=Math.max(mfe,side>0?hi-entry:entry-lo);mae=Math.max(mae,side>0?entry-lo:hi-entry);
        const out=outcome(k);
        if(speed===0&&!paused){if(out){exitPx=out.px;why=out.why;return finish(k)}i++;continue}
        return animate(k,out)}};
    const animate=(k,out)=>{
      const token=runToken,P=pathFor(k),n=P.length,o=RD.o[k];let hitIdx=-1;
      if(out&&out.why!=="close")for(let j=0;j<n;j++){const v=P[j];if(side>0?(v<=stop||v>=tgt):(v>=stop||v<=tgt)){hitIdx=j;break}}
      const goal=hitIdx>=0?hitIdx:n-1;let p=0,last=performance.now(),drawn=false;
      const frame=now=>{
        if(token!==runToken||!document.body.contains(b))return;
        const dt=Math.min(100,now-last);last=now;
        if(paused&&drawn){requestAnimationFrame(frame);return}
        if(!paused){if(speed===0)p=1;else p+=dt/speed}
        const idx=Math.min(goal,Math.floor(p*(n-1)));let h=o,l=o;for(let j=0;j<=idx;j++){h=Math.max(h,P[j]);l=Math.min(l,P[j])}
        const cur=P[idx];
        drawChart(k,{levels:[...lv,{y:cur,label:"price "+RD.f2(cur),color:"#ffffffaa",w:1}],markers:[{i:e,y:entry,color:"#5aa9ff",text:"in"}],ovr:{i:k,h,l,c:cur}});
        drawn=!paused;
        if(idx>=goal){
          if(out){exitPx=out.px;why=out.why;return finish(k)}
          i++;return advance()}
        requestAnimationFrame(frame)};
      requestAnimationFrame(frame)};
    const finish=k=>{
      const pats=findPatterns(sc,sc.k);
      const r=((exitPx-entry)*side-cost)/risk;const ptsNet=(exitPx-entry)*side-cost,usdv=ptsNet*2*N;const lvlBefore=mllLevel();st.bal+=usdv;st.eq.push(+st.bal.toFixed(2));st.peak=Math.max(st.peak,st.bal);const breached=st.bal<=lvlBefore+0.005;if(!breached)st.hwm=Math.max(st.hwm,st.bal);st.days[sc.date]=(st.days[sc.date]||0)+usdv;st.n++;st.r+=r;if(r>0)st.w++;st.curve.push(+st.r.toFixed(2));st.log.push({d:sc.date,t:sc.time+" ET",s:side>0?"Buy":"Sell",r,u:usdv,rk:risk*2*N,n:N,sa:+(risk/sc.ATR).toFixed(2),rr:+rr.toFixed(2),why,pt:pats.filter(p=>p.dir).map(p=>({id:p.id,a:p.dir===side?1:0})),ts:Date.now()});const vd=verdict(breached);persist();
      off=0;userScale=null;const fa=Math.max(0,e-MAXB),fz=Math.min(RD.n-1,k+14);
      const showFinal=()=>{lastDraw=showFinal;const pm=q("#pmk").checked;view(fa,fz,{boxes:pm?pats.flatMap(p=>p.boxes):[],levels:[...lv,...(pm?pats.flatMap(p=>p.levels):[])],markers:[{i:e,y:entry,color:"#5aa9ff",text:"in",shape:"dot"},{i:k,y:exitPx,color:r>=0?"#26dfa3":"#ff5d7c",text:"out",shape:"dot"},...(pm?pats.flatMap(p=>p.markers):[])],title:"The whole trade, plus a little after ("+TFN[tf]+")"})};showFinal();
      const ex=why==="stop"?"<b class='dn'>Stopped out.</b>":why==="target"?"<b class='up'>Target hit.</b>":why==="close"?"<b>Closed at 4:00 PM.</b>":"<b>The data ended, closed at the last price.</b>";const exb=why==="breach"?"<b class='dn'>Account breached.</b> Your balance hit the max loss limit.":ex;
      const cl=coachLine(why,r,N);
      const agree=p=>p.dir&&side?`Your ${side>0?"buy":"sell"} ${p.dir===side?"agreed with":"went against"} it. `:"";
      const patCard=pats.length?`<div class="patcard"><b>Pattern check with Fox:</b> did you spot these before you traded? Only candles up to your decision are used for "what was there".${pats.map((p,i)=>`<div class="pat" data-i="${i}"><b>${p.title}</b>${p.dir>0?" (bullish)":p.dir<0?" (bearish)":""}<br>${p.pre}<br><i>What happened next:</i> ${p.post}<br>${agree(p)}<a href="#/see/${p.guide}" target="_blank" rel="noopener">&#9654; Watch the guide</a><div class="patbtns"><button class="chip" data-a="s">I spotted it</button><button class="chip" data-a="m">I missed it</button><span class="pattally"></span></div></div>`).join("")}<div class="cap">Spotting a pattern is not the same as having an edge. These are named ideas, not guarantees.</div></div>`:`<div class="patcard"><b>Pattern check with Fox:</b> nothing textbook on this chart. That is normal: sitting out unclear charts is a skill too.</div>`;
      q("#po").innerHTML=`${why==="breach"?exb:ex} Result: <b class="${r>=0?"up":"dn"}">${r>=0?"+":""}${r.toFixed(2)}R</b>${cost?" (after costs)":""}, which is <b class="${usdv>=0?"up":"dn"}">${usd(usdv)}</b> on ${N} MNQ contract${N>1?"s":""}. Your account is now <b>${usd(st.bal)}</b>. Price went as far as <b>${(mfe/risk).toFixed(1)}R</b> in your favor and <b>${(mae/risk).toFixed(1)}R</b> against you along the way. <br>This was <b>${sc.date}</b> at <b>${sc.time} ET</b> (candle ${k-e+1} of the trade).${why==="stop"&&r<-1.05?" It gapped through your stop, so the loss was bigger than 1R.":""}<br><b>What happened:</b> ${tradeWhy(why,r,mfe,mae,risk,rr,k-e+1,side)}<br><div class="foxnote"><span class="fx">${fox(cl[1])}</span><div><b>Fox says:</b> ${cl[0]}</div></div>${patCard}<button class="btn sm" id="pnext" style="margin-top:8px">Next chart</button>`;
      q("#pnext").onclick=newChart;wirePats(pats);
      runToken++;q("#s3").style.display="none";busy=false;paintSpd();stats();curStep=null;if(vd)setTimeout(()=>celebrate(vd),900);else say(cl[0]+(pats[0]?" And did you spot the "+pats[0].title.toLowerCase()+"? Check the pattern card under the chart.":""),cl[1],12000)};
    advance()};
  b.querySelectorAll("#pl button").forEach(x=>x.onclick=()=>{level=x.dataset.l;localStorage.setItem("wick_ctx_level",level);ctxHtml()});
  b.querySelectorAll("#ptf .chip").forEach(x=>x.onclick=()=>{tf=+x.dataset.tf;userScale=null;b.querySelectorAll("#ptf .chip").forEach(y=>y.classList.toggle("on",y===x));if(sc&&lastDraw)lastDraw();if(innerWidth>=600)say(tf>=60?"Zoomed out. This is where you see the trend and the big levels. Come back down to time your entry.":"Zoomed in. Good for timing an entry, but easy to miss the bigger picture. Flip out to check.","think",7000)});
  q("#pb").onclick=()=>pickSide(1);q("#ps").onclick=()=>pickSide(-1);
  q("#px").onclick=()=>{st.skips=(st.skips||0)+1;persist();stats();peek()};
  q("#pn").onclick=newChart;q("#pw").onchange=newChart;q("#pk").onchange=()=>{if(sc&&!busy)drawChart(sc.k)};
  q("#pgo").onclick=run;q("#pback").onclick=()=>{show1();q("#po").textContent="Read the summary, look at the chart, then choose."};
  q("#s3").querySelectorAll(".chip[data-sp]").forEach(c=>c.onclick=()=>{setSpeed(+c.dataset.sp)});
  q("#pspd").onclick=()=>{const k=SPD.indexOf(speed);setSpeed(SPD[(k+1)%SPD.length])};
  q("#ppause").onclick=()=>{paused=!paused;q("#ppause").textContent=paused?"Resume":"Pause"};
  q("#pr").onclick=()=>{if(st.status==="active"&&!confirm("Start this "+usd(st.size)+" account over? Your balance and trade log reset."))return;closeModal();resetAcct()};
  q("#psz").value=String(st.size);
  q("#psz").onchange=()=>{if(busy){q("#psz").value=String(st.size);return}persist();st=getAcct(+q("#psz").value);all.cur=st.size;persist();q("#pn2").max=cfg().cap;q("#pn2").value=Math.min(+q("#pn2").value||1,cfg().cap);closeModal();stats();newChart()};
  q("#pn2").max=cfg().cap;
  newChart();
};
