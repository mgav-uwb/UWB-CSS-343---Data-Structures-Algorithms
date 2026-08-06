// CSS 343 unified library — structures/dp.js
// Dynamic-programming demos traced onto the shared MatrixRenderer: memoized
// and naive Fibonacci (a 1-row memo / a 2-row value+times race pair), plus
// rod cutting (best[] over every first cut, with the cut[] row its traceback
// reads back), and three classic table fills — LCS (longest common
// subsequence), 0/1 knapsack, and edit (Levenshtein) distance. Each fill
// highlights the ACTIVE cell being computed and the FROM cells its recurrence
// reads; a final traceback walks PATH cells back from the answer cell to
// recover the cuts, the LCS string, the chosen knapsack items, or the edit
// script. Uncomputed interior cells render blank
// ("") until their step fills them in. snapshot()/inorder() report the
// last-run table so the shared FullDemo chrome has something to show at rest.

import { Tracer } from "../core/tracer.js";

const grid = (rows, cols, fill = "") => Array.from({ length: rows }, () => new Array(cols).fill(fill));
const cloneRows = (cells) => cells.map((r) => r.slice());

const DEFAULT_ITEMS = [
  { name: "A", w: 2, v: 3 },
  { name: "B", w: 3, v: 4 },
  { name: "C", w: 4, v: 5 },
  { name: "D", w: 5, v: 6 },
];

export class DP {
  constructor() {
    this.rows = 0; this.cols = 0; this.cells = grid(0, 0);
    this.rowLabels = null; this.colLabels = null;
    this.summary = "no run yet";
  }

  build() { return this; } // DP tables have no meaningful numeric "build" input

  snapshot() { return { rows: this.rows, cols: this.cols, cells: this.cells, rowLabels: this.rowLabels, colLabels: this.colLabels }; }
  inorder() { return this.summary; }

  _setTable(rows, cols, cells, rowLabels, colLabels) {
    this.rows = rows; this.cols = cols; this.cells = cells;
    this.rowLabels = rowLabels; this.colLabels = colLabels;
  }

  /** fib(n) — top-down MEMOIZED Fibonacci over a 1-row table. Every cache hit
      is a subtree of calls that never happens; the counters make the collapse
      visible (memo: 2n−1 calls; naive: 2·fib(n+1)−1). */
  fib(n = 10) {
    n = Math.max(2, Math.min(Math.trunc(n) || 10, 20)); // keep the memo row readable
    const t = new Tracer();
    const cells = grid(1, n + 1);
    const colLabels = []; for (let k = 0; k <= n; k++) colLabels.push(String(k));
    this._setTable(1, n + 1, cells, ["memo"], colLabels);
    const snap = () => ({ rows: 1, cols: n + 1, cells: cloneRows(cells), rowLabels: ["memo"], colLabels });
    const doneCells = () => { const out = []; for (let k = 0; k <= n; k++) if (cells[0][k] !== "") out.push([0, k]); return out; };
    let calls = 0, hits = 0;
    t.step(`fib(${n}) top-down: recurse, but WRITE every answer into memo[] and check it first`,
      { snapshot: snap(), highlight: {} });
    const go = (k) => {
      calls++; t.count("call");
      if (cells[0][k] !== "") {
        hits++; t.count("cache-hit");
        t.step(`fib(${k}) — memo[${k}] = ${cells[0][k]} already known: CACHE HIT, the whole subtree of recomputation vanishes`,
          { snapshot: snap(), highlight: { active: [[0, k]], done: doneCells() } });
        return cells[0][k];
      }
      if (k <= 1) {
        cells[0][k] = k; t.count("write");
        t.step(`fib(${k}) = ${k} (base case) → memo[${k}]`,
          { snapshot: snap(), highlight: { active: [[0, k]], done: doneCells() } });
        return k;
      }
      t.step(`fib(${k}): need fib(${k - 1}) and fib(${k - 2}) — recurse`,
        { snapshot: snap(), highlight: { active: [[0, k]], done: doneCells() } });
      const v = go(k - 1) + go(k - 2);
      cells[0][k] = v; t.count("write");
      t.step(`fib(${k}) = fib(${k - 1}) + fib(${k - 2}) = ${v} → memo[${k}]`,
        { snapshot: snap(), highlight: { active: [[0, k]], done: doneCells() } });
      return v;
    };
    const v = go(n);
    const naive = 2 * (function f(k) { return k <= 1 ? k : f(k - 1) + f(k - 2); })(n + 1) - 1;
    this.summary = `fib(${n}) = ${v} — ${calls} calls with the memo (${hits} cache hits) vs ${naive} calls without`;
    t.step(`done: fib(${n}) = ${v}. ${calls} calls (${hits} were instant cache hits); the UN-memoized recursion makes ${naive} calls for the same answer`,
      { snapshot: snap(), highlight: { done: doneCells() } });
    return t.trace();
  }

