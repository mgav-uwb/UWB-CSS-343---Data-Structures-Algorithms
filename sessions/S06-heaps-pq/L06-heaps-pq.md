<!--
  CSS 343 · Lecture 6 (Session 6) — Heaps & Priority Queues; Heapsort.
  reveal.js: "---" = next part (→), "--" = next slide (↓). Notes follow "Note:".
  Concrete C++ (structs, arrays, indices) — no templates/inheritance. KaTeX: never
  two "_" on one line. Verify slides at 1280×620; code/ASCII ≤ ~56 chars (0.46em).

  Reading (pre): Sedgewick & Wayne §2.4 (Priority Queues) + ODS Ch 10 (Heaps).
  THROUGH-LINE: we want the "most important item next" fast — insert AND remove-max
  both in O(log n). A binary HEAP (a complete tree flattened into an array, no
  pointers) does it: swim up on insert, sink down on remove. Building a heap is a
  surprising O(n); running it as a sort gives in-place heapsort. Heaps power
  Huffman coding and Dijkstra (next weeks). We use a MAX-heap (min-heap is mirror).

  Covered in Spring-26 (Kim, Binary Heap deck): heap property + array layout,
  insert/percolate-up, deleteMin/percolate-down, build-heap O(n) with the swap-sum
  proof, PQ ADT, Huffman. Sedgewick §2.4 adds heapsort + indexed PQ. Deliverables:
  PA1 due · PA2 out.

  Session plan (150 min). 0:00 intro 0:04 P1 PQ ADT 16 0:20 P2 heap+array 20
  0:40 P3 insert/swim 14 0:54 P4 delMax/sink 16 1:10 BREAK 10 1:20 P5 build O(n) 22
  1:42 P6 heapsort 20 2:02 P7 in practice 16 2:18 P8 wrap+ICA 12 2:30 end.
-->

## CSS 343

### Data Structures, Algorithms & Discrete Mathematics II

**Lecture 6 — Heaps & Priority Queues; Heapsort**

<small>Summer 2026 · T/Th 6:00–8:30 · UW1 020 · Dr. Marcel Gavriliu</small>

---

## Reading

**Sedgewick & Wayne §2.4** — Priority Queues · algs4.cs.princeton.edu

- the **heap-ordered complete tree** and its **array** form
- **swim** (insert) and **sink** (remove max), each **Θ(log n)**
- **heapsort**: heapify, then sort down — in place

_Secondary:_ ODS Ch 10. Reading quiz due before class.

---

### Part 1 · The priority-queue ADT

<small>(~16 min)</small>

--

## Beyond FIFO

A **queue** serves the **oldest** item next. But often "next" should mean **most important** — a **priority queue**:

- an OS scheduler runs the **highest-priority** ready thread
- an ER treats the **most critical** patient first
- an event simulator processes the **earliest** event next

--

## It generalizes stack and queue

| ADT | removes | rule |
|---|---|---|
| stack | most-recent | LIFO |
| queue | oldest | FIFO |
| **priority queue** | **most-important** | by **key** |

A stack or queue is a PQ whose "priority" is just insertion time. The PQ lets you choose *any* ordering key.

--

## Concretely: event simulation

Simulate a system of events, each stamped with a **time**:

```text
   PQ = min-PQ keyed by event time
   insert the first events
   while PQ not empty:
       e = delMin()          // earliest event
       process e (may schedule NEW future events → insert)
```

The PQ always hands back the **next** thing to happen — even as new events appear mid-run.

--

## The priority-queue ADT

A **max-priority-queue** of comparable keys supports:

```text
   insert(x)      add a key
   max()          return the largest key
   delMax()       remove and return the largest key
   isEmpty(), size()
```

