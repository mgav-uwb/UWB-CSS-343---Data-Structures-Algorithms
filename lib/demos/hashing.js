// CSS 343 unified library — demos/hashing.js
// Full-demo spec for open-addressing with linear probing: a fixed-size array
// where collisions probe forward to the next empty slot, the table doubles
// past a 0.5 load factor, and delete uses Sedgewick's cluster re-insert (no
// tombstones). Drawn with the shared ArrayRenderer — empty slots show as "·".

import { ArrayRenderer, LinearProbing } from "../index.js";

export const hashingDemo = {
  id: "hash-lp",
  title: "Hash Table (linear probing)",
  blurb: "Open addressing: collisions probe forward to the next empty slot; the table doubles past load factor 0.5, and delete re-inserts the rest of the cluster (Sedgewick's algorithm, no tombstones). The initial box takes ranges too — try 1..21:2 (all odd keys) and watch the resizes.",
  make: () => new LinearProbing(),
  initial: "23,14,9,6,31,17,8",
  renderer: (c) => new ArrayRenderer(c, { mode: "cells" }),
  costs: ["compare", "write", "hash"],
  ops: [
    { name: "Insert", arg: "number", run: (s, v) => s.insert(v) },
    { name: "Delete", arg: "number", run: (s, v) => s.remove(v) },
    { name: "Search", arg: "number", ghost: true, run: (s, v) => s.search(v) },
  ],
};
