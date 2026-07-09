// CSS 343 unified library — structures/hashing.js
// Open-addressing hash table (linear probing) over a plain fixed-size array
// `slots` — empty cells are `null`. h(k) = ((k % M) + M) % M, count "hash".
// insert probes forward from the home slot, counting each occupied slot it
// passes as a "compare" (collision); if the load factor n/M reaches 0.5 right
// after an insert, the table doubles and every key is rehashed. remove uses
// Sedgewick's linear-probing delete: empty the found slot, then walk the rest
// of the cluster re-inserting each key so no search path breaks — no
// tombstones. snapshot() renders a DISPLAY array (empty → "·") so the shared
// ArrayRenderer draws it directly with mode 'cells'.

import { Tracer } from "../core/tracer.js";

const hash = (k, M) => ((k % M) + M) % M;

export class LinearProbing {
  constructor(M = 8) {
    this.M = M;
    this.slots = new Array(M).fill(null);
    this.n = 0;
  }

  build(keys) { for (const k of keys) this._insertSilent(k); return this; }

  /** Display array: empty slots show as "·" so the ArrayRenderer draws clean empty cells. */
  snapshot() { return this.slots.map((v) => (v === null ? "·" : v)); }
  inorder() { return this.slots.filter((v) => v !== null); }

  _insertSilent(k) {
    let i = hash(k, this.M);
    while (this.slots[i] !== null) {
      if (this.slots[i] === k) return;
      i = (i + 1) % this.M;
    }
    this.slots[i] = k; this.n++;
    if (this.n / this.M >= 0.5) this._growSilent();
  }

  /** Double M and rehash every key, silently (used by build() and after a traced insert triggers resize). */
  _growSilent() {
    const old = this.slots.filter((v) => v !== null);
    this.M *= 2;
    this.slots = new Array(this.M).fill(null);
    this.n = 0;
    for (const k of old) {
      let i = hash(k, this.M);
      while (this.slots[i] !== null) i = (i + 1) % this.M;
      this.slots[i] = k; this.n++;
    }
  }

  /** insert(k) — home slot h(k), probe forward over occupied slots (collisions), place in the first empty slot (or stop if k already present). Resizes (doubles + rehashes) if n/M ≥ 0.5 afterward. */
  insert(k) {
    const t = new Tracer();
    let i = hash(k, this.M); t.count("hash");
    const home = i;
    t.step(`insert ${k}: home slot h(${k}) = ${i}`, { snapshot: this.snapshot(), highlight: { active: [i], pointers: { h: home } } });

    while (this.slots[i] !== null) {
      t.count("compare");
      if (this.slots[i] === k) {
        t.step(`${k} already present at slot ${i} — no change`, { snapshot: this.snapshot(), highlight: { done: [i], pointers: { h: home } } });
        return t.trace();
      }
      t.step(`slot ${i} occupied by ${this.slots[i]} — collision, probe forward`, { snapshot: this.snapshot(), highlight: { compare: [i], pointers: { h: home } } });
      i = (i + 1) % this.M;
      t.step(`probe slot ${i}`, { snapshot: this.snapshot(), highlight: { active: [i], pointers: { h: home } } });
    }

    this.slots[i] = k; this.n++; t.count("write");
    t.step(`insert ${k} into empty slot ${i}`, { snapshot: this.snapshot(), highlight: { done: [i], pointers: { h: home } } });

    if (this.n / this.M >= 0.5) {
      t.step(`load factor ${this.n}/${this.M} ≥ 0.5 — resize to ${this.M * 2} and rehash every key`, { snapshot: this.snapshot(), highlight: {} });
      this._resizeTraced(t);
    }

    t.step(`done — ${k} inserted`, { snapshot: this.snapshot(), highlight: { done: this.slots.map((v, idx) => (v === k ? idx : -1)).filter((x) => x >= 0) } });
    return t.trace();
  }

  /** Double the table and rehash every existing key, one traced step per placement. */
  _resizeTraced(t) {
    const old = this.slots.filter((v) => v !== null);
    this.M *= 2;
    this.slots = new Array(this.M).fill(null);
    this.n = 0;
    for (const k of old) {
      let i = hash(k, this.M); t.count("hash");
      while (this.slots[i] !== null) { t.count("compare"); i = (i + 1) % this.M; }
      this.slots[i] = k; this.n++; t.count("write");
      t.step(`rehash ${k} → slot ${i} (M=${this.M})`, { snapshot: this.snapshot(), highlight: { active: [i] } });
    }
  }

  /** search(k) — probe from h(k) until k is found or an empty slot is hit. */
  search(k) {
    const t = new Tracer();
    let i = hash(k, this.M); t.count("hash");
    const home = i;
    t.step(`search ${k}: home slot h(${k}) = ${i}`, { snapshot: this.snapshot(), highlight: { active: [i], pointers: { h: home } } });

    while (this.slots[i] !== null) {
      t.count("compare");
      if (this.slots[i] === k) {
        t.step(`found ${k} at slot ${i}`, { snapshot: this.snapshot(), highlight: { done: [i], pointers: { h: home } } });
        return t.trace();
      }
      t.step(`slot ${i} = ${this.slots[i]} ≠ ${k} — probe forward`, { snapshot: this.snapshot(), highlight: { compare: [i], pointers: { h: home } } });
      i = (i + 1) % this.M;
      t.step(`probe slot ${i}`, { snapshot: this.snapshot(), highlight: { active: [i], pointers: { h: home } } });
    }
    t.step(`slot ${i} empty — ${k} not found`, { snapshot: this.snapshot(), highlight: { danger: [i], pointers: { h: home } } });
    return t.trace();
  }

