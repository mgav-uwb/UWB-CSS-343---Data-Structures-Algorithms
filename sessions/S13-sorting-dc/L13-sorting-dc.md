<!--
  CSS 343 · Lecture 13 (Session 13) — Advanced Sorting & Divide-and-Conquer.
  reveal.js: "---" = next part (→), "--" = next slide (↓). Notes follow "Note:".
  Concrete C++ (arrays, recursion) — no templates/inheritance. KaTeX: never two
  "_" on one line. Verify at 1280×620; code/ASCII lines ≤ ~56 chars (0.46em).

  Reading (pre): Sedgewick & Wayne §2.2 (Mergesort) + §2.3 (Quicksort) +
  Erickson Ch 1 (Recursion / Divide-and-Conquer, incl. the master theorem).
  THROUGH-LINE: DIVIDE-AND-CONQUER — split a problem into subproblems, solve
  recursively, combine. The MASTER THEOREM reads the cost straight off the
  recurrence. Mergesort (divide trivially, combine via MERGE) and quicksort
  (divide via PARTITION, combine trivially) are the two Θ(n log n) sorts; the
  Ω(n log n) comparison lower bound says we can't beat them by comparing. The
  same partition gives QUICKSELECT — the k-th smallest in Θ(n) average.

  Sorting basics are CSS-342 review; NEW here: the D&C generalization + master
  theorem, quickselect, and the sorting lower bound. Demos reuse ArrayRenderer.

  Session plan (150 min). 0:00 intro 0:04 P1 D&C+master 22 0:26 P2 mergesort 24
  0:50 BREAK 10 1:00 P3 quicksort 30 1:30 P4 lowerbound+select 24 1:54 P5 wrap 12
  2:06 ICA 2:30 end.
-->

## CSS 343

### Data Structures, Algorithms & Discrete Mathematics II

**Lecture 13 — Sorting & Divide-and-Conquer**

<small>Summer 2026 · T/Th 6:00–8:30 · UW1 020 · Dr. Marcel Gavriliu</small>

---

## Reading

**Sedgewick §2.2 (Mergesort) + §2.3 (Quicksort)** + **Erickson Ch 1 (D&C)**

- **divide-and-conquer** — split, recurse, combine
- the **master theorem** — cost from the recurrence
- **mergesort** (merge) and **quicksort** (partition)
- the **Ω(n log n)** lower bound; **quickselect**

Reading quiz due before class.

---

### Part 1 · Divide-and-conquer & the master method

<small>(~22 min)</small>

--

## The divide-and-conquer paradigm

Three steps, applied recursively:

```text
   DIVIDE   the problem into smaller subproblems
   CONQUER  each subproblem (recurse)
   COMBINE  the sub-answers into the full answer
```

Base case: a subproblem small enough to solve directly.

--

## Recursion & the base case

Every D&C algorithm needs a **base case** — small enough to solve without recursing:

```text
   sorting:       size 0 or 1 is already sorted
   binary search: empty range → "not found"
```

Forget it → **infinite recursion**. The base cases feed the first inputs into "combine."

--

## Recurrences

A D&C algorithm's cost obeys a **recurrence**:

```text
   T(n) = a · T(n/b) + f(n)
   a = # subproblems   b = shrink factor   f(n) = divide+combine cost
```

Mergesort: `T(n) = 2 T(n/2) + Θ(n)`.

--

## The master theorem

For `T(n) = a·T(n/b) + f(n)`, compare `f(n)` to `n^(log_b a)`:

```text
   case 1: f smaller  → T(n) = Θ(n^(log_b a))
   case 2: f equal    → T(n) = Θ(n^(log_b a) · log n)
   case 3: f larger   → T(n) = Θ(f(n))
```

The winner (leaves vs root work) sets the cost.

--

## Where the three cases come from

Sum the recursion tree **level by level**:

```text
   level 0:  f(n)                     (the root)
   level 1:  a · f(n/b)
   level i:  aⁱ · f(n/bⁱ)
   bottom:   n^(log_b a) · Θ(1)       (the leaves)

   T(n) = Σ levels — a geometric series:
   terms shrink → the ROOT dominates      (case 3)
   terms flat   → every level ties → ×log n (case 2)
   terms grow   → the LEAVES dominate     (case 1)
```

--

## Master theorem — worked

```text
   mergesort:  T(n) = 2T(n/2) + Θ(n)
   a=2, b=2 → n^(log₂2) = n¹ = n  =  f(n)=n   → CASE 2
   → T(n) = Θ(n log n)
```

