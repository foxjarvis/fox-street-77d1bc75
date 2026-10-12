/* Core: router, progress, rendering, quizzes, glossary tooltips, confetti. */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
window.CH=window.CH||[];window.W=window.W||{};window.GLOSS=window.GLOSS||{};window.EXTRAS=window.EXTRAS||{};

/* ---------- state ---------- */
const KEY="street_school_v1";
let S={done:{},mode:"easy",xp:0};
try{S=Object.assign(S,JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};

/* ---------- glossary links: {{term}} or {{term|shown text}} ---------- */
function gl(html){
  return String(html).replace(/\{\{([a-z0-9\-]+)(?:\|([^}]+))?\}\}/gi,(m,k,shown)=>{
    const t=GLOSS[k];const label=shown||(t?t.t:k);
    return t?`<span class="gl" data-g="${k}" tabindex="0">${label}</span>`:label;
  });
}
const SEE={candle:"candle",ohlc:"candle",body:"candle",wick:"wicks",timeframe:"zoom",support:"sr",resistance:"sr",structure:"structure",bos:"structure",choch:"structure","swing-high":"structure","swing-low":"structure",uptrend:"structure",downtrend:"structure",fakeout:"fakeout",breakout:"breakout",retest:"breakout",pullback:"pullback",sweep:"sweep",liquidity:"sweep","liquidity-pool":"sweep","equal-highs":"sweep",fvg:"fvg",imbalance:"fvg",ifvg:"ifvg","order-block":"orderblock",vwap:"vwap","order-book":"book",spread:"book",slippage:"book",depth:"book","market-order":"ordertypes","limit-order":"ordertypes","stop-order":"ordertypes",expectancy:"expectancy","win-rate":"expectancy",tick:"ticks",point:"ticks",mnq:"ticks",nq:"ticks","position-size":"sizer","r-multiple":"bracket",bracket:"bracket","stop-loss":"bracket","take-profit":"bracket","reward-risk":"bracket",drawdown:"recover","risk-of-ruin":"recover","trailing-drawdown":"trailing"};
let tipEl=null;
function showTip(el){
  const t=GLOSS[el.dataset.g];if(!t)return;
  hideTip();tipEl=document.createElement("div");tipEl.className="tip";
  tipEl.innerHTML=`<b>${t.t}</b>${t.s?` <span class="sw">(street: ${t.s})</span>`:""}<br>${gl(t.e)}${S.mode==="deep"&&t.a?`<br><span style="color:var(--mut)">${gl(t.a)}</span>`:""}<br>${SEE[el.dataset.g]?`<a href="#/see/${SEE[el.dataset.g]}" style="font-size:14px;font-weight:800">▶ Watch it explained</a> · `:""}<a href="#/glossary/${el.dataset.g}" style="font-size:13px">More in the glossary</a>`;
  document.body.appendChild(tipEl);
  const r=el.getBoundingClientRect(),w=tipEl.offsetWidth;
  let x=Math.min(Math.max(8,r.left),innerWidth-w-8),y=r.bottom+8;
  if(y+tipEl.offsetHeight>innerHeight-8)y=Math.max(8,r.top-tipEl.offsetHeight-8);
  tipEl.style.left=x+"px";tipEl.style.top=y+"px";
}
function hideTip(){if(tipEl){tipEl.remove();tipEl=null}}
document.addEventListener("click",e=>{const g=e.target.closest(".gl");if(g){e.preventDefault();showTip(g)}else if(!e.target.closest(".tip"))hideTip()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")hideTip();if((e.key==="Enter"||e.key===" ")&&e.target.classList&&e.target.classList.contains("gl")){e.preventDefault();showTip(e.target)}});
addEventListener("scroll",hideTip,{passive:true});

/* ---------- confetti and toast ---------- */
const cv=$("#conf"),cx=cv.getContext("2d");let parts=[],raf=0;
function fit(){cv.width=innerWidth;cv.height=innerHeight}fit();addEventListener("resize",fit);
function confetti(n=120){
  if(matchMedia("(prefers-reduced-motion:reduce)").matches)return;
  const cols=["#26dfa3","#ffd166","#5aa9ff","#ff5d7c","#a78bfa","#fff"];
  for(let i=0;i<n;i++)parts.push({x:innerWidth/2+(Math.random()-.5)*200,y:innerHeight*.45,vx:(Math.random()-.5)*12,vy:-Math.random()*13-3,s:5+Math.random()*6,c:cols[i%cols.length],r:Math.random()*6,vr:(Math.random()-.5)*.4,l:100+Math.random()*60});
  if(!raf)raf=requestAnimationFrame(step);
}
function step(){cx.clearRect(0,0,cv.width,cv.height);parts=parts.filter(p=>p.l>0);
  parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.3;p.r+=p.vr;p.l--;cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;cx.globalAlpha=Math.min(1,p.l/30);cx.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);cx.restore()});
  raf=parts.length?requestAnimationFrame(step):0}
