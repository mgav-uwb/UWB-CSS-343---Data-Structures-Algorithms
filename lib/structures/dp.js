// CSS 343 unified library — structures/dp.js
// Three classic dynamic-programming table fills, traced cell by cell onto the
// shared MatrixRenderer: LCS (longest common subsequence), 0/1 knapsack, and
// edit (Levenshtein) distance. Each fill highlights the ACTIVE cell being
// computed and the FROM cells its recurrence reads; a final traceback walks
// PATH cells back from the answer cell to recover the LCS string, the chosen
// knapsack items, or the edit script. Uncomputed interior cells render blank
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

  /** lcs(a,b) — fill the (|a|+1)x(|b|+1) length table, then traceback the subsequence itself. */
  lcs(a = "AGCAT", b = "GAC") {
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
