// CSS 343 unified library — structures/string-search.js
// Substring search over a fixed text: brute force (try every shift, compare
// left-to-right, slide by ONE on a mismatch — worst case Θ(nm)) vs. Knuth-
// Morris-Pratt (precompute a failure/lps table for the pattern, then scan the
// text with i that NEVER backs up — worst case Θ(n+m)). Both are traced onto
// the shared ArrayRenderer: the snapshot is just the text as a character
// array; `pointers` shows the text index i (and, for KMP, the pattern index
// j) as labeled markers, `compare`/`danger` mark the cell just compared, and
// `done` marks the matched window once found. The pattern itself isn't drawn
// as a second row (ArrayRenderer draws one array) — the step message spells
// out the pattern-side comparison in words instead.

import { Tracer } from "../core/tracer.js";

const DEFAULT_TEXT = "ABABABCABABABCAB";
const DEFAULT_PATTERN = "ABABC";

export class StringSearch {
  constructor() { this.text = DEFAULT_TEXT; this.pattern = DEFAULT_PATTERN; }

  /** build([text, pattern]) — both missing/empty falls back to the default sample pair. */
  build(args) {
    const a = Array.isArray(args) ? args : [];
    this.text = (a[0] != null && a[0] !== "") ? String(a[0]) : DEFAULT_TEXT;
    this.pattern = (a[1] != null && a[1] !== "") ? String(a[1]) : DEFAULT_PATTERN;
    return this;
  }

  /** Display array: the text as individual characters — what ArrayRenderer draws. */
  snapshot() { return this.text.split(""); }
  inorder() { return `text "${this.text}" (n=${this.text.length}), pattern "${this.pattern}" (m=${this.pattern.length})`; }

  /** bruteForce() — try every shift 0..n-m; compare left-to-right; on a mismatch slide by ONE. */
  bruteForce() {
    const t = new Tracer();
    const text = this.text, pattern = this.pattern;
    const n = text.length, m = pattern.length;
    let foundAt = -1;
    t.step(`brute force: try every shift of "${pattern}" against "${text}"`, { snapshot: text.split(""), highlight: { pointers: { shift: 0 } } });
    let i;
    for (i = 0; i <= n - m; i++) {
      let j = 0;
      for (; j < m; j++) {
        const idx = i + j;
        t.count("compare");
        const match = text[idx] === pattern[j];
        t.step(`shift ${i}: compare text[${idx}]='${text[idx]}' vs pattern[${j}]='${pattern[j]}' — ${match ? "match" : "mismatch"}`,
          { snapshot: text.split(""), highlight: match ? { compare: [idx], pointers: { i: idx, shift: i } } : { danger: [idx], pointers: { i: idx, shift: i } } });
        if (!match) break;
      }
      if (j === m) { foundAt = i; break; }
      if (i < n - m) t.step(`mismatch — slide the pattern by ONE, to shift ${i + 1}`, { snapshot: text.split(""), highlight: { pointers: { shift: i + 1 } } });
    }
    if (foundAt >= 0) {
      const done = Array.from({ length: m }, (_, k) => foundAt + k);
      t.step(`done — first match at index ${foundAt} (${t.counters.compare} comparison${t.counters.compare === 1 ? "" : "s"})`, { snapshot: text.split(""), highlight: { done, pointers: { shift: foundAt } } });
    } else {
      t.step(`done — "${pattern}" does not occur in "${text}" (${t.counters.compare} comparison${t.counters.compare === 1 ? "" : "s"})`, { snapshot: text.split(""), highlight: {} });
    }
    const trace = t.trace(); trace.result = foundAt; return trace;
  }

  /** Precompute the KMP failure/lps table: lps[k] = length of the longest proper prefix
   *  of pattern[0..k] that is also a suffix of it. Silent — a standard Θ(m) preprocessing pass. */
  _lps(pattern) {
    const m = pattern.length, lps = new Array(m).fill(0);
    let len = 0, i = 1;
    while (i < m) {
      if (pattern[i] === pattern[len]) { lps[i] = ++len; i++; }
      else if (len > 0) { len = lps[len - 1]; }
      else { lps[i] = 0; i++; }
    }
    return lps;
  }