(A **min**-PQ is the mirror image — `delMin`. We'll build the **max** version; everything flips symmetrically.)

--

## Where priority queues show up

- **event-driven simulation** — next event by time
- **Huffman coding** — take the two smallest weights (tie-in)
- **Dijkstra / Prim** — next-closest vertex (next weeks)
- **scheduling**, **A\*** search, **top-K**, **median** maintenance

--

## Why the obvious choices are too slow

| implementation | insert | delMax |
|---|---|---|
| unordered array/list | Θ(1) | **Θ(n)** |
| ordered array/list | **Θ(n)** | Θ(1) |
| **binary heap** | **Θ(log n)** | **Θ(log n)** |

Each simple option makes **one** operation cheap by making the other **linear**. We want *both* fast.

--

## The idea: partial order

A sorted list is **too** ordered (expensive to maintain). An unsorted list has **no** order (expensive to search).

A heap keeps a **partial** order — **each parent is ≥ its children** — which is:

- **strong enough**: the maximum is always at the top
- **loose enough**: restoring it after a change costs only **one root-to-leaf path**

---

### Part 2 · The binary heap

<small>(~20 min)</small>

--

## Two conditions

A **binary (max-)heap** is a binary tree that is both:

1. **complete** — every level full except possibly the last, which is filled **left-to-right**
2. **heap-ordered** — every node's key is **≥ both its children**

```text
            [ 90 ]
           /      \
        [80]      [70]
        /  \      /
     [30] [60] [50]        ← complete + heap-ordered
```

--

## Heap-ordered ⇒ max on top

If every parent ≥ its children, then by transitivity the **root is the largest** key in the whole heap.

Heap order says **nothing** about left-vs-right siblings — only parent-vs-child. That looseness is the point (a sorted tree would be a BST, expensive to keep balanced).

--

## The magic: no pointers — use an array

A **complete** tree has no gaps, so number the nodes **level by level, 1..n** and store them in an array `a[1..n]`. The tree structure becomes **arithmetic**:

```text
   a: [ _ | 90 | 80 | 70 | 30 | 60 | 50 ]
        0    1    2    3    4    5    6
```

```text
   parent(k) = k / 2      (integer division)
   left(k)   = 2k
   right(k)  = 2k + 1
```

--

## Reading the array as a tree

```text
   a: [ _ | 90 | 80 | 70 | 30 | 60 | 50 ]
             1    2    3    4    5    6

   a[1]=90  children a[2]=80, a[3]=70
   a[2]=80  children a[4]=30, a[5]=60
   a[3]=70  child    a[6]=50
```

Every "go to my child / parent" is a **multiply / divide by 2** — no dereferencing.

--

## Quick check — index arithmetic

For a heap in `a[1..15]` (1-indexed):

- the children of `a[6]` are at indices **?**
- the parent of `a[11]` is at index **?**
- is `a[8]` a leaf? (n = 15)

<small>children of 6: **12, 13** · parent of 11: **5** · a[8] leaf? its children would be 16, 17 > 15 → **yes, a leaf** (leaves are `a[n/2+1 .. n]`).</small>

--

## Heap ≠ BST

Same picture (a binary tree in an array), **different invariant**:

| | BST | heap |
|---|---|---|
| order | left < node < right | parent ≥ children |
| finds | any key, in order | **only the max** |
| shape | can be unbalanced | always **complete** |

A heap gives up "find any key" to make "find the max" and "stay balanced" trivial.

--

## Height of a heap

A complete binary tree on `n` nodes has height

$$h = \lfloor \log_2 n \rfloor$$

Every level except the last is full, so the levels double: `1, 2, 4, …` nodes. That is why every operation touching a single root-to-leaf path costs **Θ(log n)**.

--

## The heap type

```text
struct MaxHeap {
    int a[CAP + 1];   // a[0] unused
    int n = 0;        // current size
};

int  parent(int k) { return k / 2; }
int  left  (int k) { return 2 * k; }
int  right (int k) { return 2*k + 1; }
bool empty (MaxHeap& h) { return h.n == 0; }
int  max   (MaxHeap& h) { return h.a[1]; }  // Θ(1)
```

---

### Part 3 · insert — swim up

<small>(~14 min)</small>

--

## insert: add, then swim

To insert a key:

1. put it at the **end** (`a[++n]`) — keeps the tree **complete**
2. it may exceed its parent → **swim** it up: while it is bigger than its parent, **swap**

Only the new node's **path to the root** can be out of order, so fixing that one path suffices.

--

## swim — the code

```text
void swim(MaxHeap& h, int k) {
    while (k > 1 && h.a[k/2] < h.a[k]) {
        swap(h.a[k/2], h.a[k]);   // parent < child: lift
        k = k / 2;                // move up to the parent
    }
}
void insert(MaxHeap& h, int x) {
    h.a[++h.n] = x;               // append (stays complete)
    swim(h, h.n);                 // restore heap order
}
```

--

## swim — worked example

```text
   insert 95 into           append at end:        swim:
        [90]                    [90]                 [95]
       /    \                  /    \               /    \
     [80]  [70]     →       [80]  [70]     →     [90]  [70]
     / \   /               / \   / \             / \   /
   [30][60][50]         [30][60][50][95]      [30][60][50][80]
                             (95 > 50, then          95 rises
                              95 > 80)               to the root
```

--

## swim — your turn

Into the heap `a = [ 90 80 70 30 60 50 ]`, **insert 85**. Where does it land?

<small>append at index 7 (child of 70) → 85 > 70, swap up to index 3 → 85 < parent 90, **stop**. Final: `[ 90 80 85 30 60 50 70 ]`; 85 sits at index 3, having swum **one** level.</small>

--

## 🎬 Demo — insert (swim)

<div class="algo-viz" data-algo="heap-ops">
<pre class="viz-fallback">
  a: [ 90 80 70 30 60 50 40 20 ]   (a max-heap)
  press Insert and type a key → append at the end → swim up:
     new key vs parent → swap while larger → it stops when a parent dominates.
  the array view (top) and the tree view (bottom) update together.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>The heap lives in the **array** (top) — the tree (bottom) is the exact same data, same indices, no pointers. **Insert** appends, then **swims**: each **compare** is a parent–child check, each **swap** lifts the key one level — at most **log n** of them. Edit the build sequence and press Build to try your own starting heap.</small>

---

### Part 4 · delMax — sink down

<small>(~16 min)</small>

--

## delMax: swap to the end, then sink

The max is `a[1]`. To remove it:

1. **swap** `a[1]` with the **last** element `a[n]`, then **shrink** (`n--`) — the old max is parked past the end
2. the new root may be too small → **sink** it: swap with its **larger** child while it is smaller

Again only **one path** — root to a leaf — can be wrong.

--

## sink — the code

```text
void sink(MaxHeap& h, int k) {
    while (2*k <= h.n) {
        int j = 2*k;                       // left child
        if (j < h.n && h.a[j] < h.a[j+1])
            j++;                           // pick the larger child
        if (h.a[k] >= h.a[j]) break;       // already ≥ both children
        swap(h.a[k], h.a[j]);
        k = j;                             // move down
    }
}
int delMax(MaxHeap& h) {
    int top = h.a[1];
    swap(h.a[1], h.a[h.n--]);              // max to the end, shrink
    sink(h, 1);                            // restore heap order
    return top;
}
```

--

## sink — worked example

```text
  delMax on         swap root↔last,      sink 20:
     [95]           remove 95:           swap w/ larger
    /    \             [20]              child (90)…
  [90]  [70]          /    \               [90]
  / \   /          [90]  [70]             /    \
[30][60][50]       / \   /              [60]  [70]
                 [30][60][50]           / \   /
                                      [30][20][50]
```

**95** is returned; **20** sinks past **90** then **60** — one root-to-leaf path.

--

## sink vs swim

|  | swim (insert) | sink (delMax) |
|---|---|---|
| starts at | a **leaf** | the **root** |
| moves | **up** | **down** |
| compares against | **1 parent** | **2 children** (pick larger) |
| cost | Θ(log n) | Θ(log n) |

Two mirror-image primitives — **every** heap operation is built from these two.

--

## 🎬 Demo — delMax (sink)

<div class="algo-viz" data-algo="heap-ops">
<pre class="viz-fallback">
  press Delete Max: a[0] is the answer.
   1) swap a[0] with the last element → shrink
   2) sink the new root: swap with the LARGER child
      while smaller → it settles at its level.
  the array view (top) and the tree view (bottom) update together.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>**Delete Max** returns the root, moves the last key up, then **sinks** it — each step compares **both children** and swaps with the **larger**. One root-to-leaf path, **log n** work. Same sandbox as the insert slide — press Delete Max this time.</small>

