// CSS 343 unified library — demos/string-search.js
// Full-demo spec for substring search: brute force (worst case Θ(nm)) vs. KMP
// (worst case Θ(n+m)) on the SAME text/pattern pair, so the comparison counts
// are directly comparable. NAMED input boxes hold the text and pattern
// (ported from the S16 lecture demo) — try the adversarial pair
// AAAAAAAAAAAB / AAAB to see brute force pay and KMP refuse to back up.

import { StringSearch, ArrayRenderer } from "../index.js";

const DTEXT = "ABABABCABABABCAB", DPAT = "ABABC";
const clean = (v, dflt) => {
  const s = String(v ?? "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 24);
  return s || dflt;
};

export const stringSearchDemo = {
  id: "string-search",
  title: "Substring Search (brute force vs. KMP)",
  blurb: "Brute force retries the whole pattern at every shift, sliding by one on a mismatch. KMP precomputes a failure table so the text pointer i never backs up — same first match, fewer comparisons on repetitive text. Run both on the same pair and compare the compare counters (try text AAAAAAAAAAAB, pattern AAAB).",
  make: () => { const s = new StringSearch(); s.build([DTEXT, DPAT]); return s; },
  initial: "",
  noBuild: true,
  stateMsg: (ss) => ss.inorder(),
  renderer: (c) => new ArrayRenderer(c, { mode: "cells" }),
  costs: ["compare"],
  inputs: [
    { key: "text", label: "text", value: DTEXT, width: 170 },
    { key: "pat", label: "pattern", value: DPAT, width: 90 },
  ],
  ops: [
    { name: "Brute force", run: (s, _v, vals) => { s.build([clean(vals.text, DTEXT), clean(vals.pat, DPAT)]); return s.bruteForce(); } },
    { name: "KMP", run: (s, _v, vals) => { s.build([clean(vals.text, DTEXT), clean(vals.pat, DPAT)]); return s.kmp(); } },
  ],
};
