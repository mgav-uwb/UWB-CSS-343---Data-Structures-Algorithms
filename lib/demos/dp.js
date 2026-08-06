// CSS 343 unified library — demos/dp.js
// Full-demo specs for dynamic programming: the fib arc (memoized vs naive vs
// two variables — the S14 race, one op per version), rod cutting (the first
// optimization DP: a max over choices plus the cut[] record its traceback
// reads), and the three classic table fills (LCS, 0/1 knapsack, edit
// distance), all on the shared MatrixRenderer. The string demos take their
// words from NAMED input boxes (ported from the S14–S15 lecture demos), so any
// pair can be tried.

import { DP, MatrixRenderer, TreeRenderer } from "../index.js";
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
  about: `
      <p class="lede">One function, four implementations of one recurrence, each strictly better
      than the last. Run all three versions at the same n and read the counters — the whole
      argument for dynamic programming is the gap between them.</p>
      <h3>The three versions</h3>
      <ul>
        <li><b>Naive fib</b> — the textbook recursion, no memory. Two rows: each fib(k)'s value,
        and how many TIMES it has been computed. The trace is one frame per call, so its length
        <em>is</em> the call count: exactly 2·fib(n+1) − 1.</li>
        <li><b>Memo fib</b> — the same recursion plus a cache checked first. Every cache hit is a
        whole subtree of recomputation that never happens. 2n − 1 calls.</li>
        <li><b>2 vars</b> — bottom-up, keeping only the last two values. Watch the table: it never
        grows past two cells. Θ(1) space, n additions.</li>
      </ul>
      <h3>The number worth pausing on</h3>
      <p>At n = 10: <b>177</b> calls, <b>19</b>, <b>10</b> — and 166 of the naive 177 are pure
      recomputation. Look at the <em>times</em> row after a naive run: 34, 55, 34, 21, 13, 8, 5,
      3, 2, 1, 1. Those are Fibonacci numbers themselves — fib(k) is recomputed fib(n−k+1)
      times, the recursion tree measuring itself. At n = 16 the naive lane needs 3,193 calls
      against 31.</p>`,
  links: [
    { href: "../handouts/ch14-dp-i.html#fib", label: "Chapter 14 §1: the whole arc →" },
    { href: "../sessions/S14-dp-i/index.html", label: "Lecture 14 — Part 2 →" },
  ],
  make: () => new DP(),
  initial: "",
  noBuild: true,
  valPlaceholder: "n (2–16)", valWidth: 70,
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

const priceList = (v, dflt) => {
  const nums = String(v ?? "").split(/[,\s]+/).map((x) => parseInt(x, 10)).filter((x) => Number.isFinite(x) && x >= 0);
  return nums.length ? nums.slice(0, 12) : dflt;
};

