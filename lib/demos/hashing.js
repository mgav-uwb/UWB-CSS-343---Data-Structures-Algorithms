// CSS 343 unified library — demos/hashing.js
// Full-demo spec for open-addressing with linear probing: a fixed-size array
// where collisions probe forward to the next empty slot, the table doubles
// past a 0.5 load factor, and delete uses Sedgewick's cluster re-insert (no
// tombstones). Drawn with the shared ArrayRenderer — empty slots show as "·".

import { ArrayRenderer, ChainRenderer, LinearProbing, SeparateChaining } from "../index.js";

export const hashingDemo = {
  id: "hash-lp",
  title: "Hash Table (linear probing)",
  blurb: "Open addressing: collisions probe forward to the next empty slot; the table doubles past load factor 0.5, and delete re-inserts the rest of the cluster (Sedgewick's algorithm, no tombstones). The initial box takes ranges too — try 1..21:2 (all odd keys) and watch the resizes. The hash here is plain h(k) = k mod M — deliberately simple so you can predict every slot by eye; real tables scramble the key first (multiplicative/universal hashing) so patterned keys don't cluster.",
  make: () => new LinearProbing(8),
  remake: (vals) => new LinearProbing(Math.max(4, Math.min(parseInt(vals.m, 10) || 8, 32))),
  inputs: [{ key: "m", label: "start M", value: "8", width: 50 }],
  initial: "23,14,9,6,31,17,8",
  presets: [
    { name: "light load (7 keys, M=8)", initial: "23,14,9,6,31,17,8", values: { m: "8" } },
    { name: "one home slot (8,16,…,48) — clustering", initial: "8..48:8", values: { m: "8" } },
    { name: "force a resize (1..12)", initial: "1..12", values: { m: "8" } },
  ],
  buildStep: (s, k) => s.insert(k),
  proto: "hashing",
  stateMsg: (s) => `M = ${s.M}, n = ${s.n}, α = ${(s.n / s.M).toFixed(2)} — doubles at α ≥ ${s.resizeAt}; h(k) = k mod ${s.M}`,
  renderer: (c) => new ArrayRenderer(c, { mode: "cells" }),
  height: 120,   // one strip — the default canvas height is dead space
  costs: ["compare", "write", "hash"],
  ops: [
    { name: "Insert", arg: "number", run: (s, v) => s.insert(v) },
    { name: "Delete", arg: "number", run: (s, v) => s.remove(v) },
    { name: "Search", arg: "number", ghost: true, run: (s, v) => s.search(v) },
  ],
};

export const chainingDemo = {
  id: "hash-chain",
  title: "Hash Table (separate chaining)",
  blurb: "The other collision strategy: each bucket holds a linked list, so colliders simply chain — search scans one chain (Θ(α) expected), and delete is a trivial unlink (contrast probing's cluster repair). The odd keys 1..21 into M = 7 pair up into four 2-chains.",
  make: () => new SeparateChaining(7),
  remake: (vals) => new SeparateChaining(Math.max(3, Math.min(parseInt(vals.m, 10) || 7, 16))),
  inputs: [{ key: "m", label: "M", value: "7", width: 45 }],
  initial: "1..21:2",
  presets: [
    { name: "spread (1..21 by 2, M=7)", initial: "1..21:2", values: { m: "7" } },
    { name: "one bucket (multiples of 7)", initial: "7..42:7", values: { m: "7" } },
    { name: "heavy load (1..28, M=7)", initial: "1..28", values: { m: "7" } },
  ],
  buildStep: (s, k) => s.insert(k),
  proto: "hashing",
  stateMsg: (s) => `M = ${s.M}, h(k) = k mod ${s.M} — ${s.n} keys, α = ${s.alpha()}`,
  renderer: (c) => new ChainRenderer(c),
  costs: ["hash", "compare", "write"],
  ops: [
    { name: "Insert", arg: "number", run: (s, v) => s.insert(v) },
    { name: "Search", arg: "number", ghost: true, run: (s, v) => s.search(v) },
    { name: "Delete", arg: "number", run: (s, v) => s.remove(v) },
  ],
  width: 940, height: 240,
};