  /** fibNaive(n) — top-down Fibonacci with NO memo, for racing against fib(n).
      Two rows: the value of each fib(k), and how many times it has been
      computed. One frame per call, so the trace length IS the call count
      (2·fib(n+1)−1) — lockstep against the memoized trace, the gap is the
      whole story. The "times" row ends as Fibonacci numbers themselves:
      fib(k) is computed fib(n−k+1) times. */
  fibNaive(n = 10) {
    n = Math.max(2, Math.min(Math.trunc(n) || 10, 16)); // 2·fib(17)−1 = 3193 calls — keep the trace recordable
    const t = new Tracer();
    const cells = grid(2, n + 1);
    const colLabels = []; for (let k = 0; k <= n; k++) colLabels.push(String(k));
    const rowLabels = ["value", "times"];
    this._setTable(2, n + 1, cells, rowLabels, colLabels);
    const snap = () => ({ rows: 2, cols: n + 1, cells: cloneRows(cells), rowLabels, colLabels });
    const doneCells = () => { const out = []; for (let k = 0; k <= n; k++) if (cells[0][k] !== "") out.push([0, k], [1, k]); return out; };
    let calls = 0, recomputes = 0;
    t.step(`fib(${n}) naive: recurse and NEVER remember — watch the "times" row count the waste`,
      { snapshot: snap(), highlight: {} });
    const go = (k) => {
      calls++; t.count("call");
      const again = cells[0][k] !== "";
      if (again) { recomputes++; t.count("recompute"); }
      cells[1][k] = again ? cells[1][k] + 1 : 1;
      if (k <= 1) {
        cells[0][k] = k; t.count("write");
        t.step(`fib(${k}) = ${k} (base)${again ? ` — for the ${cells[1][k]}th time` : ""}`,
          { snapshot: snap(), highlight: { active: [[0, k], [1, k]], done: doneCells() } });
        return k;
      }
      t.step(again
        ? `fib(${k}) AGAIN (${cells[1][k]}× now) — a memo would skip this whole subtree`
        : `fib(${k}): need fib(${k - 1}) and fib(${k - 2}) — recurse`,
        { snapshot: snap(), highlight: { active: [[0, k], [1, k]], done: doneCells() } });
      const v = go(k - 1) + go(k - 2);
      cells[0][k] = v; t.count("write");
      return v;
    };
    const v = go(n);
    this.summary = `naive fib(${n}) = ${v} — ${calls} calls, ${recomputes} of them recomputing a value already known`;
    t.step(`done: fib(${n}) = ${v} after ${calls} calls — ${recomputes} recomputed values a memo would have cached`,
      { snapshot: snap(), highlight: { done: doneCells() } });
    return t.trace();
  }

  /** fibTwoVar(n) — the tabulated + 2-variables version (the L14 slide code:
      a=0, b=1; n times: c=a+b, slide the window). Rendered as a table that is
      only ever TWO cells wide — Θ(1) space made visible. One frame per
      addition, so it races honestly against fib()/fibNaive(). */
  fibTwoVar(n = 10) {
    n = Math.max(2, Math.min(Math.trunc(n) || 10, 16));
    const t = new Tracer();
    const cells = grid(1, 2); cells[0][0] = 0; cells[0][1] = 1;
    const rowLabels = [""], colLabels = ["a", "b"];
    this._setTable(1, 2, cells, rowLabels, colLabels);
    const snap = () => ({ rows: 1, cols: 2, cells: cloneRows(cells), rowLabels, colLabels });
    t.count("write", 2);
    t.step(`fib(${n}) with two variables: a = 0, b = 1 — the whole memory`,
      { snapshot: snap(), highlight: { done: [[0, 0], [0, 1]] } });
    let a = 0, b = 1;
    for (let i = 0; i < n; i++) {
      const c = a + b; a = b; b = c;
      t.count("add").count("write", 2);
      cells[0][0] = a; cells[0][1] = b;
      t.step(`i = ${i}: c = a + b = ${c}; slide → a = ${a}, b = ${b}`,
        { snapshot: snap(), highlight: { active: [[0, 0], [0, 1]] } });
    }
    this.summary = `fib(${n}) = ${a} — ${n} additions, never more than two cells of memory`;
    t.step(`done: return a = ${a} — ${n} additions, and the table never grew past TWO cells`,
      { snapshot: snap(), highlight: { done: [[0, 0], [0, 1]] } });
    return t.trace();
  }

  /** rodCut(prices, n) — the first OPTIMIZATION DP: best[len] = max over every
      first cut i of price[i] + best[len-i]. Three rows, so the whole method is
      on screen at once: the GIVEN price row, the best[] row being filled, and
      the cut[] row that records which first cut won — the traceback then walks
      cut[] back from n, which is why the choice is stored at all. One frame per
      CANDIDATE, so the Theta(n^2) is not asserted but counted: length len tries
      len candidates, and the trace is the triangular sum. */
  rodCut(prices = [1, 5, 8, 9], n = null) {
    const clean = (Array.isArray(prices) ? prices : []).slice(0, 12).map((p) => Math.max(0, Math.trunc(p) || 0));
    const price = [0, ...(clean.length ? clean : [1, 5, 8, 9])];   // an empty list would leave nothing to cut
    const K = price.length - 1;                                   // longest priced piece
    n = Math.max(1, Math.min(Math.trunc(n) || K, K));             // no piece longer than the price list
    const t = new Tracer();
    const cells = grid(3, n + 1);
    for (let len = 0; len <= n; len++) cells[0][len] = len === 0 ? "—" : price[len];
    const rowLabels = ["price", "best", "cut"];
    const colLabels = Array.from({ length: n + 1 }, (_, len) => String(len));
    this._setTable(3, n + 1, cells, rowLabels, colLabels);
    const snap = () => ({ rows: 3, cols: n + 1, cells: cloneRows(cells), rowLabels, colLabels });
    const priceRow = () => Array.from({ length: n + 1 }, (_, len) => [0, len]);
    const filled = (upto) => { const out = priceRow(); for (let len = 0; len <= upto; len++) out.push([1, len], [2, len]); return out; };

    cells[1][0] = 0; cells[2][0] = "—"; t.count("write");
    t.step(`rod of length ${n}, prices ${price.slice(1).join(", ")} for lengths 1..${K} — base case: best[0] = 0, an empty rod earns nothing`,
      { snapshot: snap(), highlight: { active: [[1, 0]], done: priceRow() } });

    for (let len = 1; len <= n; len++) {
      let m = -1, ci = 0;
      t.step(`best[${len}]: try EVERY first cut i = 1..${len}, then keep the largest price[i] + best[${len}−i]`,
        { snapshot: snap(), highlight: { active: [[1, len]], done: filled(len - 1) } });
      for (let i = 1; i <= len; i++) {
        const cand = price[i] + cells[1][len - i];
        t.count("compare").count("read", 2);
        const wins = cand > m;
        if (wins) { m = cand; ci = i; }
        t.step(`  i = ${i}: price[${i}] + best[${len - i}] = ${price[i]} + ${cells[1][len - i]} = ${cand}`
          + (wins ? ` — new best (cut ${i})` : ` — no better than ${m}`),
          { snapshot: snap(), highlight: { active: [[1, len]], from: [[0, i], [1, len - i]], done: filled(len - 1) } });
      }
      cells[1][len] = m; cells[2][len] = ci; t.count("write", 2);
      t.step(`best[${len}] = ${m}, achieved by first cut ${ci} → record cut[${len}] = ${ci} for the traceback`,
        { snapshot: snap(), highlight: { active: [[1, len], [2, len]], done: filled(len - 1) } });
    }

    // traceback: take the recorded first cut, subtract, repeat — the cuts fall out
    const pieces = []; const path = [];
    let k = n;
    while (k > 0) {
      const i = cells[2][k];
      if (!(i >= 1)) break;           // every recorded cut is >= 1, so this terminates
      pieces.push(i);
      path.push([2, k]);
      t.step(`traceback: cut[${k}] = ${i} — take a length-${i} piece (worth ${price[i]}), ${k - i} of the rod left`,
        { snapshot: snap(), highlight: { path: [...path], done: filled(n) } });
      k -= i;
    }
    const value = cells[1][n];
    const whole = price[n] ?? 0;
    this.summary = `rod ${n}: best = ${value} by cutting ${pieces.join(" + ")}`
      + (n <= K ? ` (selling it whole earns ${whole})` : "");
    t.step(`done — best[${n}] = ${value}, cuts ${pieces.join(" + ")}. ${pieces.length === 1 ? "Here the whole rod wins" : `Selling the rod whole would earn only ${whole}`}. `
      + `${(n * (n + 1)) / 2} candidates tried = ${n}·${n + 1}/2 — n subproblems × O(n) choices each, which is the Θ(n²)`,
      { snapshot: snap(), highlight: { path, done: filled(n) } });
    return t.trace();
  }