export const rodcutDemo = {
  id: "rodcut",
  proto: "dp",
  title: "Rod cutting — the first optimization DP",
  blurb: "best[len] = the most a rod of that length can earn = max over every first cut i of price[i] + best[len−i]. One frame per candidate, so the Θ(n²) is counted rather than asserted: length len tries len candidates. The cut row records which first cut won each length — that record, not the value, is what the traceback reads back to recover the actual pieces.",
  about: `
      <p class="lede">Fibonacci has overlap but nothing to <em>choose</em>. Rod cutting adds the
      missing ingredient — a decision at every step — and with it the full shape of an
      optimization DP: a max over choices, and a record of which choice won.</p>
      <h3>The three rows</h3>
      <ul>
        <li><b>price</b> — given, never changes. <code>price[i]</code> is what a piece of
        length <code>i</code> sells for.</li>
        <li><b>best</b> — the table being filled. <code>best[len]</code> is the most a rod of
        length <code>len</code> can earn, over every way of cutting it.</li>
        <li><b>cut</b> — the winning FIRST cut at each length. The value alone cannot tell you
        how to cut the rod; this row can, and the traceback at the end walks it.</li>
      </ul>
      <h3>What to watch</h3>
      <ul>
        <li>Every candidate reads a <em>smaller</em> <code>best[]</code> cell (highlighted as it
        is read) — cells that earlier lengths already computed. That reuse is the overlap; without
        the table, <code>best[2]</code> would be recomputed along every first-cut path, exactly
        like naive Fibonacci's <code>fib(2)</code>.</li>
        <li>The candidate counter ends at <code>n(n+1)/2</code>: ≈ n subproblems &times; O(n)
        choices each, which is where Θ(n²) comes from.</li>
        <li>Ties are common and harmless — the code keeps the first winner, so a different
        tie-break finds a different, equally optimal, set of cuts.</li>
      </ul>
      <h3>Instances worth running</h3>
      <ul>
        <li><code>1, 5, 8, 9</code> at n = 4 — the lecture instance. Greedy takes the best
        price-per-length piece (length 3, ratio 2.67) and earns 9; the DP finds 5 + 5 = 10.</li>
        <li><code>2, 5, 7, 8</code> at n = 4 — the your-turn instance. best[3] is a three-way
        tie at 7; best[4] is 10 again.</li>
        <li><code>1, 5, 8, 9, 10</code> at n = 5 — best[5] = 13 by 2 + 3, and both i = 2 and
        i = 3 achieve it (the code records the first).</li>
        <li><code>3, 5, 8, 9, 10, 17, 17, 20</code> at n = 8 — CLRS's price list, where the
        answer is eight length-1 pieces: the whole-rod price is never even close.</li>
      </ul>`,
  links: [
    { href: "../handouts/ch14-dp-i.html#rod", label: "Chapter 14 §2: rod cutting →" },
    { href: "../sessions/S14-dp-i/index.html", label: "Lecture 14 — Part 2 →" },
  ],
  make: () => new DP(),
  initial: "",
  noBuild: true,
  stateMsg: () => "ready: prices 1,5,8,9 and a rod of length 4 — press Run",
  renderer: (c) => new MatrixRenderer(c),
  costs: ["compare", "read", "write"],
  chrome: { showValue: false },
  inputs: [
    { key: "prices", label: "price[1..k]", value: "1,5,8,9", width: 150 },
    { key: "n", label: "rod n", value: "4", width: 60 },
  ],
  presets: [
    { name: "1,5,8,9 · n = 4 (the lecture)", values: { prices: "1,5,8,9", n: "4" } },
    { name: "2,5,7,8 · n = 4 (your turn)", values: { prices: "2,5,7,8", n: "4" } },
    { name: "1,5,8,9,10 · n = 5", values: { prices: "1,5,8,9,10", n: "5" } },
    { name: "3,5,8,9,10,17,17,20 · n = 8 (CLRS)", values: { prices: "3,5,8,9,10,17,17,20", n: "8" } },
  ],
  height: 190,
  ops: [
    { name: "Run rod cutting", run: (s, _v, vals) => s.rodCut(priceList(vals.prices, [1, 5, 8, 9]), parseInt(vals.n, 10)) },
  ],
};

