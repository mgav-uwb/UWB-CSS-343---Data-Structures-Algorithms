<!--
  CSS 343 · Lecture 16 (Session 16) — Strings: Tries & Substring Search.
  reveal.js: "---" = next part (→), "--" = next slide (↓). Notes follow "Note:".
  Concrete C++ (structs, char-indexed children) — no templates/inheritance.
  KaTeX: never two "_" on one line. Verify at 1280×620; code/ASCII ≤ ~56 chars.

  Reading (pre): Sedgewick & Wayne §5.2 (Tries) + §5.3 (Substring Search) +
  booksite lecture slides; ODS Ch 13 (optional).
  THROUGH-LINE: keys are STRINGS, so exploit their structure. A TRIE stores keys
  by their CHARACTER PATH — search/insert cost = key LENGTH, independent of how
  many keys, and it answers PREFIX queries (autocomplete) for free. Substring
  search: brute force is Θ(nm); KMP builds a DFA on the pattern so it NEVER backs
  up in the text (Θ(n+m)); Boyer-Moore skips ahead (sublinear in practice).

  Strings are largely NEW / Sedgewick-based (not a Spring-26 focus). Demos: trie
  (TreeRenderer) + substring search (ArrayRenderer).

  Session plan (150 min). 0:00 intro 0:04 P1 tries 26 0:30 P2 prefix ops 16
  0:46 BREAK 10 0:56 P3 brute force 18 1:14 P4 KMP & BM 30 1:44 P5 wrap 12
  1:56 ICA 2:30 end.
-->

## CSS 343

### Data Structures, Algorithms & Discrete Mathematics II

**Lecture 16 — Strings: Tries & Substring Search**

<small>Summer 2026 · T/Th 6:00–8:30 · UW1 020 · Dr. Marcel Gavriliu</small>

---

## Reading

**Sedgewick & Wayne §5.2 (Tries) + §5.3 (Substring Search)**

- **tries** — string symbol tables keyed by character path
- **prefix operations** — autocomplete, longest-prefix
- **substring search** — brute force vs **KMP** vs Boyer-Moore

_Optional:_ ODS Ch 13. Reading quiz due before class.

---

### Part 1 · Tries (string symbol tables)

<small>(~26 min)</small>

--

## String keys

When keys are **strings**, we can do better than "compare two whole strings":

```text
   BST:   O(log n) COMPARES, each up to L chars → O(L log n)
   hash:  O(1) but hashes the WHOLE key, and no order/prefix
```

Exploit the **characters** → a trie: **O(L)**, independent of n, with prefix queries.

--

## The trie idea

Store keys along **paths of characters** from the root; each edge is one character:

```text
   keys: she, sea, sells      ● = a word ends here
         (root)
            |
            s                she   = s-h-e
          /   \              sea   = s-e-a
         e     h             sells = s-e-l-l-s
        / \     \
       a●  l     e●
           |
           l
           |
           s●
```

--

## R-way trie structure

Each node has an array of **R** child pointers (R = alphabet size) + a "is-word" flag:

```text
   struct Node {
       Node* next[R];      // one slot per possible character
       bool  isWord;
   };
```

For lowercase letters R = 26; for bytes R = 256.

--

## Trie search & insert

```text
   search(key):  follow next[c] for each char c;
                 fall off (null) → NOT present;
                 reach the end → present iff isWord
   insert(key):  follow/create nodes along the path;
                 mark the last node isWord = true
```

Both are **O(L)** — L = key length. No comparisons between keys.

--

## Trie — the code

```text
struct Node { Node* next[R] = {}; bool isWord = false; };

bool search(Node* t, const string& key) {
    for (char c : key) {
        if (!t->next[c]) return false;   // fell off
        t = t->next[c];
    }
    return t->isWord;                     // path exists — is it a word?
}
```

Insert is the same walk, creating nodes and setting `isWord` at the end.

--

## Trie — a worked search

Trie holding `{she, shell, shells}`. Search `"shell"`:

```text
   s → h → e → l → l   (follow 5 chars)
   reached the node for "shell", isWord = true → FOUND
   search "shel": same path 4 chars, isWord = false → NOT a word
```