  /** rodCutNaive(prices, n) — rod cutting with NO table, for racing against
      rodCut(). Two rows: the value of each length, and how many times that
      length has been re-solved. One frame per call, so the trace length IS the
      call count — and that count is exactly 2^n, since cut(len) calls
      cut(len-1) ... cut(0) and T(n) = 1 + sum of all smaller T. The "times"
      row ends as POWERS OF TWO read backwards (cut(n-m) is solved 2^(m-1)
      times), the same self-measuring shape as naive Fibonacci's row. */
  rodCutNaive(prices = [1, 5, 8, 9], n = null) {
    const clean = (Array.isArray(prices) ? prices : []).slice(0, 12).map((p) => Math.max(0, Math.trunc(p) || 0));
    const price = [0, ...(clean.length ? clean : [1, 5, 8, 9])];
    const K = price.length - 1;
    n = Math.max(1, Math.min(Math.trunc(n) || K, K, 12));          // 2^12 = 4096 calls — keep the trace recordable
    const t = new Tracer();
    const cells = grid(2, n + 1);
    const rowLabels = ["value", "times"];
    const colLabels = Array.from({ length: n + 1 }, (_, len) => String(len));
    this._setTable(2, n + 1, cells, rowLabels, colLabels);
    const snap = () => ({ rows: 2, cols: n + 1, cells: cloneRows(cells), rowLabels, colLabels });
    const doneCells = () => { const out = []; for (let k = 0; k <= n; k++) if (cells[0][k] !== "") out.push([0, k], [1, k]); return out; };
    let calls = 0, again = 0;

    t.step(`rod ${n} with NO table: try every first cut and re-solve the remainder from scratch, every time`,
      { snapshot: snap(), highlight: {} });
    const go = (len) => {
      calls++; t.count("call");
      const seen = cells[0][len] !== "";
      if (seen) { again++; t.count("recompute"); }
      cells[1][len] = seen ? cells[1][len] + 1 : 1;
      if (len === 0) {
        cells[0][0] = 0; t.count("write");
        t.step(`cut(0) = 0 (base)${seen ? ` — for the ${cells[1][0]}th time` : ""}`,
          { snapshot: snap(), highlight: { active: [[0, 0], [1, 0]], done: doneCells() } });
        return 0;
      }
      t.step(seen
        ? `cut(${len}) AGAIN (${cells[1][len]}× now) — a table would have this already`
        : `cut(${len}): try first cuts 1..${len}, each needing the rest solved`,
        { snapshot: snap(), highlight: { active: [[0, len], [1, len]], done: doneCells() } });
      let m = -1;
      for (let i = 1; i <= len; i++) { const v = price[i] + go(len - i); if (v > m) m = v; t.count("compare"); }
      cells[0][len] = m; t.count("write");
      return m;
    };
    const v = go(n);
    this.summary = `naive rod ${n}: best = ${v} — ${calls} calls (2^${n} = ${2 ** n}), ${again} of them re-solving a length already solved`;
    t.step(`done — best = ${v} after ${calls} calls, exactly 2^${n}. ${again} were lengths already solved; the table version needs ${(n * (n + 1)) / 2} candidates`,
      { snapshot: snap(), highlight: { done: doneCells() } });
    return t.trace();
  }

