<!--
  CSS 343 · Lecture 7 (Session 7) — Hashing.
  reveal.js: "---" = next part (→), "--" = next slide (↓). Notes follow "Note:".
  Concrete C++ (structs, arrays, %) — no templates/inheritance. KaTeX: never two
  "_" on one line. Verify slides at 1280×620; code/ASCII lines ≤ ~56 chars (0.46em).

  Reading (pre): Sedgewick & Wayne §3.4 (Hash Tables) + ODS Ch 5.
  THROUGH-LINE: trees give Θ(log n) by comparing keys. Hashing aims for Θ(1) by
  COMPUTING an array index from the key. The price: collisions (handle with
  chaining or open addressing) and the loss of ORDER (no min/max/range). A good
  hash function + a bounded load factor = expected O(1) search/insert/delete.

  Covered in Spring-26 (Kim, Hashing deck; Carrano 5.1-5.2, Chen 5.6): collisions,
  closed hashing (linear / quadratic / double probing), open hashing (separate
  chaining), designing hash functions. Sedgewick §3.4 adds load factor + resizing
  and the uniform-hashing analysis.

  Session plan (150 min). 0:00 intro 0:04 P1 idea 16 0:20 P2 hash fns 18 0:38 P3
  chaining 18 0:56 P4 linear probing 18 1:14 BREAK 10 1:24 P5 probing+resize 22
  1:46 P6 analysis+use 16 2:02 P7 wrap 12 2:14 ICA 2:30 end.
-->

## CSS 343

### Data Structures, Algorithms & Discrete Mathematics II

**Lecture 7 — Hashing**

<small>Summer 2026 · T/Th 6:00–8:30 · UW1 020 · Dr. Marcel Gavriliu</small>

---

## Reading

**Sedgewick & Wayne §3.4** — Hash Tables

- **hash functions** — key → array index
- **collisions** — chaining vs open addressing
- **load factor** & **resizing** — keeping ops O(1)

_Secondary:_ ODS Ch 5. Reading quiz due before class.

---

### Part 1 · The hashing idea

<small>(~16 min)</small>

--

## Where we are

Search structures so far:

- **BST / balanced trees** — **Θ(log n)**, and keys stay **ordered**
- the cost is a chain of **comparisons** down a path

Can we do better than log n? For pure **search / insert / delete** — yes: **Θ(1)** on average. That is **hashing**.

--

## Tonight's plan

1. **the idea** — a hash function turns a key into an array index
2. **hash functions** — what makes one good
3. **collisions** — the price, resolved two ways:
   - **separate chaining** (a list per slot)
   - **open addressing** (probe for a slot)
4. **load factor & resizing** — keeping it O(1)

--

## The dream: an array indexed by key

If keys were integers `0 … M−1`, we'd just use an **array**:

```text
   a[key] = value;        // insert
   return a[key];         // search — Θ(1)!
```

Direct addressing is perfect — but only if keys are **small integers** and there aren't too many of them. Real keys are strings, big numbers, objects…

--

## The hash function

A **hash function** maps any key to an array index in `[0, M)`:

```text
   h : keys  →  { 0, 1, …, M−1 }
```

```text
   index = h(key);
   table[index] ← key       // insert
```

Compute the index, jump straight there. No comparisons, no tree walk.

--

## A hash table

```text
   M = 10,  h(k) = k mod 10

   insert 25 → slot 5      table:
   insert 33 → slot 3      [ _ _ _ 33 _ 25 _ 47 _ _ ]
   insert 47 → slot 7        0 1 2 3  4 5  6 7  8 9
```

An **array of size M** + a **hash function** = a hash table. Search `47`: compute `h(47)=7`, look at slot 7. Done.

--

## The catch: collisions

Two different keys can hash to the **same** slot:

```text
   h(25) = 5   and   h(35) = 5      →  COLLISION
```

With M slots and more than M keys, collisions are **unavoidable** (pigeonhole). Even with few keys they're likely (birthday paradox).

**The entire game of hashing is handling collisions.**

--

## Collisions are unavoidable

- **pigeonhole:** more than M keys into M slots → some slot repeats
- **birthday paradox:** even with few keys, a collision is likely after only about **√M** insertions

