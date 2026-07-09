<!--
  CSS 343 · Lecture 12 (Session 12) — Greedy Algorithms; Huffman Coding.
  reveal.js: "---" = next part (→), "--" = next slide (↓). Notes follow "Note:".
  Concrete C++ (structs, a priority_queue) — no templates/inheritance. KaTeX:
  never two "_" on one line. Verify at 1280×620; code/ASCII lines ≤ ~56 chars.

  Reading (pre): Sedgewick & Wayne §5.5 (Data Compression — Huffman) + Erickson
  Ch 4 (Greedy Algorithms).
  THROUGH-LINE: a GREEDY algorithm makes the locally-best choice at each step and
  never reconsiders. It's correct only when the problem has the greedy-choice
  property + optimal substructure — proved by an EXCHANGE ARGUMENT. HUFFMAN coding
  is the poster child: repeatedly merge the two least-frequent symbols to build a
  prefix-free code trie that provably minimizes the encoded length. We've already
  seen greedy in Dijkstra, Prim, and Kruskal — tonight is the general pattern.

  Covered in Spring-26 (Kim, Tree deck): Huffman coding (frequencies, tree build,
  codes) lived in the trees module. The GREEDY-method generalization is new
  (Erickson Ch 4). The Huffman demo reuses the L06 heap + the tree renderer.

  Session plan (150 min). 0:00 intro 0:04 P1 greedy method 22 0:26 P2 when-optimal
  20 0:46 BREAK 10 0:56 P3 Huffman build 30 1:26 P4 prefix codes 24 1:50 P5 wrap 14
  2:04 ICA 2:30 end.
-->

## CSS 343

### Data Structures, Algorithms & Discrete Mathematics II

**Lecture 12 — Greedy Algorithms & Huffman Coding**

<small>Summer 2026 · T/Th 6:00–8:30 · UW1 020 · Dr. Marcel Gavriliu</small>

---

## Reading

**Sedgewick §5.5 (Huffman)** + **Erickson Ch 4 (Greedy)**

- **the greedy method** — locally-best, never reconsider
- **when it works** — greedy-choice + optimal substructure
- **the exchange argument** — the correctness proof
- **Huffman coding** — an optimal prefix-free code

Reading quiz due before class.

---

### Part 1 · The greedy method

<small>(~22 min)</small>

--

## What is a greedy algorithm?

At each step, make the choice that looks **best right now** — and **never reconsider** it.

```text
   build a solution one piece at a time;
   each piece = the locally optimal choice
```

No backtracking, no lookahead. Fast and simple — **when** it's correct.

--

## Tonight's plan

1. **the greedy method** — what it is, when it works
2. **the exchange argument** — how to prove it correct
3. **when it fails** — counterexamples & 0/1 knapsack
4. **Huffman coding** — the optimal-greedy poster child

The recurring theme: **new algorithms from familiar structures** (Huffman reuses the L06 heap).

--

## The greedy template

```text
   greedy(problem):
       solution = {}
       while problem not solved:
           x = the locally-BEST choice available now
           add x to solution           // never undo it
           reduce problem by x
       return solution
```

Every greedy algorithm is this loop — the art is the **choice rule** and its **proof**.

--

## You've already seen greedy

| algorithm | greedy choice |
|---|---|
| **Dijkstra** | settle the **nearest** unsettled vertex |
| **Prim** | add the **lightest** edge leaving the tree |
| **Kruskal** | take the **cheapest** edge that avoids a cycle |

Tonight: the general pattern, and **Huffman**.

--

## Greedy is a strategy

"Greedy" names an **approach**, not one algorithm:

```text
   coin change · activity selection · Dijkstra
   Prim · Kruskal · Huffman · …
```

Each applies the same idea — **locally-best + never reconsider** — to a different problem. The skill is spotting when the strategy is **valid**.

--

## Greedy vs the alternatives