```text
   binary search: T(n) = T(n/2) + Θ(1)
   a=1, b=2 → n^0 = 1 = f(n)      → CASE 2 → Θ(log n)
```

--

## Master theorem — cases 1 & 3

```text
   CASE 1 (leaves dominate):  T(n) = 8T(n/2) + Θ(n²)
     n^(log₂8) = n³  >  n²   →  Θ(n³)

   CASE 3 (root dominates):   T(n) = 2T(n/2) + Θ(n²)
     n^(log₂2) = n   <  n²   →  Θ(n²)
```

Compare **leaf work** `n^(log_b a)` vs **combine work** `f(n)` — the bigger wins.

--

## Practice — read the recurrence

```text
   T(n) = 4T(n/2) + Θ(n)    →  ?
   T(n) = 3T(n/2) + Θ(n)    →  ?
```

<small>First: `n^(log₂4)=n²` vs `n` → leaves win → **Θ(n²)** (case 1). Second: `n^(log₂3)≈n^1.58` vs `n` → leaves win → **Θ(n^1.58)** (case 1, Karatsuba's cost).</small>

--

## D&C beyond sorting

```text
   binary search      T(n)=T(n/2)+O(1)   → O(log n)
   Karatsuba multiply T(n)=3T(n/2)+O(n)  → O(n^1.585)
   closest pair       T(n)=2T(n/2)+O(n)  → O(n log n)
   Strassen matrices  T(n)=7T(n/2)+O(n²) → O(n^2.807)
```

The paradigm is everywhere — not just sorting.

--

## Why D&C often wins

Splitting a problem turns a **product** into a **sum**:

```text
   n² work at one level  →  two halves: 2·(n/2)² = n²/2  (half!)
   recurse → the savings compound → n log n
```

Balanced splits + cheap combine = the n log n sweet spot.

--

## Balance is everything

The savings depend on **balanced** splits:

```text
   even split (n/2, n/2):   log n levels  →  Θ(n log n)  ✓
   skewed split (1, n−1):   n levels      →  Θ(n²)       ✗
```

Mergesort forces even splits (guaranteed n log n); quicksort's split depends on the pivot.

---

### Part 2 · Mergesort

<small>(~24 min)</small>

--

## Mergesort: the idea

```text
   sort(a):
       if size ≤ 1: return          // base case
       split a into left, right     // DIVIDE (trivial)
       sort(left); sort(right)      // CONQUER
       merge(left, right)           // COMBINE (the work)
```

Easy divide (split in half); the work is in the **merge**.

--

## The merge operation

Merge two **sorted** runs by repeatedly taking the smaller front element:

```text
   left:  2 5 8      right: 1 3 9
   compare fronts, take smaller → 1
   → 1 2 3 5 8 9      (linear scan, Θ(n))
```

Merging is the heart of mergesort — Θ(n) per level.

--

## Merge — a worked trace

```text
   L: 2 5 8    R: 1 3 9    out: [ ]
   1 < 2 → out 1        L:2 5 8   R:3 9
   2 < 3 → out 2        L:5 8     R:3 9
   5 > 3 → out 3        L:5 8     R:9
   5 < 9 → out 5;  8 < 9 → out 8;  R tail 9 → out 9
   → 1 2 3 5 8 9
```

Each element is copied **exactly once** → Θ(n).

--

## Merge needs a buffer

You can't merge two runs **in place** cheaply — merge needs **Θ(n) scratch**:

```text
   copy a[lo..hi] into aux[]        // Θ(n) extra space
   merge aux back into a[]
```

That auxiliary array is mergesort's one real drawback — and exactly what quicksort avoids.

--

## Mergesort — the recursion tree

```text
              [8 elements]              1 merge of size 8
           /              \
     [4 elems]          [4 elems]       2 merges of size 4
      /    \             /    \
   [2]    [2]         [2]    [2]         4 merges of size 2
   / \    / \         / \    / \
  ...                                   log n levels
```

Each level merges **n** elements total → **log n levels × n = Θ(n log n)**.

--

## 🎬 Demo — the merge

<div class="algo-viz" data-algo="mergesort-merge">
<pre class="viz-fallback">
   bottom-up mergesort: merge adjacent runs of size 1, then
   2, then 4, … each merge copies both runs into the Θ(n)
   AUX buffer (second row), compares fronts, writes the
   smaller back. watch the sorted runs grow ×2 a pass.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>**Build** loads the array, **Mergesort** runs the merges — runs **double** each pass, `log n` passes × `Θ(n)` = **Θ(n log n)**. The build string is editable (`1..12:1:RAND`).</small>

--

## Mergesort — the code

```text
void sort(int a[], int lo, int hi, int aux[]) {
    if (hi <= lo) return;
    int mid = (lo + hi) / 2;
    sort(a, lo,   mid, aux);        // sort left
    sort(a, mid+1, hi, aux);        // sort right
    merge(a, lo, mid, hi, aux);     // combine
}
```

Textbook divide-and-conquer: two recursive calls, then merge.

--

## Top-down vs bottom-up

- **top-down** — recurse: split, sort halves, merge (natural D&C)
- **bottom-up** — iterate: merge runs of size 1, then 2, 4, … (no recursion)

Same Θ(n log n); bottom-up avoids the call stack.

--

## Mergesort — cost & properties

```text
   time:   Θ(n log n)   ALWAYS (best = worst)
   space:  Θ(n)         auxiliary (the merge buffer)
   stable: YES          equal keys keep their order
```

Guaranteed n log n, stable — but not in place.

--

## When to use mergesort

- you need a **guaranteed** n log n (no bad inputs)
- you need **stability**
- sorting **linked lists** (merge needs no random access) or **external** data (huge files)

--

## Stability — why it matters

A **stable** sort keeps equal keys in their original order:

```text
   sort records by DATE, then re-sort by NAME (stable):
   → sorted by name, and within a name, still by date  ✓
```

Multi-key sorting relies on stability. **Mergesort is stable; quicksort is not.**

---

### Part 3 · Quicksort

<small>(~30 min)</small>

--

## Quicksort: the idea

```text
   sort(a):
       if size ≤ 1: return
       p = partition(a)             // DIVIDE (the work)
       sort(left of p); sort(right of p)   // CONQUER
       // COMBINE: nothing! already in place
```

Work is in the **partition**; the combine is **free**.

--

## Partition

Pick a **pivot**; rearrange so smaller elements go left, larger go right, pivot in the middle:

```text
   [ 3 7 1 8 2 5 ]  pivot = 5
   → [ 3 1 2 ] 5 [ 7 8 ]
        <5        >5
```

The pivot lands in its **final** sorted position. Linear scan, Θ(n).

--

## Partition — a worked trace

Lomuto scheme, **pivot = last element**:

```text
   [ 3 7 1 8 2 | 5 ]   pivot 5, boundary i = −1
   3<5 → i=0, swap a[0],a[0]  → 3 7 1 8 2
   7<5? no
   1<5 → i=1, swap a[1],a[2]  → 3 1 7 8 2
   8<5? no
   2<5 → i=2, swap a[2],a[4]  → 3 1 2 8 7
   place pivot: swap a[3],a[5] → 3 1 2 [5] 7 8
```

Pivot 5 lands at index 3 — its final sorted spot; left all < 5, right all > 5.

--

## Your turn — partition

Lomuto, **pivot = last**:

```text
   [ 5 9 3 8 6 | 7 ]    where does 7 land?
   what are the two sides?
```

<small>5&lt;7 (i=0) · 9 no · 3&lt;7 → swap → `5 3 9 8 6` · 8 no · 6&lt;7 → swap → `5 3 6 8 9` · place pivot: swap a[3],a[5] → **`5 3 6 [7] 9 8`** — pivot at rank 3, left `5 3 6`, right `9 8`.</small>

--

## Two partition schemes

- **Lomuto** — one scanning index; simple; a bit more swapping (shown above)
- **Hoare** — two pointers moving inward, swapping out-of-place pairs; fewer swaps, faster

Both are Θ(n) and place the pivot; Hoare is the classic, Lomuto the teachable one.

--

## The worst case, pictured

A bad pivot peels off **one** element per level → **n levels**:

```text
   sorted input + a fixed-position pivot (first or last):
   [1 2 3 4|5] → [1 2 3|4] → [1 2|3] → …
   n levels, each peeling ONE element → Θ(n²)
```

Balanced pivots give log n levels; bad pivots give n. **Pivot choice is everything.**

--

## 🎬 Demo — partition

<div class="algo-viz" data-algo="quicksort-partition">
<pre class="viz-fallback">
   quicksort: pick a pivot, PARTITION (smaller left, larger
   right, pivot to its final slot), then recurse on each
   side. watch the pivot lock into place, in-place, no buffer.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>**Quicksort**: each pivot **locks into its final slot**, in place. Compare its counters with **Mergesort** on the same input — then Build `1..12` (sorted!) and watch quicksort's compares **blow up**.</small>

--

## Quicksort — the code

```text
void sort(int a[], int lo, int hi) {
    if (hi <= lo) return;
    int p = partition(a, lo, hi);   // pivot to final spot
    sort(a, lo, p - 1);             // left  (< pivot)
    sort(a, p + 1, hi);             // right (> pivot)
}
```

Note the mirror of mergesort: the **work is before** the recursion (partition), and there's **no combine** — `a[lo..hi]` is sorted once both sides are.

--

## Quicksort — cost

```text
   balanced pivots:  T(n) = 2T(n/2) + Θ(n) = Θ(n log n)   (average)
   worst pivot:      T(n) = T(n-1) + Θ(n) = Θ(n²)         (sorted input!)
```

Average Θ(n log n); **worst Θ(n²)** on already-sorted input with a bad pivot.

--

## Choosing a good pivot

- **first/last element** → Θ(n²) on sorted input (bad!)
- **random** pivot → Θ(n log n) expected, no bad input
- **median-of-three** (first, middle, last) → good in practice

Randomization makes the worst case a matter of luck, not input.

--

## Randomized quicksort

**Shuffle** the array first (or pick each pivot at random):

```text
   now NO fixed input is the worst case —
   the Θ(n²) event depends only on coin flips, not the data
   → expected Θ(n log n) on EVERY input
```

An adversary who knows your code still can't force the bad case.

--

## 3-way partitioning (duplicates)

With many equal keys, split into **three** regions:

```text
   [ < pivot ] [ = pivot ] [ > pivot ]
```

Equal keys are done — never recursed on. Θ(n) on all-equal input (else Θ(n²)!).

--

## Quicksort — the whole sort

```text
   [3 7 1 8 2 5]           pivot 5 → [3 1 2] 5 [7 8]
   [3 1 2]  pivot 2 → [1] 2 [3]      [7 8] pivot 8 → [7] 8
   [1] [3] [7]  singletons — done
   → 1 2 3 5 7 8
```

Each pivot (5, 2, 8, …) locks in; the sides sort recursively, in place.

--

## Mergesort vs quicksort

| | mergesort | quicksort |
|---|---|---|
| divide | trivial (split) | **partition** (work) |
| combine | **merge** (work) | trivial (in place) |
| time | Θ(n log n) always | Θ(n log n) avg, Θ(n²) worst |
| space | Θ(n) | **Θ(log n)** (stack) |
| stable | **yes** | no |

--

## Why quicksort wins in practice

Same Θ(n log n), but a **smaller constant**:

- **in place** — no Θ(n) buffer to touch
- **cache-friendly** — partition scans contiguously
- fewer data moves than merge

So `std::sort` is quicksort-based despite the worse worst case.

---

### Part 4 · Lower bound & selection

<small>(~24 min)</small>

--

## Can we beat n log n?

By **comparing** keys — **no**. Any comparison sort needs **Ω(n log n)** comparisons.

```text
   n! possible orderings must be distinguished
   each comparison → 2 outcomes → a binary decision tree
   tree of height h distinguishes ≤ 2^h leaves
   2^h ≥ n!  →  h ≥ log₂(n!) = Θ(n log n)
```

--

## The decision tree, pictured

```text
                a<b?
              /      \
           b<c?      a<c?
           /  \      /  \
        abc  a<c?  bac  b<c?      each LEAF = one
             ...        ...        of the n! orderings
```

`n!` leaves need height `≥ log₂(n!) ≈ n log₂ n`. Any comparison sort **is** such a tree.

--

## Beating the bound: non-comparison sorts

If you **don't compare** — exploit key structure — you can go linear:

```text
   counting sort  — small integer keys, Θ(n + k)
   radix sort     — fixed-width keys, Θ(d·n)
```

These sidestep the Ω(n log n) bound because they never compare two keys.

--

## Selection: the k-th smallest

Don't sort everything — just find **one** order statistic (e.g. the median):

```text
   full sort → Θ(n log n), then index    (wasteful)
   can we find the k-th smallest FASTER?
```

Yes — **quickselect**, using quicksort's partition.

--

## Order statistics

The **k-th smallest** is the "k-th order statistic":

```text
   k = 0        → minimum
   k = n−1      → maximum
   k = n/2      → median
   k = 0.95·n   → 95th percentile
```

All computable in **Θ(n)** average by quickselect — no full sort needed.

--

## Quickselect

Partition; the pivot lands at some rank `p`. Recurse only into the **side containing k**:

```text
   if p == k: return pivot
   if k < p:  recurse LEFT
   else:      recurse RIGHT   (one side only!)
```

Average **Θ(n)** — n + n/2 + n/4 + … = 2n.

--

## Guaranteeing O(n): median-of-medians

To kill quickselect's Θ(n²) worst case, pick a **provably good** pivot:

```text
   group into 5s → median of each group →
   median OF those medians → use as pivot
   guarantees a ≥ 30/70 split → O(n) worst case
```

Beautiful in theory; the constant is large, so **randomized** quickselect wins in practice.

--

## Quickselect — a worked run

Find rank **k = 3** (0-indexed, the 4th smallest):

```text
   [ 3 7 1 8 2 5 ]   partition (pivot 5)
   → [ 3 1 2 ] 5 [ 8 7 ]   pivot 5 lands at rank 3
   rank 3 == k → answer = 5   (one partition, done!)
```

If k had been 1, we'd recurse into the **left** only; if 5, the **right** only.

--

## 🎬 Demo — quickselect

<div class="algo-viz" data-algo="quickselect">
<pre class="viz-fallback">
   find the k-th smallest: partition, see where the pivot
   lands, then recurse into ONLY the side containing rank k.
   the search zone shrinks each step until the pivot IS k.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>**Select rank** k: partition, then recurse into **only** the side holding rank k. Compare the counters with a full **Quicksort** — selection does a fraction of the work (Θ(n) vs Θ(n log n)).</small>

--

## Practice — find the median

```text
   [ 7 2 9 4 1 6 3 ]   (7 elements) — find the MEDIAN
```

<small>The median has rank 3 (0-indexed) — 3 elements below, 3 above. `quickselect(3)` on this array returns **4** (sorted: 1 2 3 **4** 6 7 9), in ~n comparisons on average, not n log n.</small>

--

## Selection in practice

- **median-of-medians** — a guaranteed **O(n)** worst case (theoretical)
- `std::nth_element` — quickselect, average O(n)
- used for **medians**, **percentiles**, **top-k** queries

---

### Part 5 · Wrap & ICA 13

<small>(~12 min)</small>

--

## Recap — divide-and-conquer

- **D&C:** divide, conquer (recurse), combine
- the **master theorem** reads the cost off `T(n)=a·T(n/b)+f(n)`
- **mergesort** = easy divide + merge; **quicksort** = partition + free combine

--

## Recap — sorting & selection

| | time | space | stable |
|---|---|---|---|
| **mergesort** | Θ(n log n) | Θ(n) | yes |
| **quicksort** | Θ(n log n) avg | Θ(log n) | no |
| **quickselect** | Θ(n) avg | Θ(1) | — |

> Comparison sorts need Ω(n log n); mergesort and quicksort meet it, and quickselect *selects* in linear time.

--

## Sorting in the real world

Library sorts are **hybrids** tuned for practice:

- **introsort** (`std::sort`) — quicksort, switch to heapsort if it goes quadratic, insertion sort for tiny arrays
- **Timsort** (Python, Java objects) — mergesort + run detection; **stable**, fast on partly-sorted data

--

## The divide-and-conquer family

| algorithm | recurrence | cost |
|---|---|---|
| binary search | T(n)=T(n/2)+O(1) | O(log n) |
| **mergesort** | 2T(n/2)+O(n) | Θ(n log n) |
| **quicksort** | 2T(n/2)+O(n) avg | Θ(n log n) |
| **quickselect** | T(n/2)+O(n) | Θ(n) |

One paradigm, read by one theorem.

--

## Which sort should I use?

- **small n** → insertion sort (tiny overhead)
- **general purpose** → quicksort / introsort (in place, fast)
- **need stable OR guaranteed n log n** → mergesort
- **small-integer / fixed-width keys** → counting / radix (linear)
- **only the k-th / median** → quickselect

--

## ICA 13 — your turn

In `ica13/ica13.cpp`:

- **merge** + top-down **mergesort** · **partition** (Lomuto) + **quicksort** · **quickselect**
- tests check against `std::sort` on random / duplicate / **already-sorted** inputs, plus known order statistics

Build `-g`, run the self-tests, Valgrind-clean.