function toast(msg){const t=document.createElement("div");t.className="toast";t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2800)}

/* ---------- header ---------- */
$("#brand").innerHTML=fox("happy")+"<span>Trader Fox's Trading School: Street Edition</span>";
const NAV=[["#/","Learn"],["#/intro","Intro video"],["#/practice","Practice"],["#/spot","Spot it"],["#/habits","My habits"],["#/cheat","Watch &amp; learn"],["#/translator","Street talk"],["#/glossary","Glossary"],["#/myths","Myths"],["#/resources","Resources"]];
function drawNav(){
  const h=location.hash||"#/";
  $("#nav").innerHTML=NAV.map(([href,t])=>`<a href="${href}" class="${(href==="#/"?(h==="#/"||h.startsWith("#/ch")):h.startsWith(href))?"on":""}">${t}</a>`).join("");
  const done=Object.keys(S.done).length;
  $("#xp").innerHTML=`<span>⭐ ${S.xp} XP</span>`;
}

/* ---------- pages ---------- */
function home(){
  const done=CH.filter(c=>S.done[c.id]!=null).length,pct=Math.round(done/CH.length*100);
  const next=CH.find(c=>S.done[c.id]==null)||CH[0];
  $("#app").innerHTML=`
  <section class="hero">
    <div class="stamp">Street Edition</div>
    <div class="mascot">${fox("happy")}</div>
    <div class="icorow">💵 🧢 ⛓️ 🧟 📦</div>
    <h1>The market is the new <em>plug</em></h1>
    <p class="lead">You already know risk, weight, timing and who to trust. This school turns what you know into trading, in the words you actually use, then goes as deep as you want (pause): the Nasdaq, candles, liquidity, risk, real strategies and the head game. Honest about what works and what does not.</p>
    <div><a class="btn" href="#/ch/${next.id}">${done?"Keep going":"Start lesson 1"}</a> <a class="btn alt" href="#/practice">Try the practice game</a></div>
    <div class="pillrow"><span class="pill">${CH.length} lessons</span><span class="pill">Real-chart practice</span><span class="pill">Interactive tools</span><span class="pill">Quizzes</span><span class="pill">Street talk translator</span><span class="pill">No signup</span></div>
    <div style="max-width:420px;margin:14px auto 0"><div class="bar"><i style="width:${pct}%"></i></div><div style="color:var(--mut);font-size:13px;margin-top:6px">${done} of ${CH.length} lessons finished</div></div>
  </section>
  <div class="note"><b>Real talk first.</b> Research on day traders is rough. In one study of Brazilian futures traders who kept going for more than 300 days, 97% lost money. In a Taiwan study, fewer than 1% of day traders were predictably profitable after costs. This school will not promise you money, and anybody who does is running game on you. It will teach you the real game, how to protect yourself, and how to find out if you have an edge before you put real money down.</div>
  <div class="sechead"><h2>The lessons</h2><span>Go in order. Each one ends with a quiz.</span></div>
  <div class="map">${CH.map((c,i)=>`<a class="cardlink" href="#/ch/${c.id}"><span class="n">${i+1}</span><div class="em">${c.em}</div><h3>${c.title}</h3><p>${c.tag}</p><div class="meta"><span>${c.min} min</span><span class="badge ${S.done[c.id]!=null?"done":"todo"}">${S.done[c.id]!=null?"Done "+S.done[c.id]+"%":"Not yet"}</span></div></a>`).join("")}</div>
  <div class="sechead"><h2>Tools and extras</h2><span>Use these any time</span></div>
  <div class="map">
    <a class="cardlink" href="#/intro"><div class="em">▶️</div><h3>Intro video (5 min)</h3><p>New to trading? Watch a short narrated introduction in street talk: what trading is, how to read a chart, risk, and where to start.</p></a>
    <a class="cardlink" href="#/practice"><div class="em">🎮</div><h3>Practice game</h3><p>Trade real Nasdaq-100 futures history with a summary of what was going on. Score in R.</p></a>
    <a class="cardlink" href="#/glossary"><div class="em">📖</div><h3>Glossary</h3><p>Every word with its street word, the street way to say it, then the trading talk.</p></a>
    <a class="cardlink" href="#/translator"><div class="em">🗣️</div><h3>Street talk</h3><p>Type a word from the block, get the trading word. Or the other way around.</p></a>
    <a class="cardlink" href="#/cheat"><div class="em">🧾</div><h3>Cheat sheet</h3><p>Tap any item and watch it explained with moving pictures, pointers and captions.</p></a>
    <a class="cardlink" href="#/myths"><div class="em">🕵️</div><h3>Myths vs facts</h3><p>The things people believe about trading that are not true.</p></a>
    <a class="cardlink" href="#/resources"><div class="em">📚</div><h3>Books and papers</h3><p>Where to go deeper, including the studies quoted here.</p></a>
  </div>`;
  scrollTo(0,0);
}

