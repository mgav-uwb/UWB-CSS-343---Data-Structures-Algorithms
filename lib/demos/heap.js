// CSS 343 unified library — demos/heap.js
// Full-demo specs for the binary heap: a priority queue AND heapsort, both
// driven by the same array-backed BinaryHeap. Array indices ARE tree positions,
// so the shared ArrayRenderer draws it directly. Two specs, one engine — the
// max-heap and the min-heap differ ONLY in which way the comparison points, so
// the min version is the max version with `>` flipped to `<` (see
// structures/heap.js `_beats`).

import { ArrayRenderer, HeapTreeRenderer, MaxHeap, MinHeap } from "../index.js";

// stateless factories — both specs mount their own renderer instances from these
const renderer = [
  (c) => new ArrayRenderer(c, { mode: "cells" }),
  (c) => new HeapTreeRenderer(c),
];

export const heapDemo = {
  id: "heap",
  title: "Binary Heap (max-heap / PQ)",
  blurb: "An array-backed complete binary tree, shown BOTH ways at once — the flat array and the tree it encodes (parent k/2, children 2k and 2k+1), so the heap property is visible: every parent ≥ its children. Insert swims up, delete-max sinks down, both Θ(log n) — plus heapsort, which reuses sink to sort in place, ascending. Flipping one comparison gives the min-heap demo.",
  make: () => new MaxHeap(),
  initial: "1..10:ZIG",  // a deterministic scramble: 1,10,2,9,…
  buildStep: (s, k) => s.insert(k),   // Build = repeated insert, animated
  proto: "heap",
  presets: [
    { name: "scramble (1..10 zigzag)", initial: "1..10:ZIG" },
    { name: "ascending (1..15) — every insert swims", initial: "1..15" },
    { name: "descending (15..1) — no swims", initial: "1..15:DESC" },
  ],
  renderer,
  height: [75, 210],
  costs: ["compare", "swap", "read", "write"],
  ops: [
    { name: "Insert", arg: "number", run: (s, v) => s.insert(v) },
    { name: "Delete max", run: (s) => s.delMax() },
    { name: "Heapify (bottom-up, Θ(n))", ghost: true, run: (s) => s.heapify() },
    { name: "Heapsort", run: (s) => s.heapsort() },
  ],
};

// The SAME engine with the comparison reversed: the root is now the SMALLEST
// key. This is the priority queue Dijkstra, Prim and Huffman actually want
// (repeatedly take the cheapest thing), and sorting it down runs DESCENDING.
export const minHeapDemo = {
  ...heapDemo,
  id: "min-heap",
  title: "Binary Heap (min-heap / PQ)",
  blurb: "The same array-backed heap with ONE comparison flipped: every parent ≤ its children, so the smallest key sits at a[1]. This is the priority queue Dijkstra, Prim and Huffman use — repeatedly remove the cheapest item. Insert swims up, delete-min sinks down, both Θ(log n); sorting down a min-heap lays the keys out in DESCENDING order.",
  make: () => new MinHeap(),
  presets: [
    { name: "scramble (1..10 zigzag)", initial: "1..10:ZIG" },
    { name: "descending (15..1) — every insert swims", initial: "1..15:DESC" },
    { name: "ascending (1..15) — no swims", initial: "1..15" },
  ],
  ops: [
    { name: "Insert", arg: "number", run: (s, v) => s.insert(v) },
    { name: "Delete min", run: (s) => s.delMin() },
    { name: "Heapify (bottom-up, Θ(n))", ghost: true, run: (s) => s.heapify() },
    { name: "Heapsort (descending)", run: (s) => s.heapsort() },
  ],
};
