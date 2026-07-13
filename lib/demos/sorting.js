// CSS 343 unified library — demos/sorting.js
// Full-demo specs for comparison sorting over a plain array (shared Sorting
// structure): bottom-up mergesort (merge is the spotlight), Lomuto quicksort
// (partition is the spotlight), and quickselect (partition, but discard the
// side that can't contain the answer).

import { Sorting, ArrayRenderer } from "../index.js";

const RAW = { loadRaw: true };  // Build = show the raw array; the ops run the algorithms

// second-canvas adapter: draw the frame's aux buffer (blank when no merge is
// mid-flight) with the aux-specific highlights carried in hl.aux
const auxView = (inner) => ({
  draw: (snap, hl) => inner.draw(snap?.aux ?? [], (hl && hl.aux) || {}),
});

export const mergesortDemo = {
  ...RAW,
  id: "mergesort",
  title: "Mergesort (bottom-up)",
  blurb: "Merge adjacent sorted runs of width 1, then 2, 4, … — and NOT in place: each merge first copies both runs into the Θ(n) AUX buffer (second row), then compares the two copies' front elements and writes the smaller back into the array. That extra row IS mergesort's memory cost — the price of a stable, always-Θ(n log n) sort.",
  make: () => new Sorting(),
  initial: "1..9:ZIG",
  presets: [
    { name: "zigzag (1..9)", initial: "1..9:ZIG" },
    { name: "already sorted (1..9) — same cost", initial: "1..9" },
    { name: "random (1..30)", initial: "1..30:RAND" },
  ],
  renderer: [
    (c) => new ArrayRenderer(c, { mode: "cells" }),
    (c) => auxView(new ArrayRenderer(c, { mode: "cells" })),
  ],
  labels: ["a[] — the array being sorted", "aux — the Θ(n) scratch buffer each merge copies into"],
  height: [95, 95],
  proto: "sorting",
  costs: ["compare", "read", "write"],
  ops: [{ name: "Mergesort", run: (s) => s.mergesort() }],
};

export const quicksortDemo = {
  ...RAW,
  id: "quicksort",
  height: 130,
  title: "Quicksort (Lomuto partition)",
  blurb: "Pick the last element as pivot; scan left-to-right swapping everything smaller into a growing boundary, then drop the pivot at that boundary — its final sorted position. Recurse on both sides. Try initial 1..9 (already sorted): Lomuto's pivot degrades to the Θ(n²) worst case — compare the counters against 1..9:ZIG.",
  make: () => new Sorting(),
  initial: "1..9:ZIG",
  presets: [
    { name: "zigzag (1..9)", initial: "1..9:ZIG" },
    { name: "sorted (1..9) — Lomuto's Θ(n²) worst", initial: "1..9" },
    { name: "random (1..30)", initial: "1..30:RAND" },
  ],
  renderer: (c) => new ArrayRenderer(c, { mode: "cells" }),
  proto: "sorting",
  costs: ["compare", "swap", "read", "write"],
  ops: [{ name: "Quicksort", run: (s) => s.quicksort() }],
};

export const quickselectDemo = {
  ...RAW,
  id: "quickselect",
  valPlaceholder: "rank k (0-based)", valWidth: 110,
  height: 130,
  title: "Quickselect (k-th smallest)",
  blurb: "Same Lomuto partition as quicksort, but recurse into only the side that contains rank k (0-indexed) — expected Θ(n), since the other side is thrown away instead of sorted.",
  make: () => new Sorting(),
  initial: "1..9:ZIG",
  presets: [
    { name: "zigzag (1..9)", initial: "1..9:ZIG" },
    { name: "sorted (1..9) — worst-case partitions", initial: "1..9" },
    { name: "random (1..30)", initial: "1..30:RAND" },
  ],
  renderer: (c) => new ArrayRenderer(c, { mode: "cells" }),
  proto: "sorting",
  costs: ["compare", "swap", "read", "write"],
  ops: [{ name: "Quickselect", arg: "number", run: (s, v) => s.quickselect(v) }],
};