const SCENES={
welcome:["🧢 🧟 💵","The dream gets sold on every block. Know the real odds before you put a dollar down."],
markets:["🧟 🧟 🧟 ➡️ 🧍 📦","Zombies shuffle up when product is scarce and the price climbs. Nobody shuffling your way and the price drops."],
nasdaq:["🏦 📦 🔌","The Nasdaq is the new plug. The market has the product, sets the price and keeps its own hours, so you learn it before you deal with it."],
futures:["⚖️ 📦 💵","A futures deal locks in the weight today for later. Know what every point pays before you touch it."],
candles:["🕯️ 🧟 📋","A candle is a block report for one stretch of time: where it opened, how high, how low, where it closed."],
charts:["🌙 🌆 ☀️","Different hours, different block. Overnight is quiet, the opening bell is when the zombies flood in."],
structure:["🧱 🏚️ 🚧","Floors and ceilings are the spots that held before, like a corner that always has heat."],
liquidity:["💧 🧟 🚓","Liquidity is the crowd. Big players need zombies on the other side to move weight without moving the price, and a sweep is a raid on everybody's stops."],
orders:["🧾 📦 🤝","An order is the deal you set before you step out: the price, the size and when you walk."],
indicators:["🧰 🔦 👀","Indicators are lookouts. They report what already happened. None of them can see around the corner."],
risk:["🛡️ ⛓️ 🧢","Protect the bag first. One bad night should never end your run."],
strategies:["♟️ 🗺️ 📖","Ten plays from the book, each with an honest evidence tag. No play wins every night."],
mind:["🧠 😤 🧟","Tilt turns you into a zombie too: chasing, revenge trades, no plan. Stay awake."],
testing:["🔬 📓 🧪","Run it small on paper before you front yourself real money, and write every move down."],
business:["💼 🧾 🏦","A prop firm fronts you the account and you keep a split. Know the rules and the tax man's cut."],
plan:["🗺️ 🧢 💵","No plan, no run. Write your rules down before the block opens."],
playbook:["📒 🧢 🧟","Your plays, your levels, your checklist. Written by you, for you."]};
function scene(id){const x=SCENES[id];return x?`<div class="scene"><div class="sico">${x[0]}</div><p><b>On the block:</b> ${x[1]}</p></div>`:""}
function chapter(id){
  const i=CH.findIndex(c=>c.id===id);if(i<0)return home();
  const c=CH[i],prev=CH[i-1],next=CH[i+1];
  const secs=c.sections.map((s,k)=>`<section class="sec"><h2>${s.h}</h2>${gl(s.html||"")}${s.deep?`<div class="deep">${gl(s.deep)}</div>`:""}${(s.widgets||[]).map(w=>`<div class="wslot" data-w="${w}"></div>`).join("")}${s.after?gl(s.after):""}</section>`).join("");
  $("#app").innerHTML=`<div class="ch">
    <div class="crumbs"><a href="#/">All lessons</a><span>Lesson ${i+1} of ${CH.length} · about ${c.min} min</span></div>
    <div class="chhead"><div class="em">${c.em}</div><div><h1>${c.title}</h1><p>${c.tag}</p></div></div>
    ${scene(c.id)}
    <div class="modes" role="group" aria-label="Detail level"><button data-m="easy" class="${S.mode==="easy"?"on":""}">Beginner</button><button data-m="deep" class="${S.mode==="deep"?"on":""}">Advanced</button></div>
    <div class="eli5"><div class="wk">${fox("happy")}</div><div><h3>The short version, street style</h3>${gl(c.eli5)}</div></div>
    ${secs}
    <div class="take"><h2>Remember these</h2><ul>${c.take.map(t=>`<li>${gl(t)}</li>`).join("")}</ul></div>
    <div class="quiz" id="quiz"><h2>Quick quiz</h2><p style="color:var(--mut)">Get 70% or more to finish this lesson and earn XP. You can retry any time.</p>${c.quiz.map((q,qi)=>`<div class="q" data-qi="${qi}"><p class="qt">${qi+1}. ${gl(q.q)}</p>${q.o.map((o,oi)=>`<button class="opt" data-oi="${oi}">${gl(o)}</button>`).join("")}<div class="why">${gl(q.why)}</div></div>`).join("")}<div class="score" id="score"></div><button class="btn alt sm" id="retry" style="display:none">Try the quiz again</button></div>
    <div class="pager">${prev?`<a class="btn alt" href="#/ch/${prev.id}">Back: ${prev.title}</a>`:`<span></span>`}${next?`<a class="btn" href="#/ch/${next.id}">Next: ${next.title}</a>`:`<a class="btn" href="#/finish">Finish the course</a>`}</div>
  </div>`;
  mountWidgets(c);
  $$(".modes:not(.exmodes) button[data-m]").forEach(b=>b.onclick=()=>{S.mode=b.dataset.m;save();setMode();$$(".modes button[data-m]").forEach(x=>x.classList.toggle("on",x===b))});
  wireQuiz(c);
  scrollTo(0,0);
}
function mountWidgets(c){$$(".wslot").forEach(el=>{const[name,arg]=el.dataset.w.split(":"),f=W[name];if(f){try{f(el,c,arg)}catch(e){el.innerHTML='<div class="warn">This tool hit a snag: '+esc(e.message)+'</div>';console.error(e)}}else el.innerHTML='<div class="warn">Missing tool: '+esc(el.dataset.w)+'</div>'})}
function setMode(){document.body.classList.toggle("deepmode",S.mode==="deep")}
function wireQuiz(c){
  let answered=0,right=0;const total=c.quiz.length;
  $$("#quiz .q").forEach(qel=>{
    const q=c.quiz[+qel.dataset.qi];
    $$(".opt",qel).forEach(b=>b.onclick=()=>{
      if(qel.classList.contains("answered"))return;
      qel.classList.add("answered");answered++;
      const ok=+b.dataset.oi===q.a;if(ok)right++;
      b.classList.add(ok?"right":"wrong");
      if(!ok)$$(".opt",qel)[q.a].classList.add("right");
      if(answered===total){
        const pct=Math.round(right/total*100);
        const sc=$("#score");
        if(pct>=70){
          const first=S.done[c.id]==null;
          if(first||pct>S.done[c.id]){S.done[c.id]=pct}
          if(first){S.xp+=50+right*10;toast("Lesson finished! +"+(50+right*10)+" XP");confetti(140)}
          save();drawNav();
          sc.innerHTML=`<span class="up">You got ${right} of ${total} (${pct}%). Lesson finished!</span>`;
        }else sc.innerHTML=`<span class="dn">You got ${right} of ${total} (${pct}%). Read the explanations and try again.</span>`;
        $("#retry").style.display="inline-block";
      }
    });
  });
  $("#retry").onclick=()=>chapter(c.id);
}

