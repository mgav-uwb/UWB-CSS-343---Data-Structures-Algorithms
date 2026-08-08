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
  about: `
      <p class="lede">A symbol table whose keys are <em>strings</em>, stored by their character
      path. The cost of a search is the length of the key — not the number of keys — and the shape
      of the tree answers prefix questions a hash table cannot.</p>
      <h3>The one subtlety</h3>
      <p>A path existing is <b>not</b> the same as a key being stored. Search <code>shells</code>
      (walks the shared path to a node marked <b>•</b> — found) and then <code>shel</code>: the
      path exists, because it is on the way to shell/shells, but the node carries no terminal mark,
      so it is correctly rejected. That distinction is the commonest trie bug, and the ICA tests it.</p>
      <h3>What to run</h3>
      <ul>
        <li><b>Insert</b> a branching word like <code>sun</code> into the default set — only the
        missing suffix appears; the <code>s</code> is reused. That prefix sharing is why a
        dictionary of English words is far smaller as a trie than as a list.</li>
        <li><b>Search</b> <code>shells</code> ✓ then <code>shel</code> ✗ — the subtlety above.</li>
        <li><b>Prefix</b> <code>sh</code> — the highlighted subtree <em>is</em> the answer to
        "what completes this?". No search, no sorting: the structure already grouped them.</li>
      </ul>
      <p>Watch the step count rather than the tree: adding more words never slows a search, only
      longer words do. The presets contrast heavy prefix sharing (to/tea/ted/ten/in/inn) with none
      at all (cat/dog/fox), which is the same contrast as a compressed trie's best and worst case.</p>`,
  links: [
    { href: "../handouts/ch16-strings-tries.html#trie", label: "Chapter 16 §2: R-way tries →" },
    { href: "../sessions/S16-strings-tries/index.html", label: "Lecture 16 — Part 1 →" },
  ],
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