Cost = 5 character steps — regardless of how many keys the trie holds.

--

## Trie — a worked insert

Insert `"sea"` into a trie holding `{she, shell}`:

```text
   s:  exists (shared with she/shell)     → follow it
   e:  's' has no 'e' child               → CREATE it
   a:  create, and mark it as a word ●

   "sea" and "she" now share exactly one node: 's'
```

Insert creates only the **missing** suffix; shared prefixes are reused.

--

## Your turn — draw the trie

Insert `to, tea, ten` into an empty trie:

```text
   how many nodes (besides the root)?
   which nodes are word-marked?
```

<small>Five: `t` → `o●` and `t` → `e` → `a●`, `n●`. The three ● word-ends are o, a, n; `t` and `e` are shared, unmarked path nodes. Searching "te" walks a valid path but `e` isn't a word → NOT found.</small>

--

## 🎬 Demo — trie

<div class="algo-viz" data-algo="trie">
<pre class="viz-fallback">
   insert she, sells, sea, shells, shell — sharing prefixes.
   search "she" (a word ✓), "sh" (a path but NOT a word ✗).
   each step follows one character down the tree; word-end
   nodes are marked. cost = key length, not # of keys.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Type a word: **Insert** (only the missing suffix appears), **Search** (`shells` ✓ vs `shel` ✗), **Prefix** (`sh` → the subtree). Starts with the five sample words.</small>

--

## Trie — the cost

| operation | cost |
|---|---|
| search / insert | **Θ(L)** (key length) |
| search miss | often < L (fall off early) |
| space | up to Θ(R · N · L) pointers |

Independent of the number of keys — but **R pointers per node** is the price.

--

## Compressed tries (radix trees)

Collapse chains of **single-child** nodes into one edge labeled with a **substring**:

```text
   {she, shells}:   "sh" ──► "e"(word) ──► "lls"(word)
   (no separate s, h, e, l, l, s nodes)
```

Far fewer nodes and pointer-hops. **Patricia tries** do this for IP routing tables.

--

## Ternary search tries (TSTs)

Store the R children as a **little BST** per node — each trie node becomes 3 links:

```text
   struct Node {
       char c;
       Node *left, *mid, *right;   // < c,  == c (next char),  > c
       bool isWord;
   };
```

**Θ(L + log R)** search, far less space than R-way.

--

## TST — how a lookup works

Three links per node: `left` (< c), `mid` (== c → next char), `right` (> c).

```text
   search "sea":
     at a node, compare query char to c:
       < c → go left      > c → go right      == c → go MID (advance query)
   only 'mid' consumes a character; left/right pick among siblings
```

Θ(L + log R) — the log R is the sibling search, once per character.

--

## Trie vs hash vs BST (for strings)

| | trie | hash | BST |
|---|---|---|---|
| search | **Θ(L)** | Θ(L) hash | Θ(L log n) |
| ordered? | **yes** | no | yes |
| **prefix** queries | **yes** | no | no |
| space | high (R-way) | moderate | moderate |

Tries win when **prefixes** matter.

--

## Trie deletion

Delete a key in two steps:

```text
   1. unmark its word-node (isWord = false)
   2. prune bottom-up: a node with NO children and NOT a word → remove it,
      then check its parent
```

Careful: never remove nodes **shared** by other keys (delete "shell", keep "shells").

---

### Part 2 · Prefix operations

<small>(~16 min)</small>

--

## keysWithPrefix (autocomplete)

Find all keys starting with a prefix:

```text
   1. walk the trie down the prefix path
   2. collect every word-marked node in the SUBTREE below
```

```text
   prefix "sh" → she, shell, shells   (autocomplete!)
```

--

## keysWithPrefix — worked

Trie holding `{she, shell, shells, sea}`. Query prefix `"she"`:

```text
   1. walk s → h → e   (reach the "she" node)
   2. DFS the subtree below, collecting word-marked nodes:
      she (isWord), shell, shells
   → { she, shell, shells }   ("sea" is elsewhere — pruned)
```

--

## longestPrefixOf

The longest stored key that is a **prefix of a query**:

