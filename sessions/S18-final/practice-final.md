# CSS 343 — Practice Final (Summer 2026)

**100 points · 120 minutes · Session 18 · a Canvas quiz, taken in class.** Comprehensive (S1–S17): the post-midterm material leads, with direct first-half items (a heap, Dijkstra) alongside the complexity bank. Closed book; one double-sided hand-written note page; no devices other than the Canvas exam page. Orders/lists: **comma-separated, no spaces**; ties broken **alphabetically / ascending** unless stated. This document is the paper rendering of the quiz.

*Same structure, length, and rules as the real final — only the data differs. Full key at the end; work it cold, on paper, in 120 minutes first. It is also on Canvas as an **ungraded practice quiz** with these exact questions — take that version too, so exam-day answer entry is automatic.*

## Q1 — Tight complexity bounds (10 pts)

Choose from: O(1) · O(log n) · O(n) · O(n log n) · O(n²) · O(E log V) · O(n + m) · O(n·m).

1. Kruskal's algorithm on a connected graph (E edges, V vertices), edges unsorted = ______

2. Huffman coding of n symbols using a binary min-heap = ______

3. KMP substring search, pattern length m, text length n = ______

4. Filling the LCS table for strings of lengths n and m = ______

5. quickselect (average case) for the k-th smallest of n items = ______

6. Worst-case search in an AVL tree of n keys = ______

7. Find the minimum in a binary min-heap of n nodes = ______

8. union in weighted quick-union WITH path compression (amortized, practical) = ______

9. Build the KMP failure function for a pattern of length m = ______

10. Comparison-sorting lower bound (any algorithm), n items = ______

## Q2 — Union-find & Kruskal (10 pts)

**(a)** A weighted quick-union with **full path compression** starts as 10 singletons (0..9). `union(p,q)` links the smaller tree's root under the larger; on a size tie, p's root goes under q's root. `find` compresses (every node on the path repoints to the root). Execute, in order:

> union(0,1) union(2,3) union(4,5) union(6,7) union(0,2) union(4,6) union(8,9) union(0,8)

then execute `find(1)` and `find(7)`. Give **(i)** the two find results (2 pts) and **(ii)** the full `parent[]` array afterward (4 pts).

**(b)** Kruskal's algorithm runs on a 9-vertex graph (vertices 0..8) with edges `(u,v,w)`: (0,1,3) · (0,7,10) · (1,2,7) · (2,3,6) · (2,8,1) · (3,4,8) · (3,5,13) · (4,5,9) · (5,6,4) · (7,6,2) · (7,8,5) · (8,6,11).

Give the edges in the order Kruskal **accepts** them, written as `u-v` pairs comma-separated (2 pts), the **first edge it skips** as `u-v` (1 pt), and the **MST weight** (1 pt).

## Q3 — Articulation points (8 pts)

An **undirected** graph on {A, B, C, D, E, F, G, H} with edges: A–B · A–C · B–C · C–D · D–F · F–E · D–E · F–G · G–H.

Run the (seq, low) algorithm from **A**, visiting neighbors alphabetically. **(a)** Give (seq, low) for every vertex (6 pts). **(b)** List the articulation points (2 pts).

## Q4 — Huffman coding (8 pts)

Frequencies: **a: 25   b: 12   c: 7   d: 28   e: 14   f: 4   g: 3**

Build the Huffman trie. Determinism rules: always merge the two nodes of smallest frequency, breaking frequency ties by the alphabetically-first symbol contained; of the two merged nodes, the smaller (same rule) becomes the **left** (0) child.

**(a)** the codes for **a, c, d, f, g** (1 pt each) · **(b)** encode **fade** (2 pts) · **(c)** how many bits total (1 pt)?

## Q5 — Recurrences (6 pts, 2 each)

Solve with the master theorem (state the case):

1. T(n) = 2·T(n/2) + 1

2. T(n) = T(n/2) + 1

3. T(n) = 3·T(n/2) + n

## Q6 — LCS (8 pts)

Fill the LCS table for **A = ABDCBA** (rows) vs **B = BDACB** (columns) on scratch paper, then give:

**(a)** the table ROW for the prefix `ABDC` (its 6 values, ε-column first, comma-separated) (2 pts) · the FINAL row (2 pts) · **(b)** the LCS **length** (1 pt) · **(c)** one longest common subsequence via traceback (3 pts — any valid LCS accepted).

## Q7 — 0/1 knapsack (7 pts)

item 1: value 40, weight 1 · item 2: value 80, weight 2 · item 3: value 100, weight 3 · item 4: value 60, weight 2 · capacity **W = 5**.

**(a)** the FINAL row of the DP table, K[n][0..W] (4 pts) · **(b)** the optimal value (1 pt) · **(c)** a set of items that achieves it (2 pts — any optimal set accepted).

## Q8 — KMP & tries (8 pts)

**(a)** The failure function of the pattern **ababab** (one value per position) (4 pts).

**(b)** Insert **sun, sung, sunk, sad, sip** into an (initially empty) trie with a word-end flag. How many nodes does the trie have, NOT counting the root (2 pts)? What is its depth — the longest root-to-node path (1 pt)? Is `su` reported as a stored word (1 pt)?

