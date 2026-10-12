/* Interactive tools. All prices here are SIMULATED or made-up example numbers. */
window.W=window.W||{};
const $w=(s,r)=>r.querySelector(s);
const STAG={
"What is a point worth? P&L calculator":["⚖️","Like weighing it up before you move it: know exactly what every point is worth in your pocket."],
"Build a candle":["🕯️","One candle is one block report. Slide it around and see who ran the corner that round."],
"Same market, different zoom":["🔭","Same block, different distance. Up close it looks wild, from far away you see who really runs it."],
"Spot the trend (5 rounds)":["🧟","Is the crowd of zombies growing or thinning out? Read the block before you step on it."],
"Eat the order book":["📦","A thick block fills your whole order at one price. A thin block makes you pay more for every extra bag."],
"Watch a liquidity sweep happen":["🚓","The raid: price pokes past the spot where everybody parked their stops, grabs them, then turns around."],
"Spot the gap: three candles":["🕳️","A gap is a hole in the block where nobody traded. Price likes to come back and check it."],
"Highs and lows tell the story":["🧱","Steps up means the zombies keep coming. Steps down means the block is drying up."],
"Turn tools on and off":["🔦","Lookouts only report what already happened. Switch them on and see how much they actually tell you."],
"The opening range":["🌅","The first stretch after the bell is when the zombies flood the block. Watch where it settles."],
"The 24 hour trading day (New York time)":["🌙","Different hours, different block: dead overnight, packed at the open, quiet at lunch."],
"Plan the trade: entry, stop, target":["🧾","Set the deal before you step out: where you get in, where you walk away, where you cash out."],
"How many contracts? Position size calculator":["📦","Do not carry more weight than you can afford to lose. Size the pack to the account."],
"Is your system a winner? Expectancy":["🧮","What does one run on this corner pay you on average? Zero or less means do not set up here."],
"What does luck do? 20 parallel universes":["🎲","Twenty blocks, same rules, wildly different nights. Luck runs the short game, so do not brag early."],
"The trailing drawdown trap":["🪤","The firm's floor follows you up. A great run can leave you closer to the edge than a flat one."],
"Tilt check: am I fit to trade today?":["🧠","Be honest. Mad, tired or chasing a loss turns you into a zombie, so check before you play."],
"Build your one-page trading plan":["🗺️","No plan, no run. Write your rules down before the block opens."]};
function box(el,title,html){const t=STAG[title],tg=t?`<div class="stag"><span>${t[0]}</span> ${t[1]}</div>`:"";el.innerHTML=`<div class="widget"><h4>${title}</h4>${tg}${html}</div>`;return el.firstChild}
const money=n=>(n<0?"-":"")+"$"+Math.abs(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const money0=n=>(n<0?"-":"")+"$"+Math.abs(Math.round(n)).toLocaleString();

/* 1. supply and demand seesaw */
W.seesaw=el=>{
  const b=box(el,"The corner seesaw: zombies vs. sellers",`<div class="seesaw" id="ss"><div class="plank"></div><div class="tri"></div><div id="sl"></div><div id="sr"></div></div>
  <div class="ctrl"><label>More sellers  ◀  slide  ▶  More buyers<input type="range" id="sv" min="0" max="100" value="50"></label></div><div class="out" id="so"></div>`);
  const draw=()=>{const v=+$w("#sv",b).value,buy=Math.round(v/10),sell=10-buy;
    $w(".plank",b).style.transform=`rotate(${(sell-buy)*2.2}deg)`;
    $w("#sl",b).innerHTML=Array.from({length:buy},(_,i)=>`<span class="ppl zom" style="left:${12+i*5}%;top:${30+(i%3)*8-(buy-sell)*1.2}px;animation-delay:${(i%4)*.15}s">🧟</span>`).join("");
    $w("#sr",b).innerHTML=Array.from({length:sell},(_,i)=>`<span class="ppl" style="right:${12+i*5}%;top:${30+(i%3)*8-(sell-buy)*1.2}px">🧍</span>`).join("");
    const price=20+(buy-sell)*3;
    $w("#so",b).innerHTML=`<b>${buy}</b> zombie buyers shuffled up with their hands out, <b>${sell}</b> sellers want to move product. ${buy>sell?"Lots of buyers and few sellers, so sellers can ask for more, like a block where everybody wants what you got. The price <b class='up'>goes up</b>.":buy<sell?"Lots of sellers and few buyers, so sellers cut the price just to get it moving. The price <b class='dn'>goes down</b>.":"Same number on each side. The price <b>stays put</b>, a quiet block."} A bag on the corner now: <b>$${price.toFixed(0)}</b> (made-up example). <i>The zombies are only a picture: a buyer who needs it bad pays almost anything, a buyer who does not need it walks.</i>`};
  $w("#sv",b).oninput=draw;draw();
};

/* 2. MNQ / NQ P&L calculator */
W.pnl=el=>{
  const b=box(el,"What is a point worth? P&L calculator",`<div class="ctrl"><label>Contract<select id="pc"><option value="2">MNQ (Micro, $2 per point)</option><option value="20">NQ (E-mini, $20 per point)</option></select></label><label>Direction<select id="pd"><option value="1">Buy (long)</option><option value="-1">Sell (short)</option></select></label><label>Contracts<input type="number" id="pn" value="1" min="1" max="100"></label></div>
  <div class="ctrl"><label>Entry price (example)<input type="number" id="pe" value="20000" step="0.25"></label><label>Exit price (example)<input type="number" id="px" value="20012.5" step="0.25"></label></div><div class="kpis" id="pk"></div><div class="cap">Numbers are made up. The only real facts here are the contract math: MNQ pays $2 per index point and moves in 0.25-point ticks worth $0.50. NQ pays $20 per point, $5 per tick.</div>`);
  const go=()=>{const m=+$w("#pc",b).value,d=+$w("#pd",b).value,n=Math.max(1,+$w("#pn",b).value||1),e=+$w("#pe",b).value,x=+$w("#px",b).value,pts=(x-e)*d,ticks=pts/.25,usd=pts*m*n;
    $w("#pk",b).innerHTML=`<div class="kpi"><small>Points moved</small><b class="${pts>=0?"up":"dn"}">${pts.toFixed(2)}</b></div><div class="kpi"><small>Ticks</small><b>${ticks.toFixed(0)}</b></div><div class="kpi"><small>Profit or loss</small><b class="${usd>=0?"up":"dn"}">${money(usd)}</b></div><div class="kpi"><small>Per tick, per contract</small><b>${money(m*.25)}</b></div>`};
  b.querySelectorAll("input,select").forEach(i=>i.oninput=go);go();
};

/* 3. candle builder */
W.candle=el=>{
  const b=box(el,"Build a candle",`<div id="cd" style="display:flex;justify-content:center"></div>
  <div class="ctrl"><label>Open (where it started)<input type="range" id="co" min="10" max="90" value="40"></label><label>Close (where it ended)<input type="range" id="cc" min="10" max="90" value="65"></label></div>
  <div class="ctrl"><label>Upper wick (how high it poked)<input type="range" id="ch" min="0" max="30" value="10"></label><label>Lower wick (how low it poked)<input type="range" id="cl" min="0" max="30" value="6"></label></div><div class="out" id="cs"></div>`);
  const draw=()=>{const o=+$w("#co",b).value,c=+$w("#cc",b).value,uh=+$w("#ch",b).value,ul=+$w("#cl",b).value,up=c>=o,col=up?UP:DN,top=Math.max(o,c),bot=Math.min(o,c),Y=v=>130-v*1.2;
    $w("#cd",b).innerHTML=`<svg viewBox="0 0 320 150" width="320" height="150"><line x1="60" y1="${Y(top+uh)}" x2="60" y2="${Y(bot-ul)}" stroke="${col}" stroke-width="4" stroke-linecap="round"/><rect x="40" y="${Y(top)}" width="40" height="${Math.max(3,(top-bot)*1.2)}" rx="3" fill="${col}"/>
    <g font-size="12" fill="#9fb4d1" font-family="system-ui"><text x="100" y="${Y(top+uh)+4}">HIGH</text><text x="100" y="${Y(bot-ul)+4}">LOW</text><text x="100" y="${Y(o)+4}">OPEN ${up?"(bottom of body)":"(top of body)"}</text><text x="100" y="${Y(c)+4}">CLOSE ${up?"(top of body)":"(bottom of body)"}</text></g></svg>`;
    const body=Math.abs(c-o),rng=body+uh+ul;let s=up?`<b class="up">Green candle.</b> Buyers won this round: it closed higher than it opened.`:`<b class="dn">Red candle.</b> Sellers won this round: it closed lower than it opened.`;
    s+=body<5?" The body is tiny, so it was a tug of war that ended in a tie (a doji).":body>rng*.7?" A big body with little wick means one side was in charge the whole time.":" ";
    if(uh>body*1.2&&uh>10)s+=" The long upper wick says price went up, but sellers pushed it back down. Buyers got rejected up there.";
    if(ul>body*1.2&&ul>10)s+=" The long lower wick says price dipped, but buyers pushed it back up. Sellers got rejected down there.";
    $w("#cs",b).innerHTML=s};
  b.querySelectorAll("input").forEach(i=>i.oninput=draw);draw();
};

/* 4. timeframes */
W.timeframes=el=>{
  const b=box(el,"Same market, different zoom",`<div class="chips" id="tf"></div><div id="tc"></div><div class="cap">One simulated session, shown as 1-minute, 5-minute, 15-minute or 30-minute candles. Same price action, very different look. SIMULATED data.</div>`);
  const base=legs([100,104,102,108,105,112,109,106,111,118,114,121],{per:[22,12,20,14,24,10,12,18,22,14,16],noise:.55,wick:.35,seed:7});
  const ch=mkChart($w("#tc",b),{height:260,volume:true});
  [["1 min",1],["5 min",5],["15 min",15],["30 min",30]].forEach(([t,k],i)=>{const c=document.createElement("button");c.className="chip"+(i===1?" on":"");c.textContent=t;c.onclick=()=>{b.querySelectorAll(".chip").forEach(x=>x.classList.remove("on"));c.classList.add("on");ch.set(aggregate(base,k),{title:t+" candles ("+aggregate(base,k).length+" candles)"})};$w("#tf",b).appendChild(c)});
  ch.set(aggregate(base,5),{title:"5 min candles (simulated)"});
};

/* 5. spot the trend game */
W.spottrend=el=>{
  const b=box(el,"Spot the trend (5 rounds)",`<div id="st"></div><div class="out" id="sto">Look at the chart and pick what the market is doing.</div><div class="chips" id="sb"><button class="chip" data-a="up">Uptrend</button><button class="chip" data-a="down">Downtrend</button><button class="chip" data-a="range">Sideways range</button></div><div class="cap">Simulated charts. Uptrend = higher highs and higher lows. Downtrend = lower highs and lower lows. Range = bouncing between a ceiling and a floor.</div>`);
  const ch=mkChart($w("#st",b),{height:220});let round=0,score=0,ans="",seed=Math.floor(Math.random()*1e5);
  const make=()=>{const k=["up","down","range"][Math.floor(Math.random()*3)];ans=k;seed+=17;
    const pts=k==="up"?[100,108,103,114,108,121,115,128]:k==="down"?[128,120,125,113,119,106,112,100]:[110,118,111,119,110,118,111,117];
    ch.set(legs(pts,{per:9,noise:.9,wick:.5,seed}),{title:"Round "+(round+1)+" of 5"})};
  make();
  b.querySelectorAll("#sb .chip").forEach(c=>c.onclick=()=>{
    if(round>=5)return;const ok=c.dataset.a===ans;if(ok)score++;round++;
    $w("#sto",b).innerHTML=(ok?"<b class='up'>Right!</b>":"<b class='dn'>Not quite.</b> It was a "+({up:"uptrend",down:"downtrend",range:"range"})[ans]+".")+(round<5?" Next chart...":` Final score: <b>${score}/5</b>. ${score>=4?"You can read a trend.":"Practice makes it click. Try again!"}`);
    if(round<5)setTimeout(make,900);else{const r=document.createElement("button");r.className="btn alt sm";r.textContent="Play again";r.onclick=()=>{round=0;score=0;make();$w("#sto",b).textContent="Look at the chart and pick what the market is doing.";r.remove()};$w("#sto",b).after(r)}
  });
};

/* 6. order book simulator */
W.orderbook=el=>{
  const b=box(el,"Eat the order book",`<div class="chips"><button class="chip on" data-d="thick">Thick book (busy market)</button><button class="chip" data-d="thin">Thin book (quiet market)</button></div>
  <div class="ladder"><div><h5>Sellers asking (ask)</h5><div id="ak"></div></div><div><h5>Buyers bidding (bid)</h5><div id="bd"></div></div></div>
  <div class="ctrl"><label>Market BUY size (contracts)<input type="range" id="qs" min="1" max="120" value="10"></label></div><div class="out" id="oo"></div><div class="cap">Made-up prices. MNQ tick = 0.25 points = $0.50 per contract.</div>`);
  let mode="thick";const mid=20000;
  const book=()=>{const s=mode==="thick"?[40,55,70,90,110,140]:[4,6,5,8,7,10];return{asks:s.map((q,i)=>({p:mid+.25*(i+1),q})),bids:s.map((q,i)=>({p:mid-.25*i,q:Math.round(q*(.8+((i*7)%5)/10))}))}};
  const go=()=>{const bk=book(),want=+$w("#qs",b).value;
    $w("#ak",b).innerHTML=[...bk.asks].reverse().map(a=>`<div class="rowa"><span>${a.p.toFixed(2)}</span><span>${a.q}</span></div>`).join("");
    $w("#bd",b).innerHTML=bk.bids.map(a=>`<div class="rowb"><span>${a.p.toFixed(2)}</span><span>${a.q}</span></div>`).join("");
    let left=want,cost=0,filled=0,lastP=bk.asks[0].p;
    for(const a of bk.asks){if(left<=0)break;const t=Math.min(left,a.q);cost+=t*a.p;filled+=t;left-=t;lastP=a.p}
    const avg=filled?cost/filled:0,slipTicks=(avg-bk.asks[0].p)/.25;
    $w("#oo",b).innerHTML=`You send a market buy for <b>${want}</b>. Best ask is <b>${bk.asks[0].p.toFixed(2)}</b>. ${left>0?"<span class='dn'>There were not enough sellers in this tiny book to fill all of it!</span> ":""}You were filled on ${filled} at an average of <b>${avg.toFixed(2)}</b>, reaching as high as <b>${lastP.toFixed(2)}</b>. That slippage is <b>${slipTicks.toFixed(1)} ticks</b>, about <b class="dn">${money(slipTicks*.5*filled)}</b> in extra cost versus the best ask. ${mode==="thin"?"Thin books make big orders move the price, like one big buyer on a dead block. That is why liquidity matters.":"In a thick book, small orders barely move the price."}`};
  b.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{b.querySelectorAll(".chip").forEach(x=>x.classList.remove("on"));c.classList.add("on");mode=c.dataset.d;go()});
  $w("#qs",b).oninput=go;go();
};