```text
   keys: {she, shells}    longestPrefixOf("shellsort") = "shells"
```

Walk the query down the trie; remember the **last word-marked node** you passed.

--

## longestPrefixOf — worked

Keys `{she, shells}`. Query `"shellsort"`:

```text
   s h e   → "she" is a word ✓  (remember "she")
   l l s   → "shells" is a word ✓  (remember "shells")
   o       → no child → stop
   → longest stored prefix = "shells"
```

One descent; remember the deepest word-marked node passed.

--

## Why prefixes are free

The trie's **structure** already groups keys by shared prefix:

```text
   all keys with prefix P  ⟺  the subtree under P's node
```

No extra index, no sorting — the tree *is* the prefix index.

--

## Autocomplete, in practice

Real autocomplete = `keysWithPrefix` + a **ranking**:

```text
   type "sh" → keysWithPrefix("sh") = {she, shell, shells}
   → rank by frequency / recency → show top few
```

Store a **weight** at each word-node; return the highest-weighted completions.

--

## Wildcard & fuzzy matching

Tries support more than exact prefixes:

- **`?` wildcard** — at that position, try **all** children (branch)
- **fuzzy / edit-distance** search — explore nearby paths within an edit budget

```text
   "c?t" → cat, cot, cut …    "cet"~1 → cat, cot, get, …
```

--

## Where tries are used

- **autocomplete** / type-ahead search
- **spell-checkers** and word games (fast prefix membership)
- **IP routing** — longest-prefix match
- **T9** predictive text, **contacts** search

--

## Prefix operations — recap

One structure, in Θ(L), answers:

- **search / contains** — is this exact word stored?
- **keysWithPrefix(p)** — autocomplete
- **longestPrefixOf(q)** — IP routing, word segmentation
- **wildcard / fuzzy** — spell-check, "did you mean?"

---

### Part 3 · Brute-force substring search

<small>(~18 min)</small>

--

## The substring search problem

Find the first occurrence of a **pattern** (length m) inside a **text** (length n):

```text
   text:    A B A B A B C A B A B A B C A B
   pattern:     A B A B C
   → first match at index 2   (text[2..6] = ABABC)
```

`text.indexOf(pattern)`, `grep`, "find" in an editor — all this.

--

## Brute force

Try the pattern at **every** starting position; compare character by character:

```text
   for i in 0 .. n-m:
       match pattern against text starting at i
       if all m chars match → return i
```

On a mismatch, **slide the pattern by ONE** and restart the comparison.

--

## Brute force — the code

```text
int search(const string& t, const string& p) {
    int n = t.size(), m = p.size();
    for (int i = 0; i <= n - m; i++) {      // each start position
        int j = 0;
        while (j < m && t[i+j] == p[j]) j++; // compare
        if (j == m) return i;                // full match
    }
    return -1;
}
```

The nested loop is the Θ(nm): up to `n` starts × up to `m` compares.

--

## Brute force — worked

```text
   text:    A B A B C
   pattern: A B A B C

   i=0: A B A B C   all 5 match → FOUND at 0
```

```text
   text:    A B C A B A B C
   pattern:     A B A B C
   i=0: A B C… mismatch at 2 → slide to i=1
   i=1: B C…   mismatch at 0 → slide to i=2  … eventually match at 3
```

--

## First match or all matches?

