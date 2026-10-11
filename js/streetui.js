/* Street talk: a search page that flips a street word into its trading word. Reads STREETDICT. */
window.EXTRAS=window.EXTRAS||{};
EXTRAS.translator={em:"🗣️",title:"Street talk",tag:"Type a street word or a trading word. See the other one.",html:'<p>You already know this game. Search a word you use on the block, or one you just heard in a lesson, and get the match.</p><div class="wslot" data-w="translator"></div>'};
W.translator=el=>{
  const D=window.STREETDICT||[],esc=x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;");
  const b=box(el,"Street to trading",'<input class="search" id="tq" placeholder="Try: re-up, front, heat, plug, margin..." autocomplete="off"><div id="tl"></div>');
  const draw=q=>{
    const t=(q||"").toLowerCase().trim();
    const f=D.filter(e=>!t||(e.street+" "+e.trading+" "+e.line).toLowerCase().includes(t));
    b.querySelector("#tl").innerHTML=f.map(e=>'<div class="trow"><b class="st">'+esc(e.street)+'</b> = <b>'+esc(e.trading)+'</b><div class="tr">'+esc(e.line)+'</div><a href="#/glossary/'+e.key+'">More in the glossary</a></div>').join("")||'<p style="color:var(--mut)">No match. Try another word.</p>';
  };
  b.querySelector("#tq").oninput=e=>draw(e.target.value);draw("");
};
