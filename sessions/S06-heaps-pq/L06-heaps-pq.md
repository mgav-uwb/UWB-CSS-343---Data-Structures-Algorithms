<!--
  CSS 343 · Lecture 6 (Session 6) — Heaps & Priority Queues; Heapsort.
  reveal.js: "---" = next part (→), "--" = next slide (↓). Notes follow "Note:".
  Concrete C++ (structs, arrays, indices) — no templates/inheritance. KaTeX: never
  two "_" on one line. Verify slides at 1280×620; code/ASCII ≤ ~60 chars (0.46em).

  Reading (pre): Sedgewick & Wayne §2.4 (Priority Queues) + ODS Ch 10 (Heaps).
  THROUGH-LINE: "most important item next," with insert AND remove-max both
  O(log n). A binary HEAP (complete tree flattened into an array) does it: swim
  up on insert, sink down on remove. The two invariants have consequences worth
  spelling out (every subtree is a heap, min at a leaf, leaves are the back half,
  paths sorted / levels not, array always > half full). Bottom-up build is
  provably correct (loop invariant) and a surprising Θ(n) (aligned S / 2S
  telescoping sum); running the heap dry gives in-place heapsort. The binary
  heap is the DEFAULT priority queue, not the only one (AVL-as-PQ, d-ary,
  leftist/binomial/Fibonacci, bucket queues). Max-heap throughout (min = mirror).

  Session plan (150 min). 0:00 intro 0:04 P1 PQ ADT 12 0:16 P2 heap+array 16
  0:32 P3 invariant consequences 12 0:44 P4 insert/swim 12 0:56 P5 delMax/sink 14
  1:10 BREAK 10 1:20 P6 build+correctness 16 1:36 P7 build is Θ(n) 14
  1:50 P8 heapsort 14 2:04 P9 PQ landscape 16 2:20 P10 wrap+ICA 10 2:30 end.
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

<small>(~12 min)</small>

--

## Beyond FIFO

| ADT                | serves next        | rule       |
| ------------------ | ------------------ | ---------- |
| stack              | newest             | LIFO       |
| queue              | oldest             | FIFO       |
| **priority queue** | **most important** | by **key** |

- an OS scheduler runs the **highest-priority** ready thread
- an ER treats the **most critical** patient first
- an event simulator processes the **earliest** event next

A stack or queue orders by insertion time; a PQ orders by **any key you choose**.

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

## Why the obvious choices are too slow

| implementation       | insert       | delMax       |
| -------------------- | ------------ | ------------ |
| unordered array/list | Θ(1)         | **Θ(n)**     |
| ordered array/list   | **Θ(n)**     | Θ(1)         |
| **binary heap**      | **Θ(log n)** | **Θ(log n)** |

Each simple option makes **one** operation cheap by making the other **linear**. We want _both_ fast.

--

## Isn't an AVL tree already a PQ?

It is! Insert and delete-max, both Θ(log n) — max = walk right (L04). So why a new structure?

|                   | AVL tree                  | binary heap     |
| ----------------- | ------------------------- | --------------- |
| memory            | node + 2 pointers per key | **plain array** |
| build from n keys | Θ(n log n)                | **Θ(n)**        |
| code              | rotations, balancing      | **~20 lines**   |

The heap is not the *only* PQ — it's the **cheapest** one: it **does less, so it costs less**.

--

## The idea: partial order

A sorted list is **too** ordered (expensive to maintain). An unsorted list has **no** order (expensive to search).

A heap keeps a **partial** order — **each parent ≥ its children** — which is:

- **strong enough**: the maximum is always at the top
- **loose enough**: restoring it after a change costs only **one root-to-leaf path**

---

### Part 2 · The binary heap

<small>(~16 min)</small>

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

## No pointers — use an array

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

<small>children of 6: **12, 13** · parent of 11: **5** · a[8] leaf? its children would be 16, 17 > 15 → **yes, a leaf**.</small>

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

