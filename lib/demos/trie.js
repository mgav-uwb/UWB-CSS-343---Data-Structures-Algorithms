// CSS 343 unified library — demos/trie.js
// Full-demo spec for the trie (prefix tree): insert/search/prefix, all Θ(key
// length). The initial box takes a comma/space-separated WORD list (buildRaw
// hands the raw text through — the numeric parser never sees it); an empty box
// replays the classic sample. Rendered with the dedicated TrieRenderer: root
// at top center, one drawn edge per character, • marks a stored word.

import { Trie, TrieRenderer } from "../index.js";
import { concatTraces } from "../core/tracer.js";

const SAMPLE = ["she", "sells", "sea", "shells", "shell"];
const words = (text) => String(text ?? "").toLowerCase().split(/[^a-z]+/).filter(Boolean).slice(0, 10);

export const trieDemo = {
  id: "trie",
  title: "Trie (Prefix Tree)",
  blurb: "Each edge is one character; a node is a complete word only if marked terminal (shown as a trailing '•'). insert/search/prefix cost only the length of the key — independent of how many other keys are stored. The initial box takes your own comma-separated word list.",
  make: () => new Trie(),
  initial: "she, sells, sea, shells, shell",
  presets: [
    { name: "she sells sea shells…", initial: "she, sells, sea, shells, shell" },
    { name: "shared prefixes (to/tea/ted/ten/in/inn)", initial: "to, tea, ted, ten, in, inn" },
    { name: "no sharing (cat, dog, fox)", initial: "cat, dog, fox" },
  ],
  initialPlaceholder: "word, word, …",
  initialTitle: "comma/space-separated words (up to 10) — Build inserts them one by one",
  buildRaw: (s, text) => {
    const ws = words(text);
    return concatTraces((ws.length ? ws : SAMPLE).map((w) => s.insert(w)));
  },
  proto: "trie",
  valPlaceholder: "word",
  stateMsg: (tr) => `words: ${tr.inorder().join(", ")} — edit the list and press Build, or Insert one word`,
  renderer: (c) => new TrieRenderer(c),
  costs: ["compare", "visit", "alloc", "write"],
  ops: [
    { name: "Insert", arg: "string", run: (s, v) => s.insert(v) },
    { name: "Search", arg: "string", ghost: true, run: (s, v) => s.search(v) },
    { name: "Prefix", arg: "string", ghost: true, run: (s, v) => s.prefix(v) },
  ],
};
