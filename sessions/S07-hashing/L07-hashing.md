<!--
  CSS 343 · Lecture 7 (Session 7) — Hashing.
  reveal.js: "---" = next part (→), "--" = next slide (↓). Notes follow "Note:".
  Concrete C++ (structs, arrays, %) — no templates/inheritance. KaTeX: never two
  "_" on one line. Verify slides at 1280×620; code/ASCII lines ≤ ~60 chars (0.46em).

  Reading (pre): OUR Chapter 7 — handouts/ch07-hashing.html (primary; replaces
  the 3rd-party text). Optional second treatment: Sedgewick & Wayne §3.4 + ODS Ch 5.
  THROUGH-LINE: trees give Θ(log n) by COMPARING keys. Hashing aims for Θ(1) by
  COMPUTING an array index from the key. The price: collisions (provably
  unavoidable — birthday math) and the loss of ORDER. Two resolution families:
  chaining (colliders share a bucket list; E[chain] = α) and open addressing
  (colliders probe; ONE invariant — no hole inside a cluster — explains search,
  the deletion problem, and its fixes). Clustering snowballs (rich-get-richer),
  better probes fix it, and a bounded load factor + resizing keep everything
  amortized O(1). Trade-off lens at the end: hashing vs balanced BST = speed vs
  order.

  Session plan (150 min). 0:00 intro 0:04 P1 idea+collisions 16 0:20 P2 hash
  fns 18 0:38 P3 chaining 18 0:56 P4 linear probing 20 1:16 BREAK 10
  1:26 P5 clustering+probes 14 1:40 P6 load factor+resizing 16 1:56 P7
  analysis+use 14 2:10 P8 wrap+ICA 2:30 end.
-->

## CSS 343

### Data Structures, Algorithms & Discrete Mathematics II

**Lecture 7 — Hashing**

<small>Summer 2026 · T/Th 6:00–8:30 · UW1 020 · Dr. Marcel Gavriliu</small>

---

## Reading

**[Chapter 7 — Hashing](../../handouts/ch07-hashing.html)** — the course text

- **hash functions** — key → array index
- **collisions** — chaining vs open addressing
- **load factor** & **resizing** — keeping ops O(1)

<small>Another treatment (optional): Sedgewick & Wayne §3.4; ODS Ch 5.</small> Reading quiz due before class.

---

### Part 1 · Computing instead of comparing

<small>(~16 min)</small>

--

## A different bet

Every search so far **compares** keys — Θ(log n) at best (balanced trees, L04–L05).

Tonight: **compute** where the key lives.

```text
   trees:    is k < node? go left/right…   Θ(log n)
   hashing:  index = h(k); table[index]    Θ(1) ??
```

The price: **collisions**, and the loss of **order** (no min / max / range). Managing that price is the whole lecture.

--

## The dream: an array indexed by key

If keys were integers `0 … M−1`, we'd just use an **array**:

```text
   a[key] = value;        // insert
   return a[key];         // search — Θ(1)!
```

Direct addressing is perfect — but only if keys are **small integers**. Real keys are strings, big numbers, objects — a universe **astronomically larger** than any array.

--

## The hash function

A **hash function** maps any key to an array index in `[0, M)`:

```text
   h : keys  →  { 0, 1, …, M−1 }

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

An **array of size M** + a **hash function** = a hash table. Search `47`: compute `h(47) = 7`, look at slot 7. Done.

--

## Collisions are unavoidable

Two different keys can hash to the **same** slot: `h(25) = h(35) = 5`.

- **pigeonhole:** the key universe is bigger than M → some keys **must** share a slot
- **birthday paradox:** collisions arrive far earlier than intuition says — with M = 365 slots, **23 keys** suffice for a 50% collision

**So the entire game of hashing is handling collisions** — not avoiding them.

--

## Why √M keys already collide

Insert keys one by one; each new key must **miss** all previous ones:

```text
   P(no collision after n keys)
     = (1 − 1/M)(1 − 2/M) ⋯ (1 − (n−1)/M)
     ≈ exp( −(1 + 2 + ⋯ + (n−1)) / M )     [1−x ≈ e^−x]
     = exp( −n(n−1) / 2M )
```

This drops to ½ when `n ≈ 1.18 √M`. For `M = 365`: `n ≈ 23`. ✓

--

## Two ways to resolve collisions

```text
   separate chaining          open addressing
   (a list per slot)          (probe for another slot)

   [3]→33                     [ _ _ _ 33 _ 25 35 47 _ _ ]
   [5]→25→35                    35 collided at 5, probed to 6
   [7]→47
