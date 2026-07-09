// CSS 343 unified library — demos/dp.js
// Full-demo specs for the three classic dynamic-programming table fills: LCS,
// 0/1 knapsack, and edit distance. Each is drawn on the shared MatrixRenderer.
// These tables aren't a numeric sequence a user types in (unlike bst/heap/…),
// so `initial` is empty and each demo has a single "Run" op that (re)computes
// the fixed sample pair/instance baked into structures/dp.js.

import { DP, MatrixRenderer } from "../index.js";

export const lcsDemo = {
  id: "lcs",
  title: "LCS (longest common subsequence)",
  blurb: "Fill the (|a|+1)×(|b|+1) length table: a diagonal +1 on a character match, otherwise the max of the cell above and the cell to the left. Traceback from the bottom-right corner recovers the subsequence itself.",
  make: () => new DP(),
  initial: "",
  stateMsg: (d) => d.inorder(),
  renderer: (c) => new MatrixRenderer(c),
  costs: ["compare", "read", "write"],
  ops: [
    { name: "Run LCS(\"AGCAT\", \"GAC\")", run: (s) => s.lcs("AGCAT", "GAC") },
  ],
};

export const knapsackDemo = {
  id: "knapsack",
  title: "0/1 Knapsack",
  blurb: "Fill the (n+1)×(capacity+1) value table: for each item, take it (value + the best without its weight) or skip it (carry the row above), whichever is larger. Traceback compares each row to the one above to recover which items were taken.",
  make: () => new DP(),
  initial: "",
  stateMsg: (d) => d.inorder(),
  renderer: (c) => new MatrixRenderer(c),
  costs: ["compare", "read", "write"],
  ops: [
    { name: "Run knapsack (W=5)", run: (s) => s.knapsack() },
  ],
};

export const editDistanceDemo = {
  id: "edit-distance",
  title: "Edit Distance (Levenshtein)",
  blurb: "Fill the (|a|+1)×(|b|+1) table: a free diagonal step on a character match, otherwise 1 + the min of insert / delete / replace. Traceback from the bottom-right corner recovers the shortest edit script.",
  make: () => new DP(),
  initial: "",
  stateMsg: (d) => d.inorder(),
  renderer: (c) => new MatrixRenderer(c),
  costs: ["compare", "read", "write"],
  ops: [
    { name: "Run editDistance(\"kitten\", \"sitting\")", run: (s) => s.editDistance("kitten", "sitting") },
  ],
};
