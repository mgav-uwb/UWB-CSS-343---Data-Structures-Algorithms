<!--
  CSS 343 · Lecture 9 (Session 9) — Graphs II: Dijkstra Shortest Paths (Greedy).
  reveal.js: "---" = next part (→), "--" = next slide (↓). Notes follow "Note:".
  Concrete C++ (structs, adjacency lists, priority_queue) — no templates/inheritance.
  KaTeX: never two "_" on one line. Verify at 1280×620; code/ASCII lines ≤ ~56 chars.

  Reading (pre): Sedgewick & Wayne §4.4 (Shortest Paths) + ODS Ch 12.
  THROUGH-LINE: BFS found FEWEST-EDGE paths. Add edge WEIGHTS (miles, cost) and
  "shortest" means least total weight — BFS no longer works. The core operation
  is edge RELAXATION (found a cheaper way to v? lower dist[v]). Dijkstra relaxes
  greedily: repeatedly SETTLE the nearest unsettled vertex and relax its edges.
  Correct for NONNEGATIVE weights; a priority queue makes it O(E log V). It's
  BFS with a priority queue instead of a plain queue.

  Covered in Spring-26 (Kim, Graph deck): Dijkstra single-source shortest path,
  pseudocode, undirected note, O(V²) analysis. Sedgewick §4.4 adds the PQ
  implementation (O(E log V)), the relaxation framing, and negative-weight limits.

  Session plan (150 min). 0:00 intro 0:04 P1 weighted+SP 22 0:26 P2 relaxation 20
  0:46 BREAK 10 0:56 P3 Dijkstra+PQ 34 1:30 P4 correctness+variants 24
  1:54 P5 wrap 10 2:04 ICA 2:30 end.
-->

## CSS 343

### Data Structures, Algorithms & Discrete Mathematics II

**Lecture 9 — Graphs II: Dijkstra's Shortest Paths**

<small>Summer 2026 · T/Th 6:00–8:30 · UW1 020 · Dr. Marcel Gavriliu</small>

---

## Reading

**Sedgewick & Wayne §4.4** — Shortest Paths

- **weighted digraphs** — edges carry a cost
- **edge relaxation** — the one core operation
- **Dijkstra's algorithm** — greedy + a priority queue
- **nonnegative** weights (why it matters)

_Secondary:_ ODS Ch 12. Reading quiz due before class.

---

### Part 1 · Weighted graphs & the shortest-path problem

<small>(~22 min)</small>

--

## Recall: BFS shortest paths

BFS found the path with the **fewest edges** — because every edge counted the same (1 step).

```text
   0 —— 1 —— 3      BFS: 0→3 in 2 edges
```

But what if edges have **different costs**?

--

## Tonight's plan

1. **weighted graphs** — edges carry costs; "shortest" = least total weight
2. **relaxation** — the one operation every SP algorithm uses
3. **Dijkstra** — greedy: settle the nearest, relax its edges
4. **limits** — nonnegative only; Bellman-Ford otherwise

The one-liner: **Dijkstra = BFS with a priority queue.**

--

## Weighted graphs

Each edge carries a **weight** (a nonnegative number):

```text
   0 —2— 1        weights = distance, time,
   |     |        price, latency, …
   5     1
   |     |
   2 —8— 3
```

Now the **cost of a path** is the **sum** of its edge weights.

--

## Path cost — worked

```text
   path 0 → 1 → 3 → 5
   weights   4   2   3
   cost = 4 + 2 + 3 = 9
```

Among all s→t paths, the **shortest** is the one with the **minimum sum**. There may be several paths — we want the cheapest.

--

## Fewest edges ≠ least weight

```text
   0 —1— 1 —1— 3      2 edges, cost 2
   0 —————9———— 3      1 edge,  cost 9
```

The **fewest-edge** path (direct, cost 9) is **not** the cheapest (cost 2). **BFS would pick the wrong one.**

--

## The shortest-path problem

Given a **weighted digraph** and a **source** s, find the **minimum-total-weight** path from s to every vertex.

