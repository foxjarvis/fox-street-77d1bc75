/* Fox: the teacher mascot. Draws the fox, and runs the little coach that pops up with a speech bubble on every page. Tips are plain teaching lines, never signals. */
/* The two characters are drawn in js/foxart.js: Fox (the mascot) and Mrs. Francis (the narrator, the female fox who is on screen wherever a voice speaks). */
function fox(mood="happy"){return foxArt(false,mood)}
function foxF(mood="happy"){return foxArt(true,mood)}

(function(){
  const TIPS={
    home:"Hey, I'm Fox, your teacher here. I'll pop up with tips as you go. You already know risk, weight and timing, so we're just putting new names on it. Start with lesson one, or jump into the practice game if you can't wait.",
    finish:"You made it to the end. The real skill now is practice, a written plan, and patience. Keep your book and stay in the game.",
    practice:"Real history with the date hidden. Read the summary first, then pick Buy, Sell or Skip. Skipping is a real decision, not a cop-out. Sometimes the best move is not moving.",
    intro:"Press play. It is about five minutes, with captions if you are somewhere quiet. Jump to any part with the buttons under the video.",
    spot:"Tap where you think the pattern is. No clock and no penalty, being wrong is how it sticks. Flip on hard mode when you want the name hidden.",
    habits:"This reads your own practice trades, your book. Under 30 trades it is mostly noise, so use it to ask questions, not to pass verdicts.",
    cheat:"Tap any card to watch it play out. There's a guide for every strategy now, with the breakout and the fakeout side by side. That is the real one next to the setup.",
    translator:"Type any word from the block and I'll show you the trading word. Or type a trading word and see what it means on the street.",
    glossary:"Search a word, or tap 'Watch it explained' on any term that has a guide. Every word shows the street word first.",
    myths:"Test every claim you hear online, mine included. You know how many people sell a dream. That's why everything here carries an evidence tag.",
    resources:"Read the originals when you can. Some numbers here came from summaries, so check the sources.",
    welcome:"The real talk box up top is the most important thing on this page. This school will never promise you profits, and anybody who does is running game.",
    markets:"Price is just the tug of war between buyers and sellers on a block. Keep the corner spot in your head, it explains a lot later.",
    nasdaq:"Three different things get called 'the Nasdaq'. The quiz checks that you can tell them apart.",
    futures:"Use the calculator before you think about size. One MNQ point is two dollars, and that adds up fast. Count the money before the move, not after.",
    candles:"Each candle is four prices: open, high, low, close. One round of the block written down. Never read one candle as a prediction.",
    charts:"Zoom out for the big picture, zoom in for the entry. Look at the whole block before you make a move. Play with the timeframe tool, the practice game has the same buttons.",
    structure:"Higher highs and higher lows is an uptrend. Mark your levels BEFORE the session, not after the move. Know the hot corners first.",
    liquidity:"Liquidity is where the orders are sitting, where the money is stacked. Watch the sweep and fair value gap guides, and read the evidence tags honestly.",
    orders:"Know your order types before you click. A market order buys you speed, not a price.",
    indicators:"Indicators summarize price, they don't predict it. Pick one or two, not ten.",
    risk:"This is the real game. Decide your stop and your size BEFORE you get in. How much weight you carry is the whole thing.",
    strategies:"Don't try all ten setups. Pick one or two, write the six-part plan, and test with costs. Every setup has a guide you can watch.",
    mind:"Your head is the biggest risk on the chart. Try the tilt check, and be honest with it. You know what hot-headed does to people.",
    testing:"Dry runs and your book before real money. The practice game uses real history, so try for 50 trades, not 3.",
    business:"Rules change at every firm, so read yours line by line before you pay for anything. Getting fronted always has fine print.",
    plan:"Write your plan down. A plan you can print beats a plan in your head."
  };
  const MORE=["Every price on the lesson charts is made up for teaching. The practice game is the one that uses real history.","Nothing here is a signal or financial advice. Trading calls are always yours.","Where should your stop go? Where your idea is wrong, not where it hurts least. That is the line where you walk."];
  let el=null,timer=null,idx=0,page="",quiet=false,persona="m";
  try{quiet=localStorage.getItem("fox_quiet")==="1"}catch(e){}
  function build(){
    if(el)return;el=document.createElement("div");el.className="fox-coach";
    el.innerHTML=`<button class="fav" aria-label="Fox, your teacher. Tap for a tip" title="Fox: tap for a tip">${fox("happy")}</button><div class="fox-bubble" role="status"><span class="who">Fox</span><span class="txt"></span><span class="acts"><a href="#" class="fx-more">another tip</a> <a href="#" class="fx-quiet"></a> <a href="#" class="fx-x">close</a></span></div>`;
    document.body.appendChild(el);
    const b=el.querySelector(".fox-bubble");
    const setQuietLabel=()=>el.querySelector(".fx-quiet").textContent=quiet?"turn pop-ups on":"quiet mode";
    setQuietLabel();
    el.querySelector(".fav").onclick=()=>{const on=b.classList.contains("on");if(on)hide();else say(next())};
    el.querySelector(".fx-x").onclick=e=>{e.preventDefault();hide()};
    el.querySelector(".fx-more").onclick=e=>{e.preventDefault();say(next())};
    el.querySelector(".fx-quiet").onclick=e=>{e.preventDefault();quiet=!quiet;try{localStorage.setItem("fox_quiet",quiet?"1":"0")}catch(x){}setQuietLabel();if(quiet)hide()};
  }
  function hide(){clearTimeout(timer);if(el)el.querySelector(".fox-bubble").classList.remove("on")}
  function say(text,o={}){build();clearTimeout(timer);const b=el.querySelector(".fox-bubble");el.querySelector(".txt").textContent=text;el.querySelector(".fav").innerHTML=persona==="f"?foxF(o.mood||"happy"):fox(o.mood||"happy");el.querySelector(".who").textContent=persona==="f"?"Mrs. Francis":"Fox";b.classList.remove("on");void b.offsetWidth;b.classList.add("on");timer=setTimeout(hide,o.ms||12000)}
  let list=[];
  function next(){const t=list[idx%list.length];idx++;return t}
  window.foxSay=(text,o)=>{if(quiet&&!(o&&o.force))return;say(text,o)};
  window.foxPage=function(){
    build();hide();idx=0;
    const p=(location.hash||"#/").replace(/^#\/?/,"").split("/");let tip;
    document.body.dataset.page=p[0]||"home";
    persona=(p[0]==="intro"||p[0]==="see")?"f":"m";if(el){el.querySelector(".fav").innerHTML=persona==="f"?foxF("happy"):fox("happy");el.querySelector(".who").textContent=persona==="f"?"Mrs. Francis":"Fox"}
    if(!p[0])tip=TIPS.home;
    else if(p[0]==="ch")tip=TIPS[p[1]];
    else if(p[0]==="see"){const d=window.EX&&EX[p[1]];tip=d?("Watch for this: "+d.points[0].replace(/<[^>]+>/g,"")+(d.mistakes&&d.mistakes[0]?" The classic mistake: "+d.mistakes[0].replace(/<[^>]+>/g,""):"")):TIPS.cheat}
    else tip=TIPS[p[0]];
    tip=tip||"Pick a lesson and I'll tag along.";
    list=[tip,...MORE];page=p.join("/");
    if(!quiet)setTimeout(()=>{if(page===p.join("/"))say(tip,{ms:11000})},900);
  };
})();
