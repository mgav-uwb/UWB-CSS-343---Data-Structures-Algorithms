// CSS 343 unified library — structures/heap.js
// The binary heap: a max-oriented priority queue backed by a plain, 0-indexed
// array — parent (k-1)>>1, children 2k+1/2k+2 — so array indices ARE tree
// positions and the shared ArrayRenderer draws it directly (no tree layout
// needed). insert swims a new leaf up; delMax swaps the root with the last
// slot, pops it, and sinks the new root down. heapsort reuses sink for both
// the heapify phase and the repeated swap-to-end phase, with the growing
// suffix marked done as it becomes the sorted result. Every op returns a
// Trace the Player scrubs.

import { Tracer } from "../core/tracer.js";

const parent = (k) => (k - 1) >> 1;
const left = (k) => 2 * k + 1;
const right = (k) => 2 * k + 2;

export class MaxHeap {
  constructor() { this.a = []; }

  build(keys) { for (const k of keys) this._insertSilent(k); return this; }
  /** loadRaw(keys) — load a RAW array AS-IS (not heapified), so a caller can
   *  then run heapify()/heapsort() as one animated build step (see FullDemo's
   *  buildAll spec hook) starting from a genuinely un-ordered complete tree. */
  loadRaw(keys) { this.a = keys.slice(); return this; }
  snapshot() { return this.a.slice(); }
  inorder() { return this.a.slice(); }

  _insertSilent(v) {
    this.a.push(v);
    let k = this.a.length - 1;
    while (k > 0 && this.a[parent(k)] < this.a[k]) {
      const p = parent(k);
      [this.a[p], this.a[k]] = [this.a[k], this.a[p]];
      k = p;
    }
  }

  /** insert(v) — append at the end, then swim up while a child exceeds its parent. */
  insert(v) {
    const t = new Tracer();
    this.a.push(v); t.count("write");
    let k = this.a.length - 1;
    t.step(`insert ${v}: append at index ${k}`, { snapshot: this.a.slice(), highlight: { active: k } });
    while (k > 0) {
      const p = parent(k);
      t.count("compare"); t.count("read", 2);
      t.step(`compare a[${k}]=${this.a[k]} vs parent a[${p}]=${this.a[p]}`,
        { snapshot: this.a.slice(), highlight: { compare: [k, p], pointers: { k } } });
      if (this.a[p] >= this.a[k]) break;
      [this.a[p], this.a[k]] = [this.a[k], this.a[p]];
      t.count("swap"); t.count("write", 2);
      t.step(`${v} > parent — swap up to index ${p}`,
        { snapshot: this.a.slice(), highlight: { active: p, pointers: { k: p } } });
      k = p;
    }
    t.step(`done — ${v} settled at index ${k}, heap property restored`, { snapshot: this.a.slice(), highlight: { done: k } });
    return t.trace();
  }

  /** delMax() — swap root with the last element, pop it off (the old max), then sink the new root down. */
  delMax() {
    const t = new Tracer();
    const n = this.a.length;
    if (n === 0) { t.step(`delMax: empty heap — nothing to remove`, { snapshot: [], highlight: {} }); return t.trace(); }
    const max = this.a[0];
    t.step(`delMax: root a[0]=${max} is the max`, { snapshot: this.a.slice(), highlight: { active: 0 } });
    if (n === 1) {
      this.a.pop(); t.count("read");
      t.step(`done — delMax = ${max}, heap is now empty`, { snapshot: [], highlight: {} });
      return t.trace();
    }
    t.count("read", 2); t.count("write"); t.count("swap");
    this.a[0] = this.a[n - 1]; this.a.pop();
    t.step(`swap root with last (a[0]=${this.a[0]}), remove old root — max = ${max}`,
      { snapshot: this.a.slice(), highlight: { danger: 0 } });
    this._sink(0, t, this.a.length);
    t.step(`done — delMax = ${max}, heap property restored`, { snapshot: this.a.slice(), highlight: { done: 0 } });
    return t.trace();
  }