  /** rodCutTree(prices, n) — the SUBPROBLEM TREE, which is what the table is an
      optimization of. A node is a remaining length, an edge is the first piece
      taken, so a root-to-cut(0) path IS one complete cutting of the rod and the
      leaves enumerate ALL of them: 2^(n-1) compositions of n, out of 2^n nodes.
      The walk scores every cutting, the optimum ends up the only green path,
      and the last frames tint by length to show why the tree is wasteful —
      2^n nodes over only n+1 distinct subproblems. Capped at n = 5 (32 nodes):
      past that the picture stops being readable, which is itself the argument
      for the table. */
  /** The rod-cutting recursion tree, built once. Shared by the three tree views
      (enumerate / memoized / the tabulated forest is built differently), so
      they cannot disagree about the shape. Node keys are UNIQUE ids and the
      displayed length is `label`: highlights are by key, and cut(2) appears
      many times, so keying by the value would light up every copy. */
  _rodTree(prices, n) {
    const clean = (Array.isArray(prices) ? prices : []).slice(0, 12).map((p) => Math.max(0, Math.trunc(p) || 0));
    const price = [0, ...(clean.length ? clean : [1, 5, 8, 9])];
    const K = price.length - 1;
    n = Math.max(1, Math.min(Math.trunc(n) || 4, K, 5));   // 2^5 = 32 nodes is the readable limit
    let id = 0;
    const build = (len, edge) => {
      const node = { key: `n${id++}`, label: String(len), len, value: "" };   // "" = a cell waiting to be filled
      if (edge != null) { node.edge = edge; node.edgePrice = price[edge]; }
      node.kids = [];
      for (let i = 1; i <= len; i++) node.kids.push(build(len - i, i));
      return node;
    };
    const root = build(n, null);
    const clone = (x) => ({ ...x, kids: x.kids.map(clone) });
    return { price, n, root, t: new Tracer(), snap: () => clone(root), clone };
  }

  rodCutTree(prices = [1, 5, 8, 9], n = null) {
    const built = this._rodTree(prices, n);
    const { price, root, t, snap } = built;
    n = built.n;

    // every root-to-leaf path, in the order the recursion would walk them
    const cuttings = [];
    (function walk(node, taken, path) {
      if (!node.kids.length) { cuttings.push({ leaf: node, cuts: taken.slice(), path: path.concat(node.key) }); return; }
      node.kids.forEach((c) => { taken.push(c.edge); walk(c, taken, path.concat(node.key)); taken.pop(); });
    })(root, [], []);

    const total = (cuts) => cuts.reduce((a, i) => a + price[i], 0);
    const nodeCount = 2 ** n;
    this._setTable(0, 0, grid(0, 0), null, null);

    t.step(`every way to cut a rod of ${n}: a node is the length still to cut, an edge is the piece taken. ${nodeCount} nodes, ${cuttings.length} leaves — and each leaf is one COMPLETE cutting`,
      { snapshot: snap(), highlight: {} });

    let best = -1, bestIdx = -1;
    cuttings.forEach((c, k) => {
      const v = total(c.cuts);
      t.count("compare");
      const better = v > best;
      if (better) { best = v; bestIdx = k; }
      const sum = c.cuts.length > 1 ? `${c.cuts.map((i) => price[i]).join(" + ")} = ${v}` : `${v}`;
      t.step(`cutting ${k + 1} of ${cuttings.length}: ${c.cuts.join(" + ")} → ${sum}`
        + (better ? `  ← best so far` : `  (best is still ${best})`),
        { snapshot: snap(), highlight: { path: c.path.slice(0, -1), cur: [c.leaf.key] } });
    });

    const win = cuttings[bestIdx];
    const others = cuttings.filter((_, k) => k !== bestIdx).map((c) => total(c.cuts)).sort((a, b) => b - a);
    this.summary = `rod ${n}: ${cuttings.length} cuttings, best = ${best} by ${win.cuts.join(" + ")}`;
    t.step(`all ${cuttings.length} scored — the optimum is ${win.cuts.join(" + ")} = ${best}; the rest score ${others.join(", ")}. Every one of them was a path in this tree`,
      { snapshot: snap(), highlight: {} });

    // Now fill in what each NODE is worth: the best obtainable for the length it
    // still has to cut. By LENGTH, shortest first — NOT by tree depth, which
    // would light the cut(0) nodes up once per level (they occur at every
    // depth) and read as the leaves being revisited. Length is also the axis
    // the table fills along, so this pass is the bottom-up order, drawn on the
    // tree before the table is ever mentioned.
    const byLen = []; (function d(node) { (byLen[node.len] ||= []).push(node); node.kids.forEach(d); })(root);
    for (let len = 0; len <= n; len++) {
      const group = byLen[len] || [];
      if (!group.length) continue;
      group.forEach((node) => {
        node.value = node.kids.length ? Math.max(...node.kids.map((c) => price[c.edge] + c.value)) : 0;
      });
      const v = group[0].value;
      t.step(len === 0
        ? `now work out what each node is WORTH — shortest length first. All ${group.length} cut(0) nodes are worth 0: an empty rod earns nothing`
        : group.length === 1
          ? `cut(${len}) = ${v} — the max over its edges of price + the child's value. This length occurs once in the tree`
          : `all ${group.length} cut(${len}) nodes are worth the SAME ${v} — each is the max over its edges of price + the child's value, and they are the same subproblem, so they cannot differ. The tree computes it ${group.length} times anyway`,
        { snapshot: snap(), highlight: { cur: group.map((x) => x.key) } });
    }
    t.step(`the root reads ${best} — and the green chain is where it came from: each node's value is the badge above the child plus that child's value (${win.cuts.map((i) => price[i]).join(" + ")} = ${best})`,
      { snapshot: snap(), highlight: { best: win.path } });

    // whole-rod and greedy-by-ratio, named on the same picture
    const whole = cuttings.find((c) => c.cuts.length === 1 && c.cuts[0] === n);
    if (whole && whole !== win) {
      t.step(`selling it WHOLE is just another path — one edge, ${price[n]}, against the optimum's ${best}`,
        { snapshot: snap(), highlight: { best: win.path, danger: [whole.leaf.key] } });
    }

    // the same tree, tinted by length: this is the overlap, and the reason a
    // table exists at all
    const TINTS = ["#9aa3b5", "#4285f4", "#ea4335", "#f9ab00", "#1e8e3e", "#a142f4"];
    const counts = {};
    (function mark(node) { counts[node.len] = (counts[node.len] || 0) + 1; node.tint = TINTS[node.len % TINTS.length]; node.kids.forEach(mark); })(root);
    const tally = Object.keys(counts).map(Number).sort((a, b) => b - a)
      .map((len) => `cut(${len})×${counts[len]}`).join(" · ");
    t.step(`now colour by LENGTH: ${tally}. ${nodeCount} nodes, but only ${n + 1} distinct subproblems — every repeat is a subtree recomputed from scratch`,
      { snapshot: snap(), highlight: {} });
    t.step(`that is what the table removes: solve each of the ${n + 1} lengths once, in order, and the ${nodeCount} nodes collapse to ${n + 1} cells. The tree is the definition; the table is the implementation`,
      { snapshot: snap(), highlight: { best: win.path } });
    return t.trace();
  }