```text
   single-source shortest paths (SSSP)
   answer: dist[v] for every v, + the path itself
```

--

## Single-source vs single-pair

- **single-source** — one s → shortest paths to **all** vertices (what Dijkstra computes)
- **single-pair** — one s → one t

Surprisingly, single-pair is **no easier**: the best known method is to run Dijkstra and **stop when t settles**.

--

## Why not enumerate all paths?

A graph can have **exponentially many** s → t paths — listing them is hopeless:

```text
   even a modest grid has millions of routes
```

Dijkstra finds shortest distances to **all V** vertices in **O(E log V)** — **without** enumerating a single path, by building them up through relaxation.

--

## The shortest-paths tree

The shortest paths from s form a **tree** rooted at s:

```text
        s
       / \        each vertex's path to s
      a   b       is unique in the tree;
      |           follow parent pointers back
      c
```

Store one **parent[v]** (the edge used to reach v) → reconstruct any path.

--

## Optimal substructure

Shortest paths have a key property:

> Any **sub-path** of a shortest path is itself a **shortest path**.

```text
   if s → … → u → … → t is shortest,
   then s → … → u is the shortest route to u
```

This is *why* relaxation works — building shortest paths from shorter ones.

--

## Representation

Adjacency list, now with weights:

```text
struct Edge { int to; int w; };
vector<vector<Edge>> adj;        // adj[u] = weighted out-edges

adj[0] = { {1,2}, {2,5} };       // 0→1 (2), 0→2 (5)
```

Same Θ(V + E) structure as L08 — each neighbor just carries a weight.

--

## Undirected? Both directions

An undirected weighted edge `u — v` (weight w) is just **two** directed edges:

```text
   adj[u].push({v, w});
   adj[v].push({u, w});
```

Dijkstra never cares — it only ever reads **out-edges**. Same algorithm either way.

--

## The nonnegative assumption

Dijkstra requires **all weights ≥ 0**.

```text
   distances, times, costs, capacities → naturally ≥ 0
```

Negative weights break the greedy logic (Part 4). For negatives, use **Bellman-Ford** instead.

---

### Part 2 · Edge relaxation

<small>(~20 min)</small>

--

## Tentative distances

Keep a **tentative** shortest distance `dist[v]` for every vertex:

```text
   dist[s] = 0            (source: zero cost to itself)
   dist[v] = ∞            (everyone else: unknown so far)
```

As we explore, these only ever **decrease** toward the true answer.

--

## Edge relaxation — the core operation

"Relax" edge `u → v` with weight `w`: **can we reach v more cheaply via u?**

```text
   if (dist[u] + w < dist[v]) {
       dist[v] = dist[u] + w;      // found a cheaper route
       parent[v] = u;              // remember how
   }
```

Every shortest-path algorithm is **relaxation, applied in some order**.

--

## Relaxation — a worked step

```text
   dist[u] = 3,  dist[v] = 10,  edge u→v weight 4

   dist[u] + w = 3 + 4 = 7  <  10  →  RELAX
   dist[v] ← 7,  parent[v] ← u
```

Next time, if some path gives `dist[v] = 6`, we'd relax again to 6. `dist[v]` only falls.

--

## One primitive, many algorithms

All shortest-path algorithms just relax edges — differing only in the **order**:

| algorithm | relaxation order |
|---|---|
| **BFS** | by layer (unit weights) |
| **Dijkstra** | nearest-first (greedy) |
| **Bellman-Ford** | all edges, V−1 times |
| **DAG-SP** | topological order |

--

## The relaxation invariant

At all times: `dist[v]` is the length of **some** path s → v (or ∞).

- so `dist[v]` is always an **upper bound** on the true shortest distance
- relaxation only **tightens** it
- when no edge can be relaxed, every `dist[v]` is **exact**

--

## The order of relaxation matters

Every shortest-path algorithm relaxes edges — they differ in the **order**:

- **bad order** → the same edge relaxes many times (Bellman-Ford: V−1 rounds)
- **right order** — process vertices **nearest-first** → each edge relaxes **once**

That "nearest-first" ordering **is Dijkstra**.