/* 7. liquidity sweep walk-through */
W.sweep=el=>{
  const b=box(el,"Watch a liquidity sweep happen",`<div id="sw"></div><div class="out" id="swo"></div><div class="ctrl"><button class="btn sm" id="swn">Next step</button><button class="btn alt sm" id="swr">Start over</button></div><div class="cap">A teaching example drawn from simulated candles. Real sweeps are messier, and not every poke above a high reverses.</div>`);
  const all=legs([100,104.1,101,104.05,100.9,104.1,101.2,101.8,106.2,103,99.5,97.5],{per:[7,6,6,6,6,7,6,3,4,5,4],noise:.28,wick:.2,seed:11});
  const ch=mkChart($w("#sw",b),{height:250});let st=0;
  const eqHigh=104.1;
  const render=()=>{
    const cut=[all.length*0+37,45,all.length-8,all.length][Math.min(st,3)];
    const cs=all.slice(0,[37,45,52,all.length][Math.min(st,3)]);
    const lv=[{y:eqHigh,label:"equal highs",color:"#ffd166",left:true}];
    const bx=st>=1?[{i0:25,i1:null,y0:eqHigh,y1:eqHigh+1.4,color:"#ff5d7c26",label:"stops + breakout orders"}]:[];
    const mk=[];if(st>=2)mk.push({i:44,y:all[44].h,shape:"down",text:"sweep",color:"#ff5d7c"});if(st>=3)mk.push({i:all.length-1,y:all[all.length-1].l,shape:"up",text:"price falls back",color:"#26dfa3"});
    ch.set(cs,{levels:lv,boxes:bx,markers:mk,title:"Simulated"});
    $w("#swo",b).innerHTML=[`<b>Step 1.</b> Price bounces between a floor and a ceiling. It taps the ceiling three times at almost the same price. Traders call that <b>equal highs</b>. Everyone can see it.`,`<b>Step 2.</b> Think about who is where. Traders who sold short put their stop-loss orders just above the equal highs. Traders hoping for a breakout have buy orders sitting there too. That crowd of waiting orders is <b>liquidity</b>.`,`<b>Step 3.</b> Price pushes up through the highs. The stops fire, which are buy orders. The breakout buyers jump in. Suddenly there are lots of orders to trade against, so big players can sell into them. This poke is called a <b>liquidity sweep</b> (or "stop run").`,`<b>Step 4.</b> With the buy orders used up, nobody is left pushing price up. It falls back below the old highs. A fake breakout! Traders who bought the breakout are now trapped.`][Math.min(st,3)]};
  $w("#swn",b).onclick=()=>{if(st<3)st++;render()};$w("#swr",b).onclick=()=>{st=0;render()};render();
};