--

## The API so far

```text
   insert   : append + swim   → Θ(log n)
   max      : a[1]            → Θ(1)
   delMax   : swap + sink     → Θ(log n)
```

A priority queue with **both** update operations logarithmic — the goal from Part 1, achieved.

---

### Part 5 · Building a heap

<small>(~22 min)</small>

--

## Build from n given keys

Given `n` keys already in an array, make it a heap. Obvious way: **insert them one at a time**.

```text
   for i in 1..n: swim(i)      // insert a[i]
```

Each insert is `Θ(log n)` → total **Θ(n log n)**. Correct — but can we do **better**?

--

## Heapify: sink bottom-up

Put all `n` keys in the array (a complete tree already), then **sink every node**, from the last internal node down to the root:

```text
   for k = n/2 down to 1:
       sink(k);
```

The bottom half are leaves (nothing to sink). Fix small heaps first, then merge upward.

--

## Heapify — a worked pass

```text
   a: [ _ | 30 60 50 90 85 40 70 45 20 ]     (arbitrary)
              1  2  3  4  5  6  7  8  9

   sink node 4 (90) … 3 (50) … 2 (60) … 1 (30),
   each time swapping down with the larger child,
   until every parent ≥ its children.
```

Start at `k = n/2 = 4`; work down to the root.

--

