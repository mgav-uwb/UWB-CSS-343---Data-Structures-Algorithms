// CSS 343 unified library — demos/dp.js
// Full-demo specs for dynamic programming: the fib arc (memoized vs naive vs
// two variables — the S14 race, one op per version) and the three classic
// table fills (LCS, 0/1 knapsack, edit distance), all on the shared
// MatrixRenderer. The string demos take their words from NAMED input boxes
// (ported from the S14–S15 lecture demos), so any pair can be tried.

import { DP, MatrixRenderer } from "../index.js";
import { expandRepeats } from "../core/sequence.js";

const word = (v, dflt) => {
  const s = expandRepeats(String(v ?? "")).toUpperCase().replace(/[^A-Z]/g, "").slice(0, 12);
  return s || dflt;
};

export const fibDemo = {
  id: "fib",
  proto: "dp",
  title: "Fibonacci — the DP arc (one version at a time)",
  blurb: "The whole DP arc on one function. Naive recursion recomputes the same values exponentially often (the 'times' row counts the waste — 2·fib(n+1)−1 calls). Memoization caches each fib(k) once (2n−1 calls). The two-variable version never holds more than two cells — Θ(1) space. Run each version at the same n and compare the counters — or open the Fibonacci RACE demo to watch all three in lockstep.",
  make: () => new DP(),
  initial: "",
  noBuild: true,
  stateMsg: () => "type n (2–16) and pick a version — compare the call counters (try n = 10: 177 vs 19 vs 10)",
  renderer: (c) => new MatrixRenderer(c),
  costs: ["call", "cache-hit", "recompute", "add", "write"],
  ops: [
    { name: "Naive fib", arg: "number", run: (s, v) => s.fibNaive(Math.min(16, v)) },
    { name: "Memo fib", arg: "number", run: (s, v) => s.fib(Math.min(16, v)) },
    { name: "2 vars", arg: "number", run: (s, v) => s.fibTwoVar(v) },
  ],
  width: 900, height: 150,
};

export const lcsDemo = {
  id: "lcs",
  proto: "dp",
  title: "LCS (longest common subsequence)",
  blurb: "Fill the (|a|+1)×(|b|+1) length table: a diagonal +1 on a character match, otherwise the max of the cell above and the cell to the left. Traceback from the bottom-right corner recovers the subsequence itself. Type any two words (the repeat shorthand works: A^6 vs (AB)^3).",
  make: () => new DP(),
  initial: "",
  noBuild: true,
  stateMsg: () => 'ready: LCS("SUNDAY", "SATURDAY") — edit the words, press Run',
  renderer: (c) => new MatrixRenderer(c),
  costs: ["compare", "read", "write"],
  inputs: [
    { key: "a", label: "a", value: "SUNDAY", width: 100 },
    { key: "b", label: "b", value: "SATURDAY", width: 100 },
  ],
  ops: [
    { name: "Run LCS", run: (s, _v, vals) => s.lcs(word(vals.a, "SUNDAY"), word(vals.b, "SATURDAY")) },
  ],
};

export const knapsackDemo = {
  id: "knapsack",
  proto: "dp",
  title: "0/1 Knapsack",
  blurb: "Fill the (n+1)×(capacity+1) value table over the fixed item set A(w2/v3) B(w3/v4) C(w4/v5) D(w5/v6): for each item, take it (value + the best without its weight) or skip it (carry the row above), whichever is larger. Traceback compares each row to the one above to recover which items were taken. Change W to see the table and the chosen set shift.",
  make: () => new DP(),
  initial: "",
  noBuild: true,
  stateMsg: () => "ready: items A(w2/v3) B(w3/v4) C(w4/v5) D(w5/v6), capacity W from the box — press Run",
  renderer: (c) => new MatrixRenderer(c),
  costs: ["compare", "read", "write"],
  inputs: [{ key: "w", label: "W (1–12)", value: "5", width: 60 }],
  height: 280,
  ops: [
    { name: "Run knapsack", run: (s, _v, vals) => s.knapsack(undefined, parseInt(vals.w, 10) || 5) },
  ],
};

export const editDistanceDemo = {
  id: "edit-distance",
  proto: "dp",
  title: "Edit Distance (Levenshtein)",
  blurb: "Fill the (|a|+1)×(|b|+1) table: a free diagonal step on a character match, otherwise 1 + the min of insert / delete / replace. Traceback from the bottom-right corner recovers the shortest edit script. Type any two words.",
  make: () => new DP(),
  initial: "",
  noBuild: true,
  stateMsg: () => 'ready: editDistance("kitten", "sitting") — edit the words, press Run',
  renderer: (c) => new MatrixRenderer(c),
  costs: ["compare", "read", "write"],
  inputs: [
    { key: "a", label: "a", value: "kitten", width: 100 },
    { key: "b", label: "b", value: "sitting", width: 100 },
  ],
  ops: [
    { name: "Run edit distance", run: (s, _v, vals) => s.editDistance(expandRepeats(vals.a).toLowerCase().replace(/[^a-z]/g, "").slice(0, 12) || "kitten", expandRepeats(vals.b).toLowerCase().replace(/[^a-z]/g, "").slice(0, 12) || "sitting") },
  ],
};