--

## Reconstructing the path

Relaxation records **`parent[v]`** — the edge that gave v its best distance. To recover the path, follow parents back:

```text
   t → parent[t] → parent[parent[t]] → … → s
   reverse it → the shortest path s … t
```

`dist[]` gives the cost; `parent[]` gives the route.

--

## 🎬 Relaxation, visualized

<div class="algo-viz" data-algo="relax">
<pre class="viz-fallback">
   dist[0]=0  dist[1]=∞  dist[2]=∞  dist[3]=∞
   relax 0→1 (2):  0+2 < ∞  → dist[1]=2
   relax 0→2 (5):  0+5 < ∞  → dist[2]=5
   relax 1→3 (1):  2+1 < ∞  → dist[3]=3
   relax 2→3 (8):  5+8=13 ≥ 3 → no change
   final: 0, 2, 5, 3
</pre>
</div>

<small>Each relaxation lowers a tentative label when a cheaper route appears. The full **Dijkstra** demo in Part 3 shows relaxation happening in the right order.</small>

---

### Part 3 · Dijkstra's algorithm

<small>(~34 min)</small>

--

## The greedy idea

Repeatedly pick the **unsettled vertex with the smallest tentative distance**, declare it **settled** (final), and **relax its out-edges**.

```text
   settled  = shortest distance is now KNOWN
   frontier = tentative distances, still improving
```

--

## Why greedy works (nonnegative)

When you settle the **nearest** unsettled vertex u, no other route to u can be shorter:

```text
   any other path to u must go through a vertex that is
   ALREADY farther away — and edges only ADD weight (≥0)
```

So `dist[u]` is already final. **This is where nonnegativity is essential.**

--

## Once settled, never revisited

Because settling the nearest vertex makes its distance **final**:

- each vertex is **settled exactly once**
- we never reprocess it (skip stale PQ entries)
- so we make **one pass**, not V−1

That's why Dijkstra is **O(E log V)** and Bellman-Ford is **O(V·E)**.

--

## Dijkstra — the algorithm

```text
dist[s] = 0;  all others ∞;  PQ = { (0, s) }
while (PQ not empty) {
    u = PQ.extractMin();          // nearest unsettled
    if (settled[u]) continue;
    settled[u] = true;
    for (Edge e : adj[u])         // relax out-edges
        if (dist[u] + e.w < dist[e.to]) {
            dist[e.to] = dist[u] + e.w;
            PQ.push({ dist[e.to], e.to });
        }
}
```

--

## Settled vs frontier

```text
   settled:  { s }              dist final
   frontier: neighbors of s     tentative, in the PQ
   ∞:        everyone else       not yet discovered
```

Each iteration moves the **nearest frontier vertex** into *settled* and pushes its neighbors onto the frontier.

--

## 🎬 Demo — Dijkstra

<div class="algo-viz" data-algo="dijkstra">
<pre class="viz-fallback">
   Dijkstra from vertex 0 on a weighted digraph: repeatedly
   SETTLE the nearest unsettled vertex (its label is now
   final) and RELAX its out-edges (lower a neighbor's label
   if cheaper). accent edges form the shortest-paths tree.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Watch the **settle → relax** loop: the smallest tentative label becomes **final**, then its out-edges relax its neighbors. Labels are running **shortest distances**; the bold **tree edges** are the shortest-paths tree. Full sandbox: the **Explore** page.</small>

--

## Dijkstra — a worked example

```text
   0→1(2)  0→2(5)  1→2(1)  1→3(7)  2→3(3)

   settle 0 (0): relax → dist 1=2, 2=5
   settle 1 (2): relax → 2: 2+1=3 < 5 ✓; 3: 2+7=9
   settle 2 (3): relax → 3: 3+3=6 < 9 ✓
   settle 3 (6): done
   dist: 0 2 3 6
```

--

## Practice — settle order

```text
   0→1 (4)   0→2 (1)   2→1 (2)   1→3 (3)

   from 0: which vertex settles 2nd?  what is dist[1]?
```