```text
   brute force   — try all solutions        (exponential)
   greedy        — one locally-best choice   (usually fast)
   dynamic prog. — optimal over subproblems  (next week)
```

Greedy is the **cheapest** approach — **if** the problem allows it.

--

## A greedy algorithm that works: coins

Make change with **US coins** (25, 10, 5, 1) using the **fewest** coins:

```text
   greedy: take the largest coin ≤ remaining, repeat
   41¢ → 25 + 10 + 5 + 1  = 4 coins   ✓ optimal
```

For US denominations, greedy is provably optimal.

--

## Another greedy win: fewest platforms

Given event intervals, how few rooms/platforms serve them all?

```text
   sort all start & end times; sweep;
   +1 platform on a start, −1 on an end;
   the running MAX = platforms needed
```

Greedy sweep, O(n log n) — provably minimal.

--

## …but "obvious" isn't a proof

Greedy *feels* right here — yet the very same "take the biggest" rule fails on other coin sets (next slide).

```text
   the denominations {1,5,10,25} have special structure;
   greedy optimality is a property of the COIN SET, not the rule
```

Never trust "obviously greedy" — the rule and the input must match.

--

## A greedy algorithm that FAILS: coins

With denominations **{1, 3, 4}**, make **6¢**:

```text
   greedy: 4 + 1 + 1        = 3 coins
   optimal: 3 + 3           = 2 coins   ✗ greedy loses!
```

Locally best (grab the 4) ≠ globally best. **Greedy needs justification.**

--

## The two ingredients

Greedy is correct exactly when the problem has:

1. **greedy-choice property** — a globally optimal solution contains the greedy (locally-best) choice
2. **optimal substructure** — an optimal solution is built from optimal solutions to subproblems

--

## Greedy-choice vs optimal substructure

Two different guarantees — don't confuse them:

| property | says | example |
|---|---|---|
| **greedy-choice** | the local best is **safe** to commit | take the nearest vertex |
| **optimal substructure** | the rest is a **smaller same problem** | shortest path minus its first edge |

You need **both**; DP needs only the second.

---

### Part 2 · When greedy is optimal

<small>(~20 min)</small>

--

## The exchange argument

The standard proof that the greedy choice is safe:

```text
   take any optimal solution O that does NOT use the greedy choice g.
   SWAP some element of O for g.
   show the result is still valid and NO WORSE.
   → an optimal solution using g exists.
```

We used this for the MST **cut property** (L11).

--

## Optimal substructure

After the greedy choice, the **rest** of the problem is a **smaller instance** of the same problem:

```text
   solve(problem):
       g = greedy choice
       return g + solve(problem without g)
```

Solve the subproblem the **same greedy way** — recursion bottoms out at the answer.

--

## When greedy FAILS: 0/1 knapsack

Items with (value, weight); knapsack holds weight W. Take each item whole or not:

```text
   greedy by value/weight ratio → can be far from optimal
   0/1 knapsack needs DYNAMIC PROGRAMMING (next week)
```

The **fractional** knapsack (take fractions) *is* greedy-solvable.

--

## How to tell if greedy works

Ask:

- can I **prove** the greedy choice is safe (exchange argument)?
- does making it leave a **smaller same problem** (optimal substructure)?
- can I find a **counterexample**?

If you can't prove it and can't break it, **test hard** — or use DP.

--

## Recognizing greedy problems

Signs a problem may be greedy-solvable:

- a clear "**best next choice**" (smallest, earliest, cheapest…)
- a natural **ordering** to process items in
- picking the best now doesn't **block** a better whole

If it *can* block a better whole → likely **DP**.

--

## Classic greedy: activity selection

Pick the **most** non-overlapping activities (each `[start, finish]`) from a room:

```text
   greedy rule: always take the activity that FINISHES EARLIEST
   among those that don't conflict with what you've picked
```

Sort by finish time; sweep once. **Provably optimal.**

--

## Why earliest-finish is optimal

