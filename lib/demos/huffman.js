// CSS 343 unified library — demos/huffman.js
// Full-demo spec for Huffman coding: repeatedly merge the two smallest-frequency
// trees in a forest until one remains. Node labels: key = character (leaves) or
// combined frequency (internal nodes); the "size" sub-label under every node is
// also the frequency. The "initial" box is numeric-only (shared FullDemo chrome),
// so it isn't useful for symbol/frequency pairs — Build always (re)builds the
// classic CLRS sample; that sample IS the point of the demo.

import { Huffman, TreeRenderer } from "../index.js";

export const huffmanDemo = {
  id: "huffman",
  title: "Huffman Coding",
  blurb: "A greedy, bottom-up optimal prefix code: repeatedly merge the two least-frequent trees in a forest until one remains. More frequent symbols end up shallower → shorter codes.",
  make: () => new Huffman(),
  initial: "",
  stateMsg: (h) => `${h.inorder()} — built from the CLRS sample a:5 b:9 c:12 d:13 e:16 f:45`,
  renderer: (c) => new TreeRenderer(c, { labels: "size" }),
  costs: ["compare", "link", "alloc"],
  ops: [
    { name: "Rebuild (CLRS sample)", run: (s) => s.build() },
  ],
};