```text
   M = 365 slots → ~50% chance of a collision
   by just 23 keys
```

So: don't fight collisions — **plan for them**.

--

## Two ways to resolve collisions

```text
   separate chaining          open addressing
   (a list per slot)          (probe for another slot)

   [3]→33                     [ _ _ _ 33 _ 25 35 47 _ _ ]
   [5]→25→35                    35 collided at 5, probed to 6
   [7]→47
```

Part 3 does **chaining**; Part 4 does **open addressing**. Both need a good hash function first — Part 2.

---

### Part 2 · Hash functions

<small>(~18 min)</small>

--

## What makes a hash function good

1. **deterministic** — same key → same index
2. **uniform** — spreads keys evenly over `[0, M)`
3. **fast** — O(1) to compute
4. **uses the whole key** — every bit matters

**Uniform** is the property that governs performance.

--

## Modular hashing

For integer keys, the workhorse:

```text
   h(k) = k mod M
```

Choose **M prime** — a prime modulus mixes all the bits of `k`. (A power of 2 would use only the low bits.)

```text
   M = 97;   h(12345) = 12345 mod 97 = 60
```

--

## Choosing the table size M

- make **M prime** — mixes all the bits of the key
- avoid **powers of 2** (use only the low bits) and powers of 10 (only low digits)
- size **M ≈ expected #keys** so the load factor starts near 1
- **resizing** keeps M right as n grows (Part 5)

--

## Hashing strings

Treat a string as a big number in base R (e.g. 31), via **Horner's method**:

```text
int hash(const string& s, int M) {
    long h = 0;
    for (char c : s)
        h = (R * h + c) % M;      // R = 31
    return (int)h;
}
```

Every character affects the result; one pass, O(len).

--

## hashCode, then compress

In practice, two steps:

1. **hashCode** — the object produces an integer (Java `hashCode()`, C++ `std::hash<T>`)
2. **compress** — reduce that integer to `[0, M)` with `mod M`

```text
   index = (obj.hashCode() & 0x7fffffff) % M;   // mask off the sign
```

--

## A bad hash function

Hashing a name by its **first letter** only:

```text
   h("Alice") = h("Aaron") = h("Amy") = 0
   → everyone named A- lands in slot 0
```

It ignores most of the key → keys **clump** → one giant bucket → **O(n)**. A hash that skips part of the key is a slow hash waiting to happen.

--

## Worked: hashing a string

`hash("CAT")` with `R = 31`, `M = 100`, ASCII C=67 A=65 T=84:

```text
   h = 0
   'C': h = (31·0  + 67)  % 100 = 67
   'A': h = (31·67 + 65)  % 100 = (2077+65)%100 = 42
   'T': h = (31·42 + 84)  % 100 = (1302+84)%100 = 86
   → slot 86
```

One left-to-right pass; the mod at each step prevents overflow.

--

## Hashing your own type (C++)

`unordered_map` needs a `std::hash` for your key type:

```text
struct PointHash {
    size_t operator()(const Point& p) const {
        return hash<int>()(p.x) * 31 + hash<int>()(p.y);
    }
};
unordered_map<Point, int, PointHash> m;
```

Combine each field's hash; **equal points must hash equally**.

--

## The uniform hashing assumption

All of hashing's O(1) analysis rests on one idealization:

> **Uniform hashing:** each key is equally likely to hash to any of the M slots, independently.

A good hash makes this *approximately* true. A bad one clumps keys — and performance collapses to O(n).

---

### Part 3 · Separate chaining

<small>(~18 min)</small>

--

## Separate chaining: a list per slot

Each array slot holds the **head of a linked list** of all keys that hash there:

```text
   M = 5,  keys 12,17,22,5,7   (h = k mod 5)

   [0] →
   [1] →
   [2] → 12 → 17 → 22        (all ≡ 2 mod 5)
   [3] →
   [4] → 5? no, 5 mod 5 = 0 …
```

Colliders simply join the same bucket's list.

--

## Chaining — the operations

```text
   search(k):  i = h(k); scan list at table[i] for k
   insert(k):  i = h(k); if not present, prepend k to table[i]
   delete(k):  i = h(k); unlink k from the list at table[i]
```

Each is: **one hash** + **a scan of one short list**.

