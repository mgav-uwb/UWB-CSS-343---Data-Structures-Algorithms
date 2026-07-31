// CSS 343 unified library — core/palette.js
// One colour per SYMBOL, shared by every view that has to say "this bit came
// from that character". The codec demo colours the source text, the bits it
// produced, the decoded text, and the leaf that emits it — all from here, so a
// run of same-coloured bits IS one character's codeword, readable at a glance.
//
// Ten well-separated hues, then darker/lighter tiers, so a 26-symbol alphabet
// still gets distinguishable colours without anyone hand-picking them.

const HUES = [262, 150, 28, 352, 210, 316, 44, 186, 8, 96];
const TIER_L = [42, 29, 55];

/** Ink colour for symbol index i (0-based, usually most-frequent-first).
 *  A negative index means "no symbol owns this yet" — a bit nobody has decoded,
 *  or a character the code was not built for — and reads as dim grey. */
export function symbolColor(i) {
  if (!Number.isFinite(i) || i < 0) return "#9aa3b5";
  const h = HUES[i % HUES.length];
  const l = TIER_L[Math.floor(i / HUES.length) % TIER_L.length];
  return `hsl(${h} 68% ${l}%)`;
}

/** The same hue, washed out — a background a dark ink still reads on. */
export function symbolWash(i) {
  if (!Number.isFinite(i) || i < 0) return "#f2f4f8";
  return `hsl(${HUES[i % HUES.length]} 80% 94%)`;
}
