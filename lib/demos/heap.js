// CSS 343 unified library — demos/heap.js
// Full-demo spec for the binary heap: a max-oriented priority queue AND
// heapsort, both driven by the same array-backed MaxHeap. Array indices ARE
// tree positions, so the shared ArrayRenderer draws it directly.

import { ArrayRenderer, HeapTreeRenderer, MaxHeap } from "../index.js";

export const heapDemo = {
  id: "heap",
  title: "Binary Heap (max-heap / PQ)",
  blurb: "An array-backed complete binary tree, shown BOTH ways at once — the flat array and the tree it encodes (parent k/2, children 2k and 2k+1), so the heap property is visible: every parent ≥ its children. Insert swims up, delete-max sinks down, both Θ(log n) — plus heapsort, which reuses sink to sort in place.",
  make: () => new MaxHeap(),
  initial: "1..10:ZIG",  // a deterministic scramble: 1,10,2,9,…
  buildStep: (s, k) => s.insert(k),   // Build = repeated insert, animated
  proto: "heap",
  renderer: [
    (c) => new ArrayRenderer(c, { mode: "cells" }),
    (c) => new HeapTreeRenderer(c),
  ],
  height: [75, 210],
  costs: ["compare", "swap", "read", "write"],
  ops: [
    { name: "Insert", arg: "number", run: (s, v) => s.insert(v) },
    { name: "Delete max", run: (s) => s.delMax() },
    { name: "Heapify (bottom-up, Θ(n))", ghost: true, run: (s) => s.heapify() },
    { name: "Heapsort", run: (s) => s.heapsort() },
  ],
};
