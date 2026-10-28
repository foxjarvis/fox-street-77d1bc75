/* Street edition: Trader Fox (the mascot, in glasses, a red fitted cap, a black puffer jacket and a gold chain) and Mrs. Francis (the narrator, soft eyes, a pleasant smile, a satin bomber with a fur collar, gold chains, hoops and a bow): one drawing, two characters.
   Gradient fur, ears joined to the head, a defined muzzle and nose, a bushy tail with a white tip. foxArt(female, mood) returns an SVG string with viewBox 0 0 120 168. */
function foxArt(female,mood="happy"){
  const k=(female?"f":"m")+(foxArt.n=(foxArt.n||0)+1);
  const mouths={
    happy:female?"M48 105.5 Q60 115.5 72 105.5 M48 105.5 L46.6 103.4 M72 105.5 L73.4 103.4":"M49 106 Q60 113 71 106",
    wow:"M54 106 Q60 119 66 106 Q60 110 54 106",
    think:"M52 107 L68 107",
    oops:"M51 112 Q60 104 69 112"};
  const mouth=mouths[mood]||mouths.happy;
  const mouthFill=mood==="wow"?"#5a1a1a":"none";
  const mouthCol=female?"#d6336c":"#5a2a12";
  const brow=mood==="oops"?`<path d="M30 52 L51 57 M90 52 L69 57" stroke="#7a3410" stroke-width="${female?2.2:3.2}" stroke-linecap="round"/>`
    :mood==="think"?`<path d="M30 56 L51 51 M69 51 L90 56" stroke="#7a3410" stroke-width="${female?2.2:3.2}" stroke-linecap="round"/>`
    :`<path d="M30 53 Q41 44 52 50 M68 50 Q79 44 90 53" fill="none" stroke="#8f3d10" stroke-width="${female?2.2:3.4}" stroke-linecap="round"/>`;
  // eyes: Francis has soft, almond, half-lidded eyes; Trader Fox has round alert eyes behind his glasses
  const eyeM=cx=>`<g><ellipse cx="${cx}" cy="64" rx="8.6" ry="9.2" fill="#fffaf2" stroke="#7a3410" stroke-width="1.1"/><circle cx="${cx}" cy="65" r="6" fill="url(#${k}iris)"/><circle cx="${cx}" cy="65" r="3.2" fill="#1b0f0a"/><circle cx="${cx+2.2}" cy="62" r="2.1" fill="#fff"/><circle cx="${cx-2}" cy="67.6" r="1" fill="#fff" opacity=".8"/><path d="M${cx-8.6} 62 Q${cx} 53 ${cx+8.6} 62" fill="none" stroke="#2a1410" stroke-width="2.2" stroke-linecap="round"/></g>`;
  const eyeF=cx=>`<g><path d="M${cx-9.5} 64.5 Q${cx} 55 ${cx+9.5} 64.5 Q${cx} 72 ${cx-9.5} 64.5 Z" fill="#fffaf2" stroke="#7a3410" stroke-width="1"/><circle cx="${cx}" cy="64.6" r="4.7" fill="url(#${k}iris)"/><circle cx="${cx}" cy="64.6" r="2.5" fill="#1b0f0a"/><circle cx="${cx+1.8}" cy="62.8" r="1.5" fill="#fff"/><path d="M${cx-10.2} 64 Q${cx} 54 ${cx+10.2} 64" fill="none" stroke="#2a1410" stroke-width="2.1" stroke-linecap="round"/><path d="M${cx-7.5} 66.5 Q${cx} 70.4 ${cx+7.5} 66.5" fill="none" stroke="#9a4210" stroke-width="1" opacity=".5"/></g>`;
  const lashes=female?`<path d="M31.8 63.4 L25.8 60.4 M33 61 L28 56.4 M36.4 58.6 L33.4 53.6 M88.2 63.4 L94.2 60.4 M87 61 L92 56.4 M83.6 58.6 L86.6 53.6" stroke="#2a1410" stroke-width="1.8" stroke-linecap="round"/><path d="M33 59 Q42 52 51 58" fill="none" stroke="#d9608f" stroke-width="1.4" opacity=".35" stroke-linecap="round"/><path d="M69 58 Q78 52 87 59" fill="none" stroke="#d9608f" stroke-width="1.4" opacity=".35" stroke-linecap="round"/>`:"";
  const glasses=female?"":`<g fill="none" stroke="url(#${k}gold)" stroke-width="2.6" stroke-linecap="round"><circle cx="42" cy="64" r="13.4"/><circle cx="78" cy="64" r="13.4"/><path d="M55.2 61 Q60 57 64.8 61"/><path d="M28.8 61 L19 57.5 M91.2 61 L101 57.5"/></g><circle cx="42" cy="64" r="12.2" fill="#cfe6ff" opacity=".13"/><circle cx="78" cy="64" r="12.2" fill="#cfe6ff" opacity=".13"/><path d="M32.5 57 Q35.5 53.5 40 53" fill="none" stroke="#fff" stroke-width="1.8" opacity=".55" stroke-linecap="round"/><path d="M68.5 57 Q71.5 53.5 76 53" fill="none" stroke="#fff" stroke-width="1.8" opacity=".55" stroke-linecap="round"/>`;
  const body=female
    ?`<path d="M22 168 C22 134 38 116 60 114 C82 116 98 134 98 168 Z" fill="url(#${k}body)" stroke="#6e1b4b" stroke-width="1.2"/>
      <g clip-path="url(#${k}bc)" stroke="#ffffff" stroke-opacity=".16" stroke-width="1.2" fill="none"><path d="M18 138 Q60 148 102 138"/><path d="M18 152 Q60 162 102 152"/></g>
      <path d="M60 126 L60 168" stroke="#ffd166" stroke-width="2" stroke-dasharray="2.4 2"/>
      <path d="M32 126 C32 114 46 111 60 111 C74 111 88 114 88 126 C84 122 78 124 72 121 C66 125 54 125 48 121 C42 124 36 122 32 126 Z" fill="#fffdf8" stroke="#e8dcc8" stroke-width="1"/>
      ${Array.from({length:7},(_,i)=>{const t=i/6,x=36+48*t,y=122-9*Math.sin(Math.PI*t);return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="#fffdf8" stroke="#eadfca" stroke-width=".8"/>`}).join("")}
      <path d="M45 122 C46 138 55 146 60 147 C65 146 74 138 75 122" fill="none" stroke="url(#${k}gold)" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="3.4 1.4"/>
      <path d="M41 122 C41 144 54 156 60 158 C66 156 79 144 79 122" fill="none" stroke="url(#${k}gold)" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="3 1.4"/>
      <path d="M60 164 C52 158 52 152 56 152 C58 152 60 154 60 155 C60 154 62 152 64 152 C68 152 68 158 60 164 Z" fill="url(#${k}gold)" stroke="#8a6417" stroke-width=".8"/>`
    :`<path d="M22 168 C22 134 38 116 60 114 C82 116 98 134 98 168 Z" fill="url(#${k}body)" stroke="#07070b" stroke-width="1.2"/>
      <g clip-path="url(#${k}bc)" stroke="#ffffff" stroke-opacity=".13" stroke-width="1.3" fill="none"><path d="M18 134 Q60 144 102 134"/><path d="M18 148 Q60 158 102 148"/><path d="M18 162 Q60 172 102 162"/></g>
      <path d="M46 116 L60 148 L74 116 C70 114 64 113 60 113 C56 113 50 114 46 116 Z" fill="#f4f6fa" stroke="#cfd6e0" stroke-width="1"/>
      <path d="M46 116 L38 132 L56 168 L60 148 Z" fill="#202029" stroke="#07070b" stroke-width="1"/><path d="M74 116 L82 132 L64 168 L60 148 Z" fill="#202029" stroke="#07070b" stroke-width="1"/>
      <path d="M40 118 C36 111 46 107 60 107 C74 107 84 111 80 118 C72 114 48 114 40 118 Z" fill="#2a2a35" stroke="#07070b" stroke-width="1"/>
      <path d="M41 118 C48 114.4 72 114.4 79 118" fill="none" stroke="#d62839" stroke-width="2"/>
      <path d="M45 118 C46 136 56 146 60 148 C64 146 74 136 75 118" fill="none" stroke="url(#${k}gold)" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 1.6"/>
      <circle cx="60" cy="155" r="7" fill="url(#${k}gold)" stroke="#8a6417" stroke-width="1"/><text x="60" y="158.6" text-anchor="middle" font-size="10" font-weight="900" font-family="Georgia,serif" fill="#5c3d08">$</text>`;
  const cap=female?"":`<g><path d="M31 38 C31 14 89 14 89 38 C80 34 40 34 31 38 Z" fill="#d62839" stroke="#8d1220" stroke-width="1.2"/><circle cx="60" cy="17" r="2.2" fill="#8d1220"/><circle cx="60" cy="27" r="5.4" fill="url(#${k}gold)" stroke="#8a6417" stroke-width=".8"/><text x="60" y="30.6" text-anchor="middle" font-size="8.5" font-weight="900" font-family="Georgia,serif" fill="#5c3d08">F</text><path d="M24 40 C38 31 82 31 96 40 C86 46 34 46 24 40 Z" fill="#a31a2a" stroke="#6d0f1b" stroke-width="1.2"/></g>`;
  const hoops=female?`<g fill="none" stroke="url(#${k}gold)" stroke-width="2.4"><circle cx="18" cy="92" r="7.4"/><circle cx="102" cy="92" r="7.4"/></g>`:"";
  const bow=female?`<g transform="translate(88 30) rotate(18)"><path d="M0 0 C-8 -9 -16 -4 -14 4 C-12 10 -4 8 0 0 Z M0 0 C8 -9 16 -4 14 4 C12 10 4 8 0 0 Z" fill="url(#${k}bow)" stroke="#b02a6c" stroke-width="1"/><circle cx="0" cy="0" r="3.2" fill="#ffd166" stroke="#c9972b" stroke-width=".8"/></g>`:"";
  const innerEar=female?"#ff9bb0":"#4a2418";
  return `<svg viewBox="0 0 120 168" aria-hidden="true">
  <defs>
    <radialGradient id="${k}fur" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#ffb04a"/><stop offset=".65" stop-color="#f27f26"/><stop offset="1" stop-color="#d9601a"/></radialGradient>
    <linearGradient id="${k}tail" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#e5651b"/><stop offset=".6" stop-color="#f58a2e"/><stop offset="1" stop-color="#ffb04a"/></linearGradient>
    <radialGradient id="${k}iris" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#ffcf70"/><stop offset=".6" stop-color="#c87a1d"/><stop offset="1" stop-color="#7a4210"/></radialGradient>
    <linearGradient id="${k}gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6d77a"/><stop offset=".5" stop-color="#c9972b"/><stop offset="1" stop-color="#8a6417"/></linearGradient>
    <linearGradient id="${k}body" x1="0" y1="0" x2="0" y2="1">${female?'<stop offset="0" stop-color="#d63d95"/><stop offset="1" stop-color="#9c2570"/>':'<stop offset="0" stop-color="#3a3a46"/><stop offset="1" stop-color="#15151c"/>'}</linearGradient>
    <linearGradient id="${k}bow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7ab8"/><stop offset="1" stop-color="#e03a8c"/></linearGradient>
    <clipPath id="${k}tc"><path d="M84 158 C106 164 122 146 118 120 C116 106 110 96 106 88 C106 100 102 112 96 122 C90 132 82 144 84 158 Z"/></clipPath>
    <clipPath id="${k}bc"><path d="M22 168 C22 134 38 116 60 114 C82 116 98 134 98 168 Z"/></clipPath>
  </defs>
  <path d="M84 158 C106 164 122 146 118 120 C116 106 110 96 106 88 C106 100 102 112 96 122 C90 132 82 144 84 158 Z" fill="url(#${k}tail)" stroke="#b8500f" stroke-width="1.2" stroke-linejoin="round"/>
  <g clip-path="url(#${k}tc)"><path d="M96 80 L128 80 L128 114 C118 106 108 108 98 114 Z" fill="#fffaf2"/><path d="M98 114 C108 108 118 106 128 114" fill="none" stroke="#f0dfc6" stroke-width="2"/><path d="M96 142 C104 136 112 138 118 144 M98 128 C106 122 114 124 118 130 M100 116 C108 112 112 114 116 118" stroke="#c9531a" stroke-width="1.4" fill="none" opacity=".5" stroke-linecap="round"/></g>
  ${body}
  <path d="M26 56 C14 36 12 14 18 4 C30 10 46 22 58 36 Z" fill="url(#${k}fur)" stroke="#b8500f" stroke-width="1.4" stroke-linejoin="round"/>
  <path d="M94 56 C106 36 108 14 102 4 C90 10 74 22 62 36 Z" fill="url(#${k}fur)" stroke="#b8500f" stroke-width="1.4" stroke-linejoin="round"/>
  <path d="M28 48 C20 34 19 20 22 11 C32 17 42 26 50 36 Z" fill="${innerEar}"/>
  <path d="M92 48 C100 34 101 20 98 11 C88 17 78 26 70 36 Z" fill="${innerEar}"/>
  <path d="M30 44 C27 34 27 26 28 21 M90 44 C93 34 93 26 92 21" stroke="#fff" stroke-width="1.6" fill="none" opacity=".35" stroke-linecap="round"/>
  ${female?"":`<g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M27 35 C18 48 18 65 21 82 L19 104" stroke="#24140f" stroke-width="5.4"/>
    <path d="M34 36 C26 52 28 70 30 86 L28 108" stroke="#3a2117" stroke-width="4.8"/>
    <path d="M42 36 C35 52 36 68 39 82 L37 101" stroke="#24140f" stroke-width="4.5"/>
    <path d="M93 35 C102 48 102 65 99 82 L101 104" stroke="#24140f" stroke-width="5.4"/>
    <path d="M86 36 C94 52 92 70 90 86 L92 108" stroke="#3a2117" stroke-width="4.8"/>
    <path d="M78 36 C85 52 84 68 81 82 L83 101" stroke="#24140f" stroke-width="4.5"/>
    <path d="M28 45 C25 61 25 80 27 98" stroke="#b98243" stroke-width="1.6"/>
    <path d="M91 47 C94 63 94 80 92 98" stroke="#d7b06a" stroke-width="1.6"/>
  </g>`}
  <path d="M60 28 C86 28 104 44 104 66 C104 84 92 100 76 108 C70 111 64 112 60 112 C56 112 50 111 44 108 C28 100 16 84 16 66 C16 44 34 28 60 28 Z" fill="url(#${k}fur)" stroke="#b8500f" stroke-width="1.4"/>
  <path d="M17 72 C22 94 40 109 60 112 C80 109 98 94 103 72 C94 86 80 96 66 98 L60 100 L54 98 C40 96 26 86 17 72 Z" fill="#fffaf2" stroke="#e9d9c0" stroke-width="1"/>
  <path d="M17 72 L27 71 L22 79 Z M103 72 L93 71 L98 79 Z M22 82 L31 84 L25 90 Z M98 82 L89 84 L95 90 Z" fill="#fffaf2" stroke="#e9d9c0" stroke-width=".8" stroke-linejoin="round"/>
  <path d="M60 42 L56 52 L60 48 L64 52 Z" fill="#c9531a" opacity=".45"/>
  <path d="M54 69 C52 77 49.5 83 49.5 88 L70.5 88 C70.5 83 68 77 66 69 C64 65 56 65 54 69 Z" fill="#ffc47e" opacity=".6"/>
  <path d="M54.5 72 L51.5 86 M65.5 72 L68.5 86" stroke="#c9531a" stroke-width="1.2" opacity=".35" stroke-linecap="round"/>
  ${female?eyeF(42)+eyeF(78):eyeM(42)+eyeM(78)}${lashes}${glasses}${brow}
  <ellipse cx="29" cy="82" rx="4.8" ry="3.2" fill="#ff7aa8" opacity="${female?".5":".2"}"/><ellipse cx="91" cy="82" rx="4.8" ry="3.2" fill="#ff7aa8" opacity="${female?".5":".2"}"/>
  <path d="M60 92 C50 90 41 95 40 103 C45 111 54 110 60 105 C66 110 75 111 80 103 C79 95 70 90 60 92 Z" fill="#fffaf2" stroke="#e9d9c0" stroke-width="1"/>
  <g fill="#b8500f" opacity=".55"><circle cx="48" cy="100" r=".9"/><circle cx="52" cy="98" r=".9"/><circle cx="46" cy="103.4" r=".9"/><circle cx="72" cy="100" r=".9"/><circle cx="68" cy="98" r=".9"/><circle cx="74" cy="103.4" r=".9"/></g>
  <path d="M50 84.5 C50 77.5 70 77.5 70 84.5 C70 91.5 63 96.5 60 96.5 C57 96.5 50 91.5 50 84.5 Z" fill="#1b0f0a"/>
  <path d="M55 82 C57 80 63 80 65 82" stroke="#fff" stroke-width="1.6" fill="none" opacity=".5" stroke-linecap="round"/><path d="M55.6 87.6 Q57.6 90 59.4 88.4 M64.4 87.6 Q62.4 90 60.6 88.4" stroke="#4a342a" stroke-width=".9" fill="none" stroke-linecap="round"/>
  <path d="M60 96.5 L60 105" stroke="${mouthCol}" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>
  <path d="${mouth}" fill="${mouthFill}" stroke="${mouthCol}" stroke-width="${female?2.6:2.6}" stroke-linecap="round" stroke-linejoin="round"/>
  ${hoops}${cap}${bow}
  </svg>`;
}
