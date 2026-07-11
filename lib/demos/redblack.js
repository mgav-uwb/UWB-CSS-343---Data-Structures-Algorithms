// CSS 343 unified library — demos/redblack.js
// The full-demo SPEC for the left-leaning red-black BST: all operations in one
// sandbox. Red links (from insert's fix-ups) render in red via the shared
// TreeRenderer.

import { RedBlack, TreeRenderer } from "../index.js";

export const redblackDemo = {
  id: "redblack",
  title: "Red-Black BST (left-leaning)",
  blurb: "A BST plus one color bit per link — red glues two nodes into a 2-3-tree node. Rotations and color flips keep it perfectly black-balanced, guaranteeing Θ(log n) height.",
  make: () => new RedBlack(),
  initial: "10..90:10",  // ascending — rotations + color flips keep it balanced
  renderer: (c) => new TreeRenderer(c, { labels: "none" }),
  costs: ["compare", "rotation", "link"],
  ops: [
    { name: "Insert", arg: "number", run: (s, v) => s.insert(v) },
    { name: "Search", arg: "number", ghost: true, run: (s, v) => s.search(v) },
  ],
};
