---
title: "CSS 343 — Practice Final: Worked Guide"
version: "1.0"
status: draft
created_by: "Claude"
created_at: "2026-08-10T12:00"
last_modified_by: "Claude"
last_modified_at: "2026-08-10T12:00"
contributors:
  - "Dr. Marcel Gavriliu"
  - "Claude"
tags:
  - "css343"
  - "exam"
  - "final"
  - "practice"
  - "worked-solutions"
related:
  - path: "./practice-final.md"
    desc: "The practice final itself — work it cold before reading this"
  - path: "./study-guide-s18.md"
    desc: "Final study guide — what is covered and how to prepare"
  - path: "../S10-midterm/study-guide-s10.md"
    desc: "Midterm study guide (S1–S9), for the first-half material"
---

# CSS 343 — Practice Final: Worked Guide

**Work the practice final cold first, on paper, in 110 minutes.** Then read this. A guide read
before the attempt teaches you to recognize solutions; a guide read after teaches you to produce
them, which is what the exam measures.

Each question below has the same four parts: **what it tests**, **the method** (a procedure you can
run under time pressure without thinking), **the answer**, and **where people go wrong** — the
specific wrong answers, and why each one is wrong rather than merely different. That last part is
the point of this document. Most lost points on this exam are not gaps in understanding; they are a
handful of predictable slips, and they repeat every term.

---

## Before anything: the mechanics that cost points

The exam is a Canvas quiz, auto-graded. Answers are compared as text, so formatting *is* correctness:

- **Comma-separated, no spaces.** `2,3,5,8,9,6` — not `2, 3, 5, 8, 9, 6`.
- **Ties break alphabetically / ascending** unless the question says otherwise.
- **Read the determinism rule inside the question.** Union-find tie-breaking and Huffman
  tie-breaking are stated per question precisely because the unstated version is ambiguous. A
  correct trace under the wrong tie rule is a wrong answer.
- **Give what is asked for.** "The FINAL row" means one row, not the table. "The pivot's index"
  means a number, not the array.
- **0-based or 1-based is always stated.** Q3 says 0-based; Q13 says write the heap array 1-indexed.
  Both appear on the same exam on purpose.

Budget roughly **1 minute per point**, which leaves ten minutes of slack. Q1 is 10 points of recall
with no computation — do it first, bank the points, and let the tracing questions have the time.

---

## Q1 — Tight complexity bounds (10 pts)

**What it tests.** Whether you know the cost of each algorithm *and* what the variables mean. The
word **tight** matters: a true-but-loose bound is wrong.

**The method.** For each item ask two questions in order: (1) what does the algorithm actually do,
in one phrase? (2) what is the input it does it to? Most wrong answers here come from answering (1)
correctly and (2) not at all.

**The answers, with the phrase that produces each:**

| # | Item | Answer | The phrase |
|---|---|---|---|
| 1 | Kruskal, edges unsorted | `O(E log V)` | *sort the edges* — E log E, and log E ≤ 2 log V |
| 2 | Huffman, binary min-heap | `O(n log n)` | *n−1 merges, each two pops and a push* |
| 3 | KMP search | `O(n + m)` | *preprocess the pattern, then read the text once* |
| 4 | Fill the LCS table | `O(n·m)` | *one constant-time cell per pair of prefixes* |
| 5 | quickselect, average | `O(n)` | *partition, then recurse on **one** side: n + n/2 + n/4 → 2n* |
| 6 | AVL worst-case search | `O(log n)` | *height is bounded by ~1.44 log n* |
| 7 | Find the min in a min-heap | `O(1)` | *it is the root — just look at it* |
| 8 | union, weighted + path compression | `O(1)` | *α(n), "effectively constant"* |
| 9 | Build the KMP failure function | see note | *match the pattern against itself* — **Θ(m)** |
| 10 | Comparison-sort lower bound | `O(n log n)` | *log₂(n!) leaves in the decision tree* |

**Where people go wrong.**

- **#1 → `O(E + V)`.** That is Kruskal *after* someone else sorted the edges. The question says
  "edges unsorted", which is exactly the clause that puts the sort inside your cost.
- **#1 → `O(V²)`.** That is Prim with an array-based scan for the minimum, a different algorithm.
- **#2 → `O(n)`.** Counting the merges (n−1) but not what a merge costs. Every merge does two
  `delMin`s and an `insert`, each log n.
