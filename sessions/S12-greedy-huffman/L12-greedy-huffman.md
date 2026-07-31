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
  prefix-free code trie that provably minimizes the encoded length. L09 DEFINED greedy (template +
  the coin pair) and L11 added Prim/Kruskal — tonight is the general pattern,
  proved; Part 1 recaps, it must not re-teach.

  Covered in Spring-26 (Kim, Tree deck): Huffman coding (frequencies, tree build,
  codes) lived in the trees module. The GREEDY-method generalization is new
  (Erickson Ch 4). The Huffman demos are INTERACTIVE (editable frequencies map
  to symbols a, b, c, …; the CLRS sample is "5, 9, 12, 13, 16, 45" → total 224;
  equal frequencies show the no-skew-no-win balanced tree; the codes demo has
  an Encode op for arbitrary text over a..f). Optimality is PROVED in two
  lemma slides (exchange Δcost algebra + the cost(T) = cost(T′) + fx + fy
  substructure identity), not postulated.

  Session plan (150 min). 0:00 intro 0:04 P1 greedy method 12 (RECAP of L09's
  definition + coin pair — do not re-teach) 0:16 P2 when-optimal 28 (activity
  selection + interval partitioning on ONE instance) 0:44 BREAK 10 0:54 P3
  Huffman build 30 1:24 P4 prefix codes 24 1:48 P5 wrap 14 2:02 ICA 2:30 end.
-->

## CSS 343

### Data Structures, Algorithms & Discrete Mathematics II

**Lecture 12 — Greedy Algorithms & Huffman Coding**

<small>Summer 2026 · T/Th 6:00–8:30 · UW1 020 · Dr. Marcel Gavriliu</small>

---

## Reading

**[Chapter 12 — Greedy & Huffman](../../handouts/ch12-greedy-huffman.html)** + **[Greedy Algorithms](../../handouts/greedy-algorithms.html)** — the course text

- **the greedy method** — locally-best, never reconsider
- **when it works** — greedy-choice + optimal substructure
- **the exchange argument** — the correctness proof
- **Huffman coding** — an optimal prefix-free code

<small>Optional second takes: Sedgewick §5.5; Erickson Ch 4. Reading quiz due before class.</small>

---

### Part 1 · The greedy method

<small>(~12 min)</small>

--

## Greedy, recalled (L09)

**Commit to the locally-best choice; never reconsider.**

```text
   greedy(problem):
       while not solved:
           x = the locally BEST choice available
           commit to x               // never undone
           shrink the problem
```

You watched it **win** (US coins; Dijkstra) and **lose** ({1,3,4} making 6: greedy 3 coins, optimal 2) — so every greedy **owes a proof**.

--

## You've already seen greedy

| algorithm    | greedy choice                                  |
| ------------ | ---------------------------------------------- |
| **Dijkstra** | settle the **nearest** unsettled vertex        |
| **Prim**     | add the **lightest** edge leaving the tree     |
| **Kruskal**  | take the **cheapest** edge that avoids a cycle |

Tonight: the general pattern, and **Huffman**.

--

## Greedy vs the alternatives

```text
   brute force   — try all solutions        (exponential)
   greedy        — one locally-best choice   (usually fast)
   dynamic prog. — optimal over subproblems  (next week)
```

Greedy is the **cheapest** approach — **if** the problem allows it.

--

## The two ingredients

Greedy is correct exactly when the problem has:

1. **greedy-choice property** — a globally optimal solution contains the greedy (locally-best) choice
2. **optimal substructure** — an optimal solution is built from optimal solutions to subproblems

--

## Greedy-choice vs optimal substructure

Two different guarantees — don't confuse them:

| property                 | says                                             | example                            |
| ------------------------ | ------------------------------------------------ | ---------------------------------- |
| **greedy-choice**        | the local best is **safe** to commit             | take the nearest vertex            |
| **optimal substructure** | what is left is the **same problem but smaller** | shortest path minus its first edge |

You need **both**; DP needs only the second.

---

### Part 2 · When greedy is optimal

<small>(~28 min)</small>

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

## The 0/1 knapsack problem

A bag carries at most **W** kilos. Item `i` has value `v[i]` and weight `w[i]`. Choose a **subset** to pack:

```text
   maximize    Σ v[i]   over the chosen items
   subject to  Σ w[i]  ≤  W

   each item is ALL or NOTHING: take it (1) or
   leave it (0) — hence "0/1". No halves, no seconds.
```

