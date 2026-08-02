// CSS 343 unified library — structures/adaptive-huffman.js
// ADAPTIVE Huffman coding (the FGK algorithm — Faller 1973, Gallager 1978,
// Knuth 1985). Static Huffman needs two passes and a table: read the text to
// count frequencies, build the tree, ship the tree with the message. Adaptive
// Huffman needs neither. Encoder and decoder start from the SAME empty tree and
// update it by the same rule after every symbol, so the decoder always knows
// the code the encoder just used — without a single bit of table.
//
// The tree obeys the SIBLING PROPERTY: every node has a sibling, and the nodes
// can be numbered so that weight never decreases as the number grows (reading
// the levels bottom-up, left to right). Gallager's theorem: a binary tree is a
// Huffman tree for its leaf weights EXACTLY when it has the sibling property.
// That is what makes the update cheap — after incrementing one leaf, the only
// thing that can break optimality is a node sitting below a same-weight node
// with a higher number, and one SWAP per level fixes it.
//
//   encode(s):  s already in the tree → emit the path root→leaf(s)
//               s brand new           → emit the path root→NYT, then s's
//                                       8-bit ASCII code ("escape to plain")
//   then update(s), which the decoder performs identically.
//
// NYT = "Not Yet Transmitted", the weight-0 leaf that stands for every symbol
// not yet seen. Its path is the escape prefix; splitting it is how the alphabet
// grows. Every op returns a Trace the Player scrubs, like the other structures.

import { Tracer } from "../core/tracer.js";
import { symbolColor } from "../core/palette.js";

const SPACE = "␣";                       // a space is a symbol; this is its glyph
const chr = (s) => (s === " " ? SPACE : s);
const ascii8 = (s) => (s === SPACE ? 32 : s.charCodeAt(0)).toString(2).padStart(8, "0");
const fromAscii8 = (bits) => chr(String.fromCharCode(parseInt(bits, 2)));

let NEXT_ID = 0;

export class AdaptiveHuffman {
  constructor() { this.reset(); }

  reset() {
    this.nyt = this._node({ nyt: true, num: 512 });
    this.root = this.nyt;
    this.leaves = new Map();                  // symbol -> leaf node
    this.order = [];                          // symbols in FIRST-SEEN order (their colours)
    this.cx = { text: [], bits: [], out: [], newSyms: 0 };
    return this;
  }

  _node(o) {
    return Object.assign({ id: NEXT_ID++, weight: 0, sym: null, nyt: false,
                           num: 0, parent: null, left: null, right: null }, o);
  }

  _all(node = this.root, out = []) {
    if (!node) return out;
    out.push(node);
    this._all(node.left, out); this._all(node.right, out);
    return out;
  }

  /** The codeword for a node: the turns from the root, 0 = left, 1 = right.
   *  Empty when the node IS the root — the first symbol of a message costs no
   *  path bits at all, because there is nothing yet to choose between. */
  _path(node) {
    let s = "";
    for (let n = node; n.parent; n = n.parent) s = (n.parent.left === n ? "0" : "1") + s;
    return s;
  }

  _ci(sym) { const i = this.order.indexOf(sym); return i < 0 ? -1 : i; }

  /** Highest-numbered node of the same weight — the "block leader". Ancestors
   *  and descendants are excluded: swapping with either would tangle the tree
   *  rather than reorder equals. */
  _leader(node) {
    const anc = new Set();
    for (let n = node; n; n = n.parent) anc.add(n);
    const desc = new Set(this._all(node));
    let best = null;
    for (const n of this._all()) {
      if (anc.has(n) || desc.has(n)) continue;
      if (n.weight !== node.weight) continue;
      if (!best || n.num > best.num) best = n;
    }
    return best && best.num > node.num ? best : null;
  }

  /** Exchange two nodes' POSITIONS. Numbers belong to positions, not to nodes,
   *  so they swap back — which is exactly what keeps the numbering monotonic. */
  _swap(a, b) {
    const pa = a.parent, pb = b.parent;
    const sa = pa.left === a ? "left" : "right";
    const sb = pb.left === b ? "left" : "right";
    pa[sa] = b; pb[sb] = a;
    a.parent = pb; b.parent = pa;
    const t = a.num; a.num = b.num; b.num = t;
  }

  /** Split NYT into an internal node over (new NYT, the new symbol's leaf).
   *  Returns the node the weight walk starts from. */
  _spawn(sym) {
    const old = this.nyt;                     // becomes the new internal node
    const leaf = this._node({ sym, num: old.num - 1, parent: old, weight: 1 });
    const nyt = this._node({ nyt: true, num: old.num - 2, parent: old });
    old.nyt = false; old.left = nyt; old.right = leaf;
    this.nyt = nyt;
    this.leaves.set(sym, leaf);
    this.order.push(sym);
    return old;                               // weight 0 → 1 in the walk below
  }

  /** The update BOTH sides run after every symbol: walk to the root, and at
   *  each step swap with the block leader if one outranks us, then increment.
   *  @returns {Array} the swaps made, for the trace to narrate */
  _update(start) {
    const swaps = [];
    for (let n = start; n; n = n.parent) {
      const lead = this._leader(n);
      if (lead) { swaps.push([n, lead]); this._swap(n, lead); }
      n.weight++;
    }
    return swaps;
  }

