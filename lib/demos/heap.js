// CSS 343 unified library — demos/heap.js
// Full-demo specs for the binary heap: a priority queue AND heapsort, both
// driven by the same array-backed BinaryHeap. Array indices ARE tree positions,
// so the shared ArrayRenderer draws it directly. Two specs, one engine — the
// max-heap and the min-heap differ ONLY in which way the comparison points, so
// the min version is the max version with `>` flipped to `<` (see
// structures/heap.js `_beats`).
//
// BUILD is itself a choice here (the "build by" dropdown), because the two ways
// to build a heap cost differently: n swims versus bottom-up heapify. The gap
// shows on insert's WORST case — ascending keys into a max-heap, where every
// insert swims to the root: 1..31 costs 98 swaps by insert against 26 by
// heapify (1..63: 258 vs 57). On RANDOM keys insert is Θ(n) expected too and
// the two land close (n=200: 234 vs 145 swaps), which is the honest version of
// the comparison and the reason the presets pair the ascending case explicitly.

import { ArrayRenderer, HeapTreeRenderer, MaxHeap, MinHeap, Tracer, concatTraces } from "../index.js";

// stateless factories — both specs mount their own renderer instances from these
const renderer = [
  (c) => new ArrayRenderer(c, { mode: "cells" }),
  (c) => new HeapTreeRenderer(c),
];

const BUILD_MODES = [
  { value: "insert", label: "repeated insert — n swims" },
  { value: "heapify", label: "heapify bottom-up — Θ(n)" },
];

/** Build = whichever of the two methods the dropdown names; both start from the
 *  fresh instance FullDemo just made, so their counters are directly comparable. */
const buildAll = (s, keys, vals) => {
  if (!keys.length) {
    const t = new Tracer();
    t.step("nothing to build — type keys in the initial box", { snapshot: s.snapshot() });
    return t.trace();
  }
  return (vals && vals.build) === "heapify"
    ? s.heapify(keys)                                  // loads the raw array, then sinks n/2…1
    : concatTraces(keys.map((k) => s.insert(k)));      // one animated swim per key
};

const buildInput = { key: "build", label: "build by", value: "insert", options: BUILD_MODES, width: 210 };

export const heapDemo = {
  id: "heap",
  title: "Binary Heap (max-heap / PQ)",
  blurb: "An array-backed complete binary tree, shown BOTH ways at once — the flat array and the tree it encodes (parent k/2, children 2k and 2k+1), so the heap property is visible: every parent ≥ its children. Insert swims up, delete-max sinks down, both Θ(log n). \"Build by\" runs the SAME keys through either build — repeated insert or bottom-up heapify (Θ(n)) — and Sort down then runs heapsort's second phase on its own, so the two halves of heapsort can be watched separately. Compare the build counters on ASCENDING keys — insert's worst case, every key swimming to the root — where 1..31 costs 98 swaps by insert against 26 by heapify; on random keys insert is Θ(n) expected too and the two run close. Flipping one comparison gives the min-heap demo.",
  make: () => new MaxHeap(),
  initial: "1..10:ZIG",  // a deterministic scramble: 1,10,2,9,…
  inputs: [buildInput],
  buildAll,
  initialBuilt: true,    // open on a finished heap, so Delete max is safe before the first Build
  proto: "heap",
  presets: [
    { name: "scramble 1..10 zigzag — by insert", initial: "1..10:ZIG", values: { build: "insert" } },
    { name: "1..31 ascending by INSERT — 98 swaps", initial: "1..31", values: { build: "insert" } },
    { name: "1..31 ascending by HEAPIFY — 26 swaps", initial: "1..31", values: { build: "heapify" } },
    { name: "15..1 descending — no swims", initial: "1..15:DESC", values: { build: "insert" } },
    { name: "random 16 by heapify — then Sort down", initial: "1..16:RAND", values: { build: "heapify" } },
  ],
  renderer,
  height: [75, 210],
  costs: ["compare", "swap", "read", "write"],
  ops: [
    { name: "Insert", arg: "number", run: (s, v) => s.insert(v) },
    { name: "Delete max", run: (s) => s.delMax() },
    // heapify is a BUILD method (the dropdown), not an op — on a heap it has
    // nothing to do. Sort down is heapsort's second phase on its own, so the
    // Θ(n) build and the Θ(n log n) sort can be watched separately.
    { name: "Sort down (heapsort phase 2)", run: (s) => s.sinkDown() },
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
  blurb: "The same array-backed heap with ONE comparison flipped: every parent ≤ its children, so the smallest key sits at a[1]. This is the priority queue Dijkstra, Prim and Huffman use — repeatedly remove the cheapest item. Insert swims up, delete-min sinks down, both Θ(log n). \"Build by\" runs the same keys through repeated insert or bottom-up heapify (Θ(n)); insert's worst case here is DESCENDING input (every key swims to the root) — 31..1 costs 98 swaps by insert against 26 by heapify. Sorting a min-heap down lays the keys out in DESCENDING order.",
  make: () => new MinHeap(),
  presets: [
    { name: "scramble 1..10 zigzag — by insert", initial: "1..10:ZIG", values: { build: "insert" } },
    { name: "31..1 descending by INSERT — 98 swaps", initial: "1..31:DESC", values: { build: "insert" } },
    { name: "31..1 descending by HEAPIFY — 26 swaps", initial: "1..31:DESC", values: { build: "heapify" } },
    { name: "1..15 ascending — no swims", initial: "1..15", values: { build: "insert" } },
    { name: "random 16 by heapify — then Sort down", initial: "1..16:RAND", values: { build: "heapify" } },
  ],
  ops: [
    { name: "Insert", arg: "number", run: (s, v) => s.insert(v) },
    { name: "Delete min", run: (s) => s.delMin() },
    { name: "Sort down (heapsort phase 2)", run: (s) => s.sinkDown() },
    { name: "Heapsort (descending)", run: (s) => s.heapsort() },
  ],
};
