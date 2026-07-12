// CSS 343 unified library — demos/compare.js
// The COMPARISON demos, ported from the lecture decks into the gallery: two
// (or three) structures run the same operation SIDE BY SIDE in lockstep, with
// a speed select and a ⏩ 1024× button to sweep the slow one to completion.
// Both are DualDemo specs — mountDemo dispatches on `panels`.

import { AVL, BST, DP, MatrixRenderer, TreeRenderer } from "../index.js";

// S04's plain-BST-vs-AVL race: the same keys into both; ascending input
// degenerates the BST into a path while the AVL rotates and stays log-height.
export const bstVsAvlDemo = {
  id: "bst-vs-avl",
  title: "BST vs AVL (side by side)",
  blurb: "The same keys into both, in lockstep: the plain BST's shape (and height) is at the mercy of insertion order, while the AVL rebalances. Insert the whole 1..16 sequence and watch the heights diverge — 15 vs 4. ⏩ 1024× sweeps a long insertion to the end.",
  proto: "avl",
  panels: [
    { title: "plain BST", make: () => new BST(), renderer: (c) => new TreeRenderer(c, { labels: "none" }) },
    { title: "AVL (rebalances)", make: () => new AVL(), renderer: (c) => new TreeRenderer(c, { labels: "bf" }) },
  ],
  op: (s, v) => s.insert(v),
  initial: "",
  sequence: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  speedControl: true,
  finishButton: true,
  width: 440, height: 280,
};

// S14's fib race: naive vs memoized vs two variables at the same n — the
// linear versions finish and freeze while the naive lane crawls toward
// 2·fib(n+1)−1 calls; ⏩ 1024× puts it out of its misery.
const clampN = (v) => Math.max(2, Math.min(16, Math.trunc(v) || 10));

export const fibRaceDemo = {
  id: "fib-race",
  title: "Fibonacci race (naive vs memo vs 2 vars)",
  blurb: "One basic step per tick, in lockstep: the two-variable version finishes first (its table never grows past TWO cells — Θ(1) space), memoization right behind at 2n−1 calls, and the naive recursion keeps recomputing values it already knew (the times row counts the waste). For n = 10: 10 · 19 · 177 steps.",
  proto: "dp",
  stacked: true, columns: "3.2fr 1fr",
  panels: [
    { title: "naive (no memo)", make: () => new DP(), renderer: (c) => new MatrixRenderer(c, {}),
      op: (s, v) => s.fibNaive(clampN(v)), width: 900, height: 130, fullRow: true,
      stat: (s, f) => `${f.counters["call"] || 0} calls · ${f.counters["recompute"] || 0} recomputes` },
    { title: "memoized", make: () => new DP(), renderer: (c) => new MatrixRenderer(c, {}),
      op: (s, v) => s.fib(clampN(v)), width: 660, height: 90,
      stat: (s, f) => `${f.counters["call"] || 0} calls · ${f.counters["cache-hit"] || 0} cache hits` },
    { title: "2 vars", make: () => new DP(), renderer: (c) => new MatrixRenderer(c, {}),
      op: (s, v) => s.fibTwoVar(clampN(v)), width: 200, height: 90,
      stat: (s, f) => `${f.counters["add"] || 0} adds · 2 cells` },
  ],
  opLabel: "Race fib", valLabel: "n (2–16)", placeholder: "10", initialValue: 10,
  speed: 300, speedControl: true, finishButton: true,
};
