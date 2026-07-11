// CSS 343 unified library — demos/heap.js
// Full-demo spec for the binary heap: a max-oriented priority queue AND
// heapsort, both driven by the same array-backed MaxHeap. Array indices ARE
// tree positions, so the shared ArrayRenderer draws it directly.

import { ArrayRenderer, MaxHeap } from "../index.js";

export const heapDemo = {
  id: "heap",
  title: "Binary Heap (max-heap / PQ)",
  blurb: "An array-backed complete binary tree: insert swims up, delete-max sinks down, both Θ(log n) — plus heapsort, which reuses sink to sort in place.",
  make: () => new MaxHeap(),
  initial: "1..10:ZIG",  // a deterministic scramble: 1,10,2,9,…
  renderer: (c) => new ArrayRenderer(c, { mode: "cells" }),
  costs: ["compare", "swap", "read", "write"],
  ops: [
    { name: "Insert", arg: "number", run: (s, v) => s.insert(v) },
    { name: "Delete max", run: (s) => s.delMax() },
    { name: "Heapsort", run: (s) => s.heapsort() },
  ],
};
