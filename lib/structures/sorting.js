// CSS 343 unified library — structures/sorting.js
// Comparison sorting over a plain array, drawn with the shared ArrayRenderer.
// mergesort is bottom-up (width doubles each pass) so the interesting step —
// merging two adjacent sorted runs — is the thing on screen; quicksort and
// quickselect share one Lomuto partition (pivot = last element, i tracks the
// "confirmed < pivot" boundary as j scans left-to-right). Every op runs once
// through a Tracer and returns a Trace the Player scrubs.

import { Tracer } from "../core/tracer.js";

const SAMPLE = [5, 2, 8, 1, 9, 3, 7, 4, 6];
const range = (lo, hi) => Array.from({ length: Math.max(0, hi - lo) }, (_, x) => lo + x);

export class Sorting {
  constructor() { this.a = []; }

  build(keys) { this.a = (keys && keys.length) ? keys.slice() : SAMPLE.slice(); return this; }
  loadRaw(keys) { return this.build(keys); } // FullDemo: Build = load the raw array (ops run the sorts)
  snapshot() { return this.a.slice(); }
  inorder() { return this.a.join(", "); }

  /** mergesort() — bottom-up: merge adjacent runs of width 1, then 2, 4, ... until
   *  width >= n. No recursion, so the merge step (the interesting part) is front
   *  and center: two sorted runs, a compare of their front elements, a write of
   *  the smaller into place. */
  mergesort() {
    const t = new Tracer();
    const n = this.a.length;
    t.step(`start: bottom-up mergesort over ${n} keys: ${this.a.join(", ")}`,
      { snapshot: this.a.slice(), highlight: {} });
    if (n < 2) {
      t.step(`done — trivially sorted`, { snapshot: this.a.slice(), highlight: { done: n ? [0] : [] } });
      return t.trace();
    }
    for (let width = 1; width < n; width *= 2) {
      t.step(`pass: merge runs of width ${width}`, { snapshot: this.a.slice(), highlight: {} });
      for (let lo = 0; lo < n; lo += 2 * width) {
        const mid = Math.min(lo + width, n);
        const hi = Math.min(lo + 2 * width, n);
        if (mid < hi) this._merge(lo, mid, hi, t);
      }
    }
    t.step(`done — mergesorted ascending: ${this.a.join(", ")}`,
      { snapshot: this.a.slice(), highlight: { done: range(0, n) } });
    return t.trace();
  }

  /** merge a[lo..mid) with a[mid..hi) in place (via a scratch copy), pointer i
   *  walks the left run, j the right run, k the write cursor into a[]. */
  _merge(lo, mid, hi, t) {
    const left = this.a.slice(lo, mid);
    const right = this.a.slice(mid, hi);
    t.step(`merge: run a[${lo}..${mid - 1}]=${left.join(",")} with a[${mid}..${hi - 1}]=${right.join(",")}`,
      { snapshot: this.a.slice(), highlight: { active: range(lo, mid), compare: range(mid, hi) } });

    let i = 0, j = 0, k = lo;
    while (i < left.length && j < right.length) {
      t.count("compare"); t.count("read", 2);
      t.step(`compare left[${i}]=${left[i]} vs right[${j}]=${right[j]}`,
        { snapshot: this.a.slice(), highlight: { compare: [lo + i, mid + j], pointers: { i: lo + i, j: mid + j, k } } });
      if (left[i] <= right[j]) { this.a[k] = left[i]; i++; } else { this.a[k] = right[j]; j++; }
      t.count("write");
      t.step(`write a[${k}] = ${this.a[k]}`,
        { snapshot: this.a.slice(), highlight: { active: k, pointers: { i: lo + i, j: mid + j, k } } });
      k++;
    }
    while (i < left.length) {
      this.a[k] = left[i]; t.count("write");
      t.step(`copy remaining left[${i}]=${this.a[k]} into a[${k}]`,
        { snapshot: this.a.slice(), highlight: { active: k, pointers: { i: lo + i, k } } });
      i++; k++;
    }
    while (j < right.length) {
      this.a[k] = right[j]; t.count("write");
      t.step(`copy remaining right[${j}]=${this.a[k]} into a[${k}]`,
        { snapshot: this.a.slice(), highlight: { active: k, pointers: { j: mid + j, k } } });
      j++; k++;
    }
    t.step(`merged a[${lo}..${hi - 1}] → ${this.a.slice(lo, hi).join(", ")}`,
      { snapshot: this.a.slice(), highlight: { done: range(lo, hi) } });
  }

  /** quicksort() — recursive, Lomuto partition (see _partition). */
  quicksort() {
    const t = new Tracer();
    const n = this.a.length;
    t.step(`start: quicksort (Lomuto partition) over ${n} keys: ${this.a.join(", ")}`,
      { snapshot: this.a.slice(), highlight: {} });
    if (n < 2) {
      t.step(`done — trivially sorted`, { snapshot: this.a.slice(), highlight: { done: n ? [0] : [] } });
      return t.trace();
    }
    const finalized = new Set();
    this._quicksort(0, n - 1, t, finalized);
    t.step(`done — quicksorted ascending: ${this.a.join(", ")}`,
      { snapshot: this.a.slice(), highlight: { done: range(0, n) } });
    return t.trace();
  }