export const rodcutTreeDemo = {
  id: "rodcut-tree",
  proto: "dp",
  title: "Rod cutting — the subproblem tree",
  blurb: "The tree the table is an optimization of. A node is the length still to cut, an edge is the piece taken, so a root-to-leaf path IS one complete cutting — and the leaves enumerate ALL of them: 2^(n-1) cuttings among 2^n nodes. Every cutting is scored in turn, the optimum ends up the only green path, and colouring by length shows why the tree is wasteful: 16 nodes over 5 distinct subproblems.",
  about: `
      <p class="lede">The table says <em>what</em> the algorithm computes. This says <em>why</em>
      that is the right thing to compute — and it is the picture the recurrence
      <code>best(len) = max over i of price[i] + best(len−i)</code> is a description of.</p>
      <h3>How to read it</h3>
      <ul>
        <li>A <b>node</b> is the length still to be cut. The root is the whole rod; every
        <code>cut(0)</code> leaf is a rod fully used up.</li>
        <li>An <b>edge badge</b> is the piece taken at that step.</li>
        <li>So a <b>root-to-leaf path</b> is one complete cutting, and its badges spell it:
        2 → 2 means "cut a 2, then cut a 2".</li>
      </ul>
      <h3>The three things it shows that a table cannot</h3>
      <ul>
        <li><b>Every option, at once.</b> A rod of 4 has exactly 8 cuttings — the 8 leaves, which
        are the 2<sup>n−1</sup> compositions of n. The demo scores each one; the optimum
        (2 + 2 = 10) finishes as the only green path, with 9, 9, 9, 7, 7, 7, 4 behind it.</li>
        <li><b>Why greedy loses, as geometry.</b> Selling the rod whole, and the greedy
        best-ratio choice of a 3, are just other paths in the same tree — both reaching 9.
        Nothing about the price list announces which path wins, which is exactly why every
        first cut has to be tried.</li>
        <li><b>The overlap.</b> The last frames colour by length: cut(2) appears twice, cut(1)
        four times, cut(0) eight times. 16 nodes, 5 distinct subproblems. That gap IS dynamic
        programming — the table computes each of the 5 once and the 16 collapse.</li>
      </ul>
      <h3>The three buttons are the three algorithms, on one picture</h3>
      <ul>
        <li><b>All cuttings</b> — the definition. Every path scored, the optimum left green.
        2<sup>n</sup> nodes: 16 at n = 4, 32 at n = 5.</li>
        <li><b>Memoized (top-down)</b> — the same tree, walked with a cache. The first time a
        length is reached it is solved; every later time the node reports the stored value and its
        whole subtree <em>greys out</em>. The saving is visible as absence. What stays lit is
        exactly <b>1 + n(n+1)/2</b> nodes — the root plus the table's candidate count — so at
        n = 4, 11 of 16, and at n = 5, 16 of 32.</li>
        <li><b>Tabulated (bottom-up)</b> — no recursion at all. Lengths are filled smallest-first,
        and each new cell shows links to the cells it reads, which already hold answers. n+1 cells
        and n(n+1)/2 links, and nothing is ever explored twice because nothing is ever explored
        a second time in the first place.</li>
      </ul>
      <p>The three end on the same optimum, which is the point: they are one algorithm seen at
      three levels of implementation. The pruned tree's node count IS the table's candidate count,
      so this demo and <a href="demo.html?ds=rodcut">the table demo</a> are counting the same
      work in two pictures.</p>
      <p>Capped at n = 5 (32 nodes). Past that the drawing stops being readable, which is not a
      limitation of the demo so much as the argument for the table: see
      <a href="demo.html?ds=rodcut-race">the race</a> for what n = 12 costs (4096 calls).</p>`,
  links: [
    { href: "../handouts/ch14-dp-i.html#rod", label: "Chapter 14 §2: rod cutting →" },
    { href: "../sessions/S14-dp-i/index.html", label: "Lecture 14 — Part 2 →" },
  ],
  make: () => new DP(),
  initial: "",
  noBuild: true,
  chrome: { showValue: false },
  stateMsg: () => "ready: prices 1,5,8,9, rod 4 — 8 ways to cut it. Pick a view: all cuttings, memoized, or tabulated",
  renderer: (c) => new TreeRenderer(c, { labels: "sym", R: 15 }),
  costs: ["compare", "cache-hit", "read", "write"],
  inputs: [
    { key: "prices", label: "price[1..k]", value: "1,5,8,9", width: 150 },
    { key: "n", label: "rod n (1–5)", value: "4", width: 70 },
  ],
  presets: [
    { name: "1,5,8,9 · n = 4 (the lecture)", values: { prices: "1,5,8,9", n: "4" } },
    { name: "2,5,7,8 · n = 4 (your turn)", values: { prices: "2,5,7,8", n: "4" } },
    { name: "1,5,8,9,10 · n = 5 (16 cuttings)", values: { prices: "1,5,8,9,10", n: "5" } },
    { name: "1,5,8 · n = 3 (the small case)", values: { prices: "1,5,8", n: "3" } },
  ],
  height: 320,
  ops: [
    { name: "All cuttings", run: (s, _v, vals) => s.rodCutTree(priceList(vals.prices, [1, 5, 8, 9]), parseInt(vals.n, 10)) },
    { name: "Memoized (top-down)", run: (s, _v, vals) => s.rodCutTreeMemo(priceList(vals.prices, [1, 5, 8, 9]), parseInt(vals.n, 10)) },
    { name: "Tabulated (bottom-up)", run: (s, _v, vals) => s.rodCutTreeTab(priceList(vals.prices, [1, 5, 8, 9]), parseInt(vals.n, 10)) },
  ],
};