```

Part 3 does **chaining**; Part 4 does **open addressing**. Both are only as good as the hash function feeding them — Part 2 first.

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

## Modular hashing — and why M is prime

For integer keys, the workhorse:

```text
   h(k) = k mod M            M = 97:  h(12345) = 26
```

- **M prime** mixes **all** the bits of `k`
- `M = 2^p` uses only the **low p bits** — any pattern in the keys (even IDs, addresses) clumps
- powers of 10: same trap with low **digits**

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

## hashCode, then compress

In practice, two steps:

1. **hashCode** — the object produces an integer (Java `hashCode()`, C++ `std::hash<T>`)
2. **compress** — reduce that integer to `[0, M)` with `mod M`

```text
   index = (obj.hashCode() & 0x7fffffff) % M;   // mask the sign
```

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

## A bad hash function

Hashing a name by its **first letter** only:

```text
   h("Alice") = h("Aaron") = h("Amy") = 0
   → everyone named A- lands in slot 0
```

It ignores most of the key → keys **clump** → one giant bucket → **O(n)**. A hash that skips part of the key is a slow hash waiting to happen.

--

## The uniform hashing assumption

All of hashing's O(1) analysis rests on one idealization:

> **Uniform hashing:** each key is equally likely to hash to any of the M slots, independently.

A good hash makes this *approximately* true. A bad one clumps keys — and performance collapses to O(n).

---

### Part 3 · Separate chaining

<small>(~18 min)</small>

--

## A list per slot

Each array slot heads a **linked list** (a *chain*) of all keys that hash there:

```text
   M = 5,  h(k) = k mod 5,  keys 12, 17, 22, 5:

   [0] → 5                    5 mod 5 = 0
   [1]
   [2] → 12 → 17 → 22         all ≡ 2 (mod 5)
   [3]
   [4]
```

Colliders simply **join the same bucket's chain**. No key is ever turned away — the array never "fills up."

--

## Chaining — the operations

```text
   search(k):  i = h(k); walk the chain at table[i]
   insert(k):  i = h(k); scan for a duplicate, then
               link k into the chain — O(1) once there
   delete(k):  i = h(k); find k in the chain, UNLINK it
```

Each is: **one hash** + **a walk of one short chain**. The other `M−1` buckets are never touched.

--

## Chaining — a worked insert

`M = 5`, `h(k) = k mod 5`. Insert 12, 22, 5, 17:

```text
   12 → 12%5 = 2      [2] → 12
   22 → 22%5 = 2      [2] → 12 → 22        (collision: join)
    5 →  5%5 = 0      [0] → 5
   17 → 17%5 = 2      [2] → 12 → 22 → 17   (chain length 3)
```

Colliders just extend the chain — no probing, no displacement, nothing else moves.

--

## Load factor — and the expected chain

```text
   load factor   α = n / M      (keys per slot)
```

Under uniform hashing each key picks its bucket independently, so

```text
   E[chain length]  =  n · (1/M)  =  α
```

- a **miss** walks a whole chain: ≈ **α** compares
- a **hit** stops partway: ≈ **1 + α/2** compares

Keep **α = O(1)** → every operation is **O(1)** expected.

--

## Chaining — your turn

`M = 7`, `h(k) = k mod 7`, holding the **odd keys 1..21**:

```text
   [0] → 7 → 21    [1] → 1 → 15    [2] → 9
   [3] → 3 → 17    [4] → 11        [5] → 5 → 19
   [6] → 13
```

**Insert 50.** Which bucket, how many compares, and what does the chain look like?

<small>h(50) = 50 mod 7 = 1 → walk bucket 1: 1 ≠ 50, 15 ≠ 50 (2 compares) → link 50: [1] → 1 → 15 → 50. Chain length 3; every other bucket untouched.</small> <!-- .element: class="fragment" -->

--

## 🎬 Demo — separate chaining

<div class="algo-viz" data-algo="hash-chain">
<pre class="viz-fallback">
   M = 7, h(k) = k mod 7 — the odd keys 1..21 (build 1..21:2):
   [0]→7→21  [1]→1→15  [2]→9  [3]→3→17  [4]→11  [5]→5→19  [6]→13
   Insert / Search / Delete a key: hash to the home bucket,
   walk ONLY that chain; delete just unlinks a node.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>The chains **hang below** their buckets. **Search** walks one chain and never touches the other six. **Delete** unlinks one node — nothing else moves. Insert a few colliders (29, 36, 43 all hash to 1…) and watch one chain grow — that's α at work.</small>

--

## Chaining: the ledger

**Strengths**

- never fills up — α can pass 1, degrades **gracefully**
- **deletion is trivial** — unlink one node

**Weaknesses**

- a pointer + a heap allocation per node (**memory**)
- pointer-chasing → poor **cache** locality

---

### Part 4 · Open addressing: linear probing

<small>(~20 min)</small>

--

## No lists — probe for a slot

Keep **every key in the array itself**. On a collision, **probe** for another open slot by a fixed rule — the simplest is **linear probing**:

```text
   h(k), h(k)+1, h(k)+2, …   (all mod M)