/* 8. FVG viewer */
W.fvg=el=>{
  const b=box(el,"Spot the gap: three candles",`<div id="fv"></div><div class="chips"><button class="chip on" data-s="0">The gap forms</button><button class="chip" data-s="1">Price comes back</button></div><div class="out" id="fvo"></div><div class="cap">Teaching example, simulated candles.</div>`);
  const cs=[{o:100,h:101,l:99.2,c:100.6,v:900},{o:100.6,h:101.2,l:100,c:100.9,v:800},{o:100.9,h:101.0,l:100.8,c:100.9,v:600},{o:100.9,h:106.5,l:100.9,c:106.2,v:5000},{o:106.2,h:108,l:105.6,c:107.6,v:2500},{o:107.6,h:109,l:107.1,c:108.6,v:1900},{o:108.6,h:109.8,l:108.1,c:109.2,v:1500},{o:109.2,h:109.6,l:107.6,c:108,v:1300},{o:108,h:108.3,l:106.2,c:106.8,v:1500},{o:106.8,h:107,l:104.9,c:105.4,v:1700},{o:105.4,h:105.6,l:101.6,c:102,v:1800},{o:102,h:102.3,l:100.7,c:101.1,v:1200},{o:101.1,h:104.6,l:100.9,c:104.1,v:2200},{o:104.1,h:106.4,l:103.8,c:106,v:2000}];
  const ch=mkChart($w("#fv",b),{height:250,volume:true});let s=0;
  const draw=()=>{const gapLo=101.0,gapHi=100.9+0,box=[{i0:2,i1:null,y0:101.0,y1:105.6,color:"#5aa9ff30",stroke:"#5aa9ff",label:"fair value gap (FVG)"}];
    ch.set(s?cs:cs.slice(0,8),{boxes:box,levels:[],title:"Simulated"});
    $w("#fvo",b).innerHTML=s?"Later, price <b>dipped back into the gap</b> and found buyers there, then rallied again. Many traders watch for exactly this retest. But it does not always happen: sometimes price slices straight through the gap and keeps going.":"Candle 1 and candle 3 do not overlap. The big green candle 4 moved so fast that there was a hole in the price range where <b>little trading happened</b>. That empty space (the blue box, from candle 1's high to candle 3's low area) is a <b>fair value gap</b>, also called an <b>imbalance</b>."};
  b.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{b.querySelectorAll(".chip").forEach(x=>x.classList.remove("on"));c.classList.add("on");s=+c.dataset.s;draw()});draw();
};

