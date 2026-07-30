// CSS 343 unified library — demos/huffman.js
// Full-demo spec for Huffman coding: repeatedly merge the two smallest-frequency
// trees in a forest until one remains. Node labels: key = character (leaves) or
// combined frequency (internal nodes); the "size" sub-label under every node is
// also the frequency. Ported from the S12 lecture demos: the initial box holds
// EDITABLE input in one of four forms — TEXT(real text), SYM-FRQ(A-20,B-11),
// SYM-RAND(A..H), or a bare number list (frequencies for a, b, c, …) — and an
// Encode op that walks root-to-leaf per character. Every build reports the size
// three ways: ASCII (8 bits/char), a fixed-length code over the same alphabet,
// and Huffman, with the ratio between them.

import { Huffman, TreeRenderer } from "../index.js";

const CLRS = "5, 9, 12, 13, 16, 45"; // a:5 b:9 c:12 d:13 e:16 f:45 → weighted total 224

export const huffmanDemo = {
  id: "huffman",
  title: "Huffman Coding",
  blurb: "A greedy, bottom-up optimal prefix code: repeatedly merge the two least-frequent trees in a forest until one remains. More frequent symbols end up shallower → shorter codes. Say WHAT to compress in any of four ways: TEXT(the white fox …) counts real characters (lower-cased; a space is a symbol and shows as ␣, usually the most frequent one); SYM-FRQ(A-20,B-11,C-7) spells out symbol/frequency pairs; SYM-RAND(A..H) invents skewed frequencies for a symbol range; or a bare number list is frequencies for a, b, c, … Each build prints the size three ways — ASCII at 8 bits a character, a fixed-length code over the same alphabet, and Huffman — plus the ratio. Try equal frequencies (8,8,8,8) for a balanced tree that saves nothing. Encode walks the trie root-to-leaf per character and decodes the bits back.",
  make: () => new Huffman(),
  valPlaceholder: "text to encode", valWidth: 105,
  initial: CLRS,
  initialPlaceholder: "TEXT(…) · SYM-FRQ(A-20,…) · SYM-RAND(A..H) · 5, 9, 12",
  initialWidth: 260,
  presets: [
    { name: "CLRS classic (5,9,12,13,16,45)", initial: CLRS },
    { name: "real text — spaces and all", initial: "TEXT(the white fox jumped over the white fence by the white house)" },
    { name: "written-out pairs", initial: "SYM-FRQ(A-20,B-11,C-7,D-3,E-2)" },
    { name: "random skewed frequencies", initial: "SYM-RAND(A..H)" },
    { name: "equal frequencies (8,8,8,8) — no win", initial: "8, 8, 8, 8" },
    { name: "doubling (1,2,4,8,16,32) — a chain", initial: "1, 2, 4, 8, 16, 32" },
  ],
  // Build = ONE animated merge-by-merge trace. `raw` is the box text verbatim,
  // so TEXT(...)/SYM-FRQ(...)/SYM-RAND(...) survive (parseSequence keeps digits only).
  buildAll: (s, keys, vals, method, raw) => s.buildInput(raw, keys),
  proto: "huffman",
  stateMsg: (h) => h.statsLine() || `${h.inorder()} — type TEXT(…), SYM-FRQ(…), SYM-RAND(A..H), or plain frequencies`,
  renderer: (c) => new TreeRenderer(c, { labels: "freq" }),
  costs: ["compare", "link", "alloc", "write"],
  ops: [
    { name: "Encode", arg: "string", run: (s, v) => s.codesWalk(v) },
  ],
};