  _quicksort(lo, hi, t, finalized) {
    if (lo > hi) return;
    if (lo === hi) {
      finalized.add(lo);
      t.step(`single element a[${lo}]=${this.a[lo]} — trivially in place`,
        { snapshot: this.a.slice(), highlight: { done: [...finalized] } });
      return;
    }
    const p = this._partition(lo, hi, t, finalized);
    this._quicksort(lo, p - 1, t, finalized);
    this._quicksort(p + 1, hi, t, finalized);
  }

  /** Lomuto partition of a[lo..hi]: pivot = a[hi]; i marks the boundary of the
   *  "confirmed < pivot" region while j scans lo..hi-1. Every element < pivot
   *  gets swapped into the boundary and i advances; at the end the pivot is
   *  swapped into index i, which is its final sorted position (returned).
   *  `finalized` just accumulates already-placed indices so earlier `done`
   *  cells stay highlighted while later partitions run. */
  _partition(lo, hi, t, finalized) {
    const pivot = this.a[hi];
    t.step(`partition a[${lo}..${hi}]: pivot = a[${hi}]=${pivot}`,
      { snapshot: this.a.slice(), highlight: { done: [...finalized], active: hi, pointers: { pivot: hi } } });
    let i = lo;
    for (let j = lo; j < hi; j++) {
      t.count("compare"); t.count("read");
      t.step(`compare a[${j}]=${this.a[j]} vs pivot ${pivot}`,
        { snapshot: this.a.slice(), highlight: { done: [...finalized], compare: [j, hi], pointers: { i, j, pivot: hi } } });
      if (this.a[j] < pivot) {
        [this.a[i], this.a[j]] = [this.a[j], this.a[i]];
        t.count("swap"); t.count("read", 2); t.count("write", 2);
        t.step(`a[${j}] < pivot — swap into boundary at i=${i}`,
          { snapshot: this.a.slice(), highlight: { done: [...finalized], active: [i, j], pointers: { i, j, pivot: hi } } });
        i++;
      }
    }
    [this.a[i], this.a[hi]] = [this.a[hi], this.a[i]];
    t.count("swap"); t.count("read", 2); t.count("write", 2);
    finalized.add(i);
    t.step(`pivot ${this.a[i]} lands in final sorted position at index ${i}`,
      { snapshot: this.a.slice(), highlight: { done: [...finalized], pointers: { pivot: i } } });
    return i;
  }

  /** quickselect(k) — 0-INDEXED rank (k=0 is the smallest element). Repeatedly
   *  Lomuto-partitions a[lo..hi], recursing only into the side that contains
   *  rank k, until the pivot lands exactly at index k. Θ(n) expected time —
   *  each partition throws away the other side instead of recursing into it.
   *  Returns the Trace (for the Player); the k-th-smallest value is also
   *  attached as `trace.result` for callers that just want the number. */
  quickselect(k) {
    const t = new Tracer();
    const n = this.a.length;
    t.step(`start: quickselect for rank k=${k} (0-indexed) among ${n} keys: ${this.a.join(", ")}`,
      { snapshot: this.a.slice(), highlight: { pointers: { k } } });
    if (n === 0 || k < 0 || k >= n) {
      t.step(`invalid: k=${k} out of range for n=${n}`, { snapshot: this.a.slice(), highlight: {} });
      const trace = t.trace(); trace.result = undefined; return trace;
    }
    let lo = 0, hi = n - 1;
    const finalized = new Set();
    while (true) {
      if (lo === hi) {
        finalized.add(lo);
        t.step(`done — a[${k}]=${this.a[k]} is rank ${k} (0-indexed smallest)`,
          { snapshot: this.a.slice(), highlight: { done: k, pointers: { k } } });
        break;
      }
      const p = this._partition(lo, hi, t, finalized);
      if (p === k) {
        t.step(`pivot landed exactly at rank k=${k}: a[${k}]=${this.a[k]}`,
          { snapshot: this.a.slice(), highlight: { done: k, pointers: { k } } });
        break;
      } else if (p < k) {
        t.step(`rank k=${k} is right of pivot index ${p} — recurse into a[${p + 1}..${hi}]`,
          { snapshot: this.a.slice(), highlight: { active: range(p + 1, hi + 1), pointers: { k } } });
        lo = p + 1;
      } else {
        t.step(`rank k=${k} is left of pivot index ${p} — recurse into a[${lo}..${p - 1}]`,
          { snapshot: this.a.slice(), highlight: { active: range(lo, p), pointers: { k } } });
        hi = p - 1;
      }
    }
    const trace = t.trace();
    trace.result = this.a[k];
    return trace;
  }
}