```

Walk forward until an **empty slot**; the key lives where the walk ends.

--

## Linear probing — insert

```text
   M = 11,  h(k) = k mod 11.   insert 14, 25, 36:
   h(14)=3 → slot 3 (empty)              place 14
   h(25)=3 → 3 taken (14) → 4 (empty)    place 25
   h(36)=3 → 3, 4 taken → 5 (empty)      place 36

   [ _ _ _ 14 25 36 _ _ _ _ _ ]
     0 1 2  3  4  5
```

14, 25, 36 differ by exactly **11** — keys a multiple of `M` apart *always* share a home slot. They line up in a **cluster** at 3, 4, 5.

--

## The probing invariant

> From `h(k)` to where `k` actually sits, every slot is **occupied** — **no hole inside a cluster**.

- **insert** maintains it: `k` fills the *first* empty slot of its run
- so **search** may stop at the first empty slot — a hole *proves* absence
- and **deletion** had better not punch a hole… (two slides)

--

## Linear probing — search

```text
   search(k):
     i = h(k)
     while table[i] is occupied:
        if table[i] == k: return FOUND
        i = (i + 1) mod M           // next slot
     return NOT FOUND               // empty ⇒ not present
```

The invariant makes the miss rule sound: **an empty slot proves `k` is absent**.

--

## Worked: search hit vs miss

```text
   [ _ _ _ 14 25 36 _ _ _ _ _ ]   (the cluster)
     0 1 2  3  4  5

   search 36: h=3 → 14≠36 → 25≠36 → 36 ✓   (3 probes, HIT)
   search 47: h=3 → 14 → 25 → 36 → slot 6
              EMPTY → NOT FOUND              (4 probes, MISS)
```

A **hit** stops on the key; a **miss** pays the **whole cluster** plus the empty slot.

--

## Practice — where does it land?

`M = 7`, `h(k) = k mod 7`, linear probing. Table currently:

```text
   [ _ 8 15 _ _ _ 20 ]     insert 22?
     0 1  2 3 4 5  6
```

<small>h(22) = 22 mod 7 = 1 → slot 1 holds 8 → probe 2 (holds 15) → probe 3 (empty) → 22 goes in slot 3. Two collisions, then it lands.</small> <!-- .element: class="fragment" -->

--

## 🎬 Demo — linear probing

<div class="algo-viz" data-algo="hash-probe">
<pre class="viz-fallback">
   M = 11 (fixed), h(k) = k mod 11 — keys 2, 8, 14, 20
   (build 2..20:6 → slots 2, 8, 3, 9).
   Insert: compute the home slot (marked h), probe forward
   past occupied cells to the first empty one.
   Search: same walk; an empty slot means NOT FOUND.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>The `h` marker is the **home slot**; on a collision the probe walks forward to the first empty cell. Try **insert 25** (home 3 is taken — watch it displace), then **search 25**: it pays the same probes. This table is **fixed-size** — fill all 11 slots and it refuses the next key.</small>

--

## The deletion problem

Delete 14 by **emptying its slot** — and you punch a **hole in the cluster**:

```text
   [ _ _ _ 14 25 36 _ … ]      naive delete 14:
     0 1 2  3  4  5            [ _ _ _ _ 25 36 _ … ]

   search 25: h(25) = 3 → slot 3 EMPTY → "not found"  ✗
```

25 is **still in the table** — but the hole broke its probe path. The invariant, violated.

--

## Deletion — two fixes

1. **Tombstone:** mark the slot "deleted" — searches **walk through** it, inserts may **reuse** it. Simple; tombstones accumulate until the table is rebuilt (Part 6's resize).
2. **Re-insert the cluster** (Sedgewick): empty the slot, then take every key **after the hole** in the cluster and insert it again — the run is rebuilt hole-free.

```text
   delete 14:  [ _ _ _ _ 25 36 _ ]  → re-insert 25, 36
               [ _ _ _ 25 36 _ _ ]  ✓ invariant restored
