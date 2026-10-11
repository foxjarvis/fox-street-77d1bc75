/* Cheat sheet, myths, resources */
window.EXTRAS=window.EXTRAS||{};
const CHEAT_REF=`
<div class="grid2">
<div class="box"><h4>MNQ and NQ math</h4><p>MNQ: <b>$2 / point</b>, tick 0.25 = <b>$0.50</b>.<br>NQ: <b>$20 / point</b>, tick 0.25 = <b>$5</b>.<br>Dollars = points x $/point x contracts.<br>Futures trade Sunday evening to Friday afternoon, with a daily break about 5 to 6 PM New York time.</p></div>
<div class="box"><h4>Nasdaq family</h4><p>{{nasdaq|Nasdaq}} = the exchange. {{composite|Composite}} = 3,000+ stocks. {{nasdaq-100|Nasdaq-100}} = 100 big companies. NQ and MNQ follow the Nasdaq-100.</p></div>
<div class="box"><h4>Candle</h4><p>Open, High, Low, Close. Green: close above open. Red: close below open. Long wick = somebody got turned away. Tiny body = nobody won the round.</p></div>
<div class="box"><h4>Structure</h4><p>Uptrend: HH + HL (the block keeps getting busier). Downtrend: LH + LL (it keeps drying up). Range: a dead block. BOS: somebody took the next corner. CHoCH: the first break against the trend (a warning).</p></div>
<div class="box"><h4>Liquidity</h4><p>(1) How easy it is to move your weight: spread and depth. (2) Where the money is stacked: stops above equal highs, below equal lows, round numbers. Sweep: poke through, grab the stops, reverse (getting set up). FVG: a gap where nobody got served.</p></div>
<div class="box"><h4>Orders</h4><p>Market: now, whatever they got. Limit: my price or I do not move. Stop: the walk-away trigger. Bracket: entry + stop + target (OCO), both exits set before you walk in. Know the stop before you enter. Never widen it.</p></div>
<div class="box"><h4>Risk formulas</h4><p>1R = what I can lose on a trade and still eat tomorrow.<br>Contracts = $risk / (stop points x $/point), round DOWN.<br>Expectancy = win% x avg win R - loss% x avg loss R.<br>Break-even win% = 1 / (1 + reward:risk).<br>Recover from a loss of L%: gain = L / (100 - L).</p></div>
<div class="box"><h4>Daily rules</h4><p>Fixed small risk per trade (0.25 to 1%). Daily loss limit. Max trades. No averaging down. Keep your book on every trade. Walk away when you are hot-headed.</p></div>
<div class="box"><h4>Prop firms (getting fronted)</h4><p>Profit target, max drawdown (static or trailing), daily loss limit, sometimes a consistency rule. Cross the line and you are cut off. Track the floor after every trade. Read the firm's own rules.</p></div>
<div class="box"><h4>Taxes (US futures)</h4><p>Section 1256: 60% long-term / 40% short-term, year-end mark-to-market, Form 6781. Ask a tax pro.</p></div>
<div class="box"><h4>Before every trade</h4><p>Is it my setup? Do I know my stop? Is my size within risk? Reward at least my minimum? News coming? Am I calm? Daily limit not hit? Any "no" = no move.</p></div>
<div class="box"><h4>Evidence in one breath</h4><p>Most day traders lose. Candles alone do not predict. Stops cluster at round numbers. ORB edge vanished after costs in a replication. 'Smart money' claims are mostly untested. Costs and discipline decide. The house takes its cut every time.</p></div>
</div>`;
EXTRAS.cheat={em:'🧾',title:'Watch & learn: the clickable cheat sheet',tag:'Tap any card to watch it explained with moving pictures, pointers and captions.',html:()=>{const G=[['basics','The basics'],['structure','Trends and levels'],['liquidity','Liquidity and price delivery'],['tools','Tools'],['risk','Risk and money'],['strategies','Strategy playbook: one guide per setup']];return `<div class="note" style="margin-top:0"><b>How this works.</b> Every card below is a short animated explainer. It draws a chart, points at the important parts and explains each step in street talk. Use <b>Simple</b> or <b>Advanced</b> captions, step through with the arrows, slow it down, or press <b>Read aloud</b>.</div>${G.map(([k,t])=>`<h2 style="margin:22px 0 4px">${t}</h2><div class="exgrid">${EXORDER.filter(id=>EX[id].sec===k).map(id=>`<a class="excard" href="#/see/${id}"><canvas class="exthumb" data-id="${id}"></canvas><div class="exc"><h3>${EX[id].em} ${EX[id].title}</h3><p>${EX[id].tag}</p><span class="watch">▶ Watch it</span></div></a>`).join('')}</div>`).join('')}<h2 style="margin:26px 0 8px">Quick reference (the whole school on one page)</h2>${CHEAT_REF}`}};