<small>Slot `a[0]` is wasted so the root sits at 1 and the `k/2`, `2k` arithmetic stays clean. Classic trick: since `a[0]` is free anyway, store the heap **size** there instead of a separate `n`.</small>

--

## Heap ≠ BST

Same picture (a binary tree), **different invariant**:

|       | BST                 | heap                |
| ----- | ------------------- | ------------------- |
| order | left < node < right | parent ≥ children   |
| finds | any key, in order   | **only the max**    |
| shape | can be unbalanced   | always **complete** |

A heap gives up "find any key" to make "find the max" and "stay balanced" trivial.

--

## Height of a heap

A complete binary tree on `n` nodes has height

$$h = \lfloor \log_2 n \rfloor$$

Every level except the last is full, so the levels double: `1, 2, 4, …` nodes. Any operation that touches a single root-to-leaf path costs **O(log n)** — guaranteed.

---

### Part 3 · What the invariants imply

<small>(~12 min)</small>

--

## Every subtree is a heap

Both conditions are **local** — parent-vs-child, level-by-level — so both survive restriction to a subtree:

```text
            [ 90 ]
           /      \
        (80)      (70)      ← each circled subtree
        /  \      /            is itself a valid heap
     [30] [60] [50]
```

**A heap is heaps all the way down** — the recursion every proof tonight leans on.

--

## So where's the min?

- down every path keys only **shrink** → the **root is the global max** (transitivity)
- a node with a child is ≥ that child → a non-leaf **can't** be the min
- so the **min is at a leaf** — but *no rule says which one*: finding it is a **Θ(n)** scan

--

## Leaves are the back half of the array

Node `k` has a child iff `2k ≤ n` — so:

```text
   internal nodes:  k = 1 .. n/2
   leaves:          k = n/2 + 1 .. n

   a: [ _ | 90  80  70 | 30  60  50 ]     n = 6
           └ internal ┘ └─ leaves ─┘
```

**At least half** of any heap is leaves.

--

## Paths sorted, levels not

```text
        [ 90 ]
       /      \
    [30]      [80]        ← siblings: no rule
    /  \      /
 [10] [20] [75]           90 ≥ 80 ≥ 75 ✓ (a path)
```

- every root-to-leaf **path** is non-increasing
- but **75 > 30**, a level up! — nothing holds **across** subtrees; only **ancestor–descendant** pairs are ordered

--

## Completeness bounds the waste

Allocate the array to fit the **last level**: capacity `2^(h+1) − 1`. Height `h` means `n ≥ 2^h` keys — the array is always **more than half full**:

```text
   h = 3:  capacity 15,  n ∈ [8..15]   →  ≥ 53% used
```

Pointer nodes (key + 2 pointers) cost ≈ **3×** the memory — *always*.

--

## Quick check — use the invariants

A max-heap holds 15 **distinct** keys in `a[1..15]`:

1. where can the **2nd**-largest key be? the **3rd**?
2. where can the **smallest** be?
3. how do you **verify** an array is a heap — at what cost?

<small>1: 2nd — a child of the root (index 2 or 3); 3rd — depth ≤ 2 (indices 2..7). 2: a leaf — indices 8..15. 3: check a[k] ≥ a[2k], a[2k+1] for k = 1..7 — Θ(n).</small>

---

### Part 4 · insert — swim up

<small>(~12 min)</small>

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

Insert **95**: it lands at index 7 — the **right child of 70** — then beats 70, then beats 90:

```text
  insert 95:           append at a[7]:        swim ×2:
      [90]                 [90]                   [95]
     /    \               /    \                 /    \
   [80]  [70]     →     [80]  [70]      →     [80]  [90]
   /  \   /             /  \   /  \           /  \   /  \
 [30][60][50]        [30][60][50][95]      [30][60][50][70]
```

```text
  a: 90 80 70 30 60 50      +95 → swap@3 → swap@1
  a: 95 80 90 30 60 50 70   (two compares, two swaps)
```

--

## swim — your turn