--

## Chaining — a worked insert

`M = 5`, `h(k) = k mod 5`. Insert 12, 22, 5, 17:

```text
   12 → 12%5 = 2      [2] → 12
   22 → 22%5 = 2      [2] → 22 → 12       (prepend; collision)
    5 →  5%5 = 0      [0] → 5
   17 → 17%5 = 2      [2] → 17 → 22 → 12  (bucket 2 now length 3)
```

Colliders just prepend to the bucket — O(1) each; no probing, no resizing needed.

--

## Load factor

The key quality metric:

```text
   load factor   α = n / M      (keys / slots)
```

With uniform hashing, the **average list length is α**, so a search costs about **1 + α** — a hash plus a short scan.

Keep α **O(1)** (a small constant) → operations are **O(1)** on average.

--

## Chaining: strengths & weaknesses

**Strengths** — never "fills up" (α can exceed 1, degrades gracefully); **deletion is trivial** (unlink).

**Weaknesses** — a pointer per node (memory); pointer-chasing → poor **cache** locality.

--

## 🎬 Demo — separate chaining

<div class="algo-viz" data-algo="hash-chain" data-example="8,23,11,20,15,18,27">
<pre class="viz-fallback">
   M = 7,   h(k) = k mod 7

   [0] →
   [1] → 8 → 15         (8, 15 ≡ 1 mod 7)
   [2] → 23
   [3] →
   [4] → 11 → 18        (11, 18 ≡ 4 mod 7)
   [5] →
   [6] → 20 → 27        (20, 27 ≡ 6 mod 7)

   search 18: h(18)=4 → scan [4]: 11, 18 ✓  (2 probes)
</pre>
</div>

<small>Each slot heads a **short list**; a collision just joins the bucket. Search = hash to the slot, then scan its list. Keep the **load factor** small and the lists stay short.</small>

---

### Part 4 · Open addressing: linear probing

<small>(~18 min)</small>

--

## Open addressing: no lists

Keep **every key in the array itself** — no linked lists. On a collision, **probe** for another open slot by a fixed rule.

The simplest rule is **linear probing**: try the next slot, then the next, wrapping around.

```text
   h(k), h(k)+1, h(k)+2, …   (all mod M)
```

--

## Linear probing — insert

```text
   M = 11,  h(k) = k mod 11.   insert 25, 36, 14:
   h(25)=3 → slot 3 (empty)     place 25
   h(36)=3 → slot 3 (taken by 25) → 4 (empty)  place 36
   h(14)=3 → 3,4 taken → 5 (empty)  place 14

   [ _ _ _ 25 36 14 _ _ _ _ _ ]
     0 1 2  3  4  5
```

25, 36, 14 all hash to 3 → they line up in a **cluster**.

--

## Linear probing — search

```text
   search(k):
     i = h(k)
     while table[i] is occupied:
        if table[i] == k: return FOUND
        i = (i + 1) mod M           // next slot
     return NOT FOUND               // hit an empty slot
```

Probe forward from `h(k)`; an **empty slot means "not present"** (the key would have been placed there).

--

## Worked: search hit vs miss

```text
   [ _ _ _ 25 36 14 _ _ _ _ _ ]   (from the insert above)
     0 1 2  3  4  5

   search 14: h=3 → 25≠14 → 36≠14 → 14 ✓   (3 probes, HIT)
   search 47: h=3 → 25 → 36 → 14 → slot 6
              EMPTY → NOT FOUND              (miss stops at 6)
```

A **hit** stops on the key; a **miss** stops on the first empty slot.

--

## 🎬 Demo — linear probing

<div class="algo-viz" data-algo="hash-probe" data-example="23,14,9,6">
<pre class="viz-fallback">
   insert a key: compute the home slot h(k), then PROBE
   forward (+1, mod M) past occupied cells to the first
   empty one. the home slot 'h' is marked; the probe
   sequence lights up; the load factor triggers a resize.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>The home slot `h(k)` is marked; on a collision the search **probes forward** (orange) to the first empty cell. Watch **clusters** grow and a **resize** double the table when it fills. Full sandbox: the **Explore** page.</small>

--

## The deletion problem

You **can't** just empty a slot — that would break probe chains:

```text
   [ _ 25 36 14 _ ]     delete 25 → [ _ _ 36 14 _ ]
   now search 36: h(36)=1 → slot 1 EMPTY → "not found"!  ✗
```

Fixes: **tombstones** (mark "deleted, keep probing"), or Sedgewick's rule — **re-insert** every key after the hole in its cluster.

--

## Practice — where does it land?

`M = 7`, `h(k) = k mod 7`, linear probing. Table currently:

```text
   [ _ 8 15 _ _ _ 20 ]     insert 22?
     0 1  2 3 4 5  6
```

<small>`h(22) = 22 mod 7 = 1` → slot 1 holds 8 → probe 2 (holds 15) → probe 3 (**empty**) → **22 goes in slot 3**. Two collisions, then it lands.</small>

--

## Cache-friendly by design

Open addressing keeps everything in **one contiguous array** — no pointers, no separate allocations.

- probing walks **adjacent** slots → the CPU **cache** loves it
- often **faster in practice** than chaining at low load factor, despite clustering

---

### Part 5 · Better probing & resizing

<small>(~22 min)</small>

--

## Primary clustering

Linear probing suffers **primary clustering**: occupied runs merge into long clusters, and any key hashing anywhere in a cluster makes it grow.

```text
   [ 25 36 14 47 ]  ← one long cluster; the next
                      collision anywhere in it grows it
```

Longer clusters → longer probes → slower. Two fixes change the probe sequence.

--

## Quadratic probing

Probe at increasing **squared** offsets:

```text
   h(k) + 1², h(k) + 2², h(k) + 3², …   (mod M)
   general:  ( h(k) + i² ) mod M
```