function glossary(focus){
  const keys=Object.keys(GLOSS).sort((a,b)=>GLOSS[a].t.localeCompare(GLOSS[b].t));
  $("#app").innerHTML=`<div class="ch"><div class="chhead"><div class="em">📖</div><div><h1>Glossary</h1><p>${keys.length} words. Each one shows the street word, the street way to say it, then the trading talk. Want it the other way around? Try <a href="#/translator">Street talk</a>.</p></div></div>
  <input class="search" id="gs" placeholder="Search a word..." autocomplete="off"><div id="gl"></div></div>`;
  const draw=q=>{
    const f=keys.filter(k=>!q||(GLOSS[k].t+" "+(GLOSS[k].s||"")+" "+GLOSS[k].e+" "+(GLOSS[k].a||"")).toLowerCase().includes(q.toLowerCase()));
    $("#gl").innerHTML=f.map(k=>`<div class="term" id="g-${k}"><h4>${GLOSS[k].t}${GLOSS[k].s?` <span class="sw">(street: ${GLOSS[k].s})</span>`:""}</h4><p class="easy"><b>Street:</b> ${gl(GLOSS[k].e)}</p>${GLOSS[k].a?`<p class="adult"><b>Advanced:</b> ${gl(GLOSS[k].a)}</p>`:""}${SEE[k]?`<p><a href="#/see/${SEE[k]}" class="btn sm">▶ Watch it explained</a></p>`:""}</div>`).join("")||'<p style="color:var(--mut)">No match. Try another word.</p>';
  };
  draw("");$("#gs").oninput=e=>draw(e.target.value);
  if(focus&&GLOSS[focus]){const el=$("#g-"+focus);if(el){el.scrollIntoView({block:"center"});el.style.borderColor="var(--gold)"}}else scrollTo(0,0);
}