Into the heap `a = [ 90 80 70 30 60 50 ]`, **insert 85**. Where does it land?

<small>append at index 7 (child of 70) → 85 beats 70, swap up to index 3 → 85 loses to parent 90, STOP. Final: [ 90 80 85 30 60 50 70 ]; 85 sits at index 3, having swum one level.</small>

--

## 🎬 Demo — insert (swim)

<div class="algo-viz" data-algo="heap-insert">
<pre class="viz-fallback">
  a: [ 90 80 70 30 60 50 ]   (a max-heap)
  press Insert and type a key → append at the end → swim up:
     new key vs parent → swap while larger → stop when a
     parent dominates.
  the array view (top) and the tree view (bottom) update together.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>The **array** (top) and the tree (bottom) are the same data — no pointers. **Insert** appends, then **swims**: each compare is a parent–child check, each swap lifts the key one level.</small>

---

### Part 5 · delMax — sink down

<small>(~14 min)</small>

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

`delMax` on `[ 95 90 70 80 60 50 ]`: **50** (the last leaf) goes on top, then sinks:

```text
  delMax:             root↔last, pop:       sink 50 ×2:
      [95]                 [50]                  [90]
     /    \               /    \                /    \
   [90]  [70]     →     [90]  [70]     →     [80]  [70]
   /  \   /             /  \                 /  \
 [80][60][50]         [80][60]             [50][60]
```

**95** is returned. 50 loses to the **larger** child twice — first 90 (not 70), then 80 (not 60) — and settles as a leaf.

--

## sink — your turn

Part 4 left us `a = [ 95 80 90 30 60 50 70 ]` (after inserting 95). Now run **delMax**. What comes back, and what remains?

<small>swap 95 ↔ 70 (last), shrink → [ 70 80 90 30 60 50 ] → sink: 70 loses to the larger child 90, swap → 70 at index 3 beats its child 50, STOP. Returns 95; heap = [ 90 80 70 30 60 50 ] — exactly where Part 4 started: delMax undid the insert.</small>

--

## sink vs swim — the whole API

|                  | swim (insert) | sink (delMax)                |
| ---------------- | ------------- | ---------------------------- |
| starts at        | the last leaf | the **root**                 |
| moves            | **up**        | **down**                     |
| compares against | **1 parent**  | **2 children** (pick larger) |
| cost             | O(log n)      | O(log n)                     |

The Part 1 goal, achieved — and **everything from here on is these two primitives, re-wrapped.**

--

## 🎬 Demo — the live PQ

<div class="algo-viz" data-algo="heap-ops">
<pre class="viz-fallback">
  press Insert (type a key): append → swim up.
  press Delete Max: a[1] is the answer;
   1) swap a[1] with the last element → shrink
   2) sink the new root: swap with the LARGER child
      while smaller → it settles at its level.
  the array view (top) and the tree view (bottom) update together.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>The full PQ: **Insert** (swim) and **Delete Max** (sink) interleaved on one heap. Watch sink compare **both children** and follow the **larger** one — and watch the counters stay under the height either way.</small>

---

### Part 6 · Building a heap — and proving it works

<small>(~16 min)</small>

--

## Build from n given keys

Given `n` keys already in an array, make it a heap. Obvious way: **insert each one** — i.e. swim `a[i]` for `i = 1..n`:

```text
   for i = 1..n: swim(i)          // n inserts
```

- worst case: keys arrive **ascending** — every key swims **all the way to the root**
- cost: sum of the depths ≈ `n·log n` → **Θ(n log n)**

Can we do better with all the data **up front**?

--

## Heapify: sink bottom-up

Put all `n` keys in the array as-is (a complete tree, wrong values everywhere), then **sink every internal node, last to first**:

```text
   for k = n/2 down to 1:
       sink(k);
```

- `a[n/2+1 .. n]` are **leaves** (Part 3) — already heaps, skipped
- when `sink(k)` runs, everything **below k is already fixed**

--