EXTRAS.myths={em:"🕵️",title:"Myths vs facts",tag:"Things people repeat about trading that are not true (or not the whole truth).",html:`
${[
["You can get rich quick.","Same story as every hustle that sold you a dream. Studies of real day traders find most lose, and only a tiny share are persistently profitable after costs (Brazil futures study: 97% of persistent day traders lost; Taiwan: fewer than 1% reliably profitable). Skills take time and many lose their account before learning."],
["A high win rate means a good strategy.","Not by itself. Winning a lot of small ones and then taking one big hit still loses. Reward-to-risk matters equally. A 40% win rate with 3:1 can beat a 70% win rate with 0.5:1. Expectancy is what counts."],
["More indicators means better signals.","Usually the opposite. Ten people telling you the same thing is still one story. Indicators are made from the same prices, so stacking them adds confusion, not new information."],
["Candlestick patterns predict the future.","In the Marshall, Young and Rose study of Dow stocks, 28 signals did not reliably predict profits. Candles are useful for reading context, not as magic signals."],
["The market makers are out to hunt my stop specifically.","Nobody is out to get you personally. Stop orders cluster at obvious places and price can run through them, but that is a market mechanic, not a plot against you. And 'sweeps' are far easier to see after the fact."],
["Gaps always fill.","Not reliably. Studies of price gaps find continuation is common, depending on size and market. Claims like 'most FVGs fill' usually come from untested vendor blogs."],
["You need $25,000 to day trade.","That was the US pattern day trader rule for stock margin accounts, and it was eliminated (approved April 14, 2026, effective June 4, 2026; brokers have until October 2027 to adopt the replacement). Futures were never subject to it. Check your broker."],
["Paper trading proves I am ready.","It proves you can click buttons and follow a plan with no stakes. It does not test fear and greed, and simulator fills are too perfect."],
["A great backtest means a great strategy.","Backtests lie through overfitting, ignored costs, hindsight and small samples. The opening range breakout gross result reproduced but vanished after costs in one replication."],
["Prop firms give you free money.","Getting fronted is never free. You pay for the evaluation and may pay again for resets. Most attempts fail, often through rule breaches. It can be a fair business model for those who succeed, but it is not free."],
["Leverage makes you rich.","Leverage magnifies gains and losses equally. Many accounts are lost because of leverage."],
["You must trade every day.","No. Skipping bad days is a skill. Many profitable traders take only a few trades per week."],
["Someone with expensive cars and a big following knows how to trade.","You know this one. Flash is not proof. Looks and followers are not an audited track record. Ask for broker statements, and remember courses are the business."],
["Trading is gambling.","It can be, and you know the difference between a gambler and an operator. Without an edge, strict risk limits and costs under control, it behaves like gambling. With them, it is a probabilistic business where small edges compound. The difference is the process."],
["I read the block, so I can read the market.","Reading people and reading price are different skills. On the block you know your people and they know you. In the market you never know who is on the other side. What carries over is risk sense, patience and keeping your head. What does not carry over is trusting your gut about people."],
["Taking big risks on the street means I can handle trading risk.","Risk tolerance is not risk management. The best operators are the ones who keep the weight small enough that one bad day cannot end them. Size small, stay in the game."],
["A hot streak means I am a boss.","A few wins in a row is luck until the numbers say otherwise. Keep your book, count the trades, and let the sample size tell you."]
].map(([m,f])=>`<div class="term"><h4 class="dn">Myth: ${m}</h4><p class="easy"><b class="up">Fact:</b> ${f}</p></div>`).join("")}`};