The **only** freedom is *which subset* — and that one restriction is what breaks greedy.

--

## When greedy FAILS: 0/1 knapsack

Three items, **W = 50**. The natural greedy: best **value/weight** ratio first.

```text
   item   value  weight  ratio
     A      60      10     6      greedy: A, then B  → 160
     B     100      20     5              20 capacity wasted
     C     120      30     4      best:   B + C      → 220
```

Greedy's first pick **blocks** the better pair. But notice: **heaviest-first** would have taken C then B — **220**, optimal. So just use *that* rule?

--

## Then use a different rule?

A second instance, `W = 10`:

```text
   X: value 10, weight 10     opt: Y + Z = 12
   Y: value  6, weight  5     but X alone fills the bag = 10
   Z: value  6, weight  5
```

| rule | inst 1 (opt **220**) | inst 2 (opt **12**) |
| --- | --- | --- |
| highest **value** · **heaviest** first | 220 ✓ | 10 ✗ |
| best **value/weight** · **lightest** first | 160 ✗ | 12 ✓ |

Each wins on one, loses on the other. **No fixed order works** → **DP** (L14–15).

--

## Prove it — or break it

The checklist for any proposed greedy rule:

- **break it** — hunt a small counterexample ({1,3,4} took one line)
- **prove it** — exchange argument + substructure
- good sign: a clear sort key, and committing costs you nothing later
- bad sign: **blocking** — an early pick eats a resource a better combination needed (knapsack's A) → reach for **DP**

--

## Classic greedy: activity selection

**One** room, five requests. Each is a half-open interval `[start, finish)` — one ending at 5 and one starting at 5 do **not** conflict. Seat as **many** as possible.

```text
   t     1  2  3  4  5  6  7  8  9  10 11
   a     ============
   b        ============
   c           ============
   d                       ======
   e                          =========
```

Greedy rule: take the activity that **finishes earliest** among those still compatible.

--

## Activity selection — the run

Sort by **finish**: `a(5) b(6) c(7) d(9) e(11)`. Take the first, then skip anything that starts before the last finish.

```text
   t     1  2  3  4  5  6  7  8  9  10 11
   a     ============                    TAKE   (room free at 5)
   b        ============                 skip   (starts 2 < 5)
   c           ============              skip   (starts 3 < 5)
   d                       ======        TAKE   (starts 7 ≥ 5)
   e                          =========  skip   (starts 8 < 9)
```

**2 activities**: `a` then `d`. Note b, c, e are never revisited.

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

## Same events — how many rooms?

Now **every** request must be honoured. Rooms run in parallel, one activity per room at a time. **Minimize the rooms.**

```text
   t     1  2  3  4  5  6  7  8  9  10 11
   a     ============
   b        ============
   c           ============
   d                       ======
   e                          =========
   count 1  2  3  3  2  1  1  2  1  1
```

At `t = 3` and `t = 4`, **three** events run at once → you need **at least 3** rooms.

--

## Why 3 rooms is optimal

```text
   LOWER BOUND   k events share an instant ⇒ they pairwise
                 conflict ⇒ every schedule needs ≥ k rooms.
                 max overlap here = 3, so rooms ≥ 3.

   GREEDY        in START order, put each event in ANY free
                 room; open a new room only if all are busy.
                 a→R1  b→R2  c→R3  d→R1(free at 5)  e→R2(free at 6)
```

Greedy opens a room only when every open room is busy — and those all overlap the new event, so it never exceeds the max overlap. **3 = 3, so both are optimal.**

--

## 🎬 Demo — intervals

<div class="algo-viz" data-algo="intervals">
<pre class="viz-fallback">
   a[1,5) b[2,6) c[3,7) d[7,9) e[8,11)
   Rooms  — greedy by START time, reuse any free room → 3 rooms
            (a,d share R1; b,e share R2; c alone in R3)
   Select — greedy by FINISH time, one room → 2 activities (a, d)
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Same events, both questions. **Rooms** colours each bar by its room; **Select** greens the chosen ones. Editable `start finish` pairs — try making one event span everything.</small>

--

## Fractional knapsack IS greedy

Same three items, same W = 50 — but now you may take **part** of an item:

```text
   greedy: highest ratio first; top off with a fraction
   A(10) + B(20) = 30 used, value 160
   + 20/30 of C  = 50 used, value 160 + 80 = 240
```

**240 > 220**: the fraction removes the waste that blocked greedy before.

---

### Part 3 · Huffman coding: build the trie

<small>(~30 min)</small>

--

## What a code is

A computer stores text as **bits**, so every symbol needs a bit pattern. The distinct symbols are the **alphabet**; a **code** gives each one a **codeword**:

```text
   alphabet   a   b   c   d   e   f      6 symbols
   codewords  000 001 010 011 100 101    3 bits each

   encode "cab"  →  010 · 000 · 001  →  010000001
   decode        →  chop into 3s, look each up
```

**Cost** of a code on a text = total bits = `Σ freq(s) × len(codeword(s))`.

--

## The compression problem

**Minimize that sum.** A fixed-length code cannot: every symbol pays the same width, however often it appears.

```text
   freqs   a:5  b:9  c:12  d:13  e:16  f:45   (100 chars)
   fixed   every symbol 3 bits → 100 × 3 = 300 bits
           f appears 45× and still pays 3
```

Idea: **frequent** symbols get **short** codewords, rare ones long — a **variable-length** code.

--

## Fixed vs variable — the numbers

```text
   fixed 3-bit:   100 × 3           = 300 bits
   Huffman:       Σ freq · codelen  = 224 bits
                                      25% smaller
```

The saving comes entirely from **skew** — a few symbols dominate. Uniform frequencies → **no win at all**.

--

## The ambiguity problem

Variable-length codes can be **ambiguous**:

```text
   a=0  b=1  c=01     "01" = "ab"?  or  "c"?  💥
```

We need codes that decode **uniquely** — no codeword may be a **prefix** of another.

--

## Prefix-free codes = a trie

Put symbols at the **leaves** of a binary tree; the path (**left=0, right=1**) is the code:

```text
        ( )
       0/  \1
      f    ( )        f = 0
          0/  \1      c = 100
        ( )   ...
       0/ \1
      c    ...        leaves only → prefix-free!
```

Since symbols sit only at **leaves**, no codeword is a prefix of another.

<small>A **trie** is a tree whose *paths* spell things out — here each root-to-leaf path spells one codeword. Sedgewick's name for this shape; L16 studies tries in their own right.</small>

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

Merging them is the safe greedy choice — **proved two slides on**.

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
   say WHAT to compress, four ways:
     TEXT(the white fox jumped over the white fence)
     SYM-FRQ(a:20, b:17, c:11)   SYM-RAND(a..h)
     5, 9, 12, 13, 16, 45        (freqs for a, b, c, …)
   then merge the two smallest roots until one tree remains.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Every build reports **ASCII · fixed-length · Huffman** bits and the ratio. `TEXT(…)` counts real characters — a space is a symbol, drawn `␣`. Try `8, 8, 8, 8`: **Huffman = fixed, no win**.</small>

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

Frequencies `x:1  y:1  z:2  w:4`. **Ties:** the node listed **earlier** becomes the **left** (0) child; a merged node joins at the **end** of the list.

```text
   merge x+y → 2   pool: 2(z) 4(w) 2(xy)
   merge z+xy → 4  pool: 4(w) 4(zxy)
   merge w+… → 8   → root
```

<small>Codes: `w = 0` (freq 4, shallow), `z = 10`, `x = 110`, `y = 111`. The rarest (x, y) sink deepest; total = 4·1 + 2·2 + 1·3 + 1·3 = **14 bits**.</small> <!-- .element: class="fragment" -->

--

## Breaking ties

When two nodes share the lowest frequency, **either** may be picked:

```text
   different tie-breaks → different trees / different codes
   BUT the weighted total Σ freq·len is always the SAME (optimal)
```

Like the MST: the optimal **cost** is unique; the optimal **tree** may not be.

--

## Proof 1 — the two rarest go deepest

**Exchange:** in any optimal tree `T`, let `a, b` = sibling leaves at **max depth**. Swap the rarest symbol `x` with `a`:

```text
   Δcost = (fx·da + fa·dx) − (fx·dx + fa·da)
         = (fa − fx) · (dx − da)
             ≥ 0     ·   ≤ 0        →  Δcost ≤ 0
```

Same for `y`↔`b` → **some optimal tree has x, y as deepest siblings** — exactly Huffman's first merge. ∎

--

## Proof 2 — merging shrinks the problem

Merge `x, y` into one symbol `z` with `fz = fx + fy`. For any tree `T` where x, y are siblings under `z`'s spot:

```text
   cost(T)  =  cost(T′)  +  fx + fy
   (every x- or y-bit is a z-bit PLUS one extra level)
```

The `fx + fy` term is a **constant** → optimal `T′` ⟺ optimal `T`. Induction on n−1 symbols finishes it. ∎

---

### Part 4 · Prefix-free codes & compression

<small>(~24 min)</small>

--

## Encoding

Replace each symbol with its **codeword**; **concatenate** the bits:

```text
   text  "face"
   f→0  a→1100  c→100  e→111
   bits  0·1100·100·111  →  01100100111   (11 bits)
```

No separators needed — the prefix-free property makes the boundaries unambiguous.

--

## Decoding

**Walk the trie** from the root, one bit at a time; emit a symbol at each **leaf**, then restart:

```text
   bits 01100100111      0 → leaf f ✓          emit f
                         1,1,0,0 → leaf a ✓    emit a
                         1,0,0 → leaf c ✓      emit c
                         1,1,1 → leaf e ✓      emit e
```

The prefix-free property guarantees you always know when a symbol ends.

--

## Self-delimiting: no separators

A prefix-free code needs **no delimiter** between symbols:

```text
   0·1100·100·111   stored as   01100100111
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

## Your turn — decode

Using tonight's codes (`f=0 c=100 d=101 e=111 a=1100 b=1101`):

```text
   decode the bits:  1010
```

<small>Walk from the root: `1,0,1` hits leaf **d**; restart; `0` hits leaf **f** — the bits decode to **"df"**. Four bits, two symbols, no separators.</small> <!-- .element: class="fragment" -->

--

## 🎬 Encode / decode

<div class="algo-viz" data-algo="huffman-codes">
<pre class="viz-fallback">
   the tree on top; under it three panels:
       text  |  encoded bits  |  decoded text
   ENCODE reads the left panel, fills the middle.
   DECODE reads the middle panel, fills the right —
   so the bits it consumes are the bits Encode just made.
   "face" → 01100100111 → "face"      (11 bits, not 32)
</pre>
</div>

<small>**text · bits · decoded text.** Encode fills the middle from the left, Decode the right from the middle — eating exactly what Encode made. One colour per symbol.</small>

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

| code                 | good when                   | weakness               |
| -------------------- | --------------------------- | ---------------------- |
| **fixed-length**     | simplicity                  | ignores skew           |
| **run-length (RLE)** | long **runs** (`aaaa`→`a4`) | useless on varied text |
| **Huffman**          | **frequency** skew          | needs frequencies      |

Real compressors **combine** them (e.g. RLE/LZ **then** Huffman).

--

## Entropy — the theoretical limit

Shannon: the best possible average is the **entropy**

```text
   H = − Σ p·log₂ p   bits per symbol

   tonight's frequencies:  H = 2.2199 → 222 bits
   Huffman                     2.24   → 224 bits
```

Huffman is guaranteed **within 1 bit** of H per symbol — here it lands within **0.02**.

--

## Huffman's limits & successors

- needs **frequencies up front** (two passes / send the table)
- integer bits/symbol → up to ~1 bit slack vs entropy
- **adaptive Huffman** builds the tree as it reads
- modern: **LZ77 + Huffman** (DEFLATE) · arithmetic coding / **ANS** (asymmetric numeral systems)

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

> Frequent → short, rare → deep; the greedy merge is provably optimal.

--

## The greedy quartet

| algorithm    | greedy choice              | proof        |
| ------------ | -------------------------- | ------------ |
| **Dijkstra** | nearest unsettled vertex   | exchange     |
| **Prim**     | lightest edge leaving tree | cut property |
| **Kruskal**  | cheapest safe edge         | cut property |
| **Huffman**  | merge two rarest           | exchange     |

One pattern, four classics — all built from structures you already had.

--

## Greedy vs dynamic programming

```text
   greedy:  ONE locally-best choice per step, never reconsider
   DP:      TRY all choices, keep the best subproblem solutions
```

Greedy is DP with the **luxury of one choice** — earn it with a proof, or fall back to **DP** (next week).

--

## ICA 12 — your turn

In `ica12/ica12.cpp`:

- build a **Huffman tree** from a frequency table (use a `priority_queue`)
- derive the **codes** (root-to-leaf, left=0/right=1)
- verify the codes are **prefix-free** and compute Σ freq·len

Build `-g`, run the self-tests, Valgrind-clean.