/* 9. structure / trend viewer */
W.structure=el=>{
  const b=box(el,"Highs and lows tell the story",`<div class="chips"><button class="chip on" data-k="up">Uptrend</button><button class="chip" data-k="down">Downtrend</button><button class="chip" data-k="range">Range</button><button class="chip" data-k="break">Trend breaks (change of character)</button></div><div id="stc"></div><div class="out" id="sto2"></div><div class="cap">Simulated. Teal triangles mark swing lows, red triangles mark swing highs.</div>`);
  const ch=mkChart($w("#stc",b),{height:250});
  const sets={up:{pts:[100,110,104,117,111,124,118,131],note:"Each peak is higher than the last (<b>higher highs</b>) and each dip stops higher than the last (<b>higher lows</b>). That is an uptrend. Buyers keep winning, and the block keeps getting busier."},
    down:{pts:[131,121,127,114,120,107,113,100],note:"Each peak is lower (<b>lower highs</b>) and each dip goes lower (<b>lower lows</b>). That is a downtrend. Sellers keep winning, and the block keeps drying up."},
    range:{pts:[110,118,111,119,110,118,111,118],note:"Price bounces between a ceiling (resistance) and a floor (support) without making progress. A range is a dead block catching its breath."},
    break:{pts:[100,110,104,118,112,122,111,104,108,98],note:"Higher highs and higher lows for a while... then price drops <b>below the last higher low</b>. The pattern broke. Traders call the first break a <b>change of character (CHoCH)</b>, and a push beyond a previous swing a <b>break of structure (BOS)</b>. It is a warning, not a guarantee."}};
  const draw=k=>{const s=sets[k],cs=legs(s.pts,{per:8,noise:.7,wick:.4,seed:30+k.length});
    const mk=s.pts.map((p,i)=>i===0||i===s.pts.length-1?null:{i:i*8-1+0,p,hi:p>s.pts[i-1]}).filter(Boolean).map(m=>({i:Math.min(cs.length-1,m.i),y:m.hi?cs[Math.min(cs.length-1,m.i)].h:cs[Math.min(cs.length-1,m.i)].l,shape:m.hi?"down":"up",color:m.hi?"#ff5d7c":"#26dfa3"}));
    ch.set(cs,{markers:mk,title:"Simulated"});$w("#sto2",b).innerHTML=s.note};
  b.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{b.querySelectorAll(".chip").forEach(x=>x.classList.remove("on"));c.classList.add("on");draw(c.dataset.k)});draw("up");
};