**Exchange argument:** let `g` = earliest-finishing activity; let `O` = any optimal schedule.

```text
   O's first activity finishes no earlier than g
   → swap it for g: still valid (g frees the room soonest),
     still the same count → optimal
```

Then optimal substructure on the activities after `g`.

--

## Fractional knapsack IS greedy

Unlike 0/1, if you can take **fractions** of items:

```text
   greedy: take items by value/weight ratio, highest first;
   fill the last bit with a fraction of the next item
```

Optimal — because a fraction lets the exchange argument go through.

---

### Part 3 · Huffman coding: build the trie

<small>(~30 min)</small>

--

## The compression problem

Store text in **fewer bits**. A **fixed-length** code wastes space:

```text
   6 symbols → 3 bits each (000..101)
   but 'e' appears 100× and 'z' once — same 3 bits?!
```

Idea: give **frequent** symbols **short** codes, **rare** ones long codes — a **variable-length** code.

--

## Fixed vs variable — the numbers

```text
   symbols a b c d e f, total 100 chars
   fixed 3-bit:  100 × 3          = 300 bits
   variable:     Σ freq · codelen = 224 bits   (Huffman)
```

The saving comes entirely from **skew** — a few symbols dominate. Uniform frequencies → no win.

--

## The ambiguity problem

Variable-length codes can be **ambiguous**:

```text
   a=0  b=1  c=01     "01" = "ab"?  or  "c"?  💥
```

We need codes that decode **uniquely** — no code is a **prefix** of another.

--

## Prefix-free codes = a trie

Put symbols at the **leaves** of a binary tree; the path (**left=0, right=1**) is the code:

```text
        ( )
       0/  \1
      f    ( )        f = 0
          0/  \1      c = 100  (down-down... )
        ( )   ...     leaves only → prefix-free!
```

Since symbols are only at **leaves**, no code is a prefix of another.

--

## Huffman's greedy idea

Repeatedly **merge the two least-frequent** nodes into one (freq = sum), until a single tree remains:

```text
   the two rarest symbols → deepest in the tree → longest codes
   the most frequent → shallow → short codes
```

Greedy choice: **combine the two smallest frequencies**.

--

## Why the two smallest?

The **deepest** leaves have the **longest** codes — so they should be the **rarest** symbols:

```text
   cost = Σ freq · depth
   put the two smallest freqs deepest (as siblings)
   → they pay the long-code penalty on the fewest occurrences
```

Merging them is the safe greedy choice (proved in Part 4).

--

## Build with a priority queue

The "two smallest" query is a **min-priority queue** — the L06 heap again:

```text
   PQ = all symbols keyed by frequency
   while PQ has > 1 node:
       x = PQ.delMin();  y = PQ.delMin();
       z = new node(x.freq + y.freq, left=x, right=y);
       PQ.insert(z);
   root = PQ.delMin();
```

--

## The build, counted

```text
   start: n leaf nodes (one per symbol)
   each merge: −2 roots, +1 new parent → n − 1 merges
   end:   1 root; 2n − 1 nodes (n leaves + n − 1 internal)
```

Every internal node has **exactly two** children — a **full** binary tree.

--

## 🎬 Demo — Huffman build

<div class="algo-viz" data-algo="huffman-build">
<pre class="viz-fallback">
   frequencies a:5 b:9 c:12 d:13 e:16 f:45  (the CLRS example)
   repeatedly merge the two smallest-frequency roots into a
   new parent (freq = sum), until one tree remains. leaves =
   symbols; the deeper the leaf, the longer (rarer) its code.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Merge the **two smallest** roots each step (freq = sum) until one tree remains. Rare symbols (a, b) sink **deep** → long codes; frequent `f` stays **shallow** → the 1-bit code `0`. Full sandbox: the **Explore** page.</small>

--

## Huffman — a worked build

