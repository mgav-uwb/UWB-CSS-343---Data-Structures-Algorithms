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
