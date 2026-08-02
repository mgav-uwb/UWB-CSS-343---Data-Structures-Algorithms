// CSS 343 unified library — demos/adaptive-huffman.js
// Adaptive Huffman (FGK), in the codec layout: the tree on top — which here is
// the whole show, because it CHANGES with every symbol — then text · bits ·
// decoded text, then the sizes. There is no build row: nothing is built ahead
// of time, which is the entire point of the algorithm.

import { AdaptiveHuffman, CodecPanels, codecStatsHTML, TreeRenderer } from "../index.js";

/** A function, not a constant: each mount needs its own handle on its panels. */
export function adaptiveCodecSpec() {
  const view = {};
  return {
    make: () => new AdaptiveHuffman(),
    noBuild: true,                     // there is nothing to build — that IS the algorithm
    renderer: [
      (c) => { const r = new TreeRenderer(c, { labels: "sym", R: 14, TOP: 22 }); r.expandable = true; return r; },
      (c) => (view.panels = new CodecPanels(c, { initialText: "abracadabra" })),
    ],
    height: [172, 150],
    costs: ["read", "compare", "write", "link"],
    // no build row at all: nothing to build, and every Encode starts from an
    // empty tree anyway, so a Reset button would promise a state change that
    // has already happened
    chrome: { showValue: false, showOps: false, showClear: false, costsInline: true },
    info: { place: "below", html: true, render: (snap) => codecStatsHTML(snap?.stats) },
    stateMsg: (s) => `${s.inorder()} — type text and press Encode; the tree grows as it reads`,
    onMount: (demo) => view.panels?.setActions([
      { label: "Encode ▸", gap: 0, title: "text → bits, updating the tree after every symbol",
        run: () => demo.runOp("Encode") },
      { label: "Decode ▸", gap: 1, title: "bits → text, from an empty tree, running the same updates",
        run: () => demo.runOp("Decode") },
    ]),
    ops: [
      { name: "Encode", desc: "text → bits: send the path if the symbol is known, else NYT + 8 ASCII bits, then update",
        run: (s) => s.encodeCodec(view.panels?.text() || "abracadabra") },
      { name: "Decode", desc: "bits → text: the same walk and the same updates, from an empty tree",
        run: (s) => s.decodeCodec("") },
    ],
  };
}

export const adaptiveHuffmanDemo = {
  id: "adaptive-huffman",
  title: "Adaptive Huffman (FGK)",
  blurb: "Static Huffman needs two passes and a table: count the whole text, build the tree, then ship the tree along with the message. Adaptive Huffman needs neither. Encoder and decoder start from the SAME empty tree — one leaf, NYT (\"not yet transmitted\") — and after every symbol they run the SAME update, so the decoder always already knows the code the encoder just used. The encoder keeps a symbol → leaf table beside the tree — that one lookup is how it knows whether a symbol has a leaf yet, and the decoder needs no such table because where its walk ENDS is the answer. A symbol already in the tree costs its path; a brand-new one costs the path to NYT plus 8 plain ASCII bits, and NYT splits to make room for it. The update walks from the leaf to the root incrementing weights, swapping any node that a same-weight, higher-numbered node outranks — that swap is the whole algorithm, and it is what keeps the tree a Huffman tree for the counts seen SO FAR (Gallager's sibling property). Watch the tree reshape as the text arrives: try abracadabra, mississippi, or a long run like aaaaaaaaaabbbbbccc, then a pangram to see it lose — 27 first-appearances cost 8 bits each and nothing repeats.",
  ...adaptiveCodecSpec(),
};
