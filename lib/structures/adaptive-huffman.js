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

  /** The update BOTH sides run after every symbol, ONE LEVEL AT A TIME so the
   *  trace can show the test that drives it. `onLevel(info)` is called for each
   *  node on the way to the root, before and after the repair:
   *    {node, leader, weight, phase: "test" | "done"}
   *  `leader` is the same-weight node with a higher number, if any — the whole
   *  conditional the algorithm turns on.
   *  @returns {Array} the swaps made */
  _update(start, onLevel = null) {
    const swaps = [];
    for (let n = start; n; n = n.parent) {
      const lead = this._leader(n);
      if (onLevel) onLevel({ node: n, leader: lead, weight: n.weight, phase: "test" });
      if (lead) { swaps.push([n, lead]); this._swap(n, lead); }
      n.weight++;
      if (onLevel) onLevel({ node: n, leader: lead, weight: n.weight, phase: "done" });
    }
    return swaps;
  }

  // ---- the codec view (same frame shape as structures/huffman.js) ----------

  /** @param nums node ids whose NUMBER should show under them — the numbering
   *  is only interesting for the nodes a comparison is about, so it appears
   *  exactly when the message names it and stays out of the way otherwise. */
  _clone(n, nums = null) {
    if (!n) return null;
    const label = n.nyt ? "NYT" : (n.sym ?? "");
    const showNum = nums && nums.has(n.id);
    const d = {
      key: n.id,
      label: n.weight,
      sub: showNum ? `${label}#${n.num}` : label,
      left: this._clone(n.left, nums), right: this._clone(n.right, nums),
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
           done = [null, null, null], group = [null, null, null], partial = false,
           nums = null } = {}) {
    const copy = (a) => a.map((o) => ({ t: o.t, ci: o.ci }));
    const col = (label, kind, items, i) => ({
      label, kind, role: roles[i], items: copy(items),
      cur: cur[i], done: done[i] ?? items.length, group: group[i], active: act === i,
    });
    const c = this.cx;
    return {
      cols: [col("text", "chars", c.text, 0),
             col("encoded bits", "bits", c.bits, 1),
             col("decoded text", "chars", c.out, 2)],
      tree: this._clone(this.root, nums),
      stats: this.stats(partial),
    };
  }

  /** Highlight: the codeword path walked so far, the leaf it ended at, and the
   *  nodes a swap moved (drawn in the "danger" red, because a swap is the one
   *  step that changes the SHAPE rather than just a count). */
  _hl({ path = [], leaf = null, swapped = [], cur = null } = {}) {
    return { path, cur: cur ?? undefined, done: leaf ? [leaf] : [], danger: swapped };
  }

  _pathIds(node) {
    const ids = [];
    for (let n = node; n; n = n.parent) ids.unshift(n.id);
    return ids;
  }

  /** The shared update narration: one frame per level, plus an extra frame
   *  BEFORE a swap so the pair is visible in its old positions. Both encode and
   *  decode call this, because both run the identical update — showing it twice
   *  in identical words is the point of the algorithm. */
  _traceUpdate(t, start, sym, side) {
    const act = side === "encode" ? 1 : 2;
    const roles = side === "encode" ? ["in", "out", "out"] : ["in", "in", "out"];
    this._update(start, ({ node, leader, weight, phase }) => {
      const who = node.sym ? `leaf '${node.sym}'` : node.nyt ? "NYT" : "the internal node";
      const nums = new Set([node.id, ...(leader ? [leader.id] : [])]);
      if (phase === "test") {
        t.count("compare");
        if (leader) {
          t.step(`${who} #${node.num} weighs ${weight} — #${leader.num} weighs the same and is numbered higher, so SWAP them first`,
            { snapshot: this._frame({ act, roles, nums }),
              highlight: this._hl({ swapped: [node.id, leader.id] }) });
        }
        return;
      }
      t.count("write");
      t.step(leader
        ? `swapped — now increment: ${weight - 1} → ${weight}`
        : `${who} #${node.num}: nothing of weight ${weight - 1} is numbered higher, so no swap — increment ${weight - 1} → ${weight}`,
        { snapshot: this._frame({ act, roles, nums }),
          highlight: this._hl({ leaf: node.id, swapped: leader ? [node.id] : [] }) });
    });
  }

  /** encodeCodec(text) — one frame per EDGE of the walk (the bit it decides is
   *  appended in that same frame), one per level of the update, and an explicit
   *  frame for every test the algorithm branches on: is the symbol in the tree,
   *  is this node a leaf, does a same-weight node outrank this one. */
  encodeCodec(text = "abracadabra") {
    const t = new Tracer();
    this.reset();
    const ROLES = ["in", "out", "out"];
    const chars = [...String(text)].map(chr);
    this.cx.text = chars.map((ch) => ({ t: ch, ci: -1 }));
    t.step(`encode "${text}" from an EMPTY tree — no table, no first pass`,
      { snapshot: this._frame({ act: 0, done: [0, 0, 0] }), highlight: {} });

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const seen = this.leaves.has(ch);
      const target = seen ? this.leaves.get(ch) : this.nyt;
      const ci = seen ? this._ci(ch) : this.order.length;
      this.cx.text[i].ci = ci;
      const at = (extra = {}) => this._frame({ act: 1, roles: ROLES, cur: [i, extra.bit ?? null, null],
                                               done: [i, null, null], partial: true, ...extra.frame });
      t.count("read");
      // ── the first test, and it is NOT a search of the tree: the encoder
      // keeps a symbol → leaf table (`this.leaves`), so "is it in the tree"
      // and "where is its leaf" are one O(1) lookup. Naming the table matters
      // — the tree on screen cannot answer this question by itself.
      t.step(seen
        ? `'${ch}': look it up in the symbol table → it already has a leaf → walk the root-to-leaf path, sending each turn`
        : `'${ch}': look it up in the symbol table → no leaf yet → walk to NYT instead, then send the symbol in the clear`,
        { snapshot: at(), highlight: this._hl({ path: [this.root.id], cur: this.root.id }) });

      // ── the walk, one frame per edge ─────────────────────────────────────
      const steps = [];                       // [{node, bit}] from the root down
      for (let n = target; n.parent; n = n.parent) {
        steps.unshift({ node: n, bit: n.parent.left === n ? "0" : "1" });
      }
      let code = "";
      const path = [this.root.id];
      for (const { node, bit } of steps) {
        code += bit;
        path.push(node.id);
        this.cx.bits.push({ t: bit, ci });
        t.count("compare").count("write");
        const isLeaf = node.nyt || !!node.sym;
        t.step(`${bit === "0" ? "left" : "right"} → send ${bit}`
          + (isLeaf
            ? ` — ${node.nyt ? "NYT" : `leaf '${node.sym}'`}, the walk ends (${code})`
            : ` — not a leaf yet, keep walking (${code} so far)`),
          { snapshot: at({ bit: this.cx.bits.length - 1 }),
            highlight: this._hl({ path: path.slice(), cur: node.id, leaf: isLeaf ? node.id : null }) });
      }
      if (!steps.length) {
        t.step(`the tree is only NYT — its path is empty, so nothing is sent yet`,
          { snapshot: at(), highlight: this._hl({ path, leaf: this.root.id }) });
      }

      // ── new symbol: the 8 raw bits, marked as a LITERAL, not a codeword ──
      if (!seen) {
        const start = this.cx.bits.length;
        for (const b of ascii8(ch)) { this.cx.bits.push({ t: b, ci }); t.count("write"); }
        this.cx.newSyms++;
        t.step(`after NYT come 8 FIXED bits — '${ch}' in plain ASCII, ${ascii8(ch)} (${ch === SPACE ? 32 : ch.charCodeAt(0)})`,
          { snapshot: this._frame({ act: 1, roles: ROLES, cur: [i, null, null], done: [i, null, null],
                                    group: [null, [start, this.cx.bits.length], null], partial: true }),
            highlight: this._hl({ path, leaf: target.id }) });
      }

      // ── grow the tree, then repair it level by level ─────────────────────
      const from = seen ? target : this._spawn(ch);
      if (!seen) {
        t.count("link", 2);
        t.step(`NYT splits: a new NYT and a leaf for '${ch}' — the alphabet grew, and the symbol table now points '${ch}' at that leaf`,
          { snapshot: this._frame({ act: 1, roles: ROLES, cur: [i, null, null], done: [i + 1, null, null], partial: true }),
            highlight: this._hl({ leaf: this.leaves.get(ch).id }) });
      }
      this._traceUpdate(t, from, ch, "encode");
    }
    t.step(`done — "${text}" is ${this.cx.bits.length} bits, and the decoder needs NO table to read it`,
      { snapshot: this._frame({ act: 1 }), highlight: {} });
    return t.trace();
  }

  /** decodeCodec(bits) — the mirror, bit by bit. Every bit is one frame and one
   *  edge; at a leaf the decoder makes the decision that defines this format:
   *  a SYMBOL leaf ends a variable-length codeword, NYT says the next 8 bits
   *  are a fixed-length literal. Then the same update runs, so the tree tracks
   *  the encoder's exactly. */
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
    this.cx.text = keepText;
    this.cx.bits = stream.map((b) => ({ t: b, ci: -1 }));
    const ROLES = ["in", "in", "out"];
    t.step(`decode ${stream.length} bits from an EMPTY tree — no symbol to look up here: the decoder learns each one from WHERE the walk ends${clean ? "" : " (these are the bits Encode just produced)"}`,
      { snapshot: this._frame({ act: 1, roles: ROLES, done: [null, 0, 0] }), highlight: {} });

    let i = 0;
    while (i < stream.length) {
      const start = i;
      let node = this.root;
      const path = [this.root.id];
      const at = (extra = {}) => this._frame({ act: extra.act ?? 1, roles: ROLES,
        cur: [null, extra.bit ?? null, extra.out ?? null], done: [null, extra.upto ?? i, null], ...extra.frame });

      // ── walk, one bit per frame, until a leaf ────────────────────────────
      t.step(node.nyt || node.sym
        ? `the tree is only NYT — the root IS the leaf, so no bits are read to find it`
        : `start at the root and read bits until a leaf`,
        { snapshot: at(), highlight: this._hl({ path: [this.root.id], cur: this.root.id }) });
      while (!node.nyt && !node.sym) {
        const b = stream[i];
        node = b === "0" ? node.left : node.right;
        t.count("compare");
        if (!node) {
          t.step(`bit ${b}: no child that way — these bits do not belong to this tree`,
            { snapshot: at({ bit: i, upto: i }), highlight: {} });
          return t.trace();
        }
        path.push(node.id);
        i += 1;
        const isLeaf = node.nyt || !!node.sym;
        t.step(`bit ${b} → go ${b === "0" ? "left" : "right"}`
          + (isLeaf ? " — a leaf, so the codeword ends here" : " — not a leaf, read another bit"),
          { snapshot: at({ bit: i - 1, upto: i }),
            highlight: this._hl({ path: path.slice(), cur: node.id, leaf: isLeaf ? node.id : null }) });
      }

      // ── THE decision: a symbol leaf, or the escape to a fixed-length code
      let sym;
      if (node.nyt) {
        t.step(`the leaf is NYT — "not yet transmitted", so this is NOT a codeword: the next 8 bits are a literal`,
          { snapshot: at({ bit: i - 1, upto: i }), highlight: this._hl({ path, leaf: node.id }) });
        const raw = stream.slice(i, i + 8).join("");
        if (raw.length < 8) {
          t.step(`only ${raw.length} bit(s) left — an ASCII literal needs 8, so the stream is truncated`,
            { snapshot: at({ upto: stream.length }), highlight: {} });
          break;
        }
        sym = fromAscii8(raw);
        i += 8;
        this.cx.newSyms++;
        t.step(`read 8 FIXED bits ${raw} = ${parseInt(raw, 2)} = '${sym}' — a symbol seen for the first time`,
          { snapshot: this._frame({ act: 1, roles: ROLES, done: [null, i, null],
                                    group: [null, [i - 8, i], null] }),
            highlight: this._hl({ path, leaf: node.id }) });
      } else {
        sym = node.sym;
        t.step(`the leaf carries '${sym}' — a VARIABLE-length codeword, ${i - start} bit${i - start === 1 ? "" : "s"} of it`,
          { snapshot: at({ bit: i - 1, upto: i }), highlight: this._hl({ path, leaf: node.id }) });
      }

      // ── emit, colouring the bits that produced it ───────────────────────
      const ci = this.leaves.has(sym) ? this._ci(sym) : this.order.length;
      for (let k = start; k < i; k++) this.cx.bits[k].ci = ci;
      this.cx.out.push({ t: sym, ci });
      t.count("write");
      t.step(`emit '${sym}' — ${i - start} bits consumed, back to the root`,
        { snapshot: this._frame({ act: 2, roles: ROLES, cur: [null, null, this.cx.out.length - 1], done: [null, i, null] }),
          highlight: this._hl({ leaf: node.id }) });

      // ── the same growth and the same update the encoder ran ─────────────
      const wasNew = !this.leaves.has(sym);
      const from = wasNew ? this._spawn(sym) : this.leaves.get(sym);
      if (wasNew) {
        t.count("link", 2);
        t.step(`NYT splits here too — the decoder grows the same branch`,
          { snapshot: this._frame({ act: 2, roles: ROLES, done: [null, i, null] }),
            highlight: this._hl({ leaf: this.leaves.get(sym).id }) });
      }
      this._traceUpdate(t, from, sym, "decode");
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