- **#2 → `O(n²)`.** That is Huffman with a *linear scan* to find the two smallest each round. The
  question says "using a binary min-heap"; the data structure named in the question is load-bearing.
- **#3 → `O(n·m)`.** That is *brute force*. The whole content of KMP is that this does not happen.
- **#5 → `O(n log n)`.** The single commonest error on this bank: quicksort recurses on **both**
  sides (n log n), quickselect on **one** (n). If you can't recall which, re-derive it — the
  geometric sum n + n/2 + n/4 + … = 2n is faster to reconstruct than to memorize.
- **#6 → `O(n)`.** That is a plain BST, which an AVL exists to prevent. If your answer for a
  *balanced* structure is linear, you have answered for the unbalanced one.
- **#7 → `O(log n)`.** You have answered *delete*-min, not *find*-min. Finding it is free; removing
  it costs the sink. Read the verb.
- **#8 → `O(log n)`.** That is weighted quick-union *without* path compression. The question names
  the optimization, so it wants the optimized bound.
- **#10 → `O(n)`.** Confusing the *comparison* lower bound with counting sort, which beats it by not
  comparing. The bound only binds algorithms whose only tool is comparison.

> **⚠ A defect in this item, flagged honestly.** Item **#9** is keyed `O(n + m)`, but building the
> failure function touches only the pattern — L16 states three times, and Chapter 16 agrees, that it
> is **Θ(m)**. `O(n + m)` is a true *upper* bound but not a tight one, and this question demands
> tight bounds. The option list offers no `O(m)`. Until the option list is fixed, **enter `O(n + m)`
> to match the key**, and know that the honest answer is Θ(m) — the build never looks at the text.
> Item **#10** has a smaller version of the same problem: a *lower* bound is properly **Ω(n log n)**,
> not O; the option list is all-O, so enter `O(n log n)`, but write Ω on paper and in your head.

---

## Q2 — Union-find & Kruskal (10 pts)

### (a) Weighted quick-union with full path compression

**What it tests.** Whether you can execute a data structure exactly as specified, including the
parts that are easy to skip.

**The method.** Keep two arrays, `parent[]` and `size[]`. For each `union(p,q)`:

1. `find(p)` and `find(q)` — **and these compress**. This is the step people skip.
2. Compare the two roots' **sizes** (not heights, not depths — the question says size).
3. Larger root wins; the smaller tree's root points at it, and the winner's size grows by the loser's.
4. **On a tie**, the question's rule: p's root goes under q's root.

**The answer.** `find(1) = 3`, `find(7) = 7`, and

```text
   parent[] = 3,3,3,3,5,7,7,7,9,3
```

Trace worth keeping: the four small unions all hit the size tie, so `parent[0]=1`, `parent[2]=3`,
`parent[4]=5`, `parent[6]=7`. Then `union(0,2)` ties again at size 2 → `parent[1]=3`. `union(4,6)`
ties at 2 → `parent[5]=7`. `union(8,9)` → `parent[8]=9`. Finally `union(0,8)`: `find(0)` walks
0→1→3 **and compresses 0 straight to 3**, and size 4 beats size 2, so `parent[9]=3`.

**Where people go wrong.**

- **Forgetting that `union` compresses.** `union(0,8)` calls `find(0)`, which repoints 0 directly at
  3. If you only compress during the two explicit `find` calls at the end, you get `parent[0]=1` and
  the array is wrong in one slot. The rule is: *every* find compresses, including the ones inside
  union.
- **Getting the tie backwards** — `parent[q_root] = p_root`. Four of the eight unions are ties here,
  so this single misreading corrupts most of the array. Reread the sentence before you start.
- **Linking by height instead of size.** They agree on this input for a while and then diverge. The
  question says "the smaller tree's root under the larger", and *tree size* is what it defines.
- **Reporting the array before the final finds.** Here `find(1)` and `find(7)` happen to change
  nothing — 1 already points at 3, and 7 is a root — but you should verify that rather than assume
  it. On the real exam that shortcut may not hold.
- **Expecting one component.** The final `parent[]` has 3 and 7 as separate roots; the sequence
  never unions them. "It must all be connected at the end" is an assumption, not a given.

### (b) Kruskal

**The method.** Sort edges by weight ascending. Walk the sorted list; accept an edge iff its
endpoints are in different components; stop after V−1 = 8 accepted edges.

**The answer.** Accepted `2-8,7-6,0-1,5-6,7-8,2-3,1-2,3-4` · first skip `4-5` · weight **36**.