<small>Settle 0 (0) → relax: 1=4, 2=1. Nearest unsettled is **2** (dist 1) → **settles 2nd**; relax 2→1: 1+2=3 < 4 → **dist[1]=3**. Then settle 1 (3), then 3 (6).</small>

--

## Finding the min: a priority queue

The bottleneck is "which unsettled vertex is nearest?" A **priority queue** (min-heap) answers it fast:

```text
   PQ.push({dist, vertex})     — on each relaxation
   PQ.extractMin()             — the nearest unsettled
```

The **binary heap** from L06 is exactly this PQ.

--

## Dijkstra uses the L06 heap

The priority queue is exactly the **binary heap** we built in Session 6:

```text
   push({dist, v})    → heap insert  (swim)   O(log V)
   extractMin()       → heap delMin  (sink)   O(log V)
```

In C++: `priority_queue<pair<int,int>, …, greater<>>` (a min-heap of `{dist, vertex}`).

--

## Lazy deletion

When we relax v, we **push a new** (smaller) entry — we don't update the old one. Old entries become **stale**:

```text
   pop a vertex → if already settled, SKIP it (stale)
```

Simpler than decrease-key, and the extra entries cost only a log factor.

--

## Lazy vs eager

| | lazy (our code) | eager |
|---|---|---|
| on relax | **push** a new entry | **decrease-key** the old |
| PQ size | up to E | at most V |
| PQ needs | plain heap | **indexed** heap |
| simpler? | **yes** | no |

Both are O(E log V). Lazy is simpler and standard with `std::priority_queue`.

--

## Complexity

With a binary-heap PQ:

```text
   each edge → at most one push          (E pushes)
   each push/pop → O(log V)
   total: O((V + E) log V)  ≈  O(E log V)
```

vs the simple array-scan version: **O(V²)** (better for dense graphs).

--

## The array-scan version (O(V²))

No priority queue — just **scan all vertices** for the nearest unsettled one:

```text
   repeat V times:
       u = unsettled vertex with smallest dist   // O(V) scan
       settle u; relax its edges                  // O(deg u)
   total: O(V²)
```

Simpler; **better for dense graphs** (E ≈ V²). This is Spring-26's version.

--

## Source → target: stop early

If you only need the distance to **one** target t (not all vertices):

```text
   as soon as t SETTLES, its dist is final → stop
```

No need to settle the rest — a real speedup for point-to-point queries (and the door to A*).

--

## Common Dijkstra bugs

- no **settled check** → reprocessing stale PQ entries (still correct, but slow / infinite if careless)
- **negative** weights → silently **wrong** answers
- lowering `dist[v]` but **not pushing** to the PQ → missed relaxations
- marking settled on **push** instead of **pop** → a vertex may still improve while queued

---

### Part 4 · Correctness, variants & limits

<small>(~24 min)</small>

--

## Why nonnegative weights matter

```text
      0 —1—> 1
      |       |
      2      −4       greedy settles 1 at dist 1…
      |       |       …but 0→2→1 costs 2 + (−4) = −2!
      v       v
      2 ——————
```

Greedy settles 1 too early; a later **negative** edge would have beaten it. **Dijkstra fails.**

--

## Bellman-Ford (for negative weights)

Relax **every edge, V−1 times**:

```text
   for i in 1..V-1:
       for each edge (u,v,w):
           relax(u, v, w)
```

Handles negative weights; detects **negative cycles**. Slower: **O(V·E)**.

--

## Negative cycles

If a cycle's weights **sum to negative**, "shortest path" is **undefined** — loop it forever, cost → −∞:

```text
   a → b → c → a   with total weight −2
   each lap subtracts 2 → no minimum exists
```

Bellman-Ford **detects** this: if any edge still relaxes on a **V-th** pass → a negative cycle.

--

## Aside: longest paths are hard

A surprising asymmetry:

```text
   SHORTEST path (nonneg) → easy   (Dijkstra, O(E log V))
   LONGEST simple path    → NP-hard (no efficient algorithm known)
```

And you can't just negate weights — that creates negative cycles, which break everything.

