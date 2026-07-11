// CSS 343 unified library — demos/huffman.js
// Full-demo spec for Huffman coding: repeatedly merge the two smallest-frequency
// trees in a forest until one remains. Node labels: key = character (leaves) or
// combined frequency (internal nodes); the "size" sub-label under every node is
// also the frequency. Ported from the S12 lecture demos: the initial box holds
// EDITABLE frequencies (numbers = frequencies for a, b, c, …; Build animates
// the merges — try equal frequencies "10, 10, 10, 10" for a balanced tree = no
// win over fixed-length), and an Encode op walks root-to-leaf per character.

import { Huffman, TreeRenderer } from "../index.js";

const CLRS = "5, 9, 12, 13, 16, 45"; // a:5 b:9 c:12 d:13 e:16 f:45 → weighted total 224

export const huffmanDemo = {
  id: "huffman",
  title: "Huffman Coding",
  blurb: "A greedy, bottom-up optimal prefix code: repeatedly merge the two least-frequent trees in a forest until one remains. More frequent symbols end up shallower → shorter codes. The numbers in the initial box are frequencies for a, b, c, … — try equal ones for a balanced (no-win) tree. Encode walks the trie root-to-leaf per character and decodes the bits back.",
  make: () => new Huffman(),
  initial: CLRS,
  buildAll: (s, keys) => s.build(keys),        // Build = ONE animated merge-by-merge trace
  stateMsg: (h) => `${h.inorder()} — the numbers in the box are frequencies for a, b, c, …`,
  renderer: (c) => new TreeRenderer(c, { labels: "size" }),
  costs: ["compare", "link", "alloc", "write"],
  ops: [
    { name: "Encode", arg: "string", run: (s, v) => s.codesWalk(v) },
  ],
};