```

--

## 🎬 Demo — delete without breaking the cluster

<div class="algo-viz" data-algo="hash-delete">
<pre class="viz-fallback">
   the cluster from the slides (build 14..36:11):
   14, 25, 36 → slots 3, 4, 5.
   Delete 14: the slot empties, then every key after the
   hole (25, 36) is RE-INSERTED so no probe path breaks.
   Then Search 25 — still found.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>**Delete 14** and watch the repair: the hole opens, then **25 and 36 re-insert** to close the run. Then **Search 25** — still reachable. Compare with the chaining demo's delete: one unlink vs a cluster rebuild.</small>

--

## Chaining vs probing — the ledger

|              | separate chaining     | linear probing            |
| ------------ | --------------------- | ------------------------- |
| colliders go | into the **chain**    | into **other slots**      |
| memory       | pointer per node      | **just the array**        |
| cache        | pointer-chasing, poor | adjacent probes, **great**|
| delete       | **unlink, trivial**   | tombstone / re-insert     |
| full table   | never (α can pass 1)  | hard stop at α = 1        |

Open addressing often **wins in practice** at low α — the cache is that important.

---

### Part 5 · Clustering & better probes

<small>(~14 min)</small>

--

## Primary clustering snowballs

A cluster doesn't just slow its own keys — it **grows faster the longer it is**:

```text
   cluster of length L  (slots s … s+L−1)

   a new key homed ANYWHERE in those L slots
   — or in the free slot at either end —
   extends the run  →  length L+1
```

Growth probability ≈ **(L+2)/M** — the rich get richer. Long runs also **merge** into longer ones.

--

## Quadratic probing

Probe at increasing **squared** offsets:

```text
   ( h(k) + i² ) mod M       i = 1, 2, 3, …
   → offsets 1, 4, 9, 16, …
```

Jumps spread the probes out → colliding keys **leave the neighborhood** instead of extending it. (Trade-off: can't always reach every slot — keep **α < ½** and M prime.)

--

## Double hashing

Use a **second hash function** for the step size:

```text
   ( h(k) + i · h2(k) ) mod M
   e.g.  h2(k) = 7 − (k mod 7)     (never 0!)
```

Colliding keys get **different strides** → even same-home keys part ways → effectively **no clustering**.

--

## Double hashing — worked

`M = 11` (prime), `h(x) = x mod 11`, `h2(x) = 7 − (x mod 7)`:

```text
   89 → 1                      [ _ 89 _ _ _ _ _ _ _ _ _ ]
   18 → 7                      [ _ 89 _ _ _ _ _ 18 _ _ _ ]
   40 → 7 taken; h2(40)=2      (7+2)%11 = 9  → slot 9
   29 → 7 taken; h2(29)=6      (7+6)%11 = 2  → slot 2
```

40 and 29 both collided with 18 at slot **7** — but stepped by **2** and **6** into different regions. No cluster forms.

--

## Which probe sequence?

| method        | step        | clustering            |
| ------------- | ----------- | --------------------- |
| **linear**    | `+1`        | primary (worst)       |
| **quadratic** | `+i²`       | secondary             |
| **double**    | `+i·h2(k)`  | ~none (best)          |

Yet real libraries mostly use **linear** probing: with a strong hash and **low α**, its cache behavior beats the others' better distribution.

---

### Part 6 · Load factor & resizing

<small>(~16 min)</small>

--

## What does a probe cost, ideally?

Idealize: every probe lands on an **occupied slot with probability α**, independently. Then a **miss** probes until the first empty slot:

```text
   E[probes] = 1 + α + α² + α³ + ⋯ = 1/(1−α)
```

A geometric series (S01!) — the cost curve is **1/(1−α)**:

```text
   α:        0.25   0.5    0.75   0.9
   probes:   1.3    2      4      10
```

--

## Linear probing — Knuth's numbers

Clustering makes linear probing worse than the ideal. Knuth (1962):

```text
   hit  ≈  ½ ( 1 + 1/(1−α)  )
   miss ≈  ½ ( 1 + 1/(1−α)² )     ← note the square

   α:      0.5        0.9
   hit:    1.5        5.5
   miss:   2.5       50.5  (!)
```

Misses pay the **square** — keep **α ≤ ½** for linear probing.

--

## Load-factor thresholds

Rule-of-thumb ceilings before resizing:

| scheme            | keep α ≤            |
| ----------------- | ------------------- |
| separate chaining | ~1 (even a bit more)|
| double hashing    | ~0.7                |
| linear probing    | **~0.5**            |

The more a scheme clusters, the **lower** the α it tolerates. Crossing the ceiling → **resize**.

--

## Resizing (rehashing)

When α crosses the threshold, **grow the table** and re-insert everything:

```text
   if (2 * n >= M) {              // α reached ½
       M = 2 * M;                 // double the array
       rehash EVERY key into the new table
   }