/* 10. indicators demo */
W.indicators=el=>{
  const b=box(el,"Turn tools on and off",`<div class="chips"><button class="chip" data-i="sma9">9-candle average</button><button class="chip" data-i="sma20">20-candle average</button><button class="chip" data-i="vwap">VWAP</button><button class="chip on" data-i="vol">Volume</button></div><div id="ic"></div><div class="out" id="io">Tap a tool to put it on the chart.</div><div class="cap">Simulated chart. Indicators are math done on past prices, so they always lag.</div>`);
  const cs=legs([100,106,103,111,107,115,111,108,113,120,116,122],{per:[14,8,12,9,14,7,8,12,14,8,10],noise:.7,wick:.5,seed:5});
  const on={vol:true};const ch=mkChart($w("#ic",b),{height:270,volume:true});
  const info={sma9:"The <b>moving average</b> is the average closing price of the last 9 candles, drawn as a smooth line. It shows the short-term direction.",sma20:"A slower moving average (20 candles). When price is above it and it points up, the trend is probably up.",vwap:"<b>VWAP</b> is the average price paid today, with busy price levels counting more. Many traders treat it as the day's 'fair price': above it feels bullish, below it feels bearish.",vol:"<b>Volume</b> bars show how much trading happened in each candle. Big move on big volume means lots of people agree."};
  const draw=()=>{const lines=[];if(on.sma9)lines.push({data:sma(cs,9),color:"#ffd166",label:"avg 9"});if(on.sma20)lines.push({data:sma(cs,20),color:"#5aa9ff",label:"avg 20"});if(on.vwap)lines.push({data:vwapSeries(cs),color:"#a78bfa",label:"VWAP",w:2});ch.vol=!!on.vol;ch.set(cs,{lines,title:"Simulated"})};
  b.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{const k=c.dataset.i;on[k]=!on[k];c.classList.toggle("on",!!on[k]);$w("#io",b).innerHTML=info[k];draw()});draw();
};

/* 11. opening range demo */
W.orb=el=>{
  const b=box(el,"The opening range",`<div class="chips"><button class="chip on" data-m="1">First 5 min</button><button class="chip" data-m="3">First 15 min</button><button class="chip" data-m="6">First 30 min</button></div><div id="oc"></div><div class="out" id="oo2"></div><div class="cap">One simulated 5-minute session. Not every breakout works. This is how the box is drawn, not a promise it pays.</div>`);
  const cs=legs([100,101.4,99.6,101.0,100.2,104.0,102.6,106.0,104.2,105.1,102.8,101.0,100.2,99.4,100.4],{per:[1,1,1,1,3,2,4,3,6,6,4,3,4,4],noise:.45,wick:.35,seed:21});
  const ch=mkChart($w("#oc",b),{height:260});
  const draw=m=>{const rg=cs.slice(0,m),hi=Math.max(...rg.map(x=>x.h)),lo=Math.min(...rg.map(x=>x.l));
    let bo=-1,dir="";for(let i=m;i<cs.length;i++){if(cs[i].c>hi){bo=i;dir="up";break}if(cs[i].c<lo){bo=i;dir="down";break}}
    ch.set(cs,{boxes:[{i0:0,i1:m-1,y0:lo,y1:hi,color:"#ffd16630",stroke:"#ffd166"}],levels:[{y:hi,label:"opening range high",color:"#ffd166"},{y:lo,label:"opening range low",color:"#ffd166"}],markers:bo>=0?[{i:bo,y:dir==="up"?cs[bo].l:cs[bo].h,shape:dir==="up"?"up":"down",text:"first close outside",color:dir==="up"?"#26dfa3":"#ff5d7c"}]:[],title:"Simulated session"});
    $w("#oo2",b).innerHTML=`The box covers the high and low of the first <b>${m*5} minutes</b>. An opening range breakout trader waits for a candle to close outside the box, then trades that direction with a stop on the other side of the box. ${bo>=0?"Here the first close outside was <b>"+dir+"</b>.":"Here nothing closed outside the box."}`};
  b.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{b.querySelectorAll(".chip").forEach(x=>x.classList.remove("on"));c.classList.add("on");draw(+c.dataset.m)});draw(1);
};

/* 12. sessions clock */
W.sessions=el=>{
  const b=box(el,"The 24 hour trading day (New York time)",`<div class="out" id="sn"></div><svg id="sc" viewBox="0 0 720 150" width="100%"></svg><div class="cap">Session windows are rough conventions and different traders draw them differently. CME equity index futures trade almost around the clock, with a one hour break from 5 to 6 PM New York time on weekdays. Check CME for holidays.</div>`);
  const segs=[["Asia (approx.)",20,26,"#a78bfa"],["London (approx.)",3,12,"#5aa9ff"],["New York futures (approx.)",8,17,"#26dfa3"],["US stock hours",9.5,16,"#ffd166"],["Daily break",17,18,"#ff5d7c"]];
  const X=h=>20+h/24*680;let s='';
  for(let h=0;h<=24;h+=3)s+=`<line x1="${X(h)}" y1="14" x2="${X(h)}" y2="130" stroke="#27426a"/><text x="${X(h)}" y="145" fill="#9fb4d1" font-size="11" text-anchor="middle">${h%24===0?"12a":h<12?h+"a":h===12?"12p":(h-12)+"p"}</text>`;
  segs.forEach((g,i)=>{const [t,a,e,c]=g,y=18+i*22;const rect=(x0,x1)=>`<rect x="${X(x0)}" y="${y}" width="${X(x1)-X(x0)}" height="17" rx="6" fill="${c}" opacity=".85"/>`;
    s+=(e>24?rect(a,24)+rect(0,e-24):a>e?rect(a,24)+rect(0,e):rect(a,e));const lab=a>e?a:a;s+=`<text x="${X(Math.min(a,24))+6}" y="${y+12}" font-size="11" fill="#04120e" font-weight="800">${t}</text>`});
  s+=`<line id="nowl" x1="0" y1="10" x2="0" y2="132" stroke="#fff" stroke-width="2"/>`;
  $w("#sc",b).innerHTML=s;
  const tick=()=>{const p=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",hour:"numeric",minute:"numeric",hour12:false,weekday:"short"}).formatToParts(new Date());const g=k=>p.find(x=>x.type===k).value;const h=(+g("hour")%24)+(+g("minute"))/60;
    $w("#nowl",b).setAttribute("x1",X(h));$w("#nowl",b).setAttribute("x2",X(h));$w("#sn",b).innerHTML=`Right now in New York it is <b>${g("weekday")} ${String(Math.floor(h)).padStart(2,"0")}:${g("minute")}</b>. The white line is now.`};
  tick();setInterval(()=>{if(document.body.contains(b))tick()},30000);
};