function extra(name){
  const x=EXTRAS[name];if(!x)return home();
  $("#app").innerHTML=`<div class="ch"><div class="chhead"><div class="em">${x.em}</div><div><h1>${x.title}</h1><p>${x.tag||""}</p></div></div>${gl(typeof x.html==="function"?x.html():x.html)}</div>`;
  mountWidgets({});$$(".exthumb").forEach(cv=>{const d=EX[cv.dataset.id];if(d)exThumb(d,cv)});
  scrollTo(0,0);
}
function see(id){
  const d=EX[id];if(!d)return extra("cheat");const i=EXORDER.indexOf(id),prev=EXORDER[i-1],next=EXORDER[i+1];
  $("#app").innerHTML=`<div class="ch"><div class="crumbs"><a href="#/cheat">All visual guides</a><span>${i+1} of ${EXORDER.length}</span></div>
  <div class="chhead"><div class="em">${d.em}</div><div><h1>${d.title}</h1><p>${d.tag}</p></div></div>
  <div class="wslot" data-w="ex:${id}" data-full="1"></div>
  <div class="grid2"><div class="take" style="margin:14px 0"><h2>Remember</h2><ul>${d.points.map(x=>`<li>${gl(x)}</li>`).join("")}</ul></div><div class="warn" style="margin:14px 0"><b>Common mistakes</b><ul style="margin:6px 0 0">${d.mistakes.map(x=>`<li>${gl(x)}</li>`).join("")}</ul></div></div>
  <p>${d.gl?"Words in this guide: "+d.gl.map(k=>GLOSS[k]?`<a href="#/glossary/${k}">${GLOSS[k].t}</a>`:"").filter(Boolean).join(", ")+".":""}</p>
  <div class="pager">${prev?`<a class="btn alt" href="#/see/${prev}">◀ ${EX[prev].title}</a>`:`<span></span>`}${d.lesson?`<a class="btn alt" href="#/ch/${d.lesson}">Open the lesson</a>`:""}${next?`<a class="btn" href="#/see/${next}">${EX[next].title} ▶</a>`:`<a class="btn" href="#/cheat">Back to all guides</a>`}</div></div>`;
  mountWidgets({});scrollTo(0,0);
}
function finish(){
  const done=CH.filter(c=>S.done[c.id]!=null).length;
  $("#app").innerHTML=`<div class="ch" style="text-align:center"><div class="hero"><div class="mascot">${fox("wow")}</div><h1>${done===CH.length?"You graduated!":"Almost there"}</h1>
  <p class="lead">${done===CH.length?"You finished every lesson. That is the start, not the end. The real skill comes from practice, a written plan, a journal and patience.":"You have finished "+done+" of "+CH.length+" lessons. Go back and finish the rest to graduate."}</p>
  <div><a class="btn" href="#/ch/plan">${done===CH.length?"Open your game plan":"Go to your game plan"}</a> <a class="btn alt" href="#/practice">Practice more</a></div></div></div>`;
  if(done===CH.length)confetti(200);
}