  /** remove(k) — find k, empty its slot, then Sedgewick's cluster fix: walk the rest of the
   *  cluster (until an empty slot) and re-insert each key so no search path breaks. No tombstones. */
  remove(k) {
    const t = new Tracer();
    let i = hash(k, this.M); t.count("hash");
    const home = i;
    t.step(`remove ${k}: home slot h(${k}) = ${i}`, { snapshot: this.snapshot(), highlight: { active: [i], pointers: { h: home } } });

    while (this.slots[i] !== null && this.slots[i] !== k) {
      t.count("compare");
      t.step(`slot ${i} = ${this.slots[i]} ≠ ${k} — probe forward`, { snapshot: this.snapshot(), highlight: { compare: [i], pointers: { h: home } } });
      i = (i + 1) % this.M;
      t.step(`probe slot ${i}`, { snapshot: this.snapshot(), highlight: { active: [i], pointers: { h: home } } });
    }
    if (this.slots[i] === null) {
      t.step(`${k} not found — nothing to remove`, { snapshot: this.snapshot(), highlight: { danger: [i], pointers: { h: home } } });
      return t.trace();
    }
    t.count("compare");
    this.slots[i] = null; this.n--; t.count("write");
    t.step(`remove ${k} from slot ${i} — empty it`, { snapshot: this.snapshot(), highlight: { danger: [i] } });

    // Sedgewick's linear-probing delete: rehash the rest of the cluster so no search breaks.
    let j = (i + 1) % this.M;
    while (this.slots[j] !== null) {
      const kk = this.slots[j];
      this.slots[j] = null; this.n--; t.count("write");
      t.step(`re-insert ${kk} (was in the same cluster at slot ${j}) so its probe sequence still works`,
        { snapshot: this.snapshot(), highlight: { active: [j] } });

      let p = hash(kk, this.M); t.count("hash");
      while (this.slots[p] !== null) { t.count("compare"); p = (p + 1) % this.M; }
      this.slots[p] = kk; this.n++; t.count("write");
      t.step(`${kk} reinserted at slot ${p}`, { snapshot: this.snapshot(), highlight: { done: [p] } });
      j = (j + 1) % this.M;
    }
    t.step(`done — ${k} removed`, { snapshot: this.snapshot(), highlight: {} });
    return t.trace();
  }
}

// ---------------------------------------------------------------------------
// Separate chaining: M buckets, each a short list of keys; a collision just
// joins its bucket. snapshot() renders each bucket as a "k → k → k" string
// (empty → "·") so the shared ArrayRenderer draws the buckets as cells.
// M is FIXED here (the teaching point is the buckets, not resizing — the
// linear-probing demo owns the resize story).
export class SeparateChaining {
  constructor(M = 7) {
    this.M = M;
    this.buckets = Array.from({ length: M }, () => []);
    this.n = 0;
  }

  build(keys) { for (const k of keys) this._insertSilent(k); return this; }

  snapshot() { return this.buckets.map((b) => (b.length ? b.join(" → ") : "·")); }
  inorder() { return this.buckets.flat(); }

  _insertSilent(k) {
    const i = hash(k, this.M);
    if (!this.buckets[i].includes(k)) { this.buckets[i].push(k); this.n++; }
  }

  /** insert(k) — hash to the bucket, scan it for a duplicate, append at the end. Never resizes; a long bucket just gets longer (that is the α story). */
  insert(k) {
    const t = new Tracer();
    const i = hash(k, this.M); t.count("hash");
    t.step(`insert ${k}: home bucket h(${k}) = ${k} mod ${this.M} = ${i}`,
      { snapshot: this.snapshot(), highlight: { active: [i], pointers: { h: i } } });
    for (const kk of this.buckets[i]) {
      t.count("compare");
      if (kk === k) {
        t.step(`${k} already in bucket ${i} — no change`, { snapshot: this.snapshot(), highlight: { done: [i] } });
        return t.trace();
      }
      t.step(`scan bucket ${i}: ${kk} ≠ ${k}`, { snapshot: this.snapshot(), highlight: { compare: [i] } });
    }
    this.buckets[i].push(k); this.n++; t.count("write");
    t.step(`append ${k} to bucket ${i} — the collision just joins the list (${this.buckets[i].length} key${this.buckets[i].length > 1 ? "s" : ""} here, α = ${this.n}/${this.M})`,
      { snapshot: this.snapshot(), highlight: { done: [i] } });
    return t.trace();
  }

  /** search(k) — hash to the bucket, scan ONLY that bucket's list; the other M−1 buckets are never touched. */
  search(k) {
    const t = new Tracer();
    const i = hash(k, this.M); t.count("hash");
    t.step(`search ${k}: home bucket h(${k}) = ${k} mod ${this.M} = ${i}`,
      { snapshot: this.snapshot(), highlight: { active: [i], pointers: { h: i } } });
    let probes = 0;
    for (const kk of this.buckets[i]) {
      t.count("compare"); probes++;
      if (kk === k) {
        t.step(`scan bucket ${i}: ${kk} ✓ found (${probes} compare${probes > 1 ? "s" : ""} — the other ${this.M - 1} buckets were never touched)`,
          { snapshot: this.snapshot(), highlight: { done: [i] } });
        return t.trace();
      }
      t.step(`scan bucket ${i}: ${kk} ≠ ${k}, follow the chain`, { snapshot: this.snapshot(), highlight: { compare: [i] } });
    }
    t.step(`bucket ${i} exhausted — ${k} is not in the table (miss after ${probes} compare${probes === 1 ? "" : "s"})`,
      { snapshot: this.snapshot(), highlight: { danger: [i] } });
    return t.trace();
  }
}
