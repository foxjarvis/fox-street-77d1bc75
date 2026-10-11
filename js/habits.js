/* Habit report: reads the practice-game trade log (this browser only) and points out habits the numbers show. Small samples are called small samples; nothing here is advice to trade a certain way. */
W.habits=el=>{
  const raw=(()=>{try{return JSON.parse(localStorage.getItem("street_practice4"))||{}}catch(e){return{}}})();
  const accts=Object.values(raw.a||{});
  const log=accts.flatMap(a=>(a.log||[]).map(x=>({...x,size:a.size})));
  const skips=accts.reduce((s,a)=>s+(a.skips||0),0);
  const usd=v=>(v<0?"-":"")+"$"+Math.abs(v).toLocaleString("en-US",{maximumFractionDigits:0});
  const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
  const pct=x=>Math.round(x*100)+"%";
  const R=x=>(x>=0?"+":"")+x.toFixed(2)+"R";
  const MINN=5;
  if(log.length<MINN){
    box(el,"Your habit report",`<div class="note" style="margin-top:0">You have <b>${log.length}</b> practice trade${log.length===1?"":"s"} saved in this browser. Fox needs at least <b>${MINN}</b> to say anything honest, and more like 30 or more to say anything solid. <a class="btn sm" href="#/practice">Go trade the practice game</a></div>`);
    return}
  // order: keep log order (oldest to newest); fields added later may be missing on older trades
  const wins=log.filter(x=>x.r>0),losses=log.filter(x=>x.r<=0);
  const exp=avg(log.map(x=>x.r));
  const f=[]; // findings: {lvl:"good|warn|info",h,t,learn:[href,label]}
  const add=(lvl,h,t,learn)=>f.push({lvl,h,t,learn});
  const hasN=log.filter(x=>x.n!=null);

  // 1. sizing after a loss vs after a win
  {const afterL=[],afterW=[];for(let i=1;i<log.length;i++){if(log[i].n==null)continue;(log[i-1].r<=0?afterL:afterW).push(log[i].n)}
   if(afterL.length>=6&&afterW.length>=6){const l=avg(afterL),w=avg(afterW);
     if(l>w*1.3)add("warn","You size up after a loss",`After a loss you averaged <b>${l.toFixed(1)}</b> contracts (${afterL.length} trades) against <b>${w.toFixed(1)}</b> after a win (${afterW.length} trades). Chasing payback with heavier weight right after a loss is how a bad day turns into a breached account.`,["#/ch/mind","Psychology lesson"]);
     else if(l<w*.8)add("good","You size down after a loss",`After a loss you averaged <b>${l.toFixed(1)}</b> contracts against <b>${w.toFixed(1)}</b> after a win. Lightening the load when you are off is what the pros do.`,["#/ch/risk","Risk lesson"]);
     else add("info","Your size stays steady after losses",`About ${l.toFixed(1)} contracts after a loss and ${w.toFixed(1)} after a win. Steady size is good: it keeps one bad trade from steering the next.`,null)}
   else if(hasN.length)add("info","Not enough trades yet to check your sizing after losses",`Fox needs at least 6 trades after a loss and 6 after a win. Keep going.`,null)}

  // 2. stop tightness
  {const sa=log.filter(x=>x.sa!=null),tight=sa.filter(x=>x.sa<.75),ok=sa.filter(x=>x.sa>=.75);
   if(tight.length>=5&&ok.length>=5){const ts=tight.filter(x=>x.why==="stop"||x.why==="breach").length/tight.length,os=ok.filter(x=>x.why==="stop"||x.why==="breach").length/ok.length;
     if(ts>os+.15)add("warn","Your tight stops get hit more",`Stops tighter than a normal 5-minute candle (under 0.75 ATR) were hit <b>${pct(ts)}</b> of the time (${tight.length} trades), against <b>${pct(os)}</b> for wider stops (${ok.length} trades). Normal noise takes out a stop that tight, so you walked away too early.`,["#/ch/risk","Risk lesson"]);
     else add("good","Your stop distances look sensible",`Tight stops (${tight.length} trades) were hit ${pct(ts)} of the time and wider stops (${ok.length} trades) ${pct(os)}. No sign that noise is eating you.`,null)}}

  // 3. time of day (parse hh:mm from the log)
  {const bucket=x=>{const m=/^(\d+):(\d+)/.exec(x.t||"");if(!m)return null;const mm=+m[1]*60+ +m[2];return mm<660?"Opening (9:30 to 11:00)":mm<840?"Midday (11:00 to 2:00)":"Afternoon (2:00 to 4:00)"};
   const g={};log.forEach(x=>{const k=bucket(x);if(k)(g[k]=g[k]||[]).push(x.r)});
   const rows=Object.entries(g).filter(([k,v])=>v.length>=MINN).map(([k,v])=>({k,n:v.length,a:avg(v)}));
   if(rows.length>=2){rows.sort((x,y)=>y.a-x.a);const best=rows[0],worst=rows[rows.length-1];
     if(best.a-worst.a>=.4)add(worst.a<0?"warn":"info","Your results change with the time of day",`You average <b>${R(best.a)}</b> in the ${best.k.toLowerCase()} (${best.n} trades) and <b>${R(worst.a)}</b> in the ${worst.k.toLowerCase()} (${worst.n} trades). If it holds up over more trades, a session filter would help.`,["#/see/sessiontime","Session timing guide"])}}

  // 4. buys vs sells
  {const bu=log.filter(x=>x.s==="Buy").map(x=>x.r),se=log.filter(x=>x.s==="Sell").map(x=>x.r);
   if(bu.length>=6&&se.length>=6&&Math.abs(avg(bu)-avg(se))>=.5)add("info",avg(bu)>avg(se)?"You are better at buys":"You are better at sells",`Buys average ${R(avg(bu))} (${bu.length} trades) and sells ${R(avg(se))} (${se.length} trades). That can be a real bias or just luck over a small sample; check again at 30+.`,["#/ch/structure","Trends and structure"])}

  // 5. reward to risk
  {const rr=log.filter(x=>x.rr!=null);
   if(rr.length>=MINN){const m=avg(rr.map(x=>x.rr)),be=1/(1+m),wr=wins.length/log.length;
     if(m<1)add("warn","Your targets are closer than your stops",`You plan about <b>${m.toFixed(2)}R</b> of reward for every 1R of risk, so you need to win more than <b>${pct(be)}</b> of trades just to break even. Your win rate is ${pct(wr)}.`,["#/see/expectancy","Win rate vs reward guide"]);
     else add(wr<be?"warn":"good","Reward against risk",`You plan about <b>${m.toFixed(2)}R</b> per 1R risked, which breaks even at a ${pct(be)} win rate. You are winning ${pct(wr)}${wr<be?", below break-even, so the plan is losing right now":", above break-even"}.`,["#/see/expectancy","Win rate vs reward guide"])}}

  // 6. risk consistency
  {const rk=log.filter(x=>x.rk>0).map(x=>x.rk);
   if(rk.length>=MINN){const s=[...rk].sort((a,b)=>a-b),med=s[Math.floor(s.length/2)],mx=s[s.length-1];
     if(mx>med*3)add("warn","Your risk per trade jumps around",`Your typical trade risks about <b>${usd(med)}</b>, but your biggest risked <b>${usd(mx)}</b>, more than three times that. One oversized move can undo many careful ones. Heavy weight on a bad day ends you.`,["#/see/sizer","Position sizing guide"])
     else add("good","Your risk per trade is consistent",`Typical risk ${usd(med)}, biggest ${usd(mx)}. Consistent risk makes your results readable.`,null)}}

  // 7. skipping
  {const t=log.length+skips;if(t>=10){const r=skips/t;
   if(r<.05)add("info","You almost never skip",`You skipped ${skips} of ${t} charts. Plenty of charts have no clean setup; sitting out the unclear ones is a skill that protects your bankroll. A dead block is not worth working.`,["#/ch/strategies","Strategy lesson"]);
   else if(r>.6)add("info","You skip a lot",`You skipped ${skips} of ${t} charts. Waiting is fine, just make sure you are not skipping setups you actually planned for.`,null)}}

  // 8. trading with or against the patterns Fox found
  {const w=[],ag=[];log.forEach(x=>{(x.pt||[]).forEach(p=>{(p.a?w:ag).push(x.r)})});
   if(w.length>=5&&ag.length>=5)add("info","Trading with the pattern versus against it",`When your trade agreed with a pattern Fox found you averaged <b>${R(avg(w))}</b> (${w.length}); when it went against one, <b>${R(avg(ag))}</b> (${ag.length}). Patterns are not edges, so treat this as a question to keep testing, not an answer.`,["#/cheat","Watch & learn guides"])}

  // 9. longest losing streak
  {let run=0,mx=0;log.forEach(x=>{run=x.r<=0?run+1:0;mx=Math.max(mx,run)});
   if(mx>=4)add("info","Your longest losing streak",`<b>${mx}</b> losses in a row. Streaks like that are normal; the question is whether your size could survive one. At 1R per loss that is ${mx}R.`,["#/see/recover","Drawdown math guide"])}

  // overview numbers
  const be=wins.length/log.length;
  const gross=wins.reduce((s,x)=>s+x.r,0),lossAbs=Math.abs(losses.reduce((s,x)=>s+x.r,0));
  const pf=lossAbs?gross/lossAbs:null;
  const passes=accts.reduce((s,a)=>s+(a.p||0),0),fails=accts.reduce((s,a)=>s+(a.f||0),0);
  const bars=(rows)=>{const mx=Math.max(.5,...rows.map(r=>Math.abs(r.v)));return rows.map(r=>`<div style="display:flex;align-items:center;gap:8px;margin:3px 0"><span style="width:150px;font-size:13px;color:var(--mut)">${r.k} (${r.n})</span><span style="flex:1;background:#16273f;border-radius:6px;height:14px;position:relative"><i style="position:absolute;top:0;${r.v>=0?"left:50%":"right:50%"};height:100%;width:${Math.abs(r.v)/mx*50}%;background:${r.v>=0?"#26dfa3":"#ff5d7c"};border-radius:6px"></i></span><b style="width:64px;text-align:right" class="${r.v>=0?"up":"dn"}">${R(r.v)}</b></div>`).join("")};
  const byTime=(()=>{const g={};log.forEach(x=>{const m=/^(\d+):(\d+)/.exec(x.t||"");if(!m)return;const mm=+m[1]*60+ +m[2];const k=mm<660?"Opening":mm<840?"Midday":"Afternoon";(g[k]=g[k]||[]).push(x.r)});return["Opening","Midday","Afternoon"].filter(k=>g[k]).map(k=>({k,n:g[k].length,v:avg(g[k])}))})();
  const bySide=["Buy","Sell"].map(s=>{const v=log.filter(x=>x.s===s).map(x=>x.r);return{k:s,n:v.length,v:avg(v)}}).filter(r=>r.n);
  const card=x=>`<div class="habit ${x.lvl}"><b>${x.lvl==="warn"?"&#9888; ":x.lvl==="good"?"&#10003; ":""}${x.h}</b><p>${x.t}</p>${x.learn?`<a href="${x.learn[0]}" target="_blank" rel="noopener">&#9654; ${x.learn[1]}</a>`:""}</div>`;
  box(el,"Your habit report",`
  <div class="note" style="margin-top:0"><b>Read this honestly.</b> Your book does not lie. This reads your <b>${log.length}</b> practice trades saved in this browser. Under about 30 trades, a lot of what you see is luck, so Fox marks patterns as things to watch, not verdicts. Trades made before this report existed are missing some details, so some checks need newer trades.</div>
  <div class="kpis"><div class="kpi"><small>Trades</small><b>${log.length}</b></div><div class="kpi"><small>Win rate</small><b>${pct(be)}</b></div><div class="kpi"><small>Average per trade</small><b class="${exp>=0?"up":"dn"}">${R(exp)}</b></div><div class="kpi"><small>Profit factor</small><b>${pf==null?"n/a":pf.toFixed(2)}</b></div><div class="kpi"><small>Passes / breaches</small><b>${passes} / ${fails}</b></div></div>
  <div class="foxnote"><span class="fx">${fox(exp>=0?"happy":"think")}</span><div><b>Fox says:</b> ${exp>=0?"Your average trade is positive so far. That is a start, not proof: check it over more trades and see if the habits below hold it together.":"Your average trade is negative so far, which is normal early on. The habits below are where the leaks usually are. Plug the biggest one first."}</div></div>
  ${f.length?`<h3 style="margin:16px 0 6px">What the numbers show</h3>${f.map(card).join("")}`:`<div class="note">No habit stands out yet. Keep trading and check back.</div>`}
  ${(byTime.length>1||bySide.length>1)?`<h3 style="margin:16px 0 6px">Average result per trade</h3>${byTime.length>1?`<div class="cap">By time of day</div>${bars(byTime)}`:""}${bySide.length>1?`<div class="cap" style="margin-top:8px">By side</div>${bars(bySide)}`:""}`:""}
  <div class="cap" style="margin-top:12px">This is education from practice trades, not a prediction and not advice. <a href="#/practice">Back to the practice game</a></div>`);
};