```text
   a:5 b:9 c:12 d:13 e:16 f:45

   merge a+b → 14           pool: 12 13 14 16 45
   merge c+d → 25           pool: 14 16 25 45
   merge 14+16 → 30         pool: 25 30 45
   merge 25+30 → 55         pool: 45 55
   merge 45+55 → 100        → root
```

--

## The resulting codes

```text
   f = 0        (45 — most frequent, 1 bit)
   c = 100      d = 101
   e = 111      a = 1100     b = 1101
```

Frequent → short, rare → long. **Weighted total = Σ freq·len = 224 bits** (vs 3·100 = 300 fixed).

--

## Extracting the codes

Walk the finished trie once (a DFS), building each leaf's path:

```text
   codes(node, path):
       if node is a leaf: code[node.sym] = path
       else:
           codes(node.left,  path + "0");
           codes(node.right, path + "1");
```

One traversal → every symbol's code. O(n) after the build.

--

## Huffman — cost

```text
   build a heap of n symbols:        O(n)
   n − 1 merges × (2 delMin + insert): O(n log n)
   extract codes (one DFS):          O(n)
   total:                            O(n log n)
```

The heap is the bottleneck — and the reason we built it in L06.

--

## Practice — predict a code

Frequencies `x:1  y:1  z:2  w:4`. Build the Huffman tree:

```text
   merge x+y → 2   pool: 2(z) 2(xy) 4(w)
   merge 2+2 → 4   pool: 4(w) 4
   merge 4+4 → 8   → root
```

<small>Codes: `w = 0` (freq 4, shallow), `z = 10`, `x = 110`, `y = 111`. The rarest (x, y) sink deepest; total = 4·1 + 2·2 + 1·3 + 1·3 = **14 bits**.</small>

--

## Breaking ties

When two nodes share the lowest frequency, **either** may be picked:

```text
   different tie-breaks → different trees / different codes
   BUT the weighted total Σ freq·len is always the SAME (optimal)
```

Like the MST: the optimal **cost** is unique; the optimal **tree** may not be.

---

### Part 4 · Prefix-free codes & compression

<small>(~24 min)</small>

--

## Encoding

Replace each symbol with its code; **concatenate** the bits:

```text
   text  "face"
   f→0  a→1100  c→100  e→111
   bits  0 1100 100 111  =  0110010 0111   (11 bits)
```

No separators needed — the prefix-free property makes the boundaries unambiguous.

--

## Decoding

**Walk the trie** from the root, one bit at a time; emit a symbol at each **leaf**, then restart:

```text
   bits 0110010...       0 → leaf f ✓        emit f
                         1,1,0,0 → leaf a ✓  emit a
                         1,0,0 → leaf c ✓    emit c …
```

The prefix-free property guarantees you always know when a symbol ends.

--

## Self-delimiting: no separators

A prefix-free code needs **no delimiter** between symbols:

```text
   0 1100 100 111   stored as   0110010 0111
   the decoder finds the boundaries FROM THE TREE
```

Fixed-length codes also self-delimit (fixed width) — but waste bits. Huffman gets both: **compact AND self-delimiting**.

--

## The decoder needs the tree

The bits alone don't decode — the decoder must have the **same trie**:

```text
   option 1: send the frequency table → rebuild the tree
   option 2: serialize the tree itself into the header
```

The tree overhead is tiny (fixed alphabet) and amortized over the whole file.

--

## 🎬 Encode / decode (walk the trie)

<div class="algo-viz" data-algo="huffman-codes">
<pre class="viz-fallback">
   with the trie built, ENCODE = look up each symbol's
   root-to-leaf path; DECODE = walk the bits from the root,
   emit a symbol at each leaf, restart.
   "cab" → 100 1100 1101 → decode back to "cab"
</pre>
</div>

<small>Encode = look up each symbol's path; decode = walk the bits from the root, emit at each **leaf**. Prefix-free ⇒ decoding is never ambiguous.</small>

--

## Compression ratio

