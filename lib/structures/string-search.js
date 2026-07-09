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
      t.step(`done — first match at index ${foundAt} (${t.counters.compare} comparisons)`, { snapshot: text.split(""), highlight: { done, pointers: { shift: foundAt } } });
    } else {
      t.step(`done — "${pattern}" does not occur in "${text}" (${t.counters.compare} comparisons)`, { snapshot: text.split(""), highlight: {} });
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

  /** kmp() — build the failure table, then scan the text with i that never moves backward;
   *  on a mismatch, jump the pattern index j via the failure table instead of restarting. */
  kmp() {
    const t = new Tracer();
    const text = this.text, pattern = this.pattern;
    const n = text.length, m = pattern.length;
    const lps = this._lps(pattern);
    t.step(`KMP phase 1 — failure table (lps) for "${pattern}" = [${lps.join(", ")}]`, { snapshot: text.split(""), highlight: {} });

    let i = 0, j = 0, foundAt = -1;
    t.step(`KMP phase 2 — scan "${text}"; i never backs up, j jumps via lps on a mismatch`, { snapshot: text.split(""), highlight: { pointers: { i: 0 } } });
    while (i < n) {
      t.count("compare");
      const match = text[i] === pattern[j];
      t.step(`compare text[${i}]='${text[i]}' vs pattern[${j}]='${pattern[j]}' — ${match ? "match" : "mismatch"}`,
        { snapshot: text.split(""), highlight: match ? { compare: [i], pointers: { i, j } } : { danger: [i], pointers: { i, j } } });
      if (match) {
        i++; j++;
        if (j === m) {
          foundAt = i - j;
          const done = Array.from({ length: m }, (_, k) => foundAt + k);
          t.step(`full match — done, first match at index ${foundAt} (${t.counters.compare} comparisons)`, { snapshot: text.split(""), highlight: { done, pointers: { i } } });
          break;
        }
      } else if (j > 0) {
        const nj = lps[j - 1];
        t.step(`mismatch at pattern[${j}] — jump j via lps: ${j} → ${nj} (i stays at ${i})`, { snapshot: text.split(""), highlight: { pointers: { i, j: nj } } });
        j = nj;
      } else {
        i++;
      }
    }
    if (foundAt < 0) t.step(`done — "${pattern}" does not occur in "${text}" (${t.counters.compare} comparisons)`, { snapshot: text.split(""), highlight: {} });
    const trace = t.trace(); trace.result = foundAt; return trace;
  }
}