## Why heapify is Θ(n), not Θ(n log n)

The trick: **most nodes are near the bottom**, where sinking is **cheap**.

- a node at height `i` costs at most `i` swaps
- a complete tree has about `n / 2^{i+1}` nodes at height `i`

```text
   total work  ≤  Σ  (nodes at height i) · i
              ≈  n · Σ  i / 2^{i+1}
```

--

## The sum is a constant

```text
   Σ_{i≥1}  i / 2^i   =  2        (a convergent series)
```

So total work `≤ n · (constant) = Θ(n)`.

**Building a heap is linear** — cheaper than sorting, cheaper than n inserts.

--

## Two ways to build

| method | how | cost |
|---|---|---|
| repeated **insert** | swim each key as it arrives | **Θ(n log n)** |
| **heapify** | put all keys in, sink `n/2 … 1` | **Θ(n)** |

Same result; heapify wins when you have all the data **up front**. (Streaming keys one-at-a-time still needs repeated insert.)

--

## Selection sort → heapsort

Selection sort each round **scans** for the max — Θ(n) per round → **Θ(n²)**.

Heapsort keeps the data in a **heap**, so "find the max" is Θ(log n) instead of Θ(n):

```text
   selection sort:  n rounds × Θ(n) scan   = Θ(n²)
   heapsort:        n rounds × Θ(log n) pop = Θ(n log n)
```

Same skeleton, a heap for the bookkeeping.

--

## The swap-sum, explicitly

Let `S = Σ_{i=0}^{h} 2^i (h − i)` — nodes at level `i` (there are `2^i` of them) times their sink cost (`h−i`, since the root is level 0 and sits at height `h`):

```text
   S  =         h·2^0 + (h−1)·2^1 + (h−2)·2^2 + … + 1·2^{h−1} + 0·2^h
   2S =         h·2^1 + (h−1)·2^2 + (h−2)·2^3 + … + 1·2^h
```

--

## Subtract: 2S − S

Shift `2S` one column right and subtract; every middle term cancels, leaving only a geometric run of powers of two:

```text
   2S − S = 2^1 + 2^2 + 2^3 + … + 2^h  −  h
          = (2^{h+1} − 2)  −  h
```

```text
   S = 2^{h+1} − h − 2
```

--

## Substitute n for h — the punchline

A complete tree of height `h` has between `2^h` and `2^{h+1}-1` nodes — using the same `n ≈ 2^h` shorthand as two slides back, `2^{h+1} = 2n` and `h = log₂ n`:

```text
   S = 2^{h+1} − h − 2
     = 2n − log₂ n − 2
     ≈ 2n − log₂ n          →   Θ(n)
```

Building a heap costs at most **two comparisons per node**, minus a `log₂ n` correction — linear, not `n log n`.

--

## 🎬 Demo — build a heap (heapify)

<div class="algo-viz" data-algo="heap-build">
<pre class="viz-fallback">
   start: arbitrary array (a complete tree, not yet a heap)
   press Build: sink node n/2, n/2−1, …, 1  (bottom-up)
   each sink swaps down with the larger child
   → a valid max-heap, in Θ(n) total.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Bottom-up **heapify**: sink each internal node from `n/2` to `1`. Watch the swaps cluster **near the bottom** (cheap) — total work is **Θ(n)**, not n·log n. Edit the array and press Build to try your own input.</small>

---

### Part 6 · Heapsort

<small>(~20 min)</small>

--

## A heap is a sorting algorithm

If a heap can hand you the max in Θ(log n)… remove them **all**, largest first, and you have the data in order. That is **heapsort**, and it runs **in place** in the same array.

Two phases:

1. **heapify** the array — Θ(n)
2. **sort down** — n × delMax — Θ(n log n)

--

## Sort down, in place

After heapify, `a[1]` is the max. Swap it to the **end**, shrink the heap by one, and **sink** the new root. Repeat.

```text
   heapify: for k=n/2..1: sink(k, n)
   for end = n down to 2:
       swap(a[1], a[end]);     // park the max at a[end]
       sink(1, end − 1);       // reheapify the smaller heap
```

The sorted tail grows from the **right**; the heap shrinks on the **left**. No extra array.

--

## Sort down — worked

```text
   heap:   [ 95 90 70 80 60 ]          heap | sorted
   swap 95↔end, sink:  90 80 70 60 | 95
   swap 90↔end, sink:  80 60 70    | 90 95
   swap 80↔end, sink:  70 60       | 80 90 95
   swap 70↔end, sink:  60          | 70 80 90 95
                                    | 60 70 80 90 95  ✓
```

Each round: park the max at the boundary, re-sink the rest.