## Q9 — Hashing (7 pts)

Define conv(x) = length(x) + Σ ord(c) over x's characters, with ord(a)=1 … ord(z)=26; the hash is **h(x) = conv(x) mod 7**, table slots 0..6, collisions by **linear probing**.

Insert, in order: **ml, ai, db, os, ux, api**

**(a)** each key's home slot (3 pts) · **(b)** the final table, slots 0..6, `_` for empty (4 pts).

## Q10 — Design (6 pts)

A catalog system stores millions of records keyed by unique ID, and must also answer *range* queries by date and *prefix* queries by title. **(a)** For ID lookup, compare separate chaining vs linear probing under a HIGH load factor — one or two sentences each on where they degrade (3 pts). **(b)** Name the structure you'd add for the date-range queries and the one for the title-prefix queries, with one sentence of justification each (3 pts).

## Q11 — Write the regular expressions (6 pts, 3 each)

1. The set of strings over {a,b}: all strings of exactly two symbols.

2. The set of strings over {0,1}: all strings ending in 0 (at least one symbol).

## Q12 — DFA (10 pts)

Σ = {a,b}. We want to recognize: **strings with an EVEN number of a's**.

**(a)** Give a DFA as a transition table — one row per state: state name, transition on a, transition on b, accepting? Mark the start state with → (6 pts).

**(b)** For each string, write **Yes** if your machine accepts it, **No** otherwise (4 pts):

   `aa` · `aba` · `b` · `abab` · `a` · `baab` · `bb` · `ε`

## Q13 — Binary heap (3 pts)

Insert, in this order, into an initially empty **binary max-heap** (append then swim; write the array **1-indexed**, a[1..n]): **12, 19, 6, 24, 10, 28, 8**.

**(a)** the heap array after all inserts (2 pts) · **(b)** the array after **one** `delMax` (1 pt).

## Q14 — Dijkstra's shortest paths (3 pts)

A **directed**, non-negative weighted graph on vertices 0..4, edges `(u→v, w)`: (0→1, 1) · (0→2, 6) · (1→2, 2) · (2→3, 3) · (1→3, 9) · (3→4, 1).

Run **Dijkstra from vertex 0**. Give `dist[v]`, the shortest-path distance, for **every** vertex 0..4, comma-separated (3 pts).


---

## Answer key

**Q1.** (1) O(E log V) · (2) O(n log n) · (3) O(n + m) · (4) O(n·m) · (5) O(n) · (6) O(log n) · (7) O(1) · (8) O(1) · (9) O(n + m) · (10) O(n log n)

**Q2.** (a) find(1)=3, find(7)=7 · parent[] = `[3, 3, 3, 3, 5, 7, 7, 7, 9, 3]`
(b) accepted: `2-8,7-6,0-1,5-6,7-8,2-3,1-2,3-4` · first skip: `4-5` (endpoints already connected) · weight **36**

**Q3.** (a) A(1,1) B(2,1) C(3,1) D(4,4) E(5,4) F(6,4) G(7,7) H(8,8) · (b) **C,D,F,G**

**Q4.** (a) a=01 c=1010 d=11 f=10111 g=10110 · (b) `10111011100` · (c) 11 bits

**Q5.** (1) Θ(n) — n^{log₂2}=n dominates f=1 → case 1 · (2) Θ(log n) — n^{log₂1}=1 = f → case 2 (binary search) · (3) Θ(n^{log₂3}) — n^{log₂3}≈n^{1.58} dominates f=n → case 1

**Q6.** (a) row `ABDC` = `0,1,2,2,3,3` · final row = `0,1,2,3,3,4` · (b) length **4** · (c) any of: `BDCB`

**Q7.** (a) `0,40,80,120,140,180` · (b) **180** · (c) any of: {1,2,4} · {2,3}

**Q8.** (a) `0,0,1,2,3,4` · (b) 9 nodes · depth 4 · NO — it is only a prefix (its node's word-end flag is false)

**Q9.** (a) ml→6 ai→5 db→1 os→1 ux→5 api→1 · (b) `ux,db,os,api,_,ai,ml`

**Q10.** (a) chaining: long chains → Θ(α) scans but graceful; probing: clustering snowballs as α→1, probes explode (and deletes need care). (b) date ranges → a balanced BST/B+ tree (ordered: range = in-order between bounds); title prefixes → a trie (prefix = a path; subtree = all completions).

**Q11.** (1) `(a|b)(a|b)` (equivalents accepted) · (2) `(0|1)*0` (equivalents accepted)

**Q12.** (a) canonical table (any equivalent DFA accepted):
```text
→ S0 (acc) | a→S1  b→S0 | yes
S1 | a→S0  b→S1 | no
```
(b) aa→Yes · aba→Yes · b→Yes · abab→Yes · a→No · baab→Yes · bb→Yes · ε→Yes

**Q13.** (a) `28,19,24,12,10,6,8` · (b) `24,19,8,12,10,6`

**Q14.** dist[] = `0,1,3,6,7`