  // ---- the codec view (same frame shape as structures/huffman.js) ----------

  _clone(n) {
    if (!n) return null;
    const d = {
      key: n.id,
      label: n.weight,
      sub: n.nyt ? "NYT" : (n.sym ?? ""),
      left: this._clone(n.left), right: this._clone(n.right),
    };
    if (n.sym) d.tint = symbolColor(this._ci(n.sym));
    return d;
  }

  stats(partial = false) {
    const c = this.cx;
    const n = c.text.length || c.out.length;
    if (!n) return null;
    return {
      chars: n, partial, ascii: n * 8, huffman: c.bits.length, newSyms: c.newSyms,
      cells: [
        ["chars", n],
        ["ASCII", `${n * 8} b`],
        ["adaptive", `${c.bits.length} b`],
        ["new symbols", `${c.newSyms} × 8 b`],
      ],
    };
  }

  _frame({ act = null, roles = ["in", "out", "out"], cur = [null, null, null],
           done = [null, null, null], partial = false } = {}) {
    const copy = (a) => a.map((o) => ({ t: o.t, ci: o.ci }));
    const col = (label, kind, items, i) => ({
      label, kind, role: roles[i], items: copy(items),
      cur: cur[i], done: done[i] ?? items.length, active: act === i,
    });
    const c = this.cx;
    return {
      cols: [col("text", "chars", c.text, 0),
             col("encoded bits", "bits", c.bits, 1),
             col("decoded text", "chars", c.out, 2)],
      tree: this._clone(this.root),
      stats: this.stats(partial),
    };
  }

  /** Highlight: the codeword path just used, the leaf it ended at, and the
   *  nodes a swap moved (drawn in the "danger" red, because a swap is the one
   *  step that changes the SHAPE rather than just a count). */
  _hl({ path = [], leaf = null, swapped = [] } = {}) {
    return { path, done: leaf ? [leaf] : [], danger: swapped };
  }

  _pathIds(node) {
    const ids = [];
    for (let n = node; n; n = n.parent) ids.unshift(n.id);
    return ids;
  }