**Where people go wrong.**

- **Reporting the accepted edges in graph order rather than acceptance order.** The question says
  "in the order Kruskal accepts them", which is weight order. Writing them as they appear in the
  problem statement scores zero on a string match.
- **Missing the skip because the MST is already complete.** After 8 accepts, all 9 vertices are
  joined, so the very next edge `(4,5,9)` is rejected. Some students stop reading at 8 accepts and
  leave the skip blank — the question asks for the first *rejected* edge, which necessarily comes
  after some accepts.
- **Summing all twelve weights.** The MST weight is the sum of the **accepted** eight: 1+2+3+4+5+6+7+8 = 36.
- **Sorting by vertex label.** Kruskal is greedy *by weight*; nothing else orders the list.

---

## Q3 — Quicksort partition & selection (8 pts)

**What it tests.** Lomuto partition executed literally, then the one decision quickselect makes.

**The method.** Pivot is the last element (5). Set `i = −1`. Scan `j` from left to the element
before the pivot; whenever `a[j] < pivot`, increment `i` and swap `a[i]` with `a[j]`. At the end
swap `a[i+1]` with the pivot.

```text
   6,9,2,8,3,5   pivot 5, i = −1
   j=0: 6<5? no          j=1: 9<5? no
   j=2: 2<5? yes → i=0, swap a[0],a[2] → 2,9,6,8,3,5
   j=3: 8<5? no
   j=4: 3<5? yes → i=1, swap a[1],a[4] → 2,3,6,8,9,5
   end: swap a[2],a[5]                 → 2,3,5,8,9,6
```

**The answer.** (a) `2,3,5,8,9,6` · (b) pivot index **2** · (c) **done** · (d) **5**.

**Where people go wrong.**

- **Forgetting the final swap.** Stopping at `2,3,6,8,9,5` leaves the pivot at the end — the
  partition has not happened. The pivot's whole job is to land at its sorted position.
- **Using `<=` instead of `<`.** Changes which elements move and, with duplicates, changes the
  pivot's final index. Use the comparison the question writes.
- **Partitioning around the first element.** A different (also valid) convention that this question
  does not use. Hoare's scheme, from L13, uses `a[lo]` — do not mix the two.
- **Answering (c) with "recurse left".** The 3rd smallest is at 0-based index **2**, and the pivot
  landed at index **2** — they coincide, so the search is *done*. The comparison is
  `k−1 == pivotIndex`, and the off-by-one between "3rd smallest" and "index 2" is exactly what the
  question is probing.
- **Answering (d) with 3.** The value at index 2 after partitioning is **5**. Sanity-check it
  against the sorted array `2,3,5,6,8,9` — third element, 5.

---

## Q4 — Huffman coding (8 pts)

**What it tests.** The greedy merge, and whether you can follow tie-breaking rules exactly.

**The method.** Repeatedly merge the two lowest-frequency nodes. Both rules matter:

- **Which two to merge:** lowest frequency; on a tie, the node whose alphabetically-first contained
  symbol comes first.
- **Which becomes the 0 (left) child:** the smaller of the two, by that same rule.

```text
   g3 f4                   → gf7      (g left)
   c7 gf7   tie → c first  → cgf14    (c left, so c=…0, g=…10, f=…11)
   b12 cgf14               → bcfg26   (b left)
   e14 a25                 → ae39     (e left)
   bcfg26 d28              → bcdfg54  (bcfg left)
   ae39 bcdfg54            → root 93  (ae left)
```

**The answer.** a=`01` c=`1010` d=`11` f=`10111` g=`10110` · `fade` = `10111`+`01`+`11`+`00` =
**`10111011100`** · **11 bits**.

**Sanity checks before you commit.** Sort your symbols by frequency and the code lengths must not
increase:

```text
   d 28 → 2 bits    a 25 → 2    e 14 → 2    b 12 → 3
   c  7 → 4         f  4 → 5    g  3 → 5
```

If a frequent symbol ends up longer than a rare one, you merged wrong. Second check: no code may be
a prefix of another — scan your five answers for that before writing them down.

**Where people go wrong.**

- **Ignoring the tie rules.** The `c7` vs `gf7` tie is deliberately placed. Break it the other way
  and every code below that point changes — the answer is not "a valid Huffman tree", it is *the*
  tree the rules produce.
