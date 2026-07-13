// CSS 343 unified library — structures/huffman.js
// Huffman coding: build an optimal prefix code by repeatedly merging the two
// least-frequent trees in a forest until one tree remains (a greedy, bottom-up
// construction — CLRS Ch.16). No heap class is used: with demo-sized forests
// (a handful of symbols) a linear min-scan is clearer to trace step-by-step
// than heap-sift internals would be. Renders with the shared TreeRenderer:
// leaves show their character (key) with frequency underneath ("f " label,
// labels:"freq"); internal nodes show their combined frequency as the key.
// Every op returns a Trace the Player scrubs, exactly like bst.js/heap.js.

import { Tracer } from "../core/tracer.js";

// The classic CLRS (Ch.16) example: a..f with these frequencies out of 100.
// Known-optimal weighted total (Σ freq·codelen) = 224.
const DEFAULT_FREQS = [["a", 5], ["b", 9], ["c", 12], ["d", 13], ["e", 16], ["f", 45]];

const leaf = (ch, f) => ({ key: ch, freq: f, size: f, isLeaf: true, left: null, right: null });
const branch = (lo, hi) => ({ key: lo.freq + hi.freq, freq: lo.freq + hi.freq, size: lo.freq + hi.freq, isLeaf: false, left: lo, right: hi });
// Renderer-facing clone: only the fields TreeRenderer reads (key/left/right/size).
const cloneNode = (n) => (n ? { key: n.key, size: n.size, left: cloneNode(n.left), right: cloneNode(n.right) } : null);

export class Huffman {
  constructor() { this.root = null; }

  /**
   * build(freqs) — freqs is [[char, frequency], …]. No args (or an empty
   * array, e.g. from the demo harness's numeric-only "initial" box) falls
   * back to the classic CLRS sample. TRACED: start as a forest of single-node
   * trees, then repeatedly merge the two smallest-frequency roots until one
   * tree remains.
   */
  /** Numbers → symbol pairs: "5, 9, 12" becomes a:5, b:9, c:12 (demo initial box). */
  _pairs(freqs) {
    if (Array.isArray(freqs) && freqs.length && !Array.isArray(freqs[0]))
      return freqs.filter(Number.isFinite).map((f, i) => [String.fromCharCode(97 + i), f]);
    return freqs;
  }
  loadRaw(keys) { this.build(this._pairs(keys)); return this; } // silent build (trace discarded)

  build(freqs) {
    const t = new Tracer();
    freqs = this._pairs(freqs);
    const list = Array.isArray(freqs) && freqs.length ? freqs : DEFAULT_FREQS;
    let forest = list.map(([ch, f]) => leaf(ch, f));

    if (forest.length === 0) { this.root = null; t.step("build: no symbols given", { snapshot: null }); return t.trace(); }
    if (forest.length === 1) {
      this.root = forest[0];
      t.step(`start: 1 leaf (${this.root.key}) — trivially the whole tree, code "0"`, { snapshot: cloneNode(this.root), highlight: { done: this.root.key } });
      return t.trace();
    }

    t.step(`start: ${forest.length} leaves as a forest`, { snapshot: null, highlight: {} });

    while (forest.length > 1) {
      // take the two smallest-frequency roots via a linear min-scan (twice)
      let i1 = 0;
      for (let i = 1; i < forest.length; i++) { t.count("compare"); if (forest[i].freq < forest[i1].freq) i1 = i; }
      const a = forest.splice(i1, 1)[0];

      let i2 = 0;
      for (let i = 1; i < forest.length; i++) { t.count("compare"); if (forest[i].freq < forest[i2].freq) i2 = i; }
      const b = forest.splice(i2, 1)[0];

      const lo = a.freq <= b.freq ? a : b, hi = a.freq <= b.freq ? b : a; // left = smaller, right = larger (consistent rule)
      const parent = branch(lo, hi);
      t.count("alloc").count("link", 2);
      forest.push(parent);

      t.step(`merge the two smallest: ${lo.key}(${lo.freq}) + ${hi.key}(${hi.freq}) → (${parent.freq})`,
        { snapshot: cloneNode(parent), highlight: { appear: parent.key } });
    }

    this.root = forest[0];
    t.step(`done — Huffman tree built (root frequency ${this.root.freq})`, { snapshot: cloneNode(this.root), highlight: { done: this.root.key } });
    return t.trace();
  }