/* 13. bracket / R:R planner */
W.bracket=el=>{
  const b=box(el,"Plan the trade: entry, stop, target",`<div id="bk"></div><div class="ctrl"><label>Direction<select id="bdz"><option value="1">Buy (long)</option><option value="-1">Sell (short)</option></select></label><label>Stop distance (points)<input type="range" id="bs" min="2" max="40" value="10"></label><label>Target (multiple of risk)<input type="range" id="bt" min="1" max="5" step=".5" value="2"></label></div><div class="ctrl"><label>Contracts (MNQ)<input type="number" id="bc" value="2" min="1" max="50"></label></div><div class="kpis" id="bko"></div><div class="cap">Simulated chart, MNQ math ($2 per point). Notice how the target gets farther away as you ask for more reward.</div>`);
  const cs=walk(60,{start:20000,vol:5,seed:9,drift:.3});const ch=mkChart($w("#bk",b),{height:240});
  const go=()=>{const d=+$w("#bdz",b).value,st=+$w("#bs",b).value,rr=+$w("#bt",b).value,n=Math.max(1,+$w("#bc",b).value||1),en=cs[cs.length-1].c,sp=en-d*st,tp=en+d*st*rr,risk=st*2*n,rew=st*rr*2*n;
    ch.set(cs,{levels:[{y:en,label:"entry",color:"#5aa9ff"},{y:sp,label:"stop (loss)",color:"#ff5d7c"},{y:tp,label:"target (win)",color:"#26dfa3"}],boxes:[{i0:cs.length-1,i1:null,y0:en,y1:tp,color:"#26dfa322"},{i0:cs.length-1,i1:null,y0:en,y1:sp,color:"#ff5d7c22"}],title:"Simulated MNQ-style prices"});
    $w("#bko",b).innerHTML=`<div class="kpi"><small>Risk if stopped out</small><b class="dn">${money0(risk)}</b></div><div class="kpi"><small>Reward at target</small><b class="up">${money0(rew)}</b></div><div class="kpi"><small>Reward : risk</small><b>${rr}:1</b></div><div class="kpi"><small>Win rate needed to break even</small><b>${(100/(1+rr)).toFixed(0)}%</b></div>`};
  b.querySelectorAll("input,select").forEach(i=>i.oninput=go);go();
};

/* 14. position size */
W.sizer=el=>{
  const b=box(el,"How many contracts? Position size calculator",`<div class="ctrl"><label>Account size ($)<input type="number" id="za" value="25000" step="500"></label><label>Risk per trade (%)<input type="number" id="zr" value="1" step=".25" min=".1" max="10"></label></div><div class="ctrl"><label>Contract<select id="zc"><option value="2">MNQ ($2 per point)</option><option value="20">NQ ($20 per point)</option></select></label><label>Stop distance (points)<input type="number" id="zs" value="15" step=".25" min=".25"></label></div><div class="kpis" id="zo"></div><div class="out" id="zm"></div>`);
  const go=()=>{const a=+$w("#za",b).value||0,r=(+$w("#zr",b).value||0)/100,m=+$w("#zc",b).value,s=+$w("#zs",b).value||1,riskUsd=a*r,perC=s*m,n=Math.floor(riskUsd/perC),actual=n*perC;
    $w("#zo",b).innerHTML=`<div class="kpi"><small>Dollars you may risk</small><b>${money0(riskUsd)}</b></div><div class="kpi"><small>Risk per contract</small><b>${money0(perC)}</b></div><div class="kpi"><small>Contracts</small><b class="${n?"up":"dn"}">${n}</b></div><div class="kpi"><small>Actual risk</small><b>${money0(actual)}</b></div>`;
    $w("#zm",b).innerHTML=n<1?`<span class="dn"><b>Zero contracts.</b> One contract would risk ${money0(perC)}, which is more than your ${money0(riskUsd)} limit. That is the market telling you: tighten the stop, trade a smaller contract, or skip the trade. Do not round up.</span>`:`Formula: contracts = dollars you may risk ÷ (stop in points × dollars per point) = ${money0(riskUsd)} ÷ ${money0(perC)}, rounded <b>down</b>.`};
  b.querySelectorAll("input,select").forEach(i=>i.oninput=go);go();
};

/* 15. expectancy and break-even */
W.expectancy=el=>{
  const b=box(el,"Is your system a winner? Expectancy",`<div class="ctrl"><label>Win rate: <b id="ew">45</b>%<input type="range" id="ewr" min="10" max="90" value="45"></label><label>Average win vs average loss (R): <b id="er">2</b><input type="range" id="err" min=".5" max="5" step=".25" value="2"></label></div><div class="kpis" id="eo"></div><div class="out" id="em"></div><div class="tblwrap" id="et"></div><div class="cap">R means "the amount I risked." If I risk $100, a 2R win is $200 and a loss is -1R, -$100.</div>`);
  const go=()=>{const w=+$w("#ewr",b).value/100,rr=+$w("#err",b).value,e=w*rr-(1-w),be=1/(1+rr);
    $w("#ew",b).textContent=Math.round(w*100);$w("#er",b).textContent=rr;
    $w("#eo",b).innerHTML=`<div class="kpi"><small>Expectancy per trade</small><b class="${e>=0?"up":"dn"}">${e>=0?"+":""}${e.toFixed(2)}R</b></div><div class="kpi"><small>Break-even win rate</small><b>${(be*100).toFixed(0)}%</b></div><div class="kpi"><small>After 100 trades</small><b class="${e>=0?"up":"dn"}">${e>=0?"+":""}${(e*100).toFixed(0)}R</b></div>`;
    $w("#em",b).innerHTML=e>0?`On average each trade makes <b class="up">${e.toFixed(2)}R</b>. If you risk $100 a trade, that is about <b>${money0(e*100)}</b> per trade before costs, over many trades. Not every trade. Over many.`:e===0?"Exactly break-even before costs. After commissions and slippage you would slowly lose.":`This system loses <b class="dn">${Math.abs(e).toFixed(2)}R</b> per trade on average. No position size can fix that. It only makes you lose faster or slower.`;
    const rrs=[1,1.5,2,3],wrs=[30,40,50,60];$w("#et",b).innerHTML=`<table><tr><th>Win rate →<br>Reward:risk ↓</th>${wrs.map(x=>`<th>${x}%</th>`).join("")}</tr>${rrs.map(r=>`<tr><th>${r}:1</th>${wrs.map(x=>{const v=x/100*r-(1-x/100);return`<td class="${v>=0?"up":"dn"}">${v>=0?"+":""}${v.toFixed(2)}R</td>`}).join("")}</tr>`).join("")}</table>`};
  b.querySelectorAll("input").forEach(i=>i.oninput=go);go();
};