- **Swapping 0 and 1.** Also produces an optimal code with the same lengths, and is still marked
  wrong: the question fixes the convention so the answer is unique.
- **Building the tree correctly and reading codes root-to-leaf backwards.** Codes are read from the
  root down; reading leaf-to-root gives every code reversed.
- **Counting bits as symbols.** `fade` is four characters but **11 bits** — that is the entire point
  of a variable-length code. Add the code lengths: 5+2+2+2.
- **Encoding in sorted order.** `fade` is f,a,d,e in that order, not a,d,e,f.

---

## Q5 — Recurrences (6 pts)

**What it tests.** The master theorem as a comparison, not as three memorized shapes.

**The method.** For `T(n) = a·T(n/b) + f(n)`, compute `n^(log_b a)` and compare it to `f(n)`:

- `n^(log_b a)` **bigger** → case 1 → `Θ(n^(log_b a))`
- **equal** → case 2 → multiply by log n
- `f(n)` **bigger** (and regular) → case 3 → `Θ(f(n))`

**The answers.**

1. `T(n) = 2T(n/2) + 1` → `n^(log₂2) = n` vs `f = 1`. n wins → **case 1**, `Θ(n)`.
2. `T(n) = T(n/2) + 1` → `n^(log₂1) = n⁰ = 1` vs `f = 1`. Equal → **case 2**, `Θ(log n)`.
3. `T(n) = 3T(n/2) + n` → `n^(log₂3) ≈ n^1.58` vs `f = n`. n^1.58 wins → **case 1**, `Θ(n^log₂3)`.

**Where people go wrong.**

- **Comparing `a` to `b`.** The comparison is between `n^(log_b a)` and `f(n)`, never between the
  constants themselves.
- **#1 → `Θ(n log n)`.** Pattern-matching to mergesort. Mergesort is `2T(n/2) + n`; here `f = 1`, so
  the levels are dominated by the leaves, not shared equally — that is the difference between case 1
  and case 2, and it is worth being able to say out loud.
- **#2 → `Θ(1)` or `Θ(n)`.** This is binary search. Each level does constant work and there are
  log n levels; the total is their product.
- **#3 → `Θ(n log n)`.** Only correct if the two sides were equal, and 1.58 > 1. When the exponent
  is irrational-looking, leave it as `n^(log₂3)` — that *is* the answer, not an unfinished one.
- **Reporting the case without the bound, or the bound without the case.** The question asks for
  both.

---

## Q6 — LCS (8 pts)

**The method.** Rows are A = `ABDCBA`, columns are B = `BDACB`, with an ε row and column of zeros.
Match → diagonal + 1; mismatch → max(up, left).

```text
        ε  B  D  A  C  B
   ε    0  0  0  0  0  0
   A    0  0  0  1  1  1
   AB   0  1  1  1  1  2
   ABD  0  1  2  2  2  2
   ABDC 0  1  2  2  3  3     ← the row asked for
   ABDCB 0 1  2  2  3  4
   ABDCBA 0 1 2  3  3  4     ← the final row
```

**The answer.** Row `ABDC` = `0,1,2,2,3,3` · final row = `0,1,2,3,3,4` · length **4** · e.g. `BDCB`.

**Where people go wrong.**

- **Omitting the ε column.** The question says "its 6 values, ε-column first". Five values is an
  automatic zero even when the numbers are right.
- **Counting the wrong row.** "The prefix `ABDC`" is row 4 — the row *after* four characters of A.
  Off-by-one here is common; label your rows with the prefix, not with a number.
- **Adding 1 on a mismatch.** Only a match adds. A mismatch inherits the better neighbour unchanged;
  the table never grows on a mismatch.
- **Taking the max of the wrong pair.** The mismatch case is max(**up**, **left**) — never the
  diagonal. The diagonal is only for matches.
- **A traceback that is not a subsequence.** Check your answer against both strings before writing
  it: `BDCB` must appear in order (not contiguously) in `ABDCBA` **and** in `BDACB`. Any valid LCS
  of length 4 is accepted, so verify rather than guess.
- **Assuming the LCS is unique.** It need not be; the *length* is.

---

## Q7 — 0/1 knapsack (7 pts)

**The method.** `K[i][w] = max(skip = K[i−1][w], take = value[i] + K[i−1][w − weight[i]])`, and
"take" is only available if the item fits. Fill row by row; the final row is item 4's.