```

Each key gets a **new** `h(k) mod M` — you can't copy slots. A resize is Θ(n), but doubling makes it **amortized O(1)** per insert.

--

## 🎬 Demo — resize & rehash

<div class="algo-viz" data-algo="hash-resize">
<pre class="viz-fallback">
   M = 8, keys 6, 10, 14 (build 6..14:4; α = 0.375 —
   6 and 14 collide at slot 6). Insert one more key:
   α reaches ½ → the table DOUBLES to M = 16 and every key
   is rehashed to a new h(k) mod 16 — watch them re-scatter.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Insert any key: α crosses **½**, the table **doubles**, and every key **rehashes** — watch 6 and 14 split apart (they collided at M = 8, they don't at M = 16). One Θ(n) rebuild, then α is back at ¼.</small>

---

### Part 7 · Analysis & when to use

<small>(~14 min)</small>

--

## The cost of hashing

Under uniform hashing, with a bounded load factor:

| operation                | expected | worst case |
| ------------------------ | -------- | ---------- |
| search / insert / delete | **Θ(1)** | **Θ(n)**   |

The worst case (every key in one bucket/cluster) needs a **bad hash or an adversary** — it doesn't happen by chance with a good hash.

--

## Hashing vs balanced BST

|                                       | hash table   | balanced BST   |
| ------------------------------------- | ------------ | -------------- |
| search / insert / delete              | **Θ(1)** avg | Θ(log n)       |
| worst case                            | Θ(n)         | **Θ(log n)**   |
| **ordered ops** (min/max/floor/range) | **no**       | **yes**        |
| iterate in sorted order               | no           | yes            |

Hashing wins on raw speed. The BST wins on **order** — and on a **guaranteed** worst case.

--

## C++: `map` vs `unordered_map`

|           | `std::map`         | `std::unordered_map` |
| --------- | ------------------ | -------------------- |
| structure | **red-black tree** | **hash table**       |
| lookup    | Θ(log n)           | Θ(1) avg             |
| iteration | **sorted**         | arbitrary order      |
| needs     | `operator<`        | `std::hash` + `==`   |

Same interface, opposite engines. Python's `dict`, Java's `HashMap` = hash tables; `std::map`, Java's `TreeMap` = trees. **Pick by whether you need order.**

--

## Real-world hash functions

- language runtimes: **randomized seeds** — defeat hash-flooding attacks (adversarial keys that all collide)
- big data / dedup: **non-cryptographic** hashes (xxHash, MurmurHash) — fast, well-distributed
- integrity / security: **cryptographic** hashes (SHA-256) — slow, collision-*resistant*

Different jobs, different hashes — all the same `key → number` contract.

--

## Pitfalls

- a **bad hash** (clumps keys) → O(n), **silently**
- forgetting to **resize** → α grows → everything slows
- open-addressing **delete** that just empties a slot → **lost keys**
- equal objects with **unequal** hashCodes → lookups miss, a **bug** (unequal objects with equal hashCodes: fine, that's just a collision)

---

### Part 8 · Wrap & ICA 07

<small>(~20 min)</small>

--

## Recap — the mechanism

- a **hash table** = an **array** + a **hash function** `h(key) → [0, M)`
- a good hash is **uniform** — and collisions are still **guaranteed** (birthday: ~√M keys)
- resolve them: **chaining** (colliders share a bucket's chain) or **open addressing** (probe: linear / quadratic / double)
- open addressing lives by one **invariant**: no hole inside a cluster — it explains search, the delete problem, and both fixes

--

## Recap — the performance

- **α = n/M** governs everything: chains average **α**; probes cost **1/(1−α)**-ish
- keep α bounded by **resizing** (double + rehash) → **amortized O(1)**
- expected **Θ(1)**, worst Θ(n) — the price of betting on a good hash

> Hashing computes where a key lives instead of comparing to find it — Θ(1), at the cost of order.

--

## The symbol-table landscape

| structure     | search       | ordered? |
| ------------- | ------------ | -------- |
| unsorted list | Θ(n)         | no       |
| sorted array  | Θ(log n)     | yes      |
| balanced BST  | Θ(log n)     | **yes**  |
| **hash table**| **Θ(1)** avg | no       |

Every session this term has been one row of this table. Hashing is the fastest — when you can give up order.

--

## ICA 07 — your turn

Implement a **linear-probing hash table** in `ica07/ica07.cpp` from a skeleton:

- `hash(key) = key % M`
- `insert` / `search` with **linear probing**
- **resize** (double M, rehash every key) when `2*n ≥ M`

Build `-g`, run the self-tests, Valgrind-clean.

