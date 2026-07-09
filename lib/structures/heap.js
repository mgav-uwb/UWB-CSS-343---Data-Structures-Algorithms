// CSS 343 unified library — structures/heap.js
// The binary heap: a max-oriented priority queue backed by a plain, 1-INDEXED
// array — a[0] is unused (the lecture convention: parent k/2, children 2k and
// 2k+1; a classic variant stores the heap size in a[0] instead of a separate
// n). Snapshots include slot 0 (drawn as "·") so array indices in the demo
// match the lecture code exactly, and the shared ArrayRenderer/HeapTreeRenderer
// draw the same snapshot directly. insert swims a new leaf up; delMax swaps
// the root with the last slot, pops it, and sinks the new root down. heapify
// and sinkDown are the two independently-invokable phases of heapsort (build
// the heap, then sort it down) — heapsort(keys) is just their composition, so
// a demo can also run either phase on its own. Every op returns a Trace the
// Player scrubs.

import { Tracer, concatTraces } from "../core/tracer.js";

const UNUSED = "·"; // what slot 0 shows in the array view: a[0] is not a key

const parent = (k) => k >> 1;
const left = (k) => 2 * k;
const right = (k) => 2 * k + 1;

export class MaxHeap {
  constructor() { this.a = [UNUSED]; }

  /** number of keys — a.length minus the unused slot 0 */
  size() { return this.a.length - 1; }

  build(keys) { for (const k of keys) this._insertSilent(k); return this; }
  /** loadRaw(keys) — load a RAW array AS-IS (not heapified), so a caller can
   *  then run heapify()/heapsort() as one animated build step (see FullDemo's
   *  buildAll spec hook) starting from a genuinely un-ordered complete tree. */
  loadRaw(keys) { this.a = [UNUSED, ...keys]; return this; }
  snapshot() { return this.a.slice(); }
  inorder() { return this.a.slice(1); }

  _insertSilent(v) {
    this.a.push(v);
    let k = this.a.length - 1;
    while (k > 1 && this.a[parent(k)] < this.a[k]) {
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
    while (k > 1) {
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
    const n = this.size();
    if (n === 0) { t.step(`delMax: empty heap — nothing to remove`, { snapshot: this.a.slice(), highlight: {} }); return t.trace(); }
    const max = this.a[1];
    t.step(`delMax: root a[1]=${max} is the max`, { snapshot: this.a.slice(), highlight: { active: 1 } });
    if (n === 1) {
      this.a.pop(); t.count("read");
      t.step(`done — delMax = ${max}, heap is now empty`, { snapshot: this.a.slice(), highlight: {} });
      return t.trace();
    }
    t.count("read", 2); t.count("write"); t.count("swap");
    this.a[1] = this.a[n]; this.a.pop();
    t.step(`swap root with last (a[1]=${this.a[1]}), remove old root — max = ${max}`,
      { snapshot: this.a.slice(), highlight: { danger: 1 } });
    this._sink(1, t, this.size());
    t.step(`done — delMax = ${max}, heap property restored`, { snapshot: this.a.slice(), highlight: { done: 1 } });
    return t.trace();
  }

  /** sink k down through a[1..end] while a child is larger; shared by delMax and heapsort. */
  _sink(k, t, end) {
    while (true) {
      const l = left(k), r = right(k);
      let big = k;
      const inRange = [k];
      if (l <= end) { t.count("compare"); t.count("read", 2); if (this.a[l] > this.a[big]) big = l; inRange.push(l); }
      if (r <= end) { t.count("compare"); t.count("read", 2); if (this.a[r] > this.a[big]) big = r; inRange.push(r); }
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
   *  not yet a heap): sink every internal node from n/2 down to 1. Θ(n) total. */
  heapify(keys) {
    const t = new Tracer();
    if (keys) this.a = [UNUSED, ...keys];
    const n = this.size();
    t.step(`start: ${n} keys as an arbitrary complete tree — not yet a heap`, { snapshot: this.a.slice(), highlight: {} });
    if (n < 2) { t.step(`done — trivially a heap`, { snapshot: this.a.slice(), highlight: { done: n ? [1] : [] } }); return t.trace(); }
    t.step(`heapify: sink each internal node from index ${n >> 1} down to 1 (bottom-up)`, { snapshot: this.a.slice(), highlight: {} });
    for (let k = n >> 1; k >= 1; k--) this._sink(k, t, n);
    t.step(`done — a valid max-heap in Θ(n); a[1]=${this.a[1]} is the max`, { snapshot: this.a.slice(), highlight: { done: 1 } });
    return t.trace();
  }

  /** sinkDown() — phase 2 of heapsort ONLY: assumes this.a is ALREADY a valid
   *  max-heap. Repeatedly swap a[1] with the end of the shrinking heap and
   *  sink(1); the growing tail is the sorted (ascending) result. Kept separate
   *  from _sink/heapify's use of "end" so a caller can run just this phase
   *  after heapify — reusing _sink directly here would need its own end
   *  tracking anyway, so this is its own small loop, not a call to _sink. */
  sinkDown() {
    const t = new Tracer();
    const n = this.size();
    if (n < 2) { t.step(`sort down: already sorted (n=${n})`, { snapshot: this.a.slice(), highlight: { done: n ? [1] : [] } }); return t.trace(); }
    t.step(`start: a[1]=${this.a[1]} is the max of a valid heap`, { snapshot: this.a.slice(), highlight: { active: 1 } });

    const sorted = [];
    for (let end = n; end > 1; end--) {
      t.count("swap"); t.count("write", 2); t.count("read", 2);
      [this.a[1], this.a[end]] = [this.a[end], this.a[1]];
      sorted.unshift(end);
      t.step(`swap a[1] with a[${end}]: a[${end}]=${this.a[end]} is now in final sorted position`,
        { snapshot: this.a.slice(), highlight: { done: [...sorted], active: 1 } });
      this._sink(1, t, end - 1);
      t.step(`sink restores the heap in a[1..${end - 1}]`, { snapshot: this.a.slice(), highlight: { done: [...sorted] } });
    }
    sorted.unshift(1);
    t.step(`done — sorted ascending: ${this.a.slice(1).join(", ")}`, { snapshot: this.a.slice(), highlight: { done: sorted } });
    return t.trace();
  }

  /** heapsort(keys?) — the full sort: heapify, then sinkDown. Pass raw keys to
   *  sort a fresh array (else sorts the current one). Composed from the two
   *  separately-invokable primitives above so a demo can also run just one
   *  phase at a time. */
  heapsort(keys) {
    if (keys) this.a = [UNUSED, ...keys];
    return concatTraces([this.heapify(), this.sinkDown()]);
  }
}
