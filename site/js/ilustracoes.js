// Ilustrações desenhadas à mão em SVG. Cada pão, doce e pote é um <symbol> de 100x100.
// As cores vêm de --a, --b e --c definidas no elemento que usa o símbolo (ver dados.js).
// Contorno: tinta marrom, ponta redonda, para parecer traço de nanquim.

const T = 'class="t"'; // traço de tinta (definido no CSS)

export const SPRITES = `
<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
  <filter id="rabisco" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="r"/>
    <feDisplacementMap in="SourceGraphic" in2="r" scale="2.4" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="tinta" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="9" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.2" result="furos"/>
    <feComposite in="SourceGraphic" in2="furos" operator="in"/>
  </filter>
  <pattern id="xadrez" width="24" height="24" patternUnits="userSpaceOnUse">
    <rect width="24" height="24" fill="#fbf1dc"/>
    <rect width="12" height="24" fill="#c8553d" opacity=".55"/>
    <rect width="24" height="12" fill="#c8553d" opacity=".55"/>
  </pattern>
  <pattern id="vime" width="14" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(8)">
    <rect width="14" height="10" fill="#c98a43"/>
    <path d="M0 5 H14 M3 0 V10 M10 0 V10" stroke="#8a5a22" stroke-width="1.6" fill="none"/>
    <path d="M0 2 H14" stroke="#e0a85c" stroke-width="1.2" fill="none"/>
  </pattern>
  <pattern id="tabua" width="60" height="40" patternUnits="userSpaceOnUse">
    <rect width="60" height="40" fill="#b8742f"/>
    <path d="M0 8 C20 4 40 12 60 7 M0 22 C25 26 40 18 60 23 M0 34 C15 31 45 37 60 33" stroke="#8a501c" stroke-width="1.4" fill="none"/>
  </pattern>
  <radialGradient id="forno" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="#ffe9b0"/><stop offset=".6" stop-color="#fbd98a" stop-opacity=".55"/><stop offset="1" stop-color="#fbd98a" stop-opacity="0"/>
  </radialGradient>
</defs>

<symbol id="i-croissant" viewBox="0 0 100 100">
  <ellipse class="t a" cx="16" cy="66" rx="8" ry="11" transform="rotate(-48 16 66)"/>
  <ellipse class="t a" cx="84" cy="66" rx="8" ry="11" transform="rotate(48 84 66)"/>
  <ellipse class="t a" cx="29" cy="56" rx="13" ry="18" transform="rotate(-32 29 56)"/>
  <ellipse class="t a" cx="71" cy="56" rx="13" ry="18" transform="rotate(32 71 56)"/>
  <ellipse class="t a" cx="50" cy="48" rx="17" ry="22"/>
  <path class="b" d="M43 30 C38 40 38 52 42 60 C37 54 36 42 43 30Z"/>
  <path class="b" d="M22 48 C16 54 17 62 21 67 C14 62 15 53 22 48Z"/>
  <path class="b" d="M70 31 C76 40 76 52 71 60 C80 52 79 40 70 31Z" opacity=".55"/>
  <path class="t" fill="none" d="M38 33 C43 43 43 55 38 66 M62 33 C57 43 57 55 62 66 M20 52 C27 56 29 63 27 71 M80 52 C73 56 71 63 73 71"/>
  <path class="c" d="M30 74 Q50 82 70 74 Q50 78 30 74Z" opacity=".35"/>
</symbol>

<symbol id="i-baguete" viewBox="0 0 100 100">
  <g transform="rotate(-32 50 50)">
    <rect class="t a" x="4" y="38" width="92" height="25" rx="12.5"/>
    <path class="c" d="M12 58 Q50 66 88 58 Q50 62 12 58Z" opacity=".4"/>
    <path class="t b" d="M18 43 Q24 41 30 52 Q23 52 18 43Z"/>
    <path class="t b" d="M35 42 Q41 40 47 52 Q40 52 35 42Z"/>
    <path class="t b" d="M52 42 Q58 40 64 52 Q57 52 52 42Z"/>
    <path class="t b" d="M69 43 Q75 41 81 52 Q74 52 69 43Z"/>
    <path fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round" d="M14 41 Q50 36 80 41"/>
  </g>
</symbol>

<symbol id="i-boule" viewBox="0 0 100 100">
  <path class="t a" d="M10 62 C8 38 28 22 50 22 C72 22 92 38 90 62 C90 74 74 82 50 82 C26 82 10 74 10 62Z"/>
  <path class="c" d="M16 68 Q50 86 84 68 Q84 78 50 82 Q16 78 16 68Z" opacity=".45"/>
  <path class="t b" d="M28 40 Q50 52 72 40 Q70 46 50 56 Q30 46 28 40Z"/>
  <path class="t" fill="none" d="M34 32 Q42 52 38 70 M50 28 Q56 50 50 74 M66 32 Q60 52 64 70"/>
  <circle class="b" cx="26" cy="50" r="2.2"/><circle class="b" cx="76" cy="52" r="2"/><circle class="b" cx="60" cy="68" r="2"/><circle class="b" cx="40" cy="64" r="1.8"/>
</symbol>

<symbol id="i-frances" viewBox="0 0 100 100">
  <g transform="rotate(-18 50 50)">
    <ellipse class="t a" cx="40" cy="48" rx="31" ry="17"/>
    <ellipse class="t a" cx="62" cy="62" rx="31" ry="17"/>
    <path class="b" d="M18 46 Q40 40 62 46 Q40 50 18 46Z" opacity=".9"/>
    <path class="t" fill="none" d="M20 48 Q40 43 60 48"/>
    <path class="b" d="M40 60 Q62 54 84 60 Q62 64 40 60Z" opacity=".9"/>
    <path class="t" fill="none" d="M42 62 Q62 57 82 62"/>
  </g>
</symbol>

<symbol id="i-brioche" viewBox="0 0 100 100">
  <path class="t a" d="M14 66 C12 48 28 40 50 40 C72 40 88 48 86 66 C86 78 72 84 50 84 C28 84 14 78 14 66Z"/>
  <circle class="t a" cx="50" cy="30" r="14"/>
  <path class="b" d="M26 56 C30 50 38 48 44 48 C36 50 32 54 30 62 C28 60 26 58 26 56Z"/>
  <path class="b" d="M42 24 C44 20 50 18 54 20 C48 20 45 23 44 28Z"/>
  <path class="t" fill="none" d="M38 42 Q50 46 62 42"/>
  <path class="c" d="M20 74 Q50 88 80 74 Q50 82 20 74Z" opacity=".35"/>
</symbol>

<symbol id="i-paoqueijo" viewBox="0 0 100 100">
  <circle class="t a" cx="30" cy="62" r="18"/>
  <circle class="t a" cx="70" cy="62" r="18"/>
  <circle class="t a" cx="50" cy="38" r="18"/>
  <circle class="b" cx="43" cy="31" r="5" opacity=".8"/><circle class="b" cx="23" cy="55" r="5" opacity=".8"/><circle class="b" cx="63" cy="55" r="5" opacity=".8"/>
  <circle class="c" cx="55" cy="44" r="2.2"/><circle class="c" cx="34" cy="68" r="2"/><circle class="c" cx="75" cy="68" r="2.2"/><circle class="c" cx="44" cy="46" r="1.6"/><circle class="c" cx="66" cy="72" r="1.6"/>
</symbol>

<symbol id="i-focaccia" viewBox="0 0 100 100">
  <path class="t a" d="M10 38 C10 28 18 24 30 26 L72 22 C84 22 90 28 90 40 L90 62 C90 74 84 78 72 78 L28 78 C16 78 10 72 10 62Z"/>
  <g class="c" opacity=".7"><circle cx="24" cy="40" r="3"/><circle cx="42" cy="36" r="3"/><circle cx="60" cy="38" r="3"/><circle cx="77" cy="40" r="3"/><circle cx="30" cy="56" r="3"/><circle cx="48" cy="54" r="3"/><circle cx="66" cy="57" r="3"/><circle cx="80" cy="58" r="3"/></g>
  <path style="fill:none;stroke:var(--b)" d="M20 66 Q36 48 56 52 M38 70 Q58 56 78 66" stroke-width="3" stroke-linecap="round"/>
  <path class="b" d="M26 50 l5 -6 l1 7z M55 46 l5 -6 l1 7z M70 52 l5 -6 l1 7z"/>
</symbol>

<symbol id="i-fatia" viewBox="0 0 100 100">
  <path class="t c" d="M78 40 L92 32 L92 66 L78 74Z"/>
  <rect class="t a" x="12" y="38" width="66" height="36" rx="4"/>
  <path class="t b" d="M12 44 Q12 32 24 32 L66 32 Q78 32 78 44 Q72 54 66 44 Q60 56 54 44 Q48 54 42 44 Q36 56 30 44 Q22 54 12 44Z"/>
  <path class="t b" d="M78 40 L92 32 Q92 38 86 40 Q84 46 78 48Z" opacity=".8"/>
  <path class="t" fill="none" d="M12 58 H78 M12 66 H78" opacity=".45"/>
  <path fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2" stroke-linecap="round" d="M20 36 H44"/>
</symbol>

<symbol id="i-rolinho" viewBox="0 0 100 100">
  <circle class="t a" cx="50" cy="52" r="36"/>
  <path style="fill:none;stroke:var(--c)" stroke-width="4.5" stroke-linecap="round" d="M50 50 a4 4 0 1 1 4 4 a9 9 0 1 1 -9 -9 a15 15 0 1 1 15 15 a22 22 0 1 1 -22 -22 a28 28 0 0 1 28 -12"/>
  <path class="t b" d="M22 42 Q38 22 66 26 Q82 34 80 50 Q68 42 58 50 Q48 38 38 50 Q28 48 22 42Z"/>
  <circle class="b" cx="30" cy="66" r="3"/><circle class="b" cx="72" cy="68" r="2.6"/>
</symbol>

<symbol id="i-sonho" viewBox="0 0 100 100">
  <path class="t a" d="M10 58 C10 38 28 28 50 28 C72 28 90 38 90 58 C90 74 72 82 50 82 C28 82 10 74 10 58Z"/>
  <path class="b" d="M22 50 C26 38 38 34 50 34 C62 34 74 38 78 50 C70 46 62 52 54 46 C46 52 36 46 22 50Z"/>
  <circle class="c" cx="50" cy="44" r="5"/>
  <circle class="b" cx="26" cy="66" r="2"/><circle class="b" cx="38" cy="72" r="2"/><circle class="b" cx="60" cy="73" r="2"/><circle class="b" cx="74" cy="64" r="2"/><circle class="b" cx="48" cy="68" r="1.8"/>
</symbol>

<symbol id="i-bolinhas" viewBox="0 0 100 100">
  <path ${T} d="M10 62 L16 84 L48 84 L54 62Z" fill="#f4e3bd"/>
  <path ${T} d="M46 62 L52 84 L84 84 L90 62Z" fill="#f4e3bd"/>
  <path class="t" fill="none" d="M20 64 L22 82 M28 64 L30 82 M36 64 L38 82 M44 64 L45 82 M56 64 L57 82 M64 64 L66 82 M72 64 L74 82 M80 64 L82 82" opacity=".55"/>
  <circle class="t a" cx="32" cy="50" r="19"/>
  <circle class="t a" cx="68" cy="50" r="19"/>
  <g class="b"><rect x="22" y="38" width="6" height="2.6" rx="1.3" transform="rotate(25 25 39)"/><rect x="34" y="34" width="6" height="2.6" rx="1.3" transform="rotate(-30 37 35)"/><rect x="38" y="52" width="6" height="2.6" rx="1.3" transform="rotate(60 41 53)"/><rect x="24" y="54" width="6" height="2.6" rx="1.3" transform="rotate(-10 27 55)"/>
  <rect x="58" y="38" width="6" height="2.6" rx="1.3" transform="rotate(-25 61 39)"/><rect x="72" y="36" width="6" height="2.6" rx="1.3" transform="rotate(40 75 37)"/><rect x="62" y="54" width="6" height="2.6" rx="1.3" transform="rotate(10 65 55)"/><rect x="76" y="52" width="6" height="2.6" rx="1.3" transform="rotate(-50 79 53)"/></g>
</symbol>

<symbol id="i-brownie" viewBox="0 0 100 100">
  <path class="t c" d="M12 52 L12 70 Q12 76 18 76 L70 76 Q76 76 76 70 L76 52Z"/>
  <path class="t a" d="M12 52 L24 32 Q26 30 30 30 L84 30 Q88 30 86 34 L76 52Z"/>
  <path class="t c" d="M76 52 L88 34 L88 54 L76 70Z" opacity=".9"/>
  <path class="b" d="M26 42 l8 -4 l6 4 l-8 4z M52 40 l8 -4 l6 3 l-8 5z M40 48 l6 -2 l4 3 l-6 2z" opacity=".9"/>
  <path class="t" fill="none" d="M30 38 l8 3 M58 44 l9 -2 M44 36 l4 6" opacity=".4"/>
</symbol>

<symbol id="i-cookie" viewBox="0 0 100 100">
  <path class="t a" d="M50 14 C58 12 64 18 72 20 C82 24 88 32 86 42 C92 50 90 62 82 70 C76 80 64 86 54 84 C44 90 32 86 24 78 C14 72 10 60 14 50 C10 40 16 28 26 22 C34 16 42 18 50 14Z"/>
  <ellipse class="b" cx="36" cy="36" rx="6" ry="4.6" transform="rotate(20 36 36)"/><ellipse class="b" cx="62" cy="32" rx="6" ry="4.6" transform="rotate(-20 62 32)"/>
  <ellipse class="b" cx="50" cy="52" rx="6.4" ry="5" transform="rotate(35 50 52)"/><ellipse class="b" cx="28" cy="58" rx="5.4" ry="4.4"/>
  <ellipse class="b" cx="72" cy="56" rx="5.8" ry="4.6" transform="rotate(-30 72 56)"/><ellipse class="b" cx="46" cy="72" rx="5.6" ry="4.4"/><ellipse class="b" cx="66" cy="72" rx="4.6" ry="3.8"/>
</symbol>

<symbol id="i-tortinha" viewBox="0 0 100 100">
  <path class="t c" d="M16 54 L24 78 Q50 86 76 78 L84 54Z"/>
  <path class="t" fill="none" d="M26 58 L30 80 M36 60 L38 82 M46 60 L47 83 M56 60 L56 83 M66 60 L65 82 M74 58 L72 80" opacity=".5"/>
  <ellipse class="t a" cx="50" cy="54" rx="35" ry="10"/>
  <path class="t b" d="M20 54 Q20 36 32 40 Q34 24 46 32 Q52 16 58 32 Q70 26 70 40 Q82 38 80 54 Q50 64 20 54Z"/>
  <path d="M34 38 q4 -2 5 2 M50 28 q3 -3 5 2 M66 38 q4 -2 5 3" fill="none" stroke="#a8702a" stroke-width="2.4" stroke-linecap="round"/>
</symbol>

<symbol id="i-queijo" viewBox="0 0 100 100">
  <path class="t a" d="M8 52 L8 70 Q8 76 14 76 L86 76 Q92 76 92 70 L92 52Z"/>
  <path class="t b" d="M8 52 L70 24 Q76 22 80 26 L92 52Z"/>
  <ellipse class="c" cx="24" cy="64" rx="5" ry="4" opacity=".7"/><ellipse class="c" cx="52" cy="62" rx="4" ry="3" opacity=".7"/><ellipse class="c" cx="74" cy="66" rx="6" ry="4.4" opacity=".7"/>
  <ellipse class="c" cx="56" cy="40" rx="4.4" ry="2.6" transform="rotate(-24 56 40)" opacity=".7"/><ellipse class="c" cx="40" cy="46" rx="3" ry="2" transform="rotate(-24 40 46)" opacity=".7"/>
</symbol>

<symbol id="i-fatiado" viewBox="0 0 100 100">
  <ellipse class="t a" cx="38" cy="62" rx="28" ry="18" transform="rotate(-14 38 62)"/>
  <ellipse class="t b" cx="62" cy="54" rx="28" ry="18" transform="rotate(10 62 54)"/>
  <ellipse class="t a" cx="46" cy="42" rx="26" ry="16" transform="rotate(-6 46 42)"/>
  <path class="t" fill="none" d="M26 40 Q40 34 60 40 M48 56 Q62 50 78 56 M22 64 Q36 58 52 64" opacity=".55"/>
</symbol>

<symbol id="i-frasco" viewBox="0 0 100 100">
  <rect class="t c" x="28" y="14" width="44" height="14" rx="4"/>
  <path class="t" fill="none" d="M36 16 V26 M44 16 V26 M52 16 V26 M60 16 V26" opacity=".4"/>
  <path class="t a" d="M26 30 Q20 34 20 44 L20 76 Q20 86 30 86 L70 86 Q80 86 80 76 L80 44 Q80 34 74 30Z"/>
  <path class="b" d="M20 70 L80 70 L80 76 Q80 86 70 86 L30 86 Q20 86 20 76Z" opacity=".55"/>
  <rect x="28" y="46" width="44" height="26" rx="3" fill="#f7ecd3" stroke="#4a2a14" stroke-width="2"/>
  <path d="M33 56 q4 -5 8 0 t8 0 t8 0 M35 64 q3 -3 6 0 t6 0" stroke="#4a2a14" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round" d="M25 40 Q23 50 24 62"/>
</symbol>

<symbol id="i-copo" viewBox="0 0 100 100">
  <path style="fill:none;stroke:var(--c)" stroke-width="5" stroke-linecap="round" d="M62 8 L54 56"/>
  <path ${T} d="M24 20 L76 20 L69 86 Q68 90 64 90 L36 90 Q32 90 31 86Z" fill="#fff" fill-opacity=".55"/>
  <path class="t a" d="M27 36 L73 36 L68 86 Q67 88 64 88 L36 88 Q33 88 32 86Z"/>
  <ellipse class="b" cx="50" cy="36" rx="23" ry="4.5"/>
  <rect class="b" x="38" y="52" width="11" height="11" rx="2.5" transform="rotate(12 43 57)" opacity=".7"/>
  <rect class="b" x="52" y="62" width="10" height="10" rx="2.5" transform="rotate(-14 57 67)" opacity=".7"/>
  <path fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round" d="M32 26 L36 76"/>
</symbol>

<symbol id="i-caneca" viewBox="0 0 100 100">
  <path class="t" fill="none" stroke-width="7" d="M72 42 Q92 42 92 58 Q92 74 70 74"/>
  <path style="fill:none;stroke:var(--b)" stroke-width="2.4" d="M72 42 Q92 42 92 58 Q92 74 70 74"/>
  <path class="t b" d="M22 34 L22 70 Q22 86 38 86 L58 86 Q74 86 74 70 L74 34Z"/>
  <path class="c" d="M22 52 H74 V60 H22Z" opacity=".85"/>
  <ellipse class="t a" cx="48" cy="34" rx="26" ry="7"/>
  <path fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round" d="M29 40 L29 70"/>
  <path class="t" fill="none" d="M38 22 q-5 -6 0 -12 M50 22 q-5 -6 0 -12 M62 22 q-5 -6 0 -12" opacity=".45"/>
</symbol>

<symbol id="i-vela" viewBox="0 0 100 100">
  <path class="flama" d="M50 8 C60 22 62 32 50 40 C38 32 40 22 50 8Z" fill="#f6a623" stroke="#4a2a14" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M50 20 C55 28 55 33 50 37 C45 33 45 28 50 20Z" fill="#ffe27a"/>
  <rect ${T} x="38" y="40" width="24" height="46" rx="4" fill="#f4e3bd"/>
  <path d="M38 52 L62 46 M38 62 L62 56 M38 72 L62 66 M38 82 L62 76" style="stroke:var(--b,#c8553d)" stroke-width="5" opacity=".8"/>
  <path d="M50 40 V36" stroke="#4a2a14" stroke-width="2.4" stroke-linecap="round"/>
</symbol>

<symbol id="i-flores" viewBox="0 0 100 100">
  <path class="t" fill="none" d="M38 60 Q34 40 30 28 M50 60 Q50 38 52 20 M62 60 Q68 42 74 32"/>
  <g stroke="#4a2a14" stroke-width="2" stroke-linejoin="round">
    <g transform="translate(30 26)"><circle r="4" cy="-8" fill="#f2a0b4"/><circle r="4" cx="8" fill="#f2a0b4"/><circle r="4" cy="8" fill="#f2a0b4"/><circle r="4" cx="-8" fill="#f2a0b4"/><circle r="4" fill="#f7d36a"/></g>
    <g transform="translate(52 18)"><circle r="4.4" cy="-9" fill="#fff"/><circle r="4.4" cx="9" fill="#fff"/><circle r="4.4" cy="9" fill="#fff"/><circle r="4.4" cx="-9" fill="#fff"/><circle r="4" fill="#f7d36a"/></g>
    <g transform="translate(75 31)"><circle r="4" cy="-8" fill="#b9a2e8"/><circle r="4" cx="8" fill="#b9a2e8"/><circle r="4" cy="8" fill="#b9a2e8"/><circle r="4" cx="-8" fill="#b9a2e8"/><circle r="3.4" fill="#f7d36a"/></g>
  </g>
  <path ${T} d="M30 58 L34 84 Q35 88 40 88 L60 88 Q65 88 66 84 L70 58Z" fill="#fff" fill-opacity=".7"/>
  <path d="M33 70 H67" stroke="#c8553d" stroke-width="3" opacity=".7"/>
</symbol>

<symbol id="i-guardanapo" viewBox="0 0 100 100">
  <path ${T} d="M14 30 L70 22 L86 66 L30 80Z" fill="url(#xadrez)"/>
  <path d="M14 30 L70 22 L86 66 L30 80Z" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="5" stroke-dasharray="2 5"/>
  <g transform="translate(50 50) rotate(-8)"><circle r="3" cy="-6" fill="#f2a0b4" stroke="#4a2a14" stroke-width="1.4"/><circle r="3" cx="6" fill="#f2a0b4" stroke="#4a2a14" stroke-width="1.4"/><circle r="3" cy="6" fill="#f2a0b4" stroke="#4a2a14" stroke-width="1.4"/><circle r="3" cx="-6" fill="#f2a0b4" stroke="#4a2a14" stroke-width="1.4"/><circle r="2.6" fill="#f7d36a" stroke="#4a2a14" stroke-width="1.2"/></g>
</symbol>

<symbol id="i-trigo" viewBox="0 0 40 140">
  <path d="M20 138 C20 100 20 60 20 22" fill="none" stroke="#7a5a22" stroke-width="2.6" stroke-linecap="round"/>
  <g fill="#e2b04a" stroke="#4a2a14" stroke-width="1.6" stroke-linejoin="round">
    <ellipse cx="14" cy="30" rx="5" ry="9" transform="rotate(-24 14 30)"/><ellipse cx="26" cy="30" rx="5" ry="9" transform="rotate(24 26 30)"/>
    <ellipse cx="14" cy="46" rx="5" ry="9" transform="rotate(-24 14 46)"/><ellipse cx="26" cy="46" rx="5" ry="9" transform="rotate(24 26 46)"/>
    <ellipse cx="14" cy="62" rx="5" ry="9" transform="rotate(-24 14 62)"/><ellipse cx="26" cy="62" rx="5" ry="9" transform="rotate(24 26 62)"/>
    <ellipse cx="14" cy="78" rx="4.6" ry="8" transform="rotate(-24 14 78)"/><ellipse cx="26" cy="78" rx="4.6" ry="8" transform="rotate(24 26 78)"/>
    <ellipse cx="20" cy="16" rx="4.6" ry="9"/>
  </g>
  <path d="M20 8 V0 M14 22 L8 12 M26 22 L32 12" stroke="#7a5a22" stroke-width="1.4" stroke-linecap="round" fill="none"/>
</symbol>
</svg>`;