EXTRAS.resources={em:"📚",title:"Books and papers",tag:"Where to go deeper, including the studies quoted in this school.",html:`
<div class="note">Links and titles below are where the facts in this school came from. Some were read as abstracts or summaries, so open the originals before relying on exact numbers.</div>
<h3>Studies quoted</h3>
<div class="term"><h4>Day Trading for a Living?</h4><p>Chague, De-Losso and Giovannetti. Brazilian equity index futures day traders, 2013 to 2015. 97% of those who persisted more than 300 days lost money. <a href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3423101" target="_blank" rel="noopener">SSRN</a></p></div>
<div class="term"><h4>The Cross-Section of Speculator Skill: Evidence from Day Trading</h4><p>Barber, Lee, Liu and Odean, Journal of Financial Markets, 2014. Taiwan, 1992 to 2006. Fewer than 1% of day traders reliably profitable after fees. <a href="https://faculty.haas.berkeley.edu/odean/papers/day%20traders/Day%20Trading%20Skill%20110523.pdf" target="_blank" rel="noopener">Working paper</a></p></div>
<div class="term"><h4>Are Investors Reluctant to Realize Their Losses?</h4><p>Terrance Odean, Journal of Finance, 1998. The disposition effect in about 10,000 brokerage accounts.</p></div>
<div class="term"><h4>Currency Orders and Exchange Rate Dynamics</h4><p>Carol Osler, Journal of Finance, 2003. Stop-loss and take-profit orders cluster around round numbers. <a href="https://www.newyorkfed.org/medialibrary/media/research/staff_reports/sr150.pdf" target="_blank" rel="noopener">NY Fed staff report</a></p></div>
<div class="term"><h4>Candlestick technical trading strategies: Can they create value for investors?</h4><p>Marshall, Young and Rose, Journal of Banking and Finance, 2006. No reliable profits from candlestick signals on Dow stocks.</p></div>
<div class="term"><h4>Can Day Trading Really Be Profitable?</h4><p>Zarattini and Aziz. A 5-minute opening range breakout test on QQQ. <a href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4416622" target="_blank" rel="noopener">SSRN 4416622</a>. An independent replication on several index products found the gross result held but net-of-cost results were not distinguishable from zero.</p></div>
<div class="term"><h4>Prospect Theory: An Analysis of Decision under Risk</h4><p>Kahneman and Tversky, Econometrica, 1979. Loss aversion.</p></div>
<h3>Official pages</h3>
<div class="term"><h4>CME Group: Micro E-mini Nasdaq-100 futures</h4><p>Contract specifications, tick size, margins. <a href="https://www.cmegroup.com/markets/equities/nasdaq/micro-e-mini-nasdaq-100.html" target="_blank" rel="noopener">CME Group</a></p></div>
<div class="term"><h4>Nasdaq-100 methodology</h4><p>How the index is built and reconstituted. <a href="https://indexes.nasdaqomx.com/docs/Methodology_NDX.pdf" target="_blank" rel="noopener">Nasdaq Indexes</a></p></div>
<div class="term"><h4>IRS Form 6781 and Publication 550</h4><p>For reporting Section 1256 gains and losses. Ask a tax professional.</p></div>
<h3>Books</h3>
<div class="term"><h4>Japanese Candlestick Charting Techniques</h4><p>Steve Nison (1991). The book that introduced candlesticks to the West.</p></div>
<div class="term"><h4>Trading in the Zone</h4><p>Mark Douglas. Trading as a probability game and the psychology of rule-following.</p></div>
<div class="term"><h4>Trade Your Way to Financial Freedom</h4><p>Van K. Tharp. R-multiples, expectancy and position sizing.</p></div>
<div class="term"><h4>Thinking, Fast and Slow</h4><p>Daniel Kahneman. Why our brains make predictable money mistakes.</p></div>
<div class="term"><h4>The Psychology of Trading</h4><p>Brett Steenbarger. A trading coach's approach to habits and improvement.</p></div>
<div class="term"><h4>Trading and Exchanges: Market Microstructure for Practitioners</h4><p>Larry Harris. Order books, liquidity and how markets actually work.</p></div>
<div class="term"><h4>Market Wizards</h4><p>Jack Schwager. Interviews with successful traders. Remember survivorship bias: you hear from the winners.</p></div>
<div class="term"><h4>A Random Walk Down Wall Street</h4><p>Burton Malkiel. A strong case for why beating markets is hard.</p></div>
<div class="term"><h4>Fooled by Randomness</h4><p>Nassim Taleb. How luck masquerades as skill.</p></div>
<h3>For backtesting done right</h3>
<div class="term"><h4>Bailey and Lopez de Prado</h4><p>Their work on backtest overfitting, the probability of backtest overfitting and the deflated Sharpe ratio is the standard reference for validating strategies.</p></div>`};
