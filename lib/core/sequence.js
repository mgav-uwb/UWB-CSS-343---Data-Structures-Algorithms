// CSS 343 unified library — core/sequence.js
// A "build sequence" mini-language for FullDemo's editable initial box. Either
// a plain number list ("10,20,30", as before) OR a compact range spec:
//
//   START..STOP[:STEP][:ORDER]     ORDER in {ASC, DESC, RAND, ZIG, ZAG} (default ASC)
//
//   "1..50"           1,2,3,…,50
//   "1..50:5"         1,6,11,…,46
//   "1..50:ZIG"       step defaults to 1; ZIG order
//   "1..50:5:RAND"    step 5, shuffled
//
// ZIG interleaves from both ENDS inward:    1..10 → 1,10,2,9,3,8,4,7,5,6
// ZAG interleaves from the MIDDLE outward:  1..10 → 5,6,4,7,3,8,2,9,1,10

const ORDERS = new Set(["ASC", "DESC", "RAND", "ZIG", "ZAG"]);
const RANGE_RE = /^(-?\d+)\s*\.\.\s*(-?\d+)\s*(?::\s*([^:\s]+))?\s*(?::\s*([^:\s]+))?$/;

function zig(a) {
  const out = []; let lo = 0, hi = a.length - 1;
  while (lo <= hi) { out.push(a[lo++]); if (lo <= hi) out.push(a[hi--]); }
  return out;
}

function zag(a) {
  const n = a.length, out = [];
  let lo = Math.floor((n - 1) / 2), hi = lo + 1;
  if (n % 2 === 1) { out.push(a[lo]); lo--; } // odd count: the one true middle goes first
  while (lo >= 0 || hi < n) {
    if (lo >= 0) out.push(a[lo--]);
    if (hi < n) out.push(a[hi++]);
  }
  return out;
}

function shuffle(a) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/** Parse a build-sequence string into an array of numbers (range spec or plain list). */
export function parseSequence(input) {
  const s = String(input ?? "").trim();
  const m = s.match(RANGE_RE);
  if (!m) return (s.match(/-?\d+/g) || []).map(Number);

  const start = Number(m[1]), stop = Number(m[2]);
  let step = 1, order = "ASC";
  [m[3], m[4]].forEach((tok) => {
    if (!tok) return;
    const up = tok.toUpperCase();
    if (ORDERS.has(up)) order = up;
    else { const n = Number(tok); if (Number.isFinite(n) && n > 0) step = n; }
  });

  const out = [];
  if (step > 0 && start <= stop) for (let v = start; v <= stop; v += step) out.push(v);

  switch (order) {
    case "DESC": return out.reverse();
    case "RAND": return shuffle(out);
    case "ZIG": return zig(out);
    case "ZAG": return zag(out);
    default: return out;
  }
}
