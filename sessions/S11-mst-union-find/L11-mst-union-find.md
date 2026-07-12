<!--
  CSS 343 · Lecture 11 (Session 11) — Graphs III: Union-Find & Minimum Spanning Trees.
  reveal.js: "---" = next part (→), "--" = next slide (↓). Notes follow "Note:".
  Concrete C++ (structs, arrays) — no templates/inheritance. KaTeX: never two "_"
  on one line. Verify at 1280×620; code/ASCII lines ≤ ~56 chars (0.46em).

  Reading (pre): Sedgewick & Wayne §1.5 (Union-Find) + §4.3 (Minimum Spanning
  Trees) + ODS §1.4 / booksite (union-find).
  THROUGH-LINE: UNION-FIND answers "are u and v connected?" under a stream of
  unions — quick-find → quick-union → weighting (with the doubling proof) →
  path compression drives the cost to near-constant. An MST is the cheapest
  set of edges connecting a weighted graph; the CUT PROPERTY (exchange proof)
  makes greedy safe. KRUSKAL (sort + union-find, safety proved via the
  component cut) and PRIM (grow one tree, the L06 heap) both run O(E log V).
  MST ≠ shortest-path tree: the a-b-c triangle separates them.

  Demo graph = the L09 graph made UNDIRECTED (same 8 vertices, triples
  "0 1 4, 0 2 2, 2 1 1, 1 3 5, 2 3 8, 2 4 10, 3 4 2, 3 5 6, 4 5 3, 5 6 1,
  4 7 7"); MST weight 21 with edges 2-1,5-6,0-2,3-4,4-5,1-3,4-7 — mirrored in
  the Kruskal/Prim worked traces and ICA 11's test T6. The MST-vs-SPT beat:
  build "0 1 2, 1 2 2, 0 2 3" and run Prim from 0 (keeps 1-2) vs Dijkstra
  from 0 (keeps 0-2).

  Covered in Spring-26 (Kim, Graph deck): MST mentioned under DFS applications;
  articulation points (a DFS application) — included here as a Part-5 aside
  with a worked disc/low example. Union-find and weighted-MST (Kruskal/Prim)
  are largely NEW / Sedgewick-based.

  Session plan (150 min). 0:00 intro 0:04 P1 union-find 26 0:30 P2 MST+cut 20
  0:50 BREAK 10 1:00 P3 Kruskal 24 1:24 P4 Prim 24 1:48 P5 wrap+aside 16
  2:04 ICA 2:30 end.
-->

## CSS 343

### Data Structures, Algorithms & Discrete Mathematics II

**Lecture 11 — Union-Find & Minimum Spanning Trees**

<small>Summer 2026 · T/Th 6:00–8:30 · UW1 020 · Dr. Marcel Gavriliu</small>

---

## Reading

**Sedgewick & Wayne §1.5 (Union-Find) + §4.3 (MST)**

- **union-find** — quick-find → quick-union → weighting → path compression
- **minimum spanning tree** — the cut property
- **Kruskal** — sort edges + union-find
- **Prim** — grow one tree with a priority queue

_Secondary:_ ODS §1.4 / booksite. Reading quiz due before class.

---

### Part 1 · Union-Find (dynamic connectivity)

<small>(~26 min)</small>

--

## The dynamic connectivity problem

Given `N` objects and a stream of **connections**, answer **"are p and q connected?"** at any point.

```text
   union(4, 3)   union(3, 8)   union(6, 5)  …
   connected(0, 7)?   connected(8, 4)?
```

Connections are transitive: connected things form **groups** (components).

--

## The union-find API

```text
struct UF {
    // are p and q in the same component?
    bool connected(int p, int q);
    // merge the components of p and q
    void  union(int p, int q);
    int   find(int p);        // component id of p
};
```

`connected(p,q)` is just `find(p) == find(q)`. Everything hinges on **find**.

--

## Union-find in code

The whole (final) structure is two arrays:

```text
struct UF {
    vector<int> parent, size;
    UF(int n) : parent(n), size(n, 1) {
        for (int i = 0; i < n; i++) parent[i] = i;   // each its own root
    }
    int  find(int x);              // walk up + compress
    void unite(int a, int b);      // link smaller under larger
    bool connected(int a, int b) { return find(a) == find(b); }
};
```

--

## Quick-find (eager)

`id[i]` = the component label of `i`. Connected ⟺ **same label**.

```text
   connected(p,q):  id[p] == id[q]          // O(1) — fast!
   union(p,q):      relabel EVERY entry
                    equal to id[p] → id[q]   // O(N) — slow
```

find is O(1), but **union scans the whole array** — O(N).

--

## Quick-find — worked

```text
   id:  0 1 2 3 4 5        (each its own label at first)

   union(1,4): scan all, relabel 1 → 4
               id = 0 4 2 3 4 5
   union(2,3): scan all, relabel 2 → 3
               id = 0 4 3 3 4 5
   connected(1,4)?  id[1]==id[4] → 4==4 → YES   (O(1))
```

Every union rescans the array — N unions ⇒ **O(N²)**. Unusable at scale.

--

## Quick-union (lazy)

`parent[i]` = i's parent → each component is a **tree**; the **root** is its id.

```text
   find(p):    follow parent[] to the root
   union(p,q): make root(p)'s parent = root(q)   // O(1) link!
```

union is cheap (one link) — but **find can be O(N)** (a tall tree).

--

## Quick-union — worked

```text
   parent: 0 1 2 3 4 5 6 7 8 9   (all roots)
   union(4,3): parent[4]=3
   union(3,8): parent[3]=8
   union(6,5): parent[6]=5
   union(9,4): find(9)=9, find(4)=8 → parent[9]=8

     8            5        forest of trees;
    / \           |        root = component id
   3   9          6
   |
   4
```

--

## Weighted quick-union

Always link the **smaller** tree under the **larger** (track sizes):

```text
   union(p,q):
     if size[root(p)] < size[root(q)]: link p-root under q-root
     else: link q-root under p-root; update sizes
```

Keeps trees **balanced** → height ≤ **log₂ N** → find is O(log N).

--

## Why height stays ≤ log₂ N

A node `x` gets **one deeper** only when its tree is linked under a tree **at least as large**:

```text
   x sinks one level  ⇒  x's tree size at least DOUBLES

   size starts at 1, can never exceed N
   ⇒ at most log₂ N doublings  ⇒  depth ≤ log₂ N
```

--

## Path compression

While doing `find`, **flatten** the path: point each node directly at the root.

```text
   find(p):
     while p != parent[p]:
        parent[p] = parent[parent[p]];   // halve the path
        p = parent[p];
     return p;
```

Trees become nearly flat → future finds are faster.

--

## Path compression — worked

```text
   before find(4):     after find(4):
        8                    8
        |                  / | \
        3                 4  3  9      4, 3 now point
        |                                straight at root 8
        4
```

The walk `4 → 3 → 8` repoints 4 (and 3) directly at root 8 — the next `find(4)` is **one hop**.

--

## Your turn — plain vs weighted

Same three unions, both schemes: `union(4,3)`, `union(3,8)`, `union(9,4)`

```text
   plain quick-union:  parent[root(p)] = root(q)
   weighted:           smaller tree under larger (ties: p side)

   what does each forest look like — and how tall?
```

<small>**Plain:** 4→3, 3→8, then root(9)=9 under root(4)=8 → the tree `8{3{4}, 9}` — **height 2**. **Weighted:** 3 under 4 (tie), then 8 under 4 (size 2 vs 1), then 9 under 4 → the star `4{3, 8, 9}` — **height 1**. Weighting flattens as you build.</small>

--

## The cost of union-find

| implementation | union | find |
|---|---|---|
| quick-find | O(N) | O(1) |
| quick-union | O(N) | O(N) |
| weighted QU | O(log N) | O(log N) |
| **weighted + path compression** | **~O(1)** | **~O(1)** |

Weighted + compression: **nearly constant** amortized (inverse Ackermann α(N) < 5 for any real N).

--

## 🎬 Demo — union-find

<div class="algo-viz" data-algo="union-find">
<pre class="viz-fallback">
   weighted quick-union + path compression: each union links
   the smaller tree under the larger; each find flattens the
   path it walks. cell i shows parent[i]; roots point at
   themselves.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Type a pair and press **Union** (`4 3`, then `3 8`, then `9 4` — the your-turn). **Connected** compares roots; **Find** walks up and **flattens** the path it took. Cell i shows `parent[i]`.</small>

--

## Where union-find is used

- **Kruskal's MST** (Part 3) — the cycle check
- **connected components** / image segmentation
- **network / percolation** connectivity
- **type unification**, equivalence classes

--

## Connected components via union-find

Count/label components in one pass:

```text
   UF uf(V);
   for each edge (u, v): uf.unite(u, v);
   components = number of distinct roots
   connected(a, b)?  →  uf.connected(a, b)   // ~O(1) after
```

Unlike DFS components (L08), union-find handles edges arriving **online** and answers queries **as they come**.

---

### Part 2 · MST & the cut property

<small>(~20 min)</small>

--

## Spanning trees

A **spanning tree** of a connected graph: a subset of edges that **connects all V vertices** with **no cycle**.

```text
   V vertices → exactly V − 1 edges, no cycle
```

A graph has many spanning trees; we want the **cheapest** one.

--

## Spanning tree — three facts

Any spanning tree of a connected graph has:

- exactly **V − 1 edges**
- **no cycle** — any non-tree edge adds exactly one
- a **unique path** between every pair of vertices

Remove one edge → disconnected; add one → a cycle.

--

## The MST problem

Given a **connected, edge-weighted, undirected** graph, find the spanning tree of **minimum total weight**.

```text
   minimize  Σ (weights of chosen edges)
   subject to: connects all V, no cycle
```

--

## The graph for tonight

```text
   0-1(4)  0-2(2)  2-1(1)  1-3(5)   2-3(8)  2-4(10)
   3-4(2)  3-5(6)  4-5(3)  5-6(1)   4-7(7)
```

<div class="algo-viz" data-algo="mst-tour">
<pre class="viz-fallback">
   the L09 graph, now UNDIRECTED — 8 vertices, 11 weighted
   edges. MST weight: 21.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>The **L09 graph, undirected** (arrows dropped). Same 11 edges — tonight's question isn't "cheapest paths from 0" but "cheapest set of edges connecting **everything**."</small>

--

## Is the MST unique?

- if **all edge weights are distinct** → the MST is **unique**
- if weights **tie** → there may be several MSTs, but they all have the **same total weight**

```text
   the minimum WEIGHT is always unique; the tree may not be
```

--

## Why MSTs matter

- **network design** — cheapest cabling / roads / pipelines connecting all sites
- **clustering** — build the MST of the data points, then **cut the k−1 heaviest edges** → k clusters (single-linkage)
- **circuit design**, **approximation** (e.g. TSP lower bound)

--

## The cut property

The one theorem behind every MST algorithm:

> Partition the vertices into two sets (a **cut**). The **minimum-weight edge crossing** the cut is **in some MST**.

```text
   any cut → its lightest crossing edge is SAFE to add
```

--

## Cut property — the exchange proof

Suppose an MST `T` does **not** contain the min crossing edge `e`:

```text
   T connects both sides → T + e contains a CYCLE
   the cycle crosses the cut AGAIN via some edge f
   w(f) ≥ w(e)            (e was the lightest crossing)

   swap:  T − f + e   is still a spanning tree,
                      and not heavier  →  also minimum ∎
```

--

## A cut, pictured

```text
   { 0, 2 }  |  { 1, 3, 4, 5, 6, 7 }
   crossing edges: 0-1 (4), 2-1 (1), 2-3 (8), 2-4 (10)
   lightest = 2-1 (1)  →  SAFE, in some MST
```

Any cut works — the algorithms just choose cuts cleverly.

--

## The cycle property (dual)

The mirror of the cut property:

> The **maximum-weight edge** in any **cycle** is **not** in any MST (all weights distinct).

```text
   heaviest edge on a cycle → always skippable
```

This is exactly what Kruskal uses to reject edges.

--

## Greedy MST framework

Both algorithms are the cut property, applied greedily:

- **Kruskal** — edges **cheapest first**; each accepted edge is the lightest crossing its **component cut**
- **Prim** — grow **one tree**; each step takes the lightest edge crossing the **tree-vs-rest cut**

Different cuts, same safe-edge rule.

---

### Part 3 · Kruskal's algorithm

<small>(~24 min)</small>

--

## Kruskal's idea

**Sort all edges by weight**; add each edge unless it would form a **cycle**:

```text
   sort edges ascending by weight
   for each edge (u, v):
       if u and v are NOT already connected:
           add (u, v) to the MST
```

Stop after **V − 1** edges. Cheapest-first, skip cycles.

--

## Union-find is the cycle check

"Would this edge form a cycle?" = "are its endpoints **already connected**?"

```text
   if (uf.connected(u, v)) skip;          // cycle → cycle property
   else { addEdge(u, v); uf.union(u, v); } // safe → cut property
```

This is why we built union-find first.

--

## Kruskal — the algorithm

```text
sort edges by weight;
UF uf(V);
for (Edge e : edges) {
    if (!uf.connected(e.u, e.v)) {
        mst.push_back(e);
        uf.union(e.u, e.v);
        if (mst.size() == V - 1) break;
    }
}
```

--

## Kruskal grows a forest

Unlike Prim's single tree, Kruskal maintains a **forest** that **merges**:

```text
   start: V isolated trees (each vertex alone)
   each accepted edge MERGES two trees into one
   after V−1 merges: one tree (the MST)
```

Union-find *is* the forest — each `union` is a merge, each `connected` asks "same tree?"

--

## Kruskal — the full run

```text
   sorted: 1(2-1) 1(5-6) 2(0-2) 2(3-4) 3(4-5)
           4(0-1) 5(1-3) 6(3-5) 7(4-7) 8(2-3) 10(2-4)

   2-1 (1)  ADD    total 1
   5-6 (1)  ADD    total 2
   0-2 (2)  ADD    total 4      {0,1,2} formed
   3-4 (2)  ADD    total 6
   4-5 (3)  ADD    total 9      {3,4,5,6} formed
   0-1 (4)  SKIP — cycle 0-2-1
   1-3 (5)  ADD    total 14     merges the two big pieces
   3-5 (6)  SKIP — cycle
   4-7 (7)  ADD    total 21     7 edges → STOP (8, 10 never seen)
```

--

## Practice — accept or skip?

Kruskal has added `2-1, 5-6, 0-2, 3-4, 4-5` so far — components `{0,1,2}`, `{3,4,5,6}`, `{7}`. Next up:

```text
   0-1 (4):  accept or skip?
   1-3 (5):  accept or skip?
```

<small>`0-1`: both endpoints already in `{0,1,2}` → **SKIP** (would close the cycle 0-2-1). `1-3`: 1 is in `{0,1,2}`, 3 is in `{3,4,5,6}` — different components → **ADD**, merging them (only 7 remains outside).</small>

--

## Why Kruskal's edge is safe

When Kruskal accepts `e = (u, v)`, let **C = u's component**. Then `e` is the **lightest** edge crossing the cut (C vs rest):

```text
   suppose a crossing edge f had  w(f) < w(e)
   → f was processed EARLIER
   → f was ADDED (endpoints in different components then)
     or SKIPPED (endpoints already together)
   → either way f's endpoints are now in ONE component
   → f cannot cross the cut  —  contradiction ∎
```

Safe by the **cut property** — so Kruskal only adds MST edges.

--

## 🎬 Demo — Kruskal

<div class="algo-viz" data-algo="kruskal">
<pre class="viz-fallback">
   edges cheapest-first: ADD an edge (bold) if its endpoints
   have different union-find roots, SKIP it (faded) if they
   share one — a cycle. the second row shows that union-find
   forest merging as edges are accepted.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Run **Kruskal**: cheapest first, **add** (bold) when it bridges two components, **skip** (faded) on a cycle — total **21**. The `u v w` triples are editable; **Build** replays construction.</small>

--

## Kruskal — cost

```text
   sort E edges:        O(E log E)   ← dominates
   E union-find ops:    ~O(E)        (near-constant each)
   total:               O(E log E) = O(E log V)
```

`log E ≤ 2 log V` since `E < V²`. Kruskal is a **sort** plus a near-linear pass.

--

## When to reach for Kruskal

- edges **already sorted**, or cheap to sort (small int weights → radix)
- **sparse** graphs (E close to V)
- you want the simplest correct MST code

Prim (next) is often better on **dense** graphs.

---

### Part 4 · Prim's algorithm

<small>(~24 min)</small>

--

## Prim's idea

Grow **one tree** from a start vertex. Repeatedly add the **lightest edge** leaving the tree to a **new** vertex:

```text
   start with {s}
   repeat V-1 times:
       add the min-weight edge from the tree
       to a vertex NOT yet in the tree
```

Each step takes the lightest edge crossing the **tree-vs-rest cut** — safe by the cut property, directly.

--

## The priority queue

To pick the lightest crossing edge fast, keep the crossing edges in a **min-priority queue**:

```text
   when a vertex joins the tree:
       push its edges to non-tree vertices onto the PQ
   pick min:
       pop the lightest edge; if it leads OUT of the tree, take it
```

The same binary heap from L06 — Prim is O(E log V).

--

## Prim — the algorithm

```text
inTree[s] = true;  push s's edges onto a min-PQ;
while (mst.size() < V - 1) {
    Edge e = pq.extractMin();
    if (inTree[e.to]) continue;      // stale — both ends in
    mst.push_back(e);
    inTree[e.to] = true;
    for (Edge f : adj[e.to])
        if (!inTree[f.to]) pq.push(f);
}
```

--

## Prim — a worked run

```text
   from 0:  tree = {0}
   cheapest edge leaving {0}:      0-2 (2)  → add 2   total 2
   leaving {0,2}:                  2-1 (1)  → add 1   total 3
   leaving {0,1,2}:                1-3 (5)  → add 3   total 8
   leaving {0,1,2,3}:              3-4 (2)  → add 4   total 10
   … continue → 4-5(3), 5-6(1), 4-7(7)     total 21
```

--

## Practice — which edge next?

Prim's tree so far is `{0, 2}` (via edge 0-2). Edges leaving it:

```text
   2-1 (1)   2-3 (8)   2-4 (10)   0-1 (4)
   which does Prim add next?
```

<small>The **lightest** crossing edge: `2-1 (1)` → vertex 1 joins the tree. Prim always takes the cheapest edge leaving the current tree, regardless of which tree vertex it starts from.</small>

--

## 🎬 Demo — Prim (and friends)

<div class="algo-viz" data-algo="prim">
<pre class="viz-fallback">
   grow ONE tree: each step adds the lightest edge (bold)
   crossing from the tree to a new vertex. compare with
   Kruskal (same MST, different order) and Dijkstra
   (a DIFFERENT tree — priority dist, not weight).
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Run **Prim from 0**, then **Kruskal** — different order, same 21. Then Build `0 1 2, 1 2 2, 0 2 3`: **Prim from 0** keeps `1-2`; **Dijkstra from 0** keeps `0-2` — **different trees!**</small>

--

## MST ≠ shortest-path tree

```text
        0                MST (weight 4):  0-1, 1-2
      2/ \3              SPT from 0:      0-1, 0-2
      1---2
        2                MST path 0→2 costs 4 — not shortest (3)
                         SPT total weight 5 — not minimum (4)
```

Different objectives → different trees. <small>(On tonight's 8-vertex graph they happen to coincide — don't be fooled.)</small>

--

## Kruskal vs Prim

| | Kruskal | Prim |
|---|---|---|
| grows | a **forest** (merges) | **one tree** |
| picks | globally cheapest edge | cheapest edge leaving the tree |
| needs | **union-find** + sort | **priority queue** |
| cost | O(E log E) | O(E log V) |
| best for | **sparse** graphs | **dense** graphs |

--

## Prim vs Dijkstra

Nearly the same algorithm — only the **priority** differs:

| | Prim (MST) | Dijkstra (SSSP) |
|---|---|---|
| PQ key | edge **weight** `w` | **distance** `dist[u]+w` |
| goal | cheapest **tree** | cheapest **paths** |
| grows | one tree via a PQ | one tree via a PQ |

--

## Lazy vs eager Prim

- **lazy** — push every crossing edge; skip stale pops (both ends already in the tree)
- **eager** — keep only the **best** edge per outside vertex (decrease-key)

Both O(E log V); lazy is simpler with a plain heap. (Same trade as Dijkstra.)

--

## Prim without a heap: O(V²)

Skip the PQ — each round, **scan all vertices** for the nearest to the tree:

```text
   repeat V times: pick the min-key non-tree vertex (O(V) scan);
                   add it; update its neighbors' keys
   total: O(V²)
```

**Better for dense graphs** (E ≈ V²) — the heap's log factor is pure overhead there.

---

### Part 5 · Wrap, an aside & ICA 11

<small>(~16 min)</small>

--

## Aside: articulation points

An **articulation point** is a vertex whose **removal disconnects** the graph — a single point of failure.

```text
   0 --- 1 --- 3        remove 1 → 3 is stranded
   |    /               remove 0 or 2 or 3 → still connected
   |   /
   2 -+                 articulation point: {1}
```

One DFS finds them all in **O(V + E)**.

--

## Finding them: disc & low

One DFS; per vertex track `disc[v]` (discovery time) and `low[v]` (earliest disc reachable from v's subtree via **≤ 1 back edge**):

- **root** — articulation iff it has **≥ 2 DFS children**
- **non-root u** — articulation iff some child `c` has `low[c] ≥ disc[u]` (c's subtree **can't escape** above u)

--

## disc / low — worked

```text
   edges: 0-1, 1-2, 2-0, 1-3       DFS from 0, ascending

   vertex   disc   low     why
     0       1      1      root, 1 DFS child (1) → not AP
     1       2      1      low via child 2's back edge
     2       3      1      back edge 2-0 → low = disc[0]
     3       4      4      leaf, no back edge

   child 3 of 1:  low[3] = 4  ≥  disc[1] = 2  →  1 IS an AP ✓
   child 2 of 1:  low[2] = 1  <  2            (escapes via 2-0)
```

--

## Recap — tonight in two lines

- **union-find**: quick-find → quick-union → **weighting** (doubling proof) → **path compression** → **~O(1)** per op
- **MST**: the **cut property** (exchange proof) makes greedy safe — **Kruskal** (sort + union-find) and **Prim** (L06 heap), both **O(E log V)**, and MST ≠ shortest-path tree

--

## Algorithms from known structures

Tonight's real lesson — new algorithms are **old structures, recombined**:

| algorithm | reuses |
|---|---|
| **Kruskal** | union-find + a sort |
| **Prim** | the L06 binary heap |
| **Dijkstra** (L09) | the L06 binary heap |
| **articulation points** | the L08 DFS tree |

--

## ICA 11 — your turn

In `ica11/ica11.cpp`, three TODOs:

- **`find`** — path compression (halving or full — either)
- **`unite`** — union by size (smaller under larger)
- **`kruskal`** — sort, skip already-connected, sum the weight
- **T6 is tonight's graph** — expect MST weight **21**

Build `-g`, run the tests, Valgrind-clean.

