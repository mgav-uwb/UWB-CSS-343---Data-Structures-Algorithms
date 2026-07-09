// CSS 343 unified library — demos/trie.js
// Full-demo spec for the trie (prefix tree): insert/search/prefix, all Θ(key
// length). The generic FullDemo "initial" box only parses NUMBERS (like
// huffman/dp), so it's left blank — Build always (re)builds the sample word
// list "she, sells, sea, shells, shell" baked into structures/trie.js.
// Rendered with the shared TreeRenderer (see structures/trie.js for how an
// n-ary trie is encoded as the binary key/left/right shape TreeRenderer reads).

import { Trie, TreeRenderer } from "../index.js";

export const trieDemo = {
  id: "trie",
  title: "Trie (Prefix Tree)",
  blurb: "Each edge is one character; a node is a complete word only if marked terminal (shown as a trailing '•'). insert/search/prefix cost only the length of the key — independent of how many other keys are stored.",
  make: () => new Trie(),
  initial: "",
  stateMsg: (tr) => `words: ${tr.inorder().join(", ")} — built from the sample she/sells/sea/shells/shell`,
  renderer: (c) => new TreeRenderer(c, { labels: "none" }),
  costs: ["compare", "visit", "alloc", "write"],
  ops: [
    { name: "Insert", arg: "string", run: (s, v) => s.insert(v) },
    { name: "Search", arg: "string", ghost: true, run: (s, v) => s.search(v) },
    { name: "Prefix", arg: "string", ghost: true, run: (s, v) => s.prefix(v) },
  ],
};