--

## Dijkstra vs BFS

BFS is **Dijkstra with all weights = 1**:

| | BFS | Dijkstra |
|---|---|---|
| edge weights | all 1 | nonnegative |
| frontier | **queue** | **priority queue** |
| gives | fewest edges | least weight |
| cost | Θ(V+E) | O(E log V) |

Same algorithm; the PQ replaces the plain queue.

--

## Dijkstra vs Prim

Both grow a tree by greedily pulling the nearest frontier vertex from a PQ. They differ in the key:

- **Dijkstra** — `dist[u] + w` (distance from the **source**)
- **Prim (MST)** — `w` (edge weight to the **tree**)

--

## Which shortest-path algorithm?

| situation | use | cost |
|---|---|---|
| unweighted | **BFS** | Θ(V+E) |
| nonnegative weights, sparse | **Dijkstra + heap** | O(E log V) |
| nonnegative, dense | **Dijkstra + array** | O(V²) |
| negative weights | **Bellman-Ford** | O(V·E) |
| one target + a heuristic | **A\*** | ≤ Dijkstra |

--

## A* — a preview

Dijkstra explores in **all** directions equally. **A\*** adds a **heuristic** estimate of the remaining distance to steer toward the goal:

```text
   priority = dist[u] + h(u)      h = estimated cost u → goal
```

Same relaxation, smarter order — faster for **point-to-point** (e.g. GPS).

--

## A* — when is it correct?

A* stays correct if the heuristic `h` is **admissible** — it never **overestimates** the true remaining cost:

```text
   straight-line distance ≤ actual road distance   ✓
   h(u) = 0  →  A* IS Dijkstra
```

An admissible `h` only **reorders** exploration; it never misses the shortest path.

--

## Where Dijkstra is used

- **GPS / maps** — shortest driving/walking routes
- **network routing** — least-latency paths (OSPF)
- **flight / transit** planning — cheapest itineraries
- **games** — pathfinding on weighted terrain
- any **least-cost path** in a weighted graph

--

## In practice: real routers

Plain Dijkstra on a continent of roads, per query, is too slow. Production routers add:

- **A\*** with a straight-line heuristic
- **bidirectional** search (from both ends, meet in the middle)
- **precomputed shortcuts** (contraction hierarchies)

All of it still built on Dijkstra's **relaxation** core.

---

### Part 5 · Wrap & ICA 09

<small>(~10 min)</small>

--

## Recap — the algorithm

- **weighted** graph: path cost = **sum** of edge weights (BFS's fewest-edges no longer applies)
- **relaxation** — `if dist[u]+w < dist[v]: lower it` — the one core operation
- **Dijkstra** — greedily **settle the nearest** unsettled vertex, relax its edges

--

## Recap — cost & limits

- a **priority queue** picks the nearest → **O(E log V)** (array scan: O(V²))
- correct only for **nonnegative** weights (else **Bellman-Ford**, O(V·E))
- **Dijkstra = BFS + a priority queue**

> Relax every edge; always settle the nearest vertex next — and with no negative weights, each settled distance is final.

--

## The shortest-path toolkit

- **unweighted** → **BFS** (fewest edges)
- **weighted, nonnegative** → **Dijkstra** (least weight)
- **negative weights** → **Bellman-Ford**
- **one target + heuristic** → **A\***

All built on a single operation: **edge relaxation**.

--

## One frontier, three searches

BFS, Dijkstra, and A* are the **same** frontier search — they differ only in the frontier's **priority**:

| algorithm | frontier priority |
|---|---|
| **BFS** | insertion order (= #edges) |
| **Dijkstra** | `dist[u]` |
| **A\*** | `dist[u] + h(u)` |

Choose the priority → choose the algorithm.

--

## ICA 09 — your turn

In `ica09/ica09.cpp`, on a **weighted** adjacency list:

- implement **edge relaxation**
- implement **Dijkstra** with a `priority_queue` (lazy deletion)
- return `dist[]` from a source; self-tests check known shortest distances

Build `-g`, run the self-tests, Valgrind-clean.