  /** rodCutTreeMemo(prices, n) — the SAME tree, walked top-down WITH a memo, so
      the saving is visible as absence: the first time a length is reached its
      subtree is explored; every later time the subtree stays on screen but
      greys out and the node reports the cached value. What is left lit is what
      the recursion actually visits — exactly 1 + n(n+1)/2 nodes, the root plus
      the table's candidate count, against the full tree's 2^n. */
  rodCutTreeMemo(prices = [1, 5, 8, 9], n = null) {
    const { price, n: N, root, t, snap, clone } = this._rodTree(prices, n);
    const memo = {}, visited = new Set(), skipped = new Set();
    const subtree = (node, out = []) => { out.push(node.key); node.kids.forEach((c) => subtree(c, out)); return out; };
    const fadedNow = () => [...skipped];

    t.step(`same tree, but top-down WITH a memo: the first time a length is reached we solve it, every later time we look it up`,
      { snapshot: snap(), highlight: {} });

    const solve = (node, path) => {
      visited.add(node.key);
      if (node.len in memo) {
        // the cache hit: this whole subtree never happens
        const drop = subtree(node).slice(1);
        drop.forEach((k) => skipped.add(k));
        node.value = memo[node.len];
        t.count("cache-hit");
        t.step(drop.length
          ? `cut(${node.len}) again — memo says ${memo[node.len]}. The ${drop.length} node${drop.length === 1 ? "" : "s"} below it never get${drop.length === 1 ? "s" : ""} explored`
          : `cut(${node.len}) again — memo says ${memo[node.len]}: a lookup instead of a call, even at a base case`,
          { snapshot: snap(), highlight: { path, done: [node.key], faded: fadedNow() } });
        return memo[node.len];
      }
      if (!node.kids.length) {
        memo[0] = 0; node.value = 0;
        t.step(`cut(0) = 0 — the rod is used up (base case, solved once)`,
          { snapshot: snap(), highlight: { path, cur: [node.key], faded: fadedNow() } });
        return 0;
      }
      t.step(`cut(${node.len}) for the FIRST time — try every first cut 1..${node.len}`,
        { snapshot: snap(), highlight: { path, cur: [node.key], faded: fadedNow() } });
      let best = -1, bi = 0;
      for (const c of node.kids) {
        const v = price[c.edge] + solve(c, path.concat(node.key));
        t.count("compare");
        if (v > best) { best = v; bi = c.edge; }
      }
      memo[node.len] = best; node.value = best;
      t.step(`cut(${node.len}) = ${best} (first cut ${bi}) → into the memo, and it is never computed again`,
        { snapshot: snap(), highlight: { path, done: [node.key], faded: fadedNow() } });
      return best;
    };
    const best = solve(root, []);

    // the optimal path, read back off the tree: at each node take the child
    // whose price + value is the node's own value
    const bestPath = []; const reusedAt = []; const cutsTaken = []; {
      // where each length was actually SOLVED (the first, expanded occurrence)
      const solvedAt = {}, byKey = {};
      (function scan(node) {
        byKey[node.key] = node;
        if (!skipped.has(node.key) && Number.isFinite(node.value) && !(node.len in solvedAt)) solvedAt[node.len] = node.key;
        node.kids.forEach(scan);
      })(root);
      let node = root;
      while (node) {
        bestPath.push(node.key);
        const nxt = node.kids.find((c) => Number.isFinite(c.value) && price[c.edge] + c.value === node.value);
        if (!nxt) {
          // the chain ends here. If this node still has rod left, its answer came
          // from the CACHE and the cutting behind it was solved elsewhere.
          if (node.len > 0 && solvedAt[node.len] && solvedAt[node.len] !== node.key) {
            // walk the optimal continuation from where that length WAS solved,
            // so the reused value is shown being assembled, not just pointed at
            let at = byKey[solvedAt[node.len]];
            while (at) {
              reusedAt.push(at.key);
              at = at.kids.find((c) => Number.isFinite(c.value) && price[c.edge] + c.value === at.value);
            }
          }
          break;
        }
        cutsTaken.push(nxt.edge);
        node = nxt;
      }
    }
    const full = 2 ** N, live = visited.size;
    this.summary = `rod ${N} memoized: best = ${best} — ${live} nodes visited of ${full} (${full - live} skipped by the cache)`;
    t.step(`done — best = ${best} by ${cutsTaken.join(" + ")}${cutsTaken.reduce((a, i) => a + i, 0) < N ? " + …" : ""}. Lit: ${live} nodes = 1 + ${N}·${N + 1}/2, the root plus the table's ${(N * (N + 1)) / 2} candidates. Greyed: ${full - live} of the full tree's ${full} — that is what one cache did`,
      { snapshot: snap(), highlight: { faded: fadedNow(), best: bestPath } });
    if (reusedAt.length) {
      t.step(`the green chain stops where the CACHE answered. That value was computed earlier, elsewhere in the tree — the node now also green — and looked up here. That is the whole trick: the answer is assembled from cells solved once, wherever they were first reached`,
        { snapshot: snap(), highlight: { faded: fadedNow(), best: bestPath.concat(reusedAt) } });
    }
    return t.trace();
  }