  /** Current tree in the {key,left,right,size} shape TreeRenderer expects. */
  snapshot() { return cloneNode(this.root); }

  /** codes() — walk left=0/right=1 from the root; returns {char: "010", …}. */
  codes() {
    const map = {};
    if (!this.root) return map;
    if (this.root.isLeaf) { map[this.root.key] = "0"; return map; } // degenerate 1-symbol tree
    (function walk(node, prefix) {
      if (!node) return;
      if (node.isLeaf) { map[node.key] = prefix; return; }
      walk(node.left, prefix + "0");
      walk(node.right, prefix + "1");
    })(this.root, "");
    return map;
  }

  /** codesWalk(text) — TRACED encode: walk root→leaf for each character,
      accumulating its code, then show the assembled bit string and decode it
      back (decode = the same walks driven by the bits). */
  codesWalk(text = "cab") {
    const t = new Tracer();
    if (!this.root) { t.step("no tree — run build first", { snapshot: null }); return t.trace(); }
    const snap = () => cloneNode(this.root);
    const known = this.codes();
    let bits = "";
    t.step(`encode "${text}": each symbol's code is its root-to-leaf path (left = 0, right = 1)`,
      { snapshot: snap(), highlight: { active: this.root.key } });
    for (const ch of text) {
      if (!(ch in known)) {
        t.step(`'${ch}' is not in this tree — a Huffman code only covers the symbols it was built for. Skipped`,
          { snapshot: snap(), highlight: {} });
        continue;
      }
      let node = this.root, code = "";
      t.step(`'${ch}': start at the root`, { snapshot: snap(), highlight: { active: node.key } });
      while (!node.isLeaf) {
        const goLeft = (function has(n) { return n ? (n.isLeaf ? n.key === ch : has(n.left) || has(n.right)) : false; })(node.left);
        node = goLeft ? node.left : node.right;
        code += goLeft ? "0" : "1";
        t.count("compare");
        t.step(`'${ch}': ${goLeft ? "left → 0" : "right → 1"}   (code so far: ${code})`,
          { snapshot: snap(), highlight: { active: node.key } });
      }
      bits += code;
      t.count("write", code.length);
      t.step(`'${ch}' = ${code}   (bits so far: ${bits})`, { snapshot: snap(), highlight: { done: node.key } });
    }
    t.step(`"${text}" → ${bits} (${bits.length} bits). DECODE runs the same walks in reverse: follow each bit from the root, emit at a leaf, restart — "${this.decode(bits)}" comes back out`,
      { snapshot: snap(), highlight: { done: this.root.key } });
    return t.trace();
  }

  /** encode(text) — concatenate each character's code. */
  encode(text) {
    const map = this.codes();
    let out = "";
    for (const ch of text) {
      if (!(ch in map)) throw new Error(`encode: symbol '${ch}' is not in the Huffman tree`);
      out += map[ch];
    }
    return out;
  }

  /** decode(bits) — walk the tree per bit, emitting a character at each leaf. */
  decode(bits) {
    if (!this.root) return "";
    if (this.root.isLeaf) return bits.split("").map(() => this.root.key).join(""); // degenerate 1-symbol tree
    let out = "", node = this.root;
    for (const b of bits) {
      node = b === "0" ? node.left : node.right;
      if (!node) throw new Error("decode: invalid bit string for this tree");
      if (node.isLeaf) { out += node.key; node = this.root; }
    }
    return out;
  }

  /** A short summary: symbol count + frequency-weighted average code length. */
  inorder() {
    if (!this.root) return "0 symbols";
    const codeMap = this.codes();
    const freqOf = {};
    (function walk(n) { if (!n) return; if (n.isLeaf) freqOf[n.key] = n.freq; else { walk(n.left); walk(n.right); } })(this.root);
    const syms = Object.keys(codeMap);
    let totalFreq = 0, totalBits = 0;
    for (const s of syms) { const f = freqOf[s] || 0; totalFreq += f; totalBits += f * codeMap[s].length; }
    const avg = totalFreq ? totalBits / totalFreq : 0;
    return `${syms.length} symbols · avg ${avg.toFixed(2)} bits/symbol`;
  }
}