## Heapify — a worked pass

```text
  i:      1  2  3  4  5  6  7  8  9
  a:    [ 30 60 50 90 85 40 70 45 20 ]     raw, n = 9

  sink 4: 90 ≥ 45, 20                  no swap
  sink 3: 50 < max(40, 70) → swap 70
        [ 30 60 70 90 85 40 50 45 20 ]
  sink 2: 60 < max(90, 85) → swap 90 ; 60 ≥ 45, 20
        [ 30 90 70 60 85 40 50 45 20 ]
  sink 1: 30↔90, 30↔85, 30 is a leaf
        [ 90 85 70 60 30 40 50 45 20 ]   ✓ a heap
```

Start at `k = n/2 = 4`; the root sinks **last**, when both its subtrees already work.

--

## 🎬 Demo — heapify

<div class="algo-viz" data-algo="heap-heapify">
<pre class="viz-fallback">
   Build: load an arbitrary array (a complete tree, not a heap)
   press Heapify: sink node n/2, n/2−1, …, 1  (bottom-up)
   each sink swaps down with the larger child
   → a valid max-heap.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Bottom-up **heapify**: sink each internal node from `n/2` down to `1`. Watch the swaps cluster **near the bottom** — and watch the swap counter stay **under n**.</small>

--

## What one sink guarantees

**Lemma.** If both subtrees under `k` are heaps, `sink(k)` makes the whole subtree at `k` a heap.

```text
    before sink(k):                after:
         [ x ]  ← only x may           a heap,
        /     \    be misplaced        rooted at k
    (heap)   (heap)
```

**Why:** the lifted **larger child** beats `x`, beats its sibling, and beats its own old subtree — top fixed; the same one-bad-node picture recurs a level down, until `x` dominates or is a leaf.

--

## Heapify is correct

**Invariant:** when the loop reaches `k`, every node **after** `k` roots a valid heap.

- **start** `k = n/2`: all nodes after are **leaves** — one-node heaps ✓
- **step:** children `2k, 2k+1` come after `k` → heaps → the **lemma** makes `k` a heap root too
- **end:** after `k = 1`, node 1 roots a heap — **the whole array** ∎

---

### Part 7 · Why heapify is Θ(n)

<small>(~14 min)</small>

--

## Swim pays depth; sink, height

| depth | nodes | swim = depth | sink = height |
| ----- | ----- | ------------ | ------------- |
| 0     | 1     | 0            | **h**         |
| 1     | 2     | 1            | h − 1         |
| …     | …     | …            | …             |
| h     | ~n/2  | **h**        | **0**         |

- n inserts pay the **swim** column: half the nodes pay ≈ h → **Θ(n log n)**
- heapify pays the **sink** column: half the nodes pay **0** → … let's count.

--

## Counting every swap

**Full** tree, `n = 2^(h+1) − 1`. A sink from height `j` costs ≤ `j` swaps — total, level by level:

```text
   depth d   nodes    sink ≤ h−d   contributes
   0         1        h            h·1
   1         2        h−1          (h−1)·2
   2         4        h−2          (h−2)·4
   ⋮         ⋮        ⋮            ⋮
   h−1       2^(h−1)  1            1·2^(h−1)
   h         2^h      0            0
```

$$S = h \cdot 1 + (h-1) \cdot 2 + (h-2) \cdot 4 + \dots + 1 \cdot 2^{h-1}$$

--

## The trick: double it and align

Doubling shifts every term **one column right** (each `2^d` becomes `2^(d+1)`):

```text
   S  =  h·1 + (h−1)·2 + (h−2)·4 + ⋯ + 1·2^(h−1)
   2S =        h·2     + (h−1)·4 + ⋯ + 2·2^(h−1) + 1·2^h
```

Equal powers of two now share a **column** — and in every column, the `2S` coefficient is exactly **one more** than the `S` coefficient below… so subtract!

--

## Subtract: the sum telescopes

Column-by-column, `2S − S` leaves **one copy of each power of two** — plus the unmatched ends:

```text
   2S − S  =  −h·1  +  1·2 + 1·4 + ⋯ + 1·2^(h−1) + 1·2^h

   S  =  ( 2 + 4 + ⋯ + 2^h )  −  h        [2S − S = S]
      =  ( 2^(h+1) − 2 )  −  h            [geometric sum]
```

$$S = 2^{h+1} - h - 2$$

--

## Fewer than n swaps

The **full** tree has `n = 2^(h+1) − 1` nodes, so `2^(h+1) = n + 1`:

$$S = n - h - 1 < n$$

**Building a heap costs fewer swaps than there are nodes** — and for *any* complete tree, `2^h ≤ n` gives `S ≤ 2n`. **heapify ∈ Θ(n).**

--

## Two ways to build

| method              | pays per node       | cost           |
| ------------------- | ------------------- | -------------- |
| repeated **insert** | its **depth** (swim)  | **Θ(n log n)** |
| **heapify**         | its **height** (sink) | **Θ(n)**       |

Same result. Heapify wins whenever the data is **all there up front**; a live PQ (keys arriving over time) still inserts one by one.

--

## Θ(n) build vs the sorting bound

Comparison sorting needs **Ω(n log n)** (L13). Did we just beat it? **No** — a heap is **not sorted**:

- heap order holds only **along paths** (Part 3) — far less information than sorted order
- extracting the sorted order still costs `n ×` Θ(log n) — that's **heapsort**, next

**Θ(n) buys partial order; full order still costs n log n.**

---

### Part 8 · Heapsort

<small>(~14 min)</small>

--

## Selection sort, done smart

Selection sort repeatedly finds the max of what's left — by **Θ(n) scan**. A heap **is** a find-max machine:

```text
   find the max of the rest:   scan Θ(n)  →  delMax Θ(log n)
   ─────────────────────────────────────────────────────────
   n rounds:                   Θ(n²)      →  Θ(n log n)
```

And `delMax` already **parks the max at the end** (swap `a[1] ↔ a[n]`) — the sorted pile grows in the same array, free. That's **heapsort**.

--

## Sort down, in place

```text
   heapify: for k = n/2 .. 1:  sink(k, n)     // Θ(n)
   for end = n down to 2:                     // n − 1 rounds
       swap(a[1], a[end]);     // park the max at a[end]
       sink(1, end − 1);       // re-heapify the rest
```

**Loop invariant:** `a[1..end]` is a heap of the `end` **smallest** keys; `a[end+1..n]` holds the rest, **sorted, in final position**.

The heap shrinks from the right; the sorted tail grows — **no extra array**.

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

Each round: park the max at the boundary, re-sink the new root.

--

## 🎬 Demo — heapsort