--

## Which Θ(n log n) sort?

| sort | worst | space | stable | note |
|---|---|---|---|---|
| **mergesort** | Θ(n log n) | **Θ(n)** | **yes** | needs a buffer |
| **quicksort** | **Θ(n²)** | Θ(log n) | no | fastest in practice |
| **heapsort** | **Θ(n log n)** | **Θ(1)** | no | guaranteed + in place |

Heapsort is the safety net: no bad inputs, no extra memory.

--

## Heapsort — properties

| property | heapsort |
|---|---|
| worst / average time | **Θ(n log n)** |
| extra space | **Θ(1)** — in place |
| stable? | **no** |

The only `Θ(n log n)` sort that is **both** guaranteed-`n log n` **and** in-place. (Mergesort needs Θ(n) space; quicksort's worst case is Θ(n²).)

--

## 🎬 Demo — heapsort

<div class="algo-viz" data-algo="heap-sort">
<pre class="viz-fallback">
   phase 1: heapify (bottom-up sinks) → a max-heap
   phase 2: repeatedly swap a[0] to the end, shrink,
            sink → the sorted tail grows from the right.
   final: the whole array is sorted ascending, in place.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>**Heapify**, then **sort down**: each round parks the max at the right and re-sinks. The **green** tail is the finished, sorted part; everything is in the **one** array. Edit the array and press Build to sort your own input.</small>

---

### Part 7 · Heaps in practice

<small>(~16 min)</small>

--

## Indexed priority queues

Dijkstra and Prim need to **decrease a key already in the PQ** ("this vertex just got closer"). A plain heap can't find that key. An **indexed PQ** keeps a map `key → array position`, so it also supports:

```text
   decreaseKey(i, v)   change item i's priority, then swim/sink
   contains(i)         is item i in the PQ?
```

Same Θ(log n), plus the ability to update in place.

--

## Library priority queues

You will rarely hand-roll one:

- **C++**: `std::priority_queue` — **max**-heap
- **Java**: `java.util.PriorityQueue` — **min**-heap
- **Python**: `heapq` — **min**-heap (negate keys for max)

All are binary heaps: push/pop Θ(log n), build Θ(n), peek Θ(1).

--

## Beyond binary: d-ary heaps

Why stop at 2 children? A **d-ary heap** gives each node **d** children:

- shallower: height `log_d n` → **faster insert/decreaseKey**
- but sink compares **d** children → **slower delMax**

Tuning `d` trades insert cost against delete cost (d=4 is a common sweet spot; the idea echoes B-trees' fat nodes from L05).

--

## Common heap bugs

- **wrong direction** — using a min-heap where you meant max (or vice-versa)
- **sink without picking the larger child** — leaves a bigger key below a smaller one
- **off-by-one indexing** — mixing 1-indexed math (`k/2`) with a 0-indexed array
- **building with n inserts** (Θ(n log n)) when **heapify** (Θ(n)) was intended

--

## Tie-in: Huffman coding

Huffman builds an optimal prefix code by **greedily merging the two least-frequent symbols**:

```text
   PQ = min-heap of (frequency, node) per symbol
   while PQ has > 1 node:
       a = delMin();  b = delMin();
       insert( node(a.f + b.f, children a, b) );
   the last node left is the Huffman-tree root
```

A **priority queue is the engine** — `n` symbols → Θ(n log n).

--

## Deliverables

- **PA1 due tonight** — submit before the deadline
- **PA2 out** — see `../../assignments/PA2/`

---

### Part 8 · Wrap & ICA 6

<small>(~12 min)</small>

--

## Recap — the structure

- **priority queue**: insert + delMax, both **Θ(log n)** — beats sorted/unsorted lists
- **binary heap**: a **complete** tree, **heap-ordered** (parent ≥ children)
- stored in an **array**, no pointers — `parent = k/2`, `children = 2k, 2k+1`

--

## Recap — the algorithms

- **swim** (insert) and **sink** (delMax) each fix **one path** → **Θ(log n)**
- **build-heap** is **Θ(n)** — bottom-up sinks; most nodes are shallow
- **heapsort**: heapify + sort-down → **Θ(n log n)**, **in place**

> A heap is a complete tree flattened into an array, kept in partial order by **swim** and **sink**.

--

## ICA 6 — your turn

Implement the **max-heap** core in `ica06/ica06.cpp` from a skeleton:

- `insert` via **swim**
- `delMax` via **sink** (remember: swap with the **larger** child)
- `heapify` a given array **bottom-up**, then verify it is a heap

Build `-g`, run the self-tests, Valgrind-clean.