export function injetarSprites() {
  if (document.getElementById("rabisco")) return;
  const d = document.createElement("div");
  d.innerHTML = SPRITES;
  document.body.prepend(d.firstElementChild);
}

/** Desenho de um item (usa as cores definidas em dados.js). */
export function sprite(icone, cores, classe = "") {
  const [a, b, c] = cores ?? ["#d9923f", "#f1cf8a", "#a8621f"];
  return `<svg class="sp ${classe}" viewBox="0 0 100 100" style="--a:${a};--b:${b};--c:${c}" aria-hidden="true" focusable="false"><use href="#i-${icone}"/></svg>`;
}

// --- cesta e caixa ------------------------------------------------------------

function pseudo(i) {
  // número fixo entre -1 e 1 por posição: o arranjo é sempre igual para o mesmo kit
  const x = Math.sin(i * 12.9898 + 4.1414) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

/** Posições dos itens dentro da cesta, de trás para frente. */
export function organizar(total) {
  const linhas = total <= 4 ? 1 : total <= 9 ? 2 : total <= 16 ? 3 : 4;
  const tam = total <= 3 ? 84 : total <= 6 ? 72 : total <= 10 ? 62 : total <= 16 ? 54 : 46;
  const porLinha = Math.ceil(total / linhas);
  const largura = 168;
  const pos = [];
  for (let i = 0; i < total; i++) {
    const linha = Math.floor(i / porLinha);
    const col = i % porLinha;
    const qtdNaLinha = Math.min(porLinha, total - linha * porLinha);
    const passo = qtdNaLinha > 1 ? Math.min(tam * 0.82, largura / (qtdNaLinha - 1)) : 0;
    const x0 = 160 - (passo * (qtdNaLinha - 1)) / 2;
    pos.push({
      x: x0 + col * passo + pseudo(i) * 4,
      y: 128 - (linhas - 1 - linha) * (tam * 0.42) + pseudo(i + 50) * 3,
      tam,
      rot: pseudo(i + 9) * 9,
    });
  }
  return pos;
}

/**
 * Cesta (ou caixa) com os itens do kit. `itens` é a lista de unidades [{chave, icone, cores}],
 * `novas` são as chaves que acabaram de entrar (recebem a animação de pouso).
 */
export function embalagemSVG(tipo, itens, novas = new Set()) {
  const pos = organizar(itens.length);
  const unidades = itens
    .map((it, i) => {
      const p = pos[i];
      const nova = novas.has(it.chave) ? " pousa" : "";
      return `<g transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rot.toFixed(1)})"><g class="un${nova}">${sprite(it.icone, it.cores, "")
        .replace("<svg ", `<svg x="${-p.tam / 2}" y="${-p.tam * 0.8}" width="${p.tam}" height="${p.tam}" `)}</g></g>`;
    })
    .join("");

  if (tipo === "caixa") {
    return `<svg class="embalagem" viewBox="0 0 320 220" role="img" aria-label="Caixa kraft com ${itens.length} itens">
  <ellipse cx="160" cy="206" rx="120" ry="9" fill="#4a2a14" opacity=".14"/>
  <path d="M48 124 L74 88 L246 88 L272 124Z" fill="#8a5f30" stroke="#4a2a14" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M74 88 L48 62 M246 88 L272 62" stroke="#4a2a14" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M48 62 L74 88 L90 88 L58 56Z" fill="#b98a52" stroke="#4a2a14" stroke-width="2" stroke-linejoin="round"/>
  <path d="M272 62 L246 88 L230 88 L262 56Z" fill="#b98a52" stroke="#4a2a14" stroke-width="2" stroke-linejoin="round"/>
  ${unidades}
  <path d="M44 120 H276 L270 204 Q270 208 266 208 L54 208 Q50 208 50 204Z" fill="#c89a62" stroke="#4a2a14" stroke-width="2.8" stroke-linejoin="round"/>
  <path d="M44 120 H276 L275 134 H45Z" fill="#b98a52" stroke="#4a2a14" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M60 150 H260 M60 170 H260" stroke="#4a2a14" stroke-opacity=".12" stroke-width="1.5"/>
  <path d="M130 120 V208 M190 120 V208" stroke="#e8dcc0" stroke-width="3" stroke-dasharray="1 5" stroke-linecap="round"/>
  <g transform="rotate(-6 160 168)"><rect x="112" y="146" width="96" height="48" rx="5" fill="#f6ecd3" stroke="#4a2a14" stroke-width="2.2"/>
    <circle cx="124" cy="158" r="3.2" fill="#c8553d" stroke="#4a2a14" stroke-width="1.2"/>
    <text x="160" y="168" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="800" font-size="15" fill="#4a2a14">CROSTA &amp; PROSA</text>
    <text x="160" y="184" text-anchor="middle" font-family="Caveat, cursive" font-size="16" fill="#c8553d">feito de madrugada</text></g>
</svg>`;
  }
  return `<svg class="embalagem" viewBox="0 0 320 220" role="img" aria-label="Cesta de vime com ${itens.length} itens">${cestaPartes(unidades)}</svg>`;
}

/** Cesta de vime desenhada em 320x220; `conteudo` entra entre o fundo e a frente da cesta. */
export function cestaPartes(conteudo) {
  return `
  <ellipse cx="160" cy="208" rx="112" ry="9" fill="#4a2a14" opacity=".14"/>
  <path d="M62 112 C58 6 262 6 258 112" fill="none" stroke="#4a2a14" stroke-width="13" stroke-linecap="round"/>
  <path d="M62 112 C58 6 262 6 258 112" fill="none" stroke="url(#vime)" stroke-width="9" stroke-linecap="round"/>
  <ellipse cx="160" cy="116" rx="116" ry="22" fill="#6b4018" stroke="#4a2a14" stroke-width="2.6"/>
  ${conteudo}
  <path d="M44 120 Q160 160 276 120 L254 206 Q160 232 66 206Z" fill="url(#vime)" stroke="#4a2a14" stroke-width="2.8" stroke-linejoin="round"/>
  <path d="M42 112 Q160 152 278 112 L278 128 Q160 170 42 128Z" fill="#b87a36" stroke="#4a2a14" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M60 123 Q160 160 260 123 M60 128 Q160 165 260 128" fill="none" stroke="#8a5a22" stroke-width="1.6" stroke-dasharray="6 4"/>
  <path d="M232 128 Q258 132 284 124 L296 164 Q262 176 236 164Z" fill="url(#xadrez)" stroke="#4a2a14" stroke-width="2.2" stroke-linejoin="round"/>`;
}

const un = (icone, cores, x, y, tam, rot = 0) =>
  `<g transform="translate(${x} ${y}) rotate(${rot})" style="--a:${cores[0]};--b:${cores[1]};--c:${cores[2]}"><svg class="sp" x="${-tam / 2}" y="${-tam / 2}" width="${tam}" height="${tam}" viewBox="0 0 100 100"><use href="#i-${icone}"/></svg></g>`;

/** Cena do topo da página: mesa, cesta, café, croissants, trigo e varal de bandeirinhas. */
export function heroSVG() {
  const letras = "CAFEZINHO".split("");
  const cores = ["#e2b878", "#fbf1dc", "#e8a595"];
  const bandeiras = letras
    .map((l, i) => {
      const t = (i + 1) / 10;
      const x = 20 + 600 * t;
      const y = 40 + 140 * t - 140 * t * t;
      const ang = Math.atan2(140 - 280 * t, 600) * (180 / Math.PI);
      return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})"><g class="bandeira" style="animation-delay:${(i * 0.18).toFixed(2)}s">
        <path d="M-21 0 H21 L0 52Z" fill="${cores[i % 3]}" stroke="#4a2a14" stroke-width="2.4" stroke-linejoin="round"/>
        <text x="0" y="28" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="800" font-size="21" fill="#4a2a14">${l}</text></g></g>`;
    })
    .join("");
  const migalhas = [[300, 480], [372, 486], [440, 478], [250, 492], [520, 470], [190, 488]]
    .map(([x, y], i) => `<ellipse class="migalha" cx="${x}" cy="${y - 70}" rx="${2 + (i % 3)}" ry="${1.6 + (i % 2)}" fill="#c98a43" stroke="#4a2a14" stroke-width="1" style="animation-delay:${(i * 0.7).toFixed(1)}s"/>`)
    .join("");
  const conteudo = [
    un("baguete", ["#d58a38", "#efc67f", "#9b5a1c"], 112, 62, 150, -24),
    un("baguete", ["#d58a38", "#efc67f", "#9b5a1c"], 214, 40, 150, 6),
    un("baguete", ["#d58a38", "#efc67f", "#9b5a1c"], 262, 66, 142, 34),
    un("boule", ["#b8692b", "#e8c280", "#7a3f17"], 160, 98, 92, -4),
    un("brioche", ["#e0a24a", "#f6d98f", "#a8641f"], 232, 100, 74, 8),
  ].join("");
  return `<svg class="hero-svg" viewBox="0 0 640 560" role="img" aria-label="Cesta de vime com baguetes e pães, croissants num prato, xícara de café fumegando, pote de geleia e espigas de trigo sobre uma mesa de madeira com toalha xadrez">
  <circle cx="330" cy="280" r="262" fill="url(#forno)"/>
  <circle cx="330" cy="280" r="222" fill="none" stroke="#c8553d" stroke-width="2.2" stroke-dasharray="2 10" stroke-linecap="round" opacity=".55"/>
  <g filter="url(#rabisco)">
    <path d="M20 40 Q320 110 620 40" fill="none" stroke="#4a2a14" stroke-width="2.4" stroke-linecap="round"/>
    ${bandeiras}
    <g class="trigo"><use href="#i-trigo" x="6" y="250" width="54" height="190"/></g>
    <g class="trigo t2"><use href="#i-trigo" x="48" y="214" width="50" height="200" style="transform:scaleX(-1);transform-origin:73px 0"/></g>
    <g class="trigo t3"><use href="#i-trigo" x="88" y="270" width="46" height="170"/></g>
    <path d="M0 436 H640 V560 H0Z" fill="url(#tabua)" stroke="#4a2a14" stroke-width="2.6"/>
    <path d="M0 436 H640 V450 H0Z" fill="#9a5e24" stroke="#4a2a14" stroke-width="2.4"/>
    <path d="M56 434 H588 L632 530 H12Z" fill="url(#xadrez)" stroke="#4a2a14" stroke-width="2.6" stroke-linejoin="round"/>
    <g transform="translate(112 154) scale(1.25)">${cestaPartes(conteudo)}</g>
    <g transform="translate(20 352)">
      ${un("frasco", ["#b8324a", "#8a1f36", "#e8c06a"], 56, 52, 104)}
    </g>
    <ellipse cx="340" cy="482" rx="82" ry="20" fill="#fffaf0" stroke="#4a2a14" stroke-width="2.6"/>
    <ellipse cx="340" cy="480" rx="60" ry="12" fill="none" stroke="#4a2a14" stroke-opacity=".25" stroke-width="1.6"/>
    ${un("croissant", ["#dc9a40", "#f3cf86", "#9c5a1b"], 304, 452, 100, -6)}
    ${un("croissant", ["#d48f38", "#f3cf86", "#9c5a1b"], 378, 456, 96, 8)}
    <ellipse cx="548" cy="468" rx="62" ry="16" fill="#fffaf0" stroke="#4a2a14" stroke-width="2.6"/>
    ${un("caneca", ["#4a2a1a", "#f6efe0", "#c8553d"], 548, 430, 104)}
    <g class="vapor" fill="none" stroke="#4a2a14" stroke-width="2.6" stroke-linecap="round" opacity=".5">
      <path d="M528 382 q-12 -16 0 -30 q12 -14 0 -30"/><path d="M552 380 q-12 -16 0 -30 q12 -14 0 -30" style="animation-delay:.5s"/><path d="M574 382 q-12 -16 0 -30 q12 -14 0 -30" style="animation-delay:1s"/>
    </g>
    ${migalhas}
  </g>
</svg>`;
}