<div class="algo-viz" data-algo="heap-sort">
<pre class="viz-fallback">
   Build: load a raw array.
   press Heapify: bottom-up sinks → a max-heap.
   press Sort Down (enabled after Heapify): repeatedly swap
     a[1] to the end, shrink, sink → sorted tail grows right.
   or press Heapsort to run both phases back-to-back.
   final: the whole array is sorted ascending, in place.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>**Heapify**, then **Sort Down** (grayed out until Heapify runs — you can't sort down a non-heap); the sorted tail grows on the right, all in **one** array. **Heapsort** = both phases at once.</small>

--

## Which Θ(n log n) sort?

| sort          | worst          | space    | stable  | in practice           |
| ------------- | -------------- | -------- | ------- | --------------------- |
| mergesort     | Θ(n log n)     | **Θ(n)** | **yes** | needs a buffer        |
| quicksort     | **Θ(n²)**      | Θ(log n) | no      | fastest constants     |
| **heapsort**  | **Θ(n log n)** | **Θ(1)** | no      | the safety net        |

Heapsort is the only one **guaranteed** `n log n` **and** in place — which is why `std::sort` (**introsort**) falls back to it when quicksort recurses too deep.

---

### Part 9 · The PQ landscape

<small>(~16 min)</small>

--

## Indexed priority queues

Dijkstra and Prim need to **decrease a key already in the PQ** ("this vertex just got closer"). A plain heap can't *find* that key — Part 3: no search order!

An **indexed PQ** adds a map `item → array position`, updated on every swap:

```text
   decreaseKey(i, v)   change item i's priority, then swim/sink
   contains(i)         is item i in the PQ?
```

Same Θ(log n) operations, plus **update-in-place**.

--

## Beyond binary: d-ary heaps

Why stop at 2 children? Give each node **d** — same array trick:

- shallower: height `log n / log d` → **faster swim** (insert, decreaseKey)
- but each sink level compares **d** children → **slower delMax**

`d = 4` is a common sweet spot — the same "fat nodes, lower height" trade as B-trees (L05).

--

## When one heap isn't enough: meld

`meld(P, Q)` merges two PQs (two servers' job queues become one). Arrays meld badly: concatenate + heapify = **Θ(n)**.

A **leftist heap** — heap-ordered *pointer* tree, every **right spine** kept ≤ log n — melds by merging right spines: **Θ(log n)**. Then everything *is* meld:

```text
   insert(x)  =  meld(heap, single node x)
   delMax()   =  meld(root's left subtree, right subtree)
```

--

## The heap family

| PQ         | delMax  | decrKey    | meld      | idea           |
| ---------- | ------- | ---------- | --------- | -------------- |
| **binary** | log n   | log n †    | Θ(n)      | array          |
| d-ary      | log n   | log n †    | Θ(n)      | wider array    |
| leftist    | log n   | log n      | **log n** | short r-spine  |
| binomial   | log n   | log n      | **log n** | binary counter |
| Fibonacci  | log n ‡ | **Θ(1)** ‡ | **Θ(1)**  | lazy melds     |
| bucket     | Θ(C)    | Θ(1)       | —         | int keys 0..C  |

<small>† via the indexed-PQ map · ‡ amortized · In practice binary/d-ary win on constants and cache; the exotics buy *specific* operations.</small>

--

## Library priority queues

You will rarely hand-roll one:

- **C++**: `std::priority_queue` — **max**-heap
- **Java**: `java.util.PriorityQueue` — **min**-heap
- **Python**: `heapq` — **min**-heap (negate keys for max)

All are binary heaps: push/pop Θ(log n), build Θ(n), peek Θ(1).

--

## Common heap bugs

- **wrong direction** — min-heap where you meant max (or vice-versa)
- **sink not picking the larger child** — a bigger key stays below a smaller one
- **off-by-one** — 1-indexed math (`k/2`) on a 0-indexed array
- **n inserts** (Θ(n log n)) where **heapify** (Θ(n)) was intended

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

### Part 10 · Wrap & ICA 6

<small>(~10 min)</small>

--

## Recap — the structure

- **binary heap** = **complete** (shape) + **heap-ordered** (values), flat in an array: `parent = k/2`, children `2k, 2k+1`
- the invariants **imply**: every subtree is a heap · max on top, min at a leaf · leaves = back half · paths sorted, levels not
- height **⌊log₂ n⌋**, guaranteed — balance for free

--

## Recap — the algorithms

- **swim** / **sink** fix **one path** → Θ(log n) insert / delMax
- **heapify**: correct by **loop invariant**, **Θ(n)** — most nodes have tiny height
- **heapsort** = heapify + n·delMax → Θ(n log n), **in place**

> A heap keeps **partial order** — cheap to build (Θ(n)), cheap to maintain (log n), and just enough for "best next."

--

## ICA 6 — your turn

Implement the **min-heap** core in `ica06/ica06.cpp` from a skeleton:

- `insert` via **swim**
- `delMin` via **sink** (swap with the **smaller** child)
- `heapify` a given array **bottom-up**
- `heapsort` — sort **in place**, ascending

Build `-g`, run the self-tests, Valgrind-clean.