function route(){
  hideTip();
  const h=(location.hash||"#/").replace(/^#\/?/,""),p=h.split("/");
  drawNav();setMode();
  if(p[0]===""||!p[0])return home();
  if(p[0]==="ch")return chapter(p[1]);
  if(p[0]==="glossary")return glossary(p[1]);
  if(p[0]==="practice"){$("#app").innerHTML=`<div class="ch"><div class="chhead"><div class="em">🎮</div><div><h1>Practice game</h1><p>Real history, real decisions. Score in R.</p></div></div><div class="wslot" data-w="practice"></div></div>`;W.practice($(".wslot"),{});return scrollTo(0,0)}
  if(p[0]==="spot"){$("#app").innerHTML=`<div class="ch"><div class="chhead"><div class="em">🎯</div><div><h1>Spot it</h1><p>Tap the pattern on a real chart before anyone tells you where it is.</p></div></div><div class="wslot" data-w="spot"></div></div>`;mountWidgets({});scrollTo(0,0);return}
  if(p[0]==="habits"){$("#app").innerHTML=`<div class="ch"><div class="chhead"><div class="em">🪞</div><div><h1>My habits</h1><p>What your own practice trades say about how you trade.</p></div></div><div class="wslot" data-w="habits"></div></div>`;mountWidgets({});scrollTo(0,0);return}
  if(p[0]==="intro"&&window.introPage)return introPage();
  if(p[0]==="finish")return finish();
  if(p[0]==="see")return see(p[1]);
  return extra(p[0]);
}
addEventListener("hashchange",()=>{if(window.speechSynthesis)speechSynthesis.cancel();route();if(window.foxPage)foxPage()});
route();if(window.foxPage)foxPage();