  /** encodeCodec(text) — one frame per symbol for the emit, one for the update,
   *  so the two halves of "adaptive" stay distinguishable: what the CURRENT
   *  code costs, and how the code changes because of it. */
  encodeCodec(text = "abracadabra") {
    const t = new Tracer();
    this.reset();
    const chars = [...String(text)].map(chr);
    this.cx.text = chars.map((ch) => ({ t: ch, ci: -1 }));
    t.step(`encode "${text}" from an EMPTY tree — no table, no first pass`,
      { snapshot: this._frame({ act: 0, done: [0, 0, 0] }), highlight: {} });

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const seen = this.leaves.has(ch);
      const node = seen ? this.leaves.get(ch) : this.nyt;
      const path = this._path(node);
      const code = seen ? path : path + ascii8(ch);
      const ci = seen ? this._ci(ch) : this.order.length;   // the colour it is about to get
      this.cx.text[i].ci = ci;
      for (const b of code) { this.cx.bits.push({ t: b, ci }); t.count("write"); }
      t.count("compare", Math.max(1, path.length));
      if (!seen) this.cx.newSyms++;

      t.step(seen
        ? `'${ch}' is in the tree — send its path ${path || "(root)"} (${code.length} bits)`
        : `'${ch}' is NEW — send the NYT path ${path || "(empty: the tree is only NYT)"} then its 8 ASCII bits (${code.length} bits)`,
        { snapshot: this._frame({ act: 1, cur: [i, this.cx.bits.length - 1, null], done: [i, null, null], partial: true }),
          highlight: this._hl({ path: this._pathIds(node), leaf: node.id }) });

      const start = seen ? node : this._spawn(ch);
      const swaps = this._update(start);
      t.count("link", swaps.length * 2);
      t.step(swaps.length
        ? `update: ${ch} now weighs ${this.leaves.get(ch).weight} — ${swaps.length} swap${swaps.length > 1 ? "s" : ""} to keep weights ordered`
        : `update: ${ch} now weighs ${this.leaves.get(ch).weight} — weights still in order, no swap`,
        { snapshot: this._frame({ act: 1, cur: [i, null, null], done: [i + 1, null, null], partial: i < chars.length - 1 }),
          highlight: this._hl({ leaf: this.leaves.get(ch).id, swapped: swaps.flatMap(([a, b]) => [a.id, b.id]) }) });
    }
    t.step(`done — "${text}" is ${this.cx.bits.length} bits, and the decoder needs NO table to read it`,
      { snapshot: this._frame({ act: 1 }), highlight: {} });
    return t.trace();
  }

  /** decodeCodec(bits) — the mirror. The decoder replays the same updates, so
   *  its tree is the encoder's tree at every step; that is the whole trick. */
  decodeCodec(bits = "") {
    const t = new Tracer();
    const typed = String(bits ?? "").trim();
    const clean = typed.replace(/[^01]/g, "");
    const stream = clean ? clean.split("") : this.cx.bits.map((o) => o.t);
    if (!stream.length) {
      t.step("nothing to decode — run Encode first, or type a bit string",
        { snapshot: this._frame({ act: 1 }), highlight: {} });
      return t.trace();
    }
    const keepText = clean ? [] : this.cx.text.map((o) => ({ t: o.t, ci: o.ci }));
    this.reset();
    this.cx.text = keepText;                 // the source stays visible as context
    this.cx.bits = stream.map((b) => ({ t: b, ci: -1 }));
    const ROLES = ["in", "in", "out"];
    t.step(`decode ${stream.length} bits from an EMPTY tree — same rule, same tree${clean ? "" : " (the bits Encode just produced)"}`,
      { snapshot: this._frame({ act: 1, roles: ROLES, done: [null, 0, 0] }), highlight: {} });

    let i = 0;
    while (i < stream.length) {
      let node = this.root, start = i;
      while (!node.nyt && !node.sym) {         // walk to a leaf (0 bits if root IS a leaf)
        const b = stream[i++];
        if (b === undefined) break;
        node = b === "0" ? node.left : node.right;
        t.count("compare");
      }
      let sym;
      if (node.nyt) {                          // escape: the next 8 bits are the symbol
        const raw = stream.slice(i, i + 8).join("");
        if (raw.length < 8) {
          t.step(`${8 - raw.length} bit(s) short of an ASCII code — the stream is truncated`,
            { snapshot: this._frame({ act: 1, roles: ROLES, cur: [null, i, null], done: [null, i, null] }), highlight: {} });
          break;
        }
        i += 8;
        sym = fromAscii8(raw);
        this.cx.newSyms++;
      } else sym = node.sym;

      const ci = this.leaves.has(sym) ? this._ci(sym) : this.order.length;
      for (let k = start; k < i; k++) this.cx.bits[k].ci = ci;   // colour the codeword just read
      this.cx.out.push({ t: sym, ci });
      t.count("write");
      t.step(node.nyt
        ? `NYT, then 8 bits → '${sym}' — a symbol seen for the first time`
        : `${stream.slice(start, i).join("")} → '${sym}'`,
        { snapshot: this._frame({ act: 2, roles: ROLES, cur: [null, i - 1, this.cx.out.length - 1], done: [null, i, null] }),
          highlight: this._hl({ path: this._pathIds(node), leaf: node.id }) });

      const from = this.leaves.has(sym) ? this.leaves.get(sym) : this._spawn(sym);
      const swaps = this._update(from);
      t.count("link", swaps.length * 2);
      t.step(`update: '${sym}' now weighs ${this.leaves.get(sym).weight}${swaps.length ? ` — ${swaps.length} swap${swaps.length > 1 ? "s" : ""}` : ""} — the encoder did exactly this`,
        { snapshot: this._frame({ act: 2, roles: ROLES, done: [null, i, null] }),
          highlight: this._hl({ leaf: this.leaves.get(sym).id, swapped: swaps.flatMap(([a, b]) => [a.id, b.id]) }) });
    }
    t.step(`done — ${stream.length} bits back to "${this.cx.out.map((o) => o.t).join("")}", with no table sent`,
      { snapshot: this._frame({ act: 2, roles: ROLES }), highlight: {} });
    return t.trace();
  }

  /** Plain (untraced) encode — for tests and for the slides' numbers. */
  encode(text) {
    this.reset();
    let out = "";
    for (const raw of String(text)) {
      const ch = chr(raw);
      const seen = this.leaves.has(ch);
      const node = seen ? this.leaves.get(ch) : this.nyt;
      out += seen ? this._path(node) : this._path(node) + ascii8(ch);
      this._update(seen ? node : this._spawn(ch));
    }
    return out;
  }

  /** Plain (untraced) decode of a bit string. */
  decode(bits) {
    this.reset();
    let out = "", i = 0;
    const s = String(bits);
    while (i < s.length) {
      let node = this.root;
      while (!node.nyt && !node.sym) node = s[i++] === "0" ? node.left : node.right;
      let sym;
      if (node.nyt) { const raw = s.slice(i, i + 8); if (raw.length < 8) break; i += 8; sym = fromAscii8(raw); }
      else sym = node.sym;
      out += sym;
      this._update(this.leaves.has(sym) ? this.leaves.get(sym) : this._spawn(sym));
    }
    return out;
  }

  /** Is the sibling property intact? (Numbers non-decreasing in weight order.)
   *  Used by the tests — it is the invariant the whole algorithm rests on. */
  siblingPropertyHolds() {
    const ns = this._all().slice().sort((a, b) => a.num - b.num);
    for (let i = 1; i < ns.length; i++) if (ns[i].weight < ns[i - 1].weight) return false;
    return true;
  }

  snapshot() { return this._frame({ act: 0 }); }
  inorder() {
    const syms = [...this.leaves.keys()];
    return `${syms.length} symbol${syms.length === 1 ? "" : "s"} seen${syms.length ? `: ${syms.join(" ")}` : " — the tree is just NYT"}`;
  }
}