/* 16. equity curve simulator */
W.equity=el=>{
  const b=box(el,"What does luck do? 20 parallel universes",`<div class="ctrl"><label>Win rate: <b id="qw">45</b>%<input type="range" id="qwr" min="20" max="80" value="45"></label><label>Reward:risk: <b id="qr">1.5</b><input type="range" id="qrr" min=".5" max="4" step=".25" value="1.5"></label><label>Risk per trade: <b id="qk">1</b>%<input type="range" id="qkr" min=".25" max="10" step=".25" value="1"></label></div><canvas class="chart" id="qc" style="height:260px"></canvas><div class="kpis" id="qo"></div><div class="ctrl"><button class="btn sm" id="qgo">Run 20 new universes</button></div><div class="cap">Each line is the same trader with the same system through 100 trades, just with different luck. SIMULATED with random numbers: a win happens with your win rate, a loss is -1R, a win is +reward R.</div>`);
  const cv=$w("#qc",b);
  const run=()=>{const w=+$w("#qwr",b).value/100,rr=+$w("#qrr",b).value,k=+$w("#qkr",b).value/100;
    $w("#qw",b).textContent=Math.round(w*100);$w("#qr",b).textContent=rr;$w("#qk",b).textContent=(k*100).toFixed(2).replace(/\.?0+$/,"");
    const N=100,P=20,paths=[];let ends=[],dds=[],ruin=0;
    for(let p=0;p<P;p++){let e=100,peak=100,dd=0;const pts=[e];for(let i=0;i<N;i++){const win=Math.random()<w;e*=win?1+k*rr:1-k;if(e<=0)e=.01;peak=Math.max(peak,e);dd=Math.max(dd,(peak-e)/peak);pts.push(e);if(e<50)ruin=1}paths.push(pts);ends.push(e);dds.push(dd)}
    ends.sort((a,b)=>a-b);const med=ends[P>>1],up=ends.filter(x=>x>100).length,worst=Math.max(...dds);
    const dpr=devicePixelRatio||1,W=cv.clientWidth,H=260;cv.width=W*dpr;cv.height=H*dpr;const c=cv.getContext("2d");c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
    const hi=Math.max(...paths.flat(),110),lo=Math.min(...paths.flat(),90),Y=v=>10+(hi-v)/(hi-lo)*(H-26),X=i=>8+i/N*(W-16);
    c.strokeStyle="#27426a";c.beginPath();c.moveTo(8,Y(100));c.lineTo(W-8,Y(100));c.stroke();c.fillStyle="#6f86a8";c.font="11px ui-monospace,monospace";c.fillText("start = 100",12,Y(100)-4);
    paths.forEach(pts=>{const fin=pts[pts.length-1];c.strokeStyle=fin>=100?"#26dfa388":"#ff5d7c88";c.lineWidth=1.6;c.beginPath();pts.forEach((v,i)=>i?c.lineTo(X(i),Y(v)):c.moveTo(X(i),Y(v)));c.stroke()});
    $w("#qo",b).innerHTML=`<div class="kpi"><small>Ended above start</small><b>${up} of ${P}</b></div><div class="kpi"><small>Middle outcome</small><b class="${med>=100?"up":"dn"}">${med.toFixed(0)}</b></div><div class="kpi"><small>Worst drawdown</small><b class="dn">${(worst*100).toFixed(0)}%</b></div><div class="kpi"><small>Any universe lost half?</small><b class="${ruin?"dn":"up"}">${ruin?"Yes":"No"}</b></div>`};
  b.querySelectorAll("input").forEach(i=>i.oninput=run);$w("#qgo",b).onclick=run;run();new ResizeObserver(()=>{}).observe(cv);
};