Jumps spread the probes out → breaks up primary clusters. (Trade-off: can't always reach every slot; keep α < ½.)

--

## Double hashing

Use a **second hash function** for the step size:

```text
   ( h(k) + i · h2(k) ) mod M
   e.g.  h2(k) = R − (k mod R),  R a prime < M
```

Different keys get **different step sizes** → the best distribution, effectively no clustering.

--

## Double hashing — worked

`B=10`, `h(x)=x mod 10`, `h2(x)=7 − (x mod 7)`:

```text
   89 → 9                     [ _ _ _ _ _ _ _ _ _ 89]
   18 → 8                     [ _ _ _ _ _ _ _ _ 18 89]
   49 → 9 taken; +h2(49)=7    (9+7)%10 = 6  → slot 6
   58 → 8 taken; +h2(58)=5    (8+5)%10 = 3  → slot 3
```

49 and 58 both collided, but stepped by **7** and **5** — different directions, no cluster.

--

## Which probe sequence?

| method | step D(i) | clustering |
|---|---|---|
| **linear** | `i` | primary (worst) |
| **quadratic** | `i²` | secondary |
| **double** | `i · h2(k)` | ~none (best) |

Linear is simplest and most cache-friendly; double hashing scatters best. Most libraries use linear probing with a good hash + low α.

--

## Load factor for open addressing

Open addressing has **no lists** — the array itself fills up, so α ≤ 1 always, and cost explodes as α → 1:

```text
   average probes (linear) ≈  ½ (1 + 1/(1−α))
   α = 0.5 → ~1.5 probes     α = 0.9 → ~5.5 probes
```

Keep **α below ~½** (linear) — which means **resizing**.

--

## Load-factor thresholds

Rule-of-thumb targets before resizing:

| scheme | keep α ≤ |
|---|---|
| separate chaining | ~1 (even a bit more) |
| double hashing | ~0.7 |
| linear probing | **~0.5** |

The more a scheme suffers from clustering, the **lower** the α it tolerates.

--

## Resizing (rehashing)

When α crosses the threshold, **grow the table** and re-insert everything:

```text
   if (n / M > threshold) {
       M = 2 * M;                 // double the array
       rehash every key into the new table
   }
```

Each key gets a **new** `h(k) mod M`. A resize is Θ(n), but rare — **amortized O(1)** per insert.

--

## 🎬 Demo — resize & rehash

<div class="algo-viz" data-algo="hash-resize" data-example="9,17,6">
<pre class="viz-fallback">
   keep inserting past the load-factor threshold:
   the table DOUBLES (M → 2M) and every key is rehashed
   to a new h(k) mod M — the array grows and re-scatters.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Insert past **α = ½**: the table **doubles** and every key is **rehashed** into the larger array. Amortized the cost is **O(1)** per insert, even though a single resize is Θ(n).</small>

---

### Part 6 · Analysis & when to use

<small>(~16 min)</small>

--

## The cost of hashing

Under uniform hashing, with a bounded load factor:

| operation | average | worst case |
|---|---|---|
| search / insert / delete | **Θ(1)** | **Θ(n)** |

The worst case (every key in one slot/cluster) needs an **adversary or a bad hash** — with a good hash and bounded α, expected O(1).

--

## Hashing vs balanced BST

| | hash table | balanced BST |
|---|---|---|
| search/insert/delete | **Θ(1)** avg | Θ(log n) |
| worst case | Θ(n) | **Θ(log n)** |
| **ordered ops** (min/max/floor/range) | **NO** | **YES** |
| iterate in order | no | yes |

Hashing wins on raw speed; the BST wins when you need **order**.

--

## Where hashing is used

- **hash maps / sets** — `unordered_map`, `unordered_set`, Java `HashMap`, Python `dict`
- **database indexing**, **caches**, **deduplication**
- **symbol tables** in compilers
- **sets / membership** — "have I seen this before?"

Whenever you need fast *keyed lookup* and don't need order — reach for a hash table.

--

## C++: `map` vs `unordered_map`

| | `std::map` | `std::unordered_map` |
|---|---|---|
| structure | **red-black tree** | **hash table** |
| lookup | Θ(log n) | Θ(1) avg |
| iteration | **sorted** | arbitrary order |
| needs | `operator<` | `std::hash` + `==` |

Same interface, opposite engines. Pick by whether you need **order**.

--

## Real-world hash functions

- language runtimes: **randomized seeds** (defeat collision-flooding attacks)
- big data / dedup: **non-cryptographic** hashes (xxHash, MurmurHash) — fast, well-distributed
- integrity / security: **cryptographic** hashes (SHA-256) — slow, collision-resistant

Different jobs, different hashes — but all obey the same `key → index` contract for tables.

--

## Pitfalls

- a **bad hash** (clumps keys) → O(n), silently
- forgetting to **resize** → α grows → slowdown
- open-addressing **delete** without tombstones → lost keys
- unequal objects with **equal hashCodes** are fine; equal objects with **unequal** hashCodes are a **bug**

--

## When NOT to hash

Reach for a **balanced tree** (not a hash) when you need:

- **ordered iteration** — visit keys smallest → largest
- **range queries** — all keys in `[lo, hi]`
- **nearest-key** — floor / ceiling / predecessor
- a **hard worst-case** guarantee (hashing's is O(n))

Hashing is for **point lookups**, not order.

---

### Part 7 · Wrap & ICA 07

<small>(~12 min)</small>

--

## Recap — the mechanism

- a **hash table** = an **array** + a **hash function** `h(key) → [0,M)`
- a good hash is **uniform** — it scatters keys evenly
- **collisions** are inevitable; resolve by **chaining** (list per slot) or **open addressing** (probe: linear / quadratic / double)

--

## Recap — the performance

- keep the **load factor** bounded (**resize** by doubling) → **amortized O(1)**
- **expected Θ(1)** search/insert/delete; worst case Θ(n)
- the trade vs a tree: **speed for order** — no min/max/floor/range

> Hashing computes where a key lives instead of comparing to find it — Θ(1), at the cost of order.

--

## The symbol-table landscape

| structure | search | ordered? |
|---|---|---|
| unsorted list | Θ(n) | no |
| sorted array | Θ(log n) | yes |
| balanced BST | Θ(log n) | **yes** |
| **hash table** | **Θ(1)** avg | no |

Every session this term has been one row of this table. Hashing is the fastest — when you can give up order.

--

## ICA 07 — your turn

Implement a **linear-probing hash table** in `ica07/ica07.cpp` from a skeleton:

- `hash(key) = key % M`
- `insert` / `search` with **linear probing**
- **resize** (double M, rehash) when the load factor crosses ½

Build `-g`, run the self-tests, Valgrind-clean.