```text
   items (v/w):  1: 40/1   2: 80/2   3: 100/3   4: 60/2      W = 5
   after item 1: 0,40,40,40,40,40
   after item 2: 0,40,80,120,120,120
   after item 3: 0,40,80,120,140,180
   after item 4: 0,40,80,120,140,180     ← the final row
```

**The answer.** Final row `0,40,80,120,140,180` · optimal **180** · e.g. {2,3} (weight 5) or
{1,2,4} (weight 5).

**Where people go wrong.**

- **Reading the same row for "take".** `take` must read `K[i−1][…]` — the row **above**. Reading
  `K[i][…]` lets you take an item twice, which is *unbounded* knapsack, a different problem (L15
  covers both; the difference is exactly this index).
- **Greedy by value-per-weight.** Ratios here are 40, 40, 33.3, 30, so greedy takes items 1 and 2
  (weight 3, value 120) and then item 4 (weight 5, value 180) — which happens to reach 180 on *this*
  data. It is not a method; L15's counterexample is one slide long. Fill the table.
- **Forgetting the fit check** and computing `K[i−1][negative index]`.
- **Giving the whole table when one row is asked for**, or the row without the `w = 0` entry.
- **Assuming the optimal set is unique.** Two different sets reach 180 here; either is accepted.

---

## Q8 — KMP & tries (8 pts)

### (a) The failure function of `ababab`

**The method.** `fail[j]` = the length of the longest **proper** prefix of `P[0..j]` that is also a
suffix of it. Build it by matching the pattern against itself: `fail[0] = 0`; then for each j, if
`P[j] == P[k]` the overlap grows, otherwise fall back to `k = fail[k−1]` and retry.

**The answer.** `0,0,1,2,3,4`.

**Where people go wrong.**

- **`0,1,2,3,4,5`** — forgetting **proper**. `fail[j]` can never equal j+1; the whole string is not
  a proper prefix of itself. If your last value equals the pattern length, you have made this error.
- **Starting at `fail[0] = 1`.** A single character has no proper prefix, so it is always 0.
- **Giving the DFA table instead.** L16 shows both views; this question asks for the failure
  function, one value per position.

### (b) The trie

**The method.** Insert the five words, sharing prefixes. Count nodes below the root; the depth is
the longest root-to-node path.

```text
   s ─ u ─ n ─ g          nodes (excluding root): s,u,n,g,k,a,d,i,p = 9
     │       └ k          depth: root→s→u→n→g = 4
     ├ a ─ d
     └ i ─ p
```

**The answer.** **9** nodes · depth **4** · `su` is **not** a stored word.

**Where people go wrong.**

- **Counting the root** (10) when the question says not to.
- **Counting words instead of nodes** (5), or counting characters across all words (17) and missing
  that `sun`, `sung`, `sunk` share the `s-u-n` path — prefix sharing is the entire reason a trie is
  compact.
- **`su` → "yes, it's in there".** The *path* exists, on the way to `sun`; the *word-end flag* is
  false. This distinction is the most-tested trie idea in the course and the commonest
  implementation bug in ICA 16.

---

## Q9 — Hashing (7 pts)

**The method.** `conv(x) = length(x) + Σ ord(c)` with a = 1 … z = 26; `h = conv mod 7`; collisions
probe linearly forward, wrapping at 6 → 0.

```text
   ml  = 2 + (13+12) = 27 → 27 mod 7 = 6
   ai  = 2 + (1+9)   = 12 → 5
   db  = 2 + (4+2)   = 8  → 1
   os  = 2 + (15+19) = 36 → 1
   ux  = 2 + (21+24) = 47 → 5
   api = 3 + (1+16+9)= 29 → 1
```

Then insert in order: ml→6 · ai→5 · db→1 · os→1 taken→**2** · ux→5 taken, 6 taken, wrap→**0** ·
api→1,2 taken→**3**.

**The answer.** Homes `6,5,1,1,5,1` · table `ux,db,os,api,_,ai,ml`.

**Where people go wrong.**

- **Dropping the `length(x)` term.** The definition is on the page; it is there precisely to catch
  reading past it. Without it every home slot shifts.
- **Using ASCII.** `ord(a) = 1`, not 97. The question defines its own alphabet mapping.
- **Not wrapping.** `ux` probes 5, 6, then **0** — the table is circular. Students who stop at 6 and
  declare it full lose the rest of the table.
- **Probing from the wrong start.** Each key probes from **its own** home slot, not from where the
  previous key landed.