  /** rodCutTreeTab(prices, n) — the same computation BOTTOM-UP: no recursion and
      no pruning, because nothing is ever explored twice in the first place.
      Drawn as a forest that grows left to right, one small tree per length in
      the order the loop fills them, each showing the already-computed cells it
      reads. n+1 cells and n(n+1)/2 links — the same n(n+1)/2 the table demo
      counts as candidates, which is the point: the tree, pruned, IS the table. */
  rodCutTreeTab(prices = [1, 5, 8, 9], n = null) {
    const clean = (Array.isArray(prices) ? prices : []).slice(0, 12).map((p) => Math.max(0, Math.trunc(p) || 0));
    const price = [0, ...(clean.length ? clean : [1, 5, 8, 9])];
    const K = price.length - 1;
    // no 2^n anywhere in this view — it is n+1 cells and n(n+1)/2 links — so it
    // runs well past the tree views' cap; two rows keep it legible
    const N = Math.max(1, Math.min(Math.trunc(n) || 4, K, 8));
    const t = new Tracer();
    const best = [0], cut = [0];
    let links = 0;

    // solve first, so every subtree can be laid out at its FINAL position from
    // frame 1 and then revealed — the picture never reflows under the reader
    for (let len = 1; len <= N; len++) {
      let m = -1, ci = 0;
      for (let i = 1; i <= len; i++) { const v = price[i] + best[len - i]; if (v > m) { m = v; ci = i; } }
      best[len] = m; cut[len] = ci;
    }
    // Row packing by LEAF COUNT, not by cell count: length len contributes len
    // leaf cells, so the rows would be wildly uneven otherwise (0..4 is ten
    // cells, 5..8 is twenty-six). Target ~10 slots a row, which is what a
    // two-compartment node can hold legibly at this width.
    const SLOTS = 14;
    const rowOf = []; { let row = 0, used = 0;
      for (let len = 0; len <= N; len++) {
        const w = Math.max(1, len);
        if (used && used + w > SLOTS) { row++; used = 0; }
        rowOf[len] = row; used += w;
      } }
    const roots = [];
    for (let len = 0; len <= N; len++) {
      const node = { key: `L${len}`, label: String(len), value: best[len], ghost: true, row: rowOf[len], kids: [] };
      for (let i = 1; i <= len; i++) {
        node.kids.push({ key: `L${len}r${i}`, label: String(len - i), value: best[len - i], edge: i, edgePrice: price[i], ghost: true, kids: [] });
        links++;
      }
      roots.push(node);
    }
    const clone = (x) => ({ ...x, kids: (x.kids || []).map(clone) });
    const snap = () => roots.map(clone);
    const reveal = (len) => { roots[len].ghost = false; roots[len].kids.forEach((k) => { k.ghost = false; }); };

    t.step(`bottom-up: ${N + 1} cells, filled smallest first. Every position is already fixed — the cells appear in the order the loop writes them, and each shows the cells it reads`,
      { snapshot: snap(), highlight: {} });
    reveal(0);
    t.step(`best[0] = 0 — an empty rod earns nothing. No recursion, no exploration: this cell is just written`,
      { snapshot: snap(), highlight: { done: ["L0"] } });

    for (let len = 1; len <= N; len++) {
      reveal(len);
      const cand = roots[len].kids.map((k) => `${price[k.edge]}+${best[+k.label]}`).join(", ");
      t.count("read", len).count("compare", len);
      t.step(`best[${len}]: read the ${len} cell${len === 1 ? "" : "s"} below — ${cand}`,
        { snapshot: snap(), highlight: { cur: [`L${len}`] } });
      t.count("write");
      t.step(`best[${len}] = ${best[len]}, first cut ${cut[len]}. Written once, never revisited`,
        { snapshot: snap(), highlight: { done: [`L${len}`] } });
    }

    const pieces = []; let k = N;
    while (k > 0 && cut[k] >= 1) { pieces.push(cut[k]); k -= cut[k]; }
    // the optimal path across the cells: best[N] -> best[N-cut[N]] -> …
    const bestKeys = []; { let j = N; while (j > 0 && cut[j] >= 1) { bestKeys.push(`L${j}`, `L${j}r${cut[j]}`); j -= cut[j]; } bestKeys.push("L0"); }
    this.summary = `rod ${N} tabulated: best = ${best[N]} by ${pieces.join(" + ")} — ${N + 1} cells, ${links} links`;
    t.step(`done — best[${N}] = ${best[N]} by ${pieces.join(" + ")}, the green chain: each cell's winning link points at the cell that produced it. ${N + 1} cells and ${links} links = ${N}·${N + 1}/2, against ${2 ** N} nodes in the full tree`,
      { snapshot: snap(), highlight: { best: bestKeys, done: roots.map((r) => r.key) } });
    return t.trace();
  }

