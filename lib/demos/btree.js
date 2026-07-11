// CSS 343 unified library — demos/btree.js
// Full-demo spec for the B-tree (order 5): wide split-and-promote — a node
// splits when it fills at M keys, and the high fan-out keeps the tree shallow.

import { BTree, MultiwayTreeRenderer } from "../index.js";

export const btreeDemo = {
  id: "btree",
  title: "B-tree (order 5)",
  blurb: "Wide split-and-promote: a node splits when it fills at M keys, promoting its middle key upward — high fan-out keeps the tree shallow even as it grows.",
  make: () => new BTree(5),
  initial: "5..75:5",
  renderer: (c) => new MultiwayTreeRenderer(c),
  costs: ["compare", "write", "alloc"],
  ops: [
    { name: "Insert", arg: "number", run: (s, v) => s.insert(v) },
    { name: "Search", arg: "number", ghost: true, run: (s, v) => s.search(v) },
  ],
};