- **Inserting in a different order.** The order given is the order that produces this table; sorting
  the keys first produces a different, wrong one.
- **Reporting homes after probing.** (a) asks where each key *hashes*, (b) where it *ends up*. `os`
  homes to 1 and lands at 2; both facts are on the page and they are different answers.

---

## Q10 — Design (6 pts)

**What it tests.** Whether you can match a structure to a query type and say *why* — which is the
course's through-line, not a fact to recall.

**A full-credit shape.**

**(a)** At high load factor: **separate chaining** degrades *gracefully* — buckets get longer, a
search scans a chain, cost is Θ(α), and α > 1 is legal. **Linear probing** degrades *sharply* —
clusters merge and grow, so each insert both takes longer and makes the next cluster bigger; as
α → 1 the probe count explodes, and the table cannot exceed α = 1 at all. Deletion is also
harder under probing: you cannot simply blank a slot without breaking the probe chains through it
(tombstones, or reinsert the cluster).

**(b)** Date **ranges** → a **balanced BST / B+ tree**: it keeps keys in order, so a range query is
"find the low end, then walk in order until the high end" — output-sensitive, no scan of the
whole set. Title **prefixes** → a **trie**: a prefix is a path from the root, and every completion
is exactly the subtree beneath it.

**Where people go wrong.**

- **Naming a hash table for the range query.** Hashing deliberately destroys order — neighbouring
  keys land in unrelated buckets, so a range means scanning everything. This is the single most
  common wrong answer, and the reason is worth saying: the property that makes hashing fast for
  point lookups is the same property that makes it useless here.
- **Naming a BST for the prefix query.** Not wrong enough to be worthless — an ordered structure
  *can* find a prefix range — but a trie is the better answer and the justification is the
  discriminator. Say why: prefix = path, completions = subtree.
- **Describing chaining and probing without answering "where do they degrade".** The question asks
  about behaviour under high load, not for definitions.
- **Claiming chaining "never degrades".** It does — Θ(α) per search. The contrast is graceful versus
  sharp, not immune versus fragile.

---

## Q11 — Regular expressions (6 pts)

**The method.** Build from the four operations only: concatenation, `|`, `*`, `()`. Then test your
answer against three strings: a typical member, a boundary member, and a near-miss non-member.

**The answers.** (1) `(a|b)(a|b)` · (2) `(0|1)*0`. Equivalents are accepted.

**Where people go wrong.**

- **(1) → `(a|b)*`.** Accepts every length including 0 and 1; "exactly two symbols" means exactly
  two. Concatenate two choices; do not star them.
- **(1) → `ab`.** That is one specific string, not the four (`aa`, `ab`, `ba`, `bb`).
- **(2) → `1*0`.** Rejects `00`, which ends in 0. Anything may precede the final 0, including
  more 0s.
- **(2) → `(0|1)*0*`.** Accepts `01`, which does not end in 0 — and accepts the empty string. The
  final `0` must be mandatory and last.
- **(2) → `(0|1)*`.** Accepts everything.
- **Reaching for `{2}`, `+`, `?`, `\d`.** They are sugar, and fine if the grader accepts
  equivalents, but the exam is testing the four primitives. If you write sugar, be sure you could
  expand it.

---

## Q12 — DFA (10 pts)

**The method.** Ask what the machine must *remember*. "Even number of a's" needs one bit — the
parity so far — so two states suffice, and `b` never changes it.

```text
   → S0 (accepting) | a → S1 | b → S0
     S1             | a → S0 | b → S1
```

**The answer.** The table above, and: `aa` Yes · `aba` Yes · `b` Yes · `abab` Yes · `a` No ·
`baab` Yes · `bb` Yes · `ε` Yes.

**Where people go wrong.**

- **Making S0 non-accepting.** Zero is an even number, so the empty string is accepted and the start
  state must be accepting. **Seven of the eight** test strings depend on this — every one except `a`.
- **`ε` → No.** Same error, in its purest form. If you got `ε` wrong you almost certainly got `b`
  and `bb` wrong too — they are the same fact.
- **Sending `b` to the other state.** Only `a` flips parity. A `b` self-loops.
- **Building four states** (one per a/b combination). Not wrong, just unnecessary — and more states
  mean more chances to mis-fill the table. Ask what must be remembered, and remember only that.
- **Forgetting to mark the start state.** Six of the ten points are the table, and the start marker
  is part of it.