  /** lcs(a,b) — fill the (|a|+1)x(|b|+1) length table, then traceback the subsequence itself. */
  lcs(a = "AGCAT", b = "GAC") {
    a = String(a || "AGCAT").toUpperCase().slice(0, 12); // keep the table readable
    b = String(b || "GAC").toUpperCase().slice(0, 12);
    const t = new Tracer();
    const n = a.length, m = b.length;
    const cells = grid(n + 1, m + 1);
    for (let i = 0; i <= n; i++) cells[i][0] = 0;
    for (let j = 0; j <= m; j++) cells[0][j] = 0;
    const rowLabels = ["", ...a.split("")], colLabels = ["", ...b.split("")];
    this._setTable(n + 1, m + 1, cells, rowLabels, colLabels);
    const snap = () => ({ rows: n + 1, cols: m + 1, cells: cloneRows(cells), rowLabels, colLabels });
    const doneSoFar = (i, j) => {
      const out = [];
      for (let r = 0; r <= n; r++) for (let c = 0; c <= m; c++) {
        if (r === 0 || c === 0 || r < i || (r === i && c < j)) out.push([r, c]);
      }
      return out;
    };
    const fullDone = () => { const out = []; for (let r = 0; r <= n; r++) for (let c = 0; c <= m; c++) out.push([r, c]); return out; };

    t.count("write", n + m + 1);
    t.step(`LCS("${a}", "${b}"): base row/column are 0 — an empty prefix shares no characters`,
      { snapshot: snap(), highlight: { done: doneSoFar(1, 1) } });

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        t.count("compare");
        if (a[i - 1] === b[j - 1]) {
          cells[i][j] = cells[i - 1][j - 1] + 1; t.count("read").count("write");
          t.step(`a[${i - 1}]='${a[i - 1]}' == b[${j - 1}]='${b[j - 1]}' → dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${cells[i][j]}`,
            { snapshot: snap(), highlight: { active: [[i, j]], from: [[i - 1, j - 1]], done: doneSoFar(i, j) } });
        } else {
          const up = cells[i - 1][j], left = cells[i][j - 1]; t.count("read", 2);
          cells[i][j] = Math.max(up, left); t.count("write");
          t.step(`'${a[i - 1]}' != '${b[j - 1]}' → dp[${i}][${j}] = max(up=${up}, left=${left}) = ${cells[i][j]}`,
            { snapshot: snap(), highlight: { active: [[i, j]], from: [[i - 1, j], [i, j - 1]], done: doneSoFar(i, j) } });
        }
      }
    }

    // traceback: walk from the bottom-right corner, taking diagonal matches
    let i = n, j = m; const chars = []; const path = [[i, j]];
    while (i > 0 && j > 0) {
      t.count("compare");
      if (a[i - 1] === b[j - 1]) {
        chars.push(a[i - 1]);
        t.step(`traceback: '${a[i - 1]}' matches — take it, move diagonally to dp[${i - 1}][${j - 1}]`,
          { snapshot: snap(), highlight: { path: [...path], done: fullDone() } });
        i--; j--;
      } else if (cells[i - 1][j] >= cells[i][j - 1]) {
        t.step(`traceback: dp[${i - 1}][${j}]=${cells[i - 1][j]} ≥ dp[${i}][${j - 1}]=${cells[i][j - 1]} — move up`,
          { snapshot: snap(), highlight: { path: [...path], done: fullDone() } });
        i--;
      } else {
        t.step(`traceback: dp[${i}][${j - 1}]=${cells[i][j - 1]} > dp[${i - 1}][${j}]=${cells[i - 1][j]} — move left`,
          { snapshot: snap(), highlight: { path: [...path], done: fullDone() } });
        j--;
      }
      path.push([i, j]);
    }
    const result = chars.reverse().join("");
    this.summary = `LCS("${a}", "${b}") = "${result}" (length ${cells[n][m]})`;
    t.step(`done — LCS = "${result}", length ${cells[n][m]}`, { snapshot: snap(), highlight: { path, done: fullDone() } });
    return t.trace();
  }

  /** knapsack(items, W) — fill the (n+1)x(W+1) value table, then traceback which items were taken. */
  knapsack(items = DEFAULT_ITEMS, W = 5) {
    W = Math.max(1, Math.min(Math.trunc(W) || 5, 12)); // keep the table readable
    const t = new Tracer();
    const n = items.length;
    const cells = grid(n + 1, W + 1);
    for (let i = 0; i <= n; i++) cells[i][0] = 0;
    for (let w = 0; w <= W; w++) cells[0][w] = 0;
    const rowLabels = ["∅", ...items.map((it) => `${it.name} w${it.w}/v${it.v}`)];
    const colLabels = Array.from({ length: W + 1 }, (_, w) => String(w));
    this._setTable(n + 1, W + 1, cells, rowLabels, colLabels);
    const snap = () => ({ rows: n + 1, cols: W + 1, cells: cloneRows(cells), rowLabels, colLabels });
    const doneSoFar = (i, w) => {
      const out = [];
      for (let r = 0; r <= n; r++) for (let c = 0; c <= W; c++) {
        if (r === 0 || c === 0 || r < i || (r === i && c < w)) out.push([r, c]);
      }
      return out;
    };
    const fullDone = () => { const out = []; for (let r = 0; r <= n; r++) for (let c = 0; c <= W; c++) out.push([r, c]); return out; };

    t.count("write", n + W + 1);
    t.step(`0/1 knapsack, capacity ${W}: base row/column are 0 — no items or no capacity means value 0`,
      { snapshot: snap(), highlight: { done: doneSoFar(1, 1) } });

    for (let i = 1; i <= n; i++) {
      const { w: wt, v: val, name } = items[i - 1];
      for (let w = 0; w <= W; w++) {
        t.count("compare");
        if (wt > w) {
          cells[i][w] = cells[i - 1][w]; t.count("read").count("write");
          t.step(`item ${name} (w=${wt}) doesn't fit in capacity ${w} → dp[${i}][${w}] = dp[${i - 1}][${w}] = ${cells[i][w]}`,
            { snapshot: snap(), highlight: { active: [[i, w]], from: [[i - 1, w]], done: doneSoFar(i, w) } });
        } else {
          const skip = cells[i - 1][w], take = val + cells[i - 1][w - wt]; t.count("read", 2);
          cells[i][w] = Math.max(skip, take); t.count("write");
          t.step(`item ${name} (w=${wt}, v=${val}): dp[${i}][${w}] = max(skip=${skip}, take=${val}+dp[${i - 1}][${w - wt}]=${take}) = ${cells[i][w]}`,
            { snapshot: snap(), highlight: { active: [[i, w]], from: [[i - 1, w], [i - 1, w - wt]], done: doneSoFar(i, w) } });
        }
      }
    }

    // traceback: item i-1 was taken iff dp[i][w] != dp[i-1][w]
    let i = n, w = W; const chosen = []; const path = [[i, w]];
    while (i > 0) {
      t.count("compare");
      if (cells[i][w] !== cells[i - 1][w]) {
        chosen.push(items[i - 1].name);
        t.step(`traceback: dp[${i}][${w}] != dp[${i - 1}][${w}] — item ${items[i - 1].name} was taken`,
          { snapshot: snap(), highlight: { path: [...path], done: fullDone() } });
        w -= items[i - 1].w;
      } else {
        t.step(`traceback: dp[${i}][${w}] == dp[${i - 1}][${w}] — item ${items[i - 1].name} was not taken`,
          { snapshot: snap(), highlight: { path: [...path], done: fullDone() } });
      }
      i--;
      path.push([i, w]);
    }
    chosen.reverse();
    this.summary = `knapsack(W=${W}) optimal value = ${cells[n][W]}, items taken: {${chosen.join(", ")}}`;
    t.step(`done — optimal value ${cells[n][W]}, chosen items {${chosen.join(", ")}}`, { snapshot: snap(), highlight: { path, done: fullDone() } });
    return t.trace();
  }

  /** editDistance(a,b) — fill the (|a|+1)x(|b|+1) Levenshtein table, then traceback the edit script. */
  editDistance(a = "kitten", b = "sitting") {
    a = String(a || "kitten").slice(0, 12); // keep the table readable
    b = String(b || "sitting").slice(0, 12);
    const t = new Tracer();
    const n = a.length, m = b.length;
    const cells = grid(n + 1, m + 1);
    for (let i = 0; i <= n; i++) cells[i][0] = i;
    for (let j = 0; j <= m; j++) cells[0][j] = j;
    const rowLabels = ["", ...a.split("")], colLabels = ["", ...b.split("")];
    this._setTable(n + 1, m + 1, cells, rowLabels, colLabels);
    const snap = () => ({ rows: n + 1, cols: m + 1, cells: cloneRows(cells), rowLabels, colLabels });
    const doneSoFar = (i, j) => {
      const out = [];
      for (let r = 0; r <= n; r++) for (let c = 0; c <= m; c++) {
        if (r === 0 || c === 0 || r < i || (r === i && c < j)) out.push([r, c]);
      }
      return out;
    };
    const fullDone = () => { const out = []; for (let r = 0; r <= n; r++) for (let c = 0; c <= m; c++) out.push([r, c]); return out; };

    t.count("write", n + m + 1);
    t.step(`edit distance("${a}", "${b}"): base row/col = index — delete or insert the whole prefix`,
      { snapshot: snap(), highlight: { done: doneSoFar(1, 1) } });

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        t.count("compare");
        if (a[i - 1] === b[j - 1]) {
          cells[i][j] = cells[i - 1][j - 1]; t.count("read").count("write");
          t.step(`'${a[i - 1]}' == '${b[j - 1]}' → no edit needed, dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${cells[i][j]}`,
            { snapshot: snap(), highlight: { active: [[i, j]], from: [[i - 1, j - 1]], done: doneSoFar(i, j) } });
        } else {
          const del = cells[i - 1][j], ins = cells[i][j - 1], rep = cells[i - 1][j - 1]; t.count("read", 3);
          cells[i][j] = 1 + Math.min(del, ins, rep); t.count("write");
          t.step(`'${a[i - 1]}' != '${b[j - 1]}' → dp[${i}][${j}] = 1 + min(delete=${del}, insert=${ins}, replace=${rep}) = ${cells[i][j]}`,
            { snapshot: snap(), highlight: { active: [[i, j]], from: [[i - 1, j], [i, j - 1], [i - 1, j - 1]], done: doneSoFar(i, j) } });
        }
      }
    }

    // traceback: recover the edit script from the recurrence that produced each cell
    let i = n, j = m; const ops = []; const path = [[i, j]];
    while (i > 0 || j > 0) {
      t.count("compare");
      let msg;
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && cells[i][j] === cells[i - 1][j - 1]) {
        msg = `keep '${a[i - 1]}'`; i--; j--;
      } else if (i > 0 && j > 0 && cells[i][j] === cells[i - 1][j - 1] + 1) {
        msg = `replace '${a[i - 1]}' → '${b[j - 1]}'`; i--; j--;
      } else if (i > 0 && cells[i][j] === cells[i - 1][j] + 1) {
        msg = `delete '${a[i - 1]}'`; i--;
      } else {
        msg = `insert '${b[j - 1]}'`; j--;
      }
      ops.push(msg);
      path.push([i, j]);
      t.step(`traceback: ${msg}`, { snapshot: snap(), highlight: { path: [...path], done: fullDone() } });
    }
    ops.reverse();
    const edits = ops.filter((o) => !o.startsWith("keep")).length;
    this.summary = `editDistance("${a}", "${b}") = ${cells[n][m]}`;
    t.step(`done — edit distance = ${cells[n][m]} (${edits} edits: ${ops.join(", ")})`, { snapshot: snap(), highlight: { path, done: fullDone() } });
    return t.trace();
  }
}