export const lcsDemo = {
  id: "lcs",
  proto: "dp",
  title: "LCS (longest common subsequence)",
  blurb: "Fill the (|a|+1)×(|b|+1) length table: a diagonal +1 on a character match, otherwise the max of the cell above and the cell to the left. Traceback from the bottom-right corner recovers the subsequence itself. Type any two words (the repeat shorthand works: A^6 vs (AB)^3).",
  about: `
      <p class="lede">The canonical two-dimensional DP, and the most deployed one you will meet
      this term: <code>L[i][j]</code> is the LCS length of the first i characters of a and the
      first j of b, and every cell reads only its up, left and diagonal neighbours.</p>
      <h3>The recurrence, as the cells show it</h3>
      <ul>
        <li><b>match</b> — the two last characters are equal, so pairing them costs nothing:
        <code>diagonal + 1</code>. One highlighted source cell.</li>
        <li><b>mismatch</b> — at least one of the two last characters is not in the LCS, so drop
        one and take the better: <code>max(up, left)</code>. Two highlighted source cells.</li>
        <li><b>traceback</b> — the corner holds only the LENGTH. Walking back from it, taking a
        diagonal step on each match and following the larger neighbour otherwise, spells the
        subsequence itself. This is why the whole table is kept: the two-row space optimization
        can report the length but not the string.</li>
      </ul>
      <h3>A built-in bug detector</h3>
      <p>Values never decrease going right or down, and adjacent cells never differ by more than
      1. A hand-filled table that drops or jumps by 2 is wrong, and the invariant pins the bug to
      within a cell.</p>
      <h3>Pairs worth trying</h3>
      <ul>
        <li><code>AGCAT</code> / <code>GAC</code> — the lecture table. Length 2; AC, GC and GA
        are all valid answers (the length is unique, the string is not).</li>
        <li><code>SUNDAY</code> / <code>SATURDAY</code> — length 5, SUDAY: SATURDAY has no N.</li>
        <li><code>ABCBDAB</code> / <code>BDCABA</code> — the CLRS pair, length 4 (BCBA).</li>
        <li><code>A^6</code> / <code>(AB)^3</code> — the repeat shorthand, and a table that is
        all matches down one staircase.</li>
      </ul>`,
  links: [
    { href: "../handouts/ch14-dp-i.html#lcs", label: "Chapter 14 §3: LCS →" },
    { href: "../sessions/S14-dp-i/index.html", label: "Lecture 14 — Part 3 →" },
  ],
  make: () => new DP(),
  initial: "",
  noBuild: true,
  stateMsg: () => 'ready: LCS("SUNDAY", "SATURDAY") — edit the words, press Run',
  renderer: (c) => new MatrixRenderer(c),
  costs: ["compare", "read", "write"],
  chrome: { showValue: false },
  inputs: [
    { key: "a", label: "a", value: "SUNDAY", width: 100 },
    { key: "b", label: "b", value: "SATURDAY", width: 100 },
  ],
  presets: [
    { name: "SUNDAY / SATURDAY", values: { a: "SUNDAY", b: "SATURDAY" } },
    { name: "ABCBDAB / BDCABA (CLRS)", values: { a: "ABCBDAB", b: "BDCABA" } },
    { name: "A^6 / (AB)^3 — repeat shorthand", values: { a: "A^6", b: "(AB)^3" } },
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
  chrome: { showValue: false },
  inputs: [{ key: "w", label: "W (1–12)", value: "5", width: 60 }],
  presets: [
    { name: "W = 5 (the lecture example)", values: { w: "5" } },
    { name: "W = 8", values: { w: "8" } },
    { name: "W = 12 (room for more?)", values: { w: "12" } },
  ],
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
  chrome: { showValue: false },
  inputs: [
    { key: "a", label: "a", value: "kitten", width: 100 },
    { key: "b", label: "b", value: "sitting", width: 100 },
  ],
  presets: [
    { name: "kitten → sitting (the classic)", values: { a: "kitten", b: "sitting" } },
    { name: "intention → execution", values: { a: "intention", b: "execution" } },
    { name: "identical words (distance 0)", values: { a: "banana", b: "banana" } },
  ],
  ops: [
    { name: "Run edit distance", run: (s, _v, vals) => s.editDistance(expandRepeats(vals.a).toLowerCase().replace(/[^a-z]/g, "").slice(0, 12) || "kitten", expandRepeats(vals.b).toLowerCase().replace(/[^a-z]/g, "").slice(0, 12) || "sitting") },
  ],
};