  /** sink k down through [0,end) while a child is larger; shared by delMax and heapsort. */
  _sink(k, t, end) {
    while (true) {
      const l = left(k), r = right(k);
      let big = k;
      const inRange = [k];
      if (l < end) { t.count("compare"); t.count("read", 2); if (this.a[l] > this.a[big]) big = l; inRange.push(l); }
      if (r < end) { t.count("compare"); t.count("read", 2); if (this.a[r] > this.a[big]) big = r; inRange.push(r); }
      t.step(`sink: compare a[${k}]=${this.a[k]} with its child/children`,
        { snapshot: this.a.slice(), highlight: { compare: inRange, pointers: { k } } });
      if (big === k) break;
      [this.a[k], this.a[big]] = [this.a[big], this.a[k]];
      t.count("swap"); t.count("write", 2);
      t.step(`swap a[${k}] with larger child a[${big}]`,
        { snapshot: this.a.slice(), highlight: { active: big, pointers: { k: big } } });
      k = big;
    }
  }

  /** heapify(keys) — build a heap bottom-up from a RAW array (a complete tree that is
   *  not yet a heap): sink every internal node from n/2-1 down to 0. Θ(n) total. */
  heapify(keys) {
    const t = new Tracer();
    if (keys) this.a = keys.slice();
    const n = this.a.length;
    t.step(`start: ${n} keys as an arbitrary complete tree — not yet a heap`, { snapshot: this.a.slice(), highlight: {} });
    if (n < 2) { t.step(`done — trivially a heap`, { snapshot: this.a.slice(), highlight: { done: n ? [0] : [] } }); return t.trace(); }
    t.step(`heapify: sink each internal node from index ${Math.floor(n / 2) - 1} down to 0 (bottom-up)`, { snapshot: this.a.slice(), highlight: {} });
    for (let k = Math.floor(n / 2) - 1; k >= 0; k--) this._sink(k, t, n);
    t.step(`done — a valid max-heap in Θ(n); a[0]=${this.a[0]} is the max`, { snapshot: this.a.slice(), highlight: { done: 0 } });
    return t.trace();
  }

  /** heapsort(keys?) — phase 1 heapify (sink n/2-1..0), phase 2 repeatedly swap a[0] with the
   *  end of the shrinking heap and sink(0); the growing tail is the sorted (ascending) result.
   *  Pass raw keys to sort a fresh array (else sorts the current one). */
  heapsort(keys) {
    const t = new Tracer();
    if (keys) this.a = keys.slice();
    const n = this.a.length;
    if (n < 2) { t.step(`heapsort: already sorted (n=${n})`, { snapshot: this.a.slice(), highlight: { done: n ? [0] : [] } }); return t.trace(); }

    t.step(`phase 1 — heapify: sink from index ${Math.floor(n / 2) - 1} down to 0`, { snapshot: this.a.slice(), highlight: {} });
    for (let k = Math.floor(n / 2) - 1; k >= 0; k--) this._sink(k, t, n);
    t.step(`heapified — a[0]=${this.a[0]} is the max`, { snapshot: this.a.slice(), highlight: { active: 0 } });

    const sorted = [];
    for (let end = n - 1; end > 0; end--) {
      t.count("swap"); t.count("write", 2); t.count("read", 2);
      [this.a[0], this.a[end]] = [this.a[end], this.a[0]];
      sorted.unshift(end);
      t.step(`phase 2 — swap a[0] with a[${end}]: a[${end}]=${this.a[end]} is now in final sorted position`,
        { snapshot: this.a.slice(), highlight: { done: [...sorted], active: 0 } });
      this._sink(0, t, end);
      t.step(`sink restores the heap in a[0..${end - 1}]`, { snapshot: this.a.slice(), highlight: { done: [...sorted] } });
    }
    sorted.unshift(0);
    t.step(`done — heapsorted ascending: ${this.a.join(", ")}`, { snapshot: this.a.slice(), highlight: { done: sorted } });
    return t.trace();
  }
}