- **first** occurrence — stop at the first full match (what we've shown)
- **all** occurrences — after a match, **continue** searching from the next position
- **count** — the same, tallying matches

```text
   KMP for "all": on a match, set j = fail[m-1] and keep going
```

--

## Brute force — the cost

```text
   worst case: pattern AAAA…AB, text AAAA…AAA
   each of ~n positions rescans ~m chars → Θ(n · m)
```

The waste: on a mismatch it **re-examines** text characters it already looked at.

--

## When brute force is fine

Don't over-engineer — brute force is often the right call:

- **short** text/pattern, or **random-ish** text (near-linear)
- a **one-off** search — preprocessing isn't worth it

Reach for KMP/BM on **long**, **repetitive**, or **repeatedly-searched** text.

---

### Part 4 · KMP & Boyer-Moore

<small>(~30 min)</small>

--

## KMP: never back up

**Knuth-Morris-Pratt:** after a partial match, we already know the last few text characters — use them to shift the pattern **without re-reading the text**.

```text
   the text pointer i NEVER decreases
   on a mismatch, jump the PATTERN pointer j instead
```

Result: **Θ(n + m)** — linear.

--

## The key insight

```text
   text:     A B A B A B C …
   pattern:  A B A B C
                     ↑ mismatch at pattern[4]
```

We matched `"ABAB"`. `"AB"` is a prefix of the pattern that's also a **suffix** of what we matched → slide so `"AB"` re-aligns, resume at `pattern[2]`, **keep i**.

--

## Failure function — worked

Pattern `"AABAA"`:

```text
   j:      0  1  2  3  4
   P:      A  A  B  A  A
   fail:   0  1  0  1  2
```

`fail[4]=2`: `"AA"` is the longest proper prefix of `"AABAA"` that's also a suffix. Mismatch at `j=4` → reset `j = fail[3] = 1`, keep `i`.

--

## Your turn — failure function

Pattern `"ABABAC"` — fill the table:

```text
   j:      0  1  2  3  4  5
   P:      A  B  A  B  A  C
   fail:   ?  ?  ?  ?  ?  ?
```

<small>`fail = [0, 0, 1, 2, 3, 0]` — the ABAB self-overlap grows (A, AB, ABA…), and the C at the end matches no prefix, so it resets to 0. A mismatch at `j=5` falls back to `j = fail[4] = 3`.</small>

--

## The failure function / DFA

Precompute, for the **pattern**, how far to fall back on a mismatch:

```text
   fail[j] = length of the longest proper prefix of pattern[0..j)
             that is also a suffix of it
```

On a mismatch at pattern index j, reset `j = fail[j]` (don't touch i).

--

## Sedgewick's DFA view

Instead of a failure function, precompute a **full DFA** on the pattern:

```text
   dfa[c][j] = the pattern state to go to on reading char c in state j
```

- search: **one array lookup** per text char, no inner loop
- build: Θ(R·m); search: Θ(n) — a deterministic automaton for the pattern

--

## Building the failure function

```text
   fail[0] = 0;  int k = 0;
   for (int j = 1; j < m; j++) {
       while (k > 0 && P[j] != P[k]) k = fail[k-1];
       if (P[j] == P[k]) k++;
       fail[j] = k;
   }
```

The pattern matches **itself** — Θ(m).

--

## KMP — the search

```text
int kmp(const string& t, const string& p, vector<int>& fail) {
    int j = 0;                            // chars matched so far
    for (int i = 0; i < (int)t.size(); i++) {
        while (j > 0 && t[i] != p[j]) j = fail[j-1];   // fall back
        if (t[i] == p[j]) j++;
        if (j == (int)p.size()) return i - j + 1;      // match!
    }
    return -1;
}
```

`i` only ever **increases** → the text is read once → **Θ(n)**.

--

## 🎬 Demo — substring search

<div class="algo-viz" data-algo="string-search">
<pre class="viz-fallback">
   brute force: align the pattern, compare, and on a mismatch
   slide by ONE — re-examining text characters.
   KMP: on a mismatch, jump the pattern via the failure table
   and NEVER move the text pointer back. watch the compare
   count: brute-force Θ(nm) vs KMP Θ(n+m).
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Run **Brute force**, then **KMP** on the same pair and compare the **compare counters**. The default is the intro example; try `AAAAAAAAAAAB AAAB` — brute force's worst case, KMP unbothered.</small>

--

## KMP — the cost

```text
   build the failure function: Θ(m)
   scan the text (i never backs up): Θ(n)
   total: Θ(n + m)   — guaranteed linear
```

The text is read **once**, left to right — great for streaming.

--

## KMP vs brute — the numbers

Worst case: text `AAA…A` (n chars), pattern `AA…AB` (m chars):

```text
   brute force:  ~ n · m comparisons
   KMP:          ~ n + m comparisons
```

```text
   n = 10⁶, m = 1000:   10⁹  vs  10⁶   →  ~1000× fewer
```

--

## KMP — a worked search

Pattern `"AABAAC"`, `fail = [0,1,0,1,2,0]`:

```text
   text:    A A B A A B A A C …
   match A A B A A, then pattern[5]='C' vs text[5]='B' → MISMATCH
   → j = fail[4] = 2, keep i = 5
   resume comparing pattern[2]='B' vs text[5]='B' … continue
```

The text pointer stays at 5 — `text[0..4]` are never re-read.

--

## Boyer-Moore: skip ahead

Compare the pattern **right-to-left**; on a mismatch, use the **bad character** to jump far ahead:

```text
   text:    … X Y Z …
   pattern:     A B C   Z not in pattern → skip PAST it
```

Often **sublinear** — the standard for `grep`/editors.

--

## Boyer-Moore — worked

```text
   text:    … S T R I N G   S E A R C H …
   pattern:       S E A R C H
                            ↑ compare RIGHT to LEFT
   text char 'G' aligns under pattern[5]='H': mismatch, and
   'G' is NOT in "SEARCH" → skip the pattern PAST 'G' entirely
```

One comparison skipped 6 positions — that's the sublinear win.

--

## Boyer-Moore: two rules

Boyer-Moore combines two skip heuristics, taking the **larger**:

- **bad character** — align the mismatched char with its last pattern occurrence
- **good suffix** — reuse an already-matched suffix (KMP's idea, for suffixes)

--

## The substring-search family

| algorithm | preprocess | search | note |
|---|---|---|---|
| **brute force** | none | Θ(nm) worst | simple |
| **KMP** | Θ(m) pattern | **Θ(n+m)** | never backs up |
| **Boyer-Moore** | Θ(m+R) | **sublinear** typical | grep/editors |
| **Rabin-Karp** | Θ(m) | Θ(n) avg | rolling **hash** |

--

## Rabin-Karp: hashing windows

Hash the pattern once; **roll** a hash over each length-m window of the text:

```text
   if hash(window) == hash(pattern):  verify char-by-char (guard collisions)
   rolling hash updates in O(1) per shift → Θ(n) average
```

Shines for **multiple patterns** (hash them all into a set) and **2-D** search.

--

## The common thread

Every fast searcher **preprocesses the pattern**, then reads the text **once**:

```text
   KMP:          failure function / DFA
   Boyer-Moore:  skip tables
   Rabin-Karp:   pattern hash
```

Preprocess `m` (small, reused), then scan `n` (huge) → **Θ(n + f(m))**.

---

### Part 5 · Wrap & ICA 16

<small>(~12 min)</small>

--

## Recap — tries

- a **trie** keys strings by **character path** → **Θ(L)**, independent of n
- **prefix operations** (autocomplete, longest-prefix) come for free
- **TSTs** cut the R-pointer space cost

--

## Recap — substring search

- **brute force** Θ(nm) — re-examines text on a mismatch
- **KMP** Θ(n+m) — a **DFA/failure function** on the pattern, never backs up
- **Boyer-Moore** — skip ahead, sublinear in practice

> Exploit the string's structure — its characters (tries) or its self-overlaps (KMP).

--

## The string toolkit

| need | tool | cost |
|---|---|---|
| string keys + **prefix** queries | **trie / TST** | Θ(L) |
| exact key lookup, no order | hash | Θ(L) |
| find a pattern (guaranteed linear) | **KMP** | Θ(n+m) |
| find a pattern (fast in practice) | **Boyer-Moore** | sublinear |
| find many patterns / rolling | **Rabin-Karp** | Θ(n) avg |

--

## Strings are everywhere

- **search** — grep, find-in-editor, code search
- **bioinformatics** — DNA/protein pattern matching (huge texts)
- **networking** — deep-packet inspection, intrusion detection
- **autocomplete / spell-check** — tries
- **compilers** — lexing with tries/automata

--

## ICA 16 — your turn

In `ica16/ica16.cpp`:

- a **trie** — `insert`, `search`, `startsWith` (prefix)
- **brute-force** substring search
- **KMP** — failure function + no-backup search

Build `-g`, run the self-tests, Valgrind-clean.

