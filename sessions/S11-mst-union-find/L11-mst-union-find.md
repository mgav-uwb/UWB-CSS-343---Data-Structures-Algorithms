<!--
  CSS 343 · Lecture 11 (Session 11) — Graphs III: Union-Find & Minimum Spanning Trees.
  reveal.js: "---" = next part (→), "--" = next slide (↓). Notes follow "Note:".
  Concrete C++ (structs, arrays) — no templates/inheritance. KaTeX: never two "_"
  on one line. Verify at 1280×620; code/ASCII lines ≤ ~56 chars (0.46em).

  Reading (pre): Sedgewick & Wayne §1.5 (Union-Find) + §4.3 (Minimum Spanning
  Trees) + ODS §1.4 / booksite (union-find).
  THROUGH-LINE: UNION-FIND answers "are u and v connected?" under a stream of
  unions — quick-find → quick-union → weighting → path compression drives the
  cost to near-constant. An MST is the cheapest set of edges connecting a
  weighted graph; both greedy MST algorithms rest on the CUT PROPERTY. KRUSKAL
  (sort edges + union-find for cycle checks) and PRIM (grow one tree via a
  priority queue) both build it in O(E log V).

  Covered in Spring-26 (Kim, Graph deck): MST mentioned under DFS applications;
  articulation points (a DFS application) — included here as a Part-5 aside.
  Union-find and weighted-MST (Kruskal/Prim) are largely NEW / Sedgewick-based.

  Session plan (150 min). 0:00 intro 0:04 P1 union-find 26 0:30 P2 MST+cut 20
  0:50 BREAK 10 1:00 P3 Kruskal 26 1:26 P4 Prim 24 1:50 P5 wrap+aside 14
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

## Tonight's plan

1. **union-find** — 4 implementations, each faster than the last
2. **MST** — the cheapest spanning tree; the **cut property**
3. **Kruskal** — sort edges + union-find
4. **Prim** — grow one tree with a priority queue

