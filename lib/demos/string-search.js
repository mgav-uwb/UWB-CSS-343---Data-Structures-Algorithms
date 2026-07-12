// CSS 343 unified library — demos/string-search.js
// Substring search as a SIDE-BY-SIDE race: brute force (worst case Θ(nm)) vs
// KMP (worst case Θ(n+m)) run the SAME text/pattern pair in lockstep, one
// trace frame per tick — KMP finishes and freezes while brute force keeps
// re-trying shifts. Compare counters live in each panel's title; ⏩ 1024×
// sweeps brute force to the end. The value box takes "TEXT PATTERN" (repeat
// shorthand works: A^11B A^3B is the adversarial pair).

import { StringSearch, ArrayRenderer } from "../index.js";
import { expandRepeats } from "../core/sequence.js";

const DTEXT = "ABABABCABABABCAB", DPAT = "ABABC";

const pair = (v) => {
  const w = expandRepeats(String(v ?? "")).toUpperCase().replace(/[^A-Z ]/g, "")
    .trim().split(/\s+/).map((s) => s.slice(0, 24));
  return w.length >= 2 ? [w[0], w[1]] : [DTEXT, w[0] || DPAT];
};
const mkPanel = (title, algo) => ({
  title,
  make: () => { const s = new StringSearch(); s.build([DTEXT, DPAT]); return s; },
  renderer: (c) => new ArrayRenderer(c, { mode: "cells" }),
  op: (s, v) => { s.build(pair(v)); return s[algo](); },
  // KMP's Θ(m) aux — the failure table — rides along in its frames' snapshots
  stat: (snap, f) => `${f.counters["compare"] || 0} compares`
    + (snap && snap.lps ? ` · failure table [${snap.lps.join(",")}]` : ""),
  width: 900, height: 130,
});

export const stringSearchDemo = {
  id: "string-search",
  title: "Substring Search race (brute force vs. KMP)",
  blurb: "The SAME text/pattern pair, one comparison-frame per tick, in lockstep: brute force retries the whole pattern at every shift (sliding by one on a mismatch) while KMP's failure table means the text pointer never backs up — KMP finishes and freezes, brute force keeps paying. Type \"TEXT PATTERN\"; the adversarial pair is A^11B A^3B (36 vs 20 compares).",
  proto: "kmp",
  stacked: true,
  panels: [mkPanel("brute force", "bruteForce"), mkPanel("KMP", "kmp")],
  opArg: "string",
  opLabel: "Race both", valLabel: "text pattern", valWidth: 260,
  initialValue: `${DTEXT} ${DPAT}`, placeholder: "TEXT PATTERN or A^11B A^3B",
  speed: 300, speedControl: true, finishButton: true,
};