/* 17. prop trailing drawdown */
W.drawdown=el=>{
  const b=box(el,"The trailing drawdown trap",`<div class="ctrl"><label>Starting balance ($)<input type="number" id="ds" value="25000"></label><label>Max drawdown ($)<input type="number" id="dm" value="1500"></label><label>Type<select id="dt"><option value="trail">Trailing (floor follows your best balance)</option><option value="static">Static (floor never moves)</option></select></label></div><div class="ctrl"><label>Daily results ($), comma separated, in order<input type="text" id="dd" value="400, 600, -300, 500, -450, -380"></label></div><div class="kpis" id="do"></div><div class="tblwrap" id="dtb"></div><div class="cap">Made-up numbers. Real firms differ (some trail intraday, some only at the end of day, some stop trailing once the floor reaches the start balance, some have daily loss limits). Always read your own firm's rules.</div>`);
  const go=()=>{const s0=+$w("#ds",b).value||0,dm=+$w("#dm",b).value||0,tr=$w("#dt",b).value==="trail",days=$w("#dd",b).value.split(",").map(x=>parseFloat(x)).filter(x=>!isNaN(x));
    let bal=s0,peak=s0,rows="",blown=false;
    days.forEach((d,i)=>{if(blown){return}bal+=d;peak=Math.max(peak,bal);const floor=tr?peak-dm:s0-dm,room=bal-floor;if(bal<=floor)blown=true;rows+=`<tr><td>Day ${i+1}</td><td class="${d>=0?"up":"dn"}">${money0(d)}</td><td>${money0(bal)}</td><td>${money0(floor)}</td><td class="${room<dm*.35?"dn":""}">${money0(room)}</td></tr>`});
    const floor=tr?peak-dm:s0-dm;
    $w("#do",b).innerHTML=`<div class="kpi"><small>Balance</small><b>${money0(bal)}</b></div><div class="kpi"><small>Best balance so far</small><b>${money0(peak)}</b></div><div class="kpi"><small>Floor (account dies below)</small><b class="dn">${money0(floor)}</b></div><div class="kpi"><small>Room left</small><b class="${blown?"dn":"up"}">${blown?"Account failed":money0(bal-floor)}</b></div>`;
    $w("#dtb",b).innerHTML=`<table><tr><th>Day</th><th>Result</th><th>Balance</th><th>Floor</th><th>Room</th></tr>${rows}</table>`+(tr&&!blown&&bal>s0?`<div class="note">Notice: you are up ${money0(bal-s0)}, yet you only have ${money0(bal-floor)} of room. A trailing floor chases your best balance, so giving back profit can fail the account even though you are still green overall.</div>`:"")+(blown?`<div class="warn"><b>The account failed.</b> Balance touched the floor. This is the most common way people lose evaluations: not from one giant loss, but from giving back gains against a trailing floor.</div>`:"")};
  b.querySelectorAll("input,select").forEach(i=>i.oninput=go);go();
};

/* 18. tilt check */
W.tilt=el=>{
  const qs=["I slept at least 6 or 7 hours.","I am calm. My heart is not racing.","I am not trying to win back money from yesterday.","I know today's setups and I wrote them down.","I know my daily loss limit and I will stop when I hit it.","I am not rushing because I am afraid to miss out.","I ate and drank water. I am not hungry or wired.","There are no big life problems pulling my mind away right now."];
  const b=box(el,"Tilt check: am I fit to trade today?",`<div id="tq"></div><div class="out" id="to">Tap each statement that is true.</div>`);
  const on=new Set();$w("#tq",b).innerHTML=qs.map((q,i)=>`<button class="opt" data-i="${i}">⬜ ${q}</button>`).join("");
  $w("#tq",b).querySelectorAll(".opt").forEach(o=>o.onclick=()=>{const i=+o.dataset.i;on.has(i)?on.delete(i):on.add(i);o.textContent=(on.has(i)?"✅ ":"⬜ ")+qs[i];o.classList.toggle("right",on.has(i));const n=on.size;
    $w("#to",b).innerHTML=n===8?"<b class='up'>Green light.</b> You are in good shape. Trade your plan.":n>=6?"<b style='color:var(--gold)'>Yellow light.</b> Mostly good. Fix the unchecked ones, or trade smaller today.":"<b class='dn'>Red light.</b> Most pros would say sit today out or only paper trade. The market is open tomorrow too.";});
};

/* 19. plan builder */
W.plan=el=>{
  const saved=JSON.parse(localStorage.getItem("street_plan")||"{}");
  const f=[["market","What I trade","MNQ (Micro Nasdaq-100 futures)"],["hours","My trading window (New York time)","9:30 to 11:30 AM"],["acct","Account size ($)","25000"],["risk","Risk per trade (% of account)","0.5"],["dloss","Daily max loss ($)","250"],["maxtr","Max number of trades per day","3"],["setups","My 1 or 2 setups (describe each in plain words)","Setup 1: ..."],["entry","Exactly what I need to see before I enter","..."],["stop","Where my stop goes and why","..."],["target","Where I take profit","At least 2R, or at the next level"],["never","I will NOT trade when","I am tilted, after my daily loss limit, in the first 2 minutes of the open, during red-flag news"],["after","After each trade and each day I will","Screenshot, write in my journal, rate my discipline 1 to 5"]];
  const b=box(el,"Build your one-page trading plan",`<div id="pf">${f.map(([k,l,p])=>`<div class="ctrl"><label>${l}${["setups","entry","stop","target","never","after"].includes(k)?`<textarea id="p_${k}" rows="3" style="width:100%;background:#0a1322;border:1px solid var(--line);border-radius:10px;padding:8px 10px;color:var(--ink)" placeholder="${p}"></textarea>`:`<input type="text" id="p_${k}" placeholder="${p}">`}</label></div>`).join("")}</div><div class="ctrl"><button class="btn sm" id="pc">Copy my plan</button><button class="btn alt sm" id="pp">Print it</button></div><div class="out" id="po" style="white-space:pre-wrap"></div><div class="cap">Saved on your device only. A plan you wrote while calm beats a plan you invent while you are scared. Same as knowing your route before you move.</div>`);
  f.forEach(([k])=>{const i=$w("#p_"+k,b);i.value=saved[k]||"";i.oninput=()=>{saved[k]=i.value;localStorage.setItem("street_plan",JSON.stringify(saved));out()}});
  const out=()=>{$w("#po",b).textContent="MY TRADING PLAN\n"+f.map(([k,l])=>"\n"+l.toUpperCase()+"\n"+(saved[k]||"(not filled in yet)")).join("\n")+"\n\nRule: if the plan says no, the answer is no."};
  $w("#pc",b).onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText($w("#po",b).textContent);toast("Plan copied")};
  $w("#pp",b).onclick=()=>{const w=window.open("","_blank");w.document.write("<pre style='font:16px system-ui;white-space:pre-wrap;padding:24px'>"+esc($w("#po",b).textContent)+"</pre>");w.document.close();w.print()};out();
};

