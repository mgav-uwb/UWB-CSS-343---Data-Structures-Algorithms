// CSS 343 unified library — demos/huffman.js
// Full-demo spec for Huffman coding: repeatedly merge the two smallest-frequency
// trees in a forest until one remains. Node labels: key = character (leaves) or
// combined frequency (internal nodes); the "size" sub-label under every node is
// also the frequency. Ported from the S12 lecture demos: the initial box holds
// EDITABLE input in one of four forms — TEXT(real text), SYM-FRQ(a:20, b:17),
// SYM-RAND(a..h), or a bare number list (frequencies for a, b, c, …) — and an
// Encode op that walks root-to-leaf per character. Every build reports the size
// three ways: ASCII (8 bits/char), a fixed-length code over the same alphabet,
// and Huffman, with the ratio between them.

import { ArrayRenderer, CodecRenderer, Huffman, TreeRenderer } from "../index.js";

const CLRS = "5, 9, 12, 13, 16, 45"; // a:5 b:9 c:12 d:13 e:16 f:45 → weighted total 224

export const huffmanDemo = {
  id: "huffman",
  title: "Huffman Coding",
  blurb: "A greedy, bottom-up optimal prefix code: repeatedly merge the two least-frequent trees in a forest until one remains. More frequent symbols end up shallower → shorter codes. Say WHAT to compress in any of four ways: TEXT(the white fox …) counts real characters (lower-cased; a space is a symbol and shows as ␣, usually the most frequent one); SYM-FRQ(a:20, b:17, c:11) spells out symbol/frequency pairs in the same notation the slides use; SYM-RAND(a..h) invents skewed frequencies for a symbol range; or a bare number list is frequencies for a, b, c, … Each build prints the size three ways — ASCII at 8 bits a character, a fixed-length code over the same alphabet, and Huffman — plus the ratio. Try equal frequencies (8,8,8,8) for a balanced tree that saves nothing. Encode walks the trie root-to-leaf per character and decodes the bits back.",
  make: () => new Huffman(),
  valPlaceholder: "text to encode", valWidth: 105,
  initial: CLRS,
  initialPlaceholder: "TEXT(…) · SYM-FRQ(a:20, b:17) · SYM-RAND(a..h) · 5, 9, 12",
  initialWidth: 260,
  presets: [
    { name: "CLRS classic (5,9,12,13,16,45)", initial: CLRS },
    { name: "real text — spaces and all", initial: "TEXT(the white fox jumped over the white fence by the white house)" },
    { name: "written-out pairs", initial: "SYM-FRQ(a:20, b:17, c:11, d:6, e:3)" },
    { name: "random skewed frequencies", initial: "SYM-RAND(a..h)" },
    { name: "equal frequencies (8,8,8,8) — no win", initial: "8, 8, 8, 8" },
    { name: "doubling (1,2,4,8,16,32) — a chain", initial: "1, 2, 4, 8, 16, 32" },
  ],
  // Build = ONE animated merge-by-merge trace. `raw` is the box text verbatim,
  // so TEXT(...)/SYM-FRQ(...)/SYM-RAND(...) survive (parseSequence keeps digits only).
  buildAll: (s, keys, vals, method, raw) => s.buildInput(raw, keys),
  proto: "huffman",
  stateMsg: (h) => h.statsLine() || `${h.inorder()} — type TEXT(…), SYM-FRQ(a:20, b:17), SYM-RAND(a..h), or plain frequencies`,
  // shown BOTH ways at once, like the heap: the ordered symbol:frequency pool
  // on top (smallest first, so the next merge is always the leftmost two) and
  // the tree it is being folded into below
  renderer: [
    (c) => new ArrayRenderer(c, { mode: "cells", pointers: false }),
    (c) => new TreeRenderer(c, { labels: "sym" }),
  ],
  height: [72, 250],
  costs: ["compare", "link", "alloc", "write"],
  ops: [
    { name: "Encode", arg: "string", desc: "text → bits: walk root-to-leaf per symbol",
      run: (s, v) => s.codesWalk(v) },
    { name: "Decode", arg: "string", desc: "bits → text: walk the bits from the root, emit at each leaf (empty box replays the last Encode)",
      run: (s, v) => s.decodeWalk(v) },
  ],
};

/** The same code, USED: three columns — text · encoded bits · decoded text —
 *  where the middle column is literally the handoff, so Decode consumes what
 *  Encode produced instead of the student retyping a bit string. Whichever
 *  column is the current output alternates between the tree walk that is
 *  producing it and the result of that walk. */
export const huffmanCodecDemo = {
  id: "huffman-codec",
  title: "Huffman: encode / decode",
  blurb: "The round trip, in three columns: the text on the left, its encoded bits in the middle, the decoded text on the right. ENCODE reads the left column and fills the middle; DECODE reads the middle and fills the right — so the bits Decode consumes are exactly the bits Encode produced, on screen. While a symbol is being coded the output column shows the root-to-leaf WALK that produces it, then flips back to show what that walk appended; the input column highlights the character (encoding) or the bit (decoding) currently being consumed. The strip underneath keeps the running score: characters, ASCII at 8 bits each, a fixed-length code over the same alphabet, and Huffman. Build the code first — the box takes the same TEXT(…)/SYM-FRQ(…)/SYM-RAND(…)/frequency-list forms as the build demo.",
  make: () => new Huffman(),
  initial: CLRS,
  initialPlaceholder: "TEXT(…) · SYM-FRQ(a:20, b:17) · SYM-RAND(a..h) · 5, 9, 12",
  initialWidth: 240,
  valInitial: "face", valPlaceholder: "text (Encode) / bits (Decode)", valWidth: 130,
  presets: [
    { name: "CLRS classic — encode \"face\"", initial: CLRS },
    { name: "from real text", initial: "TEXT(the white fox jumped over the white fence by the white house)" },
    { name: "written-out pairs", initial: "SYM-FRQ(a:20, b:17, c:11, d:6, e:3)" },
  ],
  buildAll: (s, keys, vals, method, raw) => s.buildCodec(raw, keys),
  renderer: (c) => new CodecRenderer(c),
  height: 250,
  costs: ["compare", "write"],
  stateMsg: (h) => h.statsLine() || "build a code, then Encode",
  ops: [
    { name: "Encode", arg: "string", desc: "text → bits (left column to middle)",
      run: (s, v) => s.encodeCodec(v || "face") },
    { name: "Decode", arg: "string", desc: "bits → text (middle column to right); leave empty to decode what Encode just produced",
      run: (s, v) => s.decodeCodec(v) },
  ],
};