Two structures you already know (union-find, the L06 heap) power two classic algorithms.

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
   id:  0 1 2 3 4 5      union(2,4): relabel every 2 → 4? (or 4→2)
        every cell = its own label at first
   union(1,4): id = 0 4 2 3 4 5   (1's label 1 → 4)
   union(2,3): id = 0 4 3 3 4 5   (2's label... scan all)
   connected(1,4)? id[1]==id[4] → 4==4 → YES  (O(1))
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
   each time x's depth grows, its tree size at least DOUBLES
   size ≤ N → can double at most log₂ N times → depth ≤ log₂ N
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
   path it walks. the parent[] forest stays nearly flat.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Each **union** links the smaller tree under the larger; each **find** flattens the path it walks (path compression). Watch the `parent[]` forest stay shallow no matter the order of unions. Full sandbox: the **Explore** page.</small>

--

## Where union-find is used

- **Kruskal's MST** (Part 3) — cycle detection
- **connected components** / image segmentation
- **network / percolation** connectivity
- **type unification**, equivalence classes
- **Kruskal-style greedy** merging in general

--

## Connected components via union-find

Count/label components in one pass:

```text
   UF uf(V);
   for each edge (u, v): uf.unite(u, v);
   components = number of distinct roots
   connected(a, b)?  →  uf.connected(a, b)   // O(1) after
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

## Spanning tree — the three facts

For a connected graph on V vertices, any spanning tree has:

- exactly **V − 1 edges**
- **no cycle** — adding any non-tree edge makes exactly one
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

## Is the MST unique?

- if **all edge weights are distinct** → the MST is **unique**
- if weights **tie** → there may be several MSTs, but they all have the **same total weight**

```text
   the minimum WEIGHT is always unique; the tree may not be
```

--

## Why MSTs matter

- **network design** — cheapest cabling / roads / pipelines connecting all sites
- **clustering** — cut the longest MST edges to form groups
- **circuit design**, **approximation** (e.g. TSP lower bound)

--

## MST for clustering

Build the MST, then **delete the k−1 heaviest** edges → **k clusters**:

```text
   MST of points → cut the longest links →
   groups of nearby points (single-linkage clustering)
```

The MST captures "who is closest to whom" — cut its weakest links to separate groups.

--

## The cut property

The one theorem behind every MST algorithm:

> Partition the vertices into two sets (a **cut**). The **minimum-weight edge crossing** the cut is **in some MST**.

```text
   any cut → its lightest crossing edge is SAFE to add
```

--

## Cut property — why it's true

Suppose an MST `T` does **not** contain the min crossing edge `e`:

```text
   T already connects both sides → adding e makes a CYCLE
   that cycle has another crossing edge f, with weight(f) ≥ weight(e)
   swap: T − f + e is still spanning, and NOT heavier
```

So some MST contains `e`. (An **exchange argument** — the greedy proof pattern.)

--

## A cut, pictured

```text
   { 0, 2 }  |  { 1, 3, 4, 5, 6, 7 }
   crossing edges: 0–1 (4), 2–1 (1), 2–3 (8), 2–4 (10)
   lightest = 2–1 (1)  →  SAFE, in some MST
```

Any cut works — the algorithms just choose cuts cleverly.

--

## Greedy MST framework

Both algorithms are the cut property, applied greedily:

- **Kruskal** — consider edges **cheapest first**; each safely bridges two components (a cut)
- **Prim** — grow **one tree**; repeatedly add the lightest edge crossing out of it (a cut)

Different cuts, same safe-edge rule.

--

## The cycle property (dual)

The mirror of the cut property:

> The **maximum-weight edge** in any **cycle** is **not** in any MST.

```text
   heaviest edge on a cycle → always skippable
```

This is exactly what Kruskal uses to reject edges.

---

### Part 3 · Kruskal's algorithm

<small>(~26 min)</small>

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

## 🎬 Demo — Kruskal

<div class="algo-viz" data-algo="kruskal">
<pre class="viz-fallback">
   edges cheapest-first: ADD an edge (bold) if its endpoints
   are in different components (union-find), SKIP it (faded)
   if they're already connected — that would make a cycle.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Edges are considered **cheapest first**. An edge is **added** (bold) when it joins two components, **skipped** (faded) when its endpoints are already connected (a cycle). Watch the forest merge into one tree at **weight 21**.</small>

--

## Kruskal — a worked step

```text
   edges sorted: 1,1,2,2,3,5,7,8,10  (weights)

   take 1 (2–1)  → add          total 1
   take 1 (5–6)  → add          total 2
   take 2 (0–2)  → add          total 4
   take 2 (3–4)  → add          total 6
   take 3 (4–5)  → add          total 9
   take 5 (1–3)  → add          total 14
   take 7 (4–7)  → add          total 21   (7 edges — done)
```

--

## Kruskal — cost

```text
   sort E edges:        O(E log E)   ← dominates
   E union-find ops:    ~O(E)        (near-constant each)
   total:               O(E log E) = O(E log V)
```

`log E = O(log V)` since `E < V²`. Kruskal is a **sort** plus a near-linear pass.

--

## Practice — accept or skip?

Kruskal has so far added `{0–2, 3–4, 2–1, 5–6}`. Next edges by weight:

```text
   4–5 (3):  connected(4,5)?  4∈{0,1,2,3,4}, 5∈{5,6} → NO → ADD
   1–3 (5):  connected(1,3)?  both in {0,1,2,3,4}    → ??
```

<small>`1–3`: 1 and 3 are already in the same component `{0,1,2,3,4}` → **SKIP** (it would close a cycle). Only edges bridging two components are added.</small>

--

## When to reach for Kruskal

- edges **already sorted**, or cheap to sort (small weights → radix)
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
   cheapest edge leaving {0}:      0–2 (2)  → add 2   total 2
   leaving {0,2}:                  2–1 (1)  → add 1   total 3
   leaving {0,1,2}:                1–3 (5)  → add 3   total 8
   leaving {0,1,2,3}:              3–4 (2)  → add 4   total 10
   … continue → 4–5(3), 5–6(1), 4–7(7)     total 21
```

--

## Practice — which edge next?

Prim's tree so far is `{0, 2}` (via edge 0–2). Edges leaving it:

```text
   2–1 (1)   2–3 (8)   2–4 (10)   0–1 (4)
   which does Prim add next?
```

<small>The **lightest** crossing edge: `2–1 (1)` → vertex 1 joins the tree. Prim always takes the cheapest edge leaving the current tree, regardless of where it points.</small>

--

## 🎬 Demo — Prim

<div class="algo-viz" data-algo="prim">
<pre class="viz-fallback">
   grow ONE tree from vertex 0: each step adds the lightest
   edge (bold) crossing from the tree to a new vertex. the
   tree expands outward until all vertices are included.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>The tree grows from vertex 0: each step adds the **lightest edge** crossing to a **new** vertex (bold). Compare with Kruskal — different order of additions, **same MST** (weight **21**).</small>

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
| goal | cheapest tree | cheapest paths |
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

<small>(~14 min)</small>

--

## Aside: articulation points

A DFS application from the graph unit: an **articulation point** is a vertex whose **removal disconnects** the graph.

```text
   found via DFS: a vertex is an articulation point if a
   child's subtree has no back edge above the vertex
```

O(V + E) with one DFS — critical for **network reliability**.

--

## Finding articulation points

Run one DFS; for each vertex track `disc[v]` (discovery time) and `low[v]` (earliest reachable via a back edge):

- the **root** is an articulation point if it has **≥ 2 DFS children**
- a **non-root** `u` is one if some child `c` has `low[c] ≥ disc[u]` (c's subtree can't escape above u)

--

## Recap — union-find

- **union-find** answers "connected?" under a stream of unions
- quick-find → quick-union → **weighting** → **path compression**
- final cost: **nearly constant** (inverse Ackermann) per op

--

## Recap — MST

- an **MST** connects all V vertices for minimum total weight (V−1 edges)
- the **cut property** makes greedy safe
- **Kruskal** (sort + union-find) and **Prim** (PQ) both give **O(E log V)**

> Any cut's lightest crossing edge is safe — Kruskal and Prim just pick different cuts.

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

## When to use what

- **union-find** — dynamic connectivity, cycle detection, components
- **MST** (Kruskal/Prim) — cheapest network connecting everything
- **articulation points** — single points of failure in a network

--

## ICA 11 — your turn

In `ica11/ica11.cpp`:

- implement **weighted quick-union + path compression** (`find`, `union`)
- implement **Kruskal's MST** using it (sort edges, skip cycles)
- self-tests check connectivity queries and the MST total weight

Build `-g`, run the self-tests, Valgrind-clean.