- **Counting a's per string but mis-transcribing.** `baab` has two a's → Yes. Count carefully; these
  four points are free.

---

## Q13 — Binary heap (3 pts)

**The method.** Append at the end, then **swim**: while the node beats its parent, swap up. Parent
of `i` is `i/2` in 1-indexed arrays. For `delMax`: the root leaves, the **last** element moves to
the root, then **sink**: swap with the larger child while it beats you.

```text
   12               → 12
   19  swims        → 19,12
   6                → 19,12,6
   24  swims twice  → 24,19,6,12
   10               → 24,19,6,12,10
   28  swims twice  → 28,19,24,12,10,6
   8                → 28,19,24,12,10,6,8
```

**The answer.** (a) `28,19,24,12,10,6,8` · (b) `24,19,8,12,10,6`.

**Where people go wrong.**

- **0-indexing.** The question says 1-indexed. With 0-indexing the parent is `(i−1)/2` and your swim
  targets shift — the contents may even be right while the answer string is wrong.
- **Sorting the array.** A heap is *not* sorted; it satisfies only the parent ≥ child property.
  `28,19,24,…` is correct and is not descending.
- **On `delMax`, promoting the larger child repeatedly.** That leaves a hole in the middle and an
  array of the wrong shape. The rule is: last element to the root, then sink.
- **Sinking against the wrong child.** Swap with the **larger** of the two children, or you break
  the heap property with the other one.
- **Forgetting the array shrinks.** After `delMax` there are six entries, not seven.

---

## Q14 — Dijkstra (3 pts)

**The method.** All distances ∞ except the source at 0. Repeatedly finalize the unfinalized vertex
with the smallest tentative distance, then relax its outgoing edges.

```text
   finalize 0 (0):  dist[1]=1, dist[2]=6
   finalize 1 (1):  0+1+2 = 3 < 6 → dist[2]=3 ;  dist[3]=1+9=10
   finalize 2 (3):  3+3 = 6 < 10  → dist[3]=6
   finalize 3 (6):  dist[4]=7
   finalize 4 (7)
```

**The answer.** `0,1,3,6,7`.

**Where people go wrong.**

- **Leaving `dist[2] = 6`.** The direct edge 0→2 costs 6, but going 0→1→2 costs 3. Taking the first
  value you write down and never improving it is the classic Dijkstra error — relaxation exists to
  overwrite it.
- **Leaving `dist[3] = 10`.** Same error one step later: 1→3 gives 10, but 2→3 gives 6.
- **Relaxing from a vertex before it is finalized.** Process vertices in order of their finalized
  distance; that ordering is what makes the algorithm correct with non-negative weights.
- **Treating the graph as undirected.** The edges are directed. There is no 2→0 or 3→1.
- **Reporting the path instead of the distances.** The question asks for `dist[v]` for every vertex.

---

## The five errors that cost the most points

1. **Ignoring a stated determinism rule** (Q2 tie-breaking, Q4 tie-breaking). Your trace can be
   flawless and still wrong. Read the rule, and re-read it before you commit.
2. **Answering the wrong verb.** find-min vs delete-min (Q1 #7), homes vs final slots (Q9), value
   vs index (Q3), path vs distances (Q14).
3. **Off-by-one between an ordinal and an index.** "3rd smallest" is index 2 (Q3); "the prefix
   `ABDC`" is row 4 (Q6); 1-indexed heaps (Q13).
4. **Not improving a first estimate.** Dijkstra's `dist[2]` (Q14) and the mismatch branch in LCS
   (Q6) both punish taking the first number you wrote.
5. **Formatting.** Comma-separated, no spaces; exactly what was asked for; the ε column included.
   These are free points and they are lost every term.

---

## Change Log

| Version | Date             | Author | Summary       |
| ------- | ---------------- | ------ | ------------- |
| 1.0     | 2026-08-10T12:00 | Claude | Initial guide: method + answer + characteristic wrong answers for all 14 questions, exam-mechanics preamble, and a closing five-error summary. Every mechanical answer independently recomputed (not taken from `exam/solver.py`) and confirmed against the practice key — 35/35 checks. Flags the Q1 #9 defect (failure-function build keyed `O(n + m)`; L16 and Chapter 16 both say **Θ(m)**, and the option list has no `O(m)`) and the smaller Q1 #10 notation issue (a lower bound is Ω, but the option list is all-O). |
