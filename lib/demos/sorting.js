// CSS 343 unified library — demos/sorting.js
// Full-demo specs for comparison sorting over a plain array (shared Sorting
// structure): bottom-up mergesort (merge is the spotlight), Lomuto quicksort
// (partition is the spotlight), and quickselect (partition, but discard the
// side that can't contain the answer).

import { Sorting, ArrayRenderer } from "../index.js";

const RAW = { loadRaw: true };  // Build = show the raw array; the ops run the algorithms

export const mergesortDemo = {
  ...RAW,
  id: "mergesort",
  title: "Mergesort (bottom-up)",
  blurb: "Merge adjacent sorted runs of width 1, then 2, 4, ... — the merge step compares the two runs' front elements and writes the smaller one into place.",
  make: () => new Sorting(),
  initial: "1..9:ZIG",
  renderer: (c) => new ArrayRenderer(c, { mode: "cells" }),
  proto: "sorting",
  costs: ["compare", "read", "write"],
  ops: [{ name: "Mergesort", run: (s) => s.mergesort() }],
};

export const quicksortDemo = {
  ...RAW,
  id: "quicksort",
  title: "Quicksort (Lomuto partition)",
  blurb: "Pick the last element as pivot; scan left-to-right swapping everything smaller into a growing boundary, then drop the pivot at that boundary — its final sorted position. Recurse on both sides. Try initial 1..9 (already sorted): Lomuto's pivot degrades to the Θ(n²) worst case — compare the counters against 1..9:ZIG.",
  make: () => new Sorting(),
  initial: "1..9:ZIG",
  renderer: (c) => new ArrayRenderer(c, { mode: "cells" }),
  proto: "sorting",
  costs: ["compare", "swap", "read", "write"],
  ops: [{ name: "Quicksort", run: (s) => s.quicksort() }],
};

export const quickselectDemo = {
  ...RAW,
  id: "quickselect",
  title: "Quickselect (k-th smallest)",
  blurb: "Same Lomuto partition as quicksort, but recurse into only the side that contains rank k (0-indexed) — expected Θ(n), since the other side is thrown away instead of sorted.",
  make: () => new Sorting(),
  initial: "1..9:ZIG",
  renderer: (c) => new ArrayRenderer(c, { mode: "cells" }),
  proto: "sorting",
  costs: ["compare", "swap", "read", "write"],
  ops: [{ name: "Quickselect", arg: "number", run: (s, v) => s.quickselect(v) }],
};