```text
   fixed-length:   100 chars × 3 bits = 300 bits
   Huffman:        Σ freq·len          = 224 bits
   ratio ≈ 224 / 300 ≈ 0.75   (25% smaller)
```

The **more skewed** the frequencies, the **bigger** the win.

--

## Huffman vs simpler codes

| code | good when | weakness |
|---|---|---|
| **fixed-length** | simplicity | ignores skew |
| **run-length (RLE)** | long **runs** (`aaaa`→`a4`) | useless on varied text |
| **Huffman** | **frequency** skew | needs frequencies |

Real compressors **combine** them (e.g. RLE/LZ **then** Huffman).

--

## Why Huffman is optimal

Among **all** prefix-free codes, Huffman's minimizes Σ freq·len.

- proved by an **exchange argument**: the two rarest symbols can be made **deepest siblings** without increasing cost
- then **optimal substructure**: merging them leaves a smaller optimal problem

--

## Entropy — the theoretical limit

Shannon: the best possible average is the **entropy**

```text
   H = − Σ p·log₂ p   bits per symbol
```

Huffman gets **within 1 bit** of H per symbol — optimal among **integer-length** codes.

--

## Huffman's limits & successors

- needs the **frequencies up front** (two passes, or send the table)
- integer bits/symbol → up to ~1 bit of slack vs entropy
- **adaptive Huffman** updates the tree as it reads (one pass)
- modern codecs pair it with **LZ77** (DEFLATE) or use **arithmetic / ANS** coding

--

## Huffman in the wild

- **DEFLATE** (ZIP, gzip, PNG) — Huffman + LZ77
- **JPEG**, **MP3** — Huffman-code the quantized data
- **fax**, many codecs

A 1952 student's term paper, still everywhere.

---

### Part 5 · Wrap & ICA 12

<small>(~14 min)</small>

--

## Recap — greedy

- a **greedy** algorithm makes the locally-best choice and never reconsiders
- correct iff **greedy-choice property** + **optimal substructure**
- prove it with an **exchange argument**; break it with a **counterexample**
- fast — but only when justified (else **DP**)

--

## Recap — Huffman

- **variable-length**, **prefix-free** code — symbols at trie **leaves**
- greedy: **merge the two least-frequent** (a min-heap) until one tree
- **optimal** prefix code — minimizes Σ freq·len

> Frequent symbols get short codes; Huffman's greedy merge makes that assignment provably optimal.

--

## The greedy algorithms we've met

| algorithm | greedy choice | proof |
|---|---|---|
| **Dijkstra** | nearest unsettled vertex | exchange |
| **Prim** | lightest edge leaving tree | cut property |
| **Kruskal** | cheapest safe edge | cut property |
| **Huffman** | merge two rarest | exchange |

One pattern, four classic algorithms — all proved the same way.

--

## Greedy vs dynamic programming

```text
   greedy:  ONE locally-best choice per step, never reconsider
   DP:      TRY all choices, keep the best subproblem solutions
```

Greedy is DP with the **luxury of one choice**. When greedy's proof fails → **DP** (next week).

--

## When to reach for greedy

- you can **prove** the greedy choice is safe (exchange argument), **or**
- speed matters and you've **stress-tested** against counterexamples
- the problem has **optimal substructure**

Otherwise → **dynamic programming**.

--

## The back-half theme

Sessions 9–12 share one shape:

- a **greedy** choice, proved safe by an **exchange argument**
- built on a **structure you already have** (the heap, union-find)

```text
   Dijkstra · Prim · Kruskal · Huffman
   one idea, four classic algorithms
```

--

## ICA 12 — your turn

In `ica12/ica12.cpp`:

- build a **Huffman tree** from a frequency table (use a `priority_queue`)
- derive the **codes** (root-to-leaf, left=0/right=1)
- verify the codes are **prefix-free** and compute Σ freq·len

Build `-g`, run the self-tests, Valgrind-clean.