  /** failTable() — build the failure function, TRACED. This is the piece the
      search demo takes for granted and the exam asks for: the pattern matched
      against ITSELF, with the same never-back-up trick the search uses. Two
      rows — the pattern, and fail[] filling in — so the picture is exactly the
      table the slides draw. `k` is the length of the current prefix-suffix
      overlap; a mismatch falls back through the part of the table already
      built, which is the self-reference that makes it Theta(m). */
  failTable() {
    const p = this.pattern, m = p.length;
    const t = new Tracer();
    const cells = [p.split(""), new Array(m).fill("")];
    const rowLabels = ["P", "fail", "j / k"];
    const colLabels = Array.from({ length: m }, (_, i) => String(i));
    // A third row carries the two POINTERS, because the whole build is the
    // interplay of exactly two numbers and narrating them is not the same as
    // showing them: j is the position being filled, k the length of the
    // prefix-suffix overlap so far — and k doubles as an index, since P[k] is
    // the character j is being compared against. When they coincide the cell
    // shows both.
    const ptrRow = (j, k) => {
      const row = new Array(m).fill("");
      if (k != null && k >= 0 && k < m) row[k] = "k";
      if (j != null && j >= 0 && j < m) row[j] = row[j] === "k" ? "j k" : "j";
      return row;
    };
    const snap = (j, k) => ({ rows: 3, cols: m,
      cells: [cells[0].slice(), cells[1].slice(), ptrRow(j, k)], rowLabels, colLabels });
    const done = (upto) => { const out = []; for (let c = 0; c <= upto; c++) out.push([0, c], [1, c]); return out; };

    t.step(`build fail[] for "${p}" by matching the pattern against ITSELF — fail[j] is the longest proper prefix of P[0..j] that is also a suffix of it. Two pointers do all the work: j walks the pattern, k is the overlap length (and P[k] is the character j gets compared to)`,
      { snapshot: snap(), highlight: {} });
    cells[1][0] = 0; t.count("write");
    t.step(`fail[0] = 0 always: a single character has no PROPER prefix. Start with j = 1, k = 0`,
      { snapshot: snap(1, 0), highlight: { active: [[1, 0]] } });

    let k = 0, j = 1;
    while (j < m) {
      t.count("compare");
      if (p[j] === p[k]) {
        k++; cells[1][j] = k; t.count("write");
        t.step(`j=${j}, k=${k - 1}: P[${j}]='${p[j]}' == P[${k - 1}]='${p[k - 1]}' → the overlap grows to k=${k}, so fail[${j}] = ${k}. Both pointers advance`,
          { snapshot: snap(j, k - 1), highlight: { active: [[1, j]], from: [[0, j], [0, k - 1]], done: done(j - 1) } });
        j++;
      } else if (k > 0) {
        const was = k; k = cells[1][k - 1];
        t.count("read");
        t.step(`j=${j}, k=${was}: P[${j}]='${p[j]}' != P[${was}]='${p[was]}' → j stays put and only k falls back, through the table we already built: k = fail[${was - 1}] = ${k}. The SEARCH does this same move on the pattern pointer`,
          { snapshot: snap(j, k), highlight: { active: [[0, j]], from: [[1, was - 1], [0, was]], done: done(j - 1) } });
      } else {
        cells[1][j] = 0; t.count("write");
        t.step(`j=${j}, k=0: P[${j}]='${p[j]}' matches no prefix at all and k has bottomed out → fail[${j}] = 0, and j moves on`,
          { snapshot: snap(j, 0), highlight: { active: [[1, j]], done: done(j - 1) } });
        j++;
      }
    }
    this.summary = `fail("${p}") = [${cells[1].join(", ")}]`;
    t.step(`done — fail = [${cells[1].join(", ")}]. j reached the end of the pattern, and every fall-back only ever moved k, never j — which is why the build is Θ(m). On a mismatch after matching j characters, the SEARCH resets j = fail[j−1] and never moves the text pointer i`,
      { snapshot: snap(), highlight: { done: done(m - 1) } });
    return t.trace();
  }

  /** kmp() — build the failure table, then scan the text with i that never moves backward;
   *  on a mismatch, jump the pattern index j via the failure table instead of restarting. */
  kmp() {
    const t = new Tracer();
    const text = this.text, pattern = this.pattern;
    const n = text.length, m = pattern.length;
    const lps = this._lps(pattern);
    const ksnap = () => ({ array: text.split(""), lps: lps.slice() });
    t.step(`KMP phase 1 — failure table (lps) for "${pattern}" = [${lps.join(", ")}]`, { snapshot: ksnap(), highlight: {} });

    let i = 0, j = 0, foundAt = -1;
    t.step(`KMP phase 2 — scan "${text}"; i never backs up, j jumps via lps on a mismatch`, { snapshot: ksnap(), highlight: { pointers: { i: 0 } } });
    while (i < n) {
      t.count("compare");
      const match = text[i] === pattern[j];
      t.step(`compare text[${i}]='${text[i]}' vs pattern[${j}]='${pattern[j]}' — ${match ? "match" : "mismatch"}`,
        { snapshot: ksnap(), highlight: match ? { compare: [i], pointers: { i, j } } : { danger: [i], pointers: { i, j } } });
      if (match) {
        i++; j++;
        if (j === m) {
          foundAt = i - j;
          const done = Array.from({ length: m }, (_, k) => foundAt + k);
          t.step(`full match — done, first match at index ${foundAt} (${t.counters.compare} comparison${t.counters.compare === 1 ? "" : "s"})`, { snapshot: ksnap(), highlight: { done, pointers: { i } } });
          break;
        }
      } else if (j > 0) {
        const nj = lps[j - 1];
        t.step(`mismatch at pattern[${j}] — jump j via lps: ${j} → ${nj} (i stays at ${i})`, { snapshot: ksnap(), highlight: { pointers: { i, j: nj } } });
        j = nj;
      } else {
        i++;
      }
    }
    if (foundAt < 0) t.step(`done — "${pattern}" does not occur in "${text}" (${t.counters.compare} comparison${t.counters.compare === 1 ? "" : "s"})`, { snapshot: ksnap(), highlight: {} });
    const trace = t.trace(); trace.result = foundAt; return trace;
  }
}
