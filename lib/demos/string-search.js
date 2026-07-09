// CSS 343 unified library — demos/string-search.js
// Full-demo spec for substring search: brute force (worst case Θ(nm)) vs. KMP
// (worst case Θ(n+m)) on the SAME text/pattern pair, so the comparison counts
// are directly comparable. The generic FullDemo "initial" box only parses
// NUMBERS (like huffman/dp), so it's left blank — Build always (re)builds the
// default sample text "ABABABCABABABCAB" / pattern "ABABC".

import { StringSearch, ArrayRenderer } from "../index.js";

export const stringSearchDemo = {
  id: "string-search",
  title: "Substring Search (brute force vs. KMP)",
  blurb: "Brute force retries the whole pattern at every shift, sliding by one on a mismatch. KMP precomputes a failure table so the text pointer i never backs up — same first match, fewer comparisons on repetitive text.",
  make: () => new StringSearch(),
  initial: "",
  stateMsg: (ss) => ss.inorder(),
  renderer: (c) => new ArrayRenderer(c, { mode: "cells" }),
  costs: ["compare"],
  ops: [
    { name: "Brute force", run: (s) => s.bruteForce() },
    { name: "KMP", run: (s) => s.kmp() },
  ],
};
