<!--
  CSS 343 · Lecture 9 (Session 9) — Graphs II: Dijkstra Shortest Paths (Greedy).
  reveal.js: "---" = next part (→), "--" = next slide (↓). Notes follow "Note:".
  Concrete C++ (structs, adjacency lists, priority_queue) — no templates/inheritance.
  KaTeX: never two "_" on one line. Verify at 1280×620; code/ASCII lines ≤ ~56 chars.

  Reading (pre): Sedgewick & Wayne §4.4 (Shortest Paths) + ODS Ch 12.
  THROUGH-LINE: BFS found FEWEST-EDGE paths. Add edge WEIGHTS and "shortest"
  means least total weight — BFS breaks. The core operation is edge RELAXATION
  (found a cheaper way to v? lower dist[v]); every SP algorithm is relaxation in
  some order. Dijkstra's order is greedy — settle the nearest unsettled vertex —
  PROVEN correct for nonnegative weights by the leave-the-settled-set chain, and
  made fast (O(E log V)) by the L06 heap. Dijkstra = BFS + a priority queue.

  Worked examples: Part 1's RUNNING DIAMOND 0→1(2) 0→2(5) 1→3(4) 2→3(8) carries
  weights→path cost (6 vs 13)→fewest≠cheapest (direct 0→3(9) added: BFS pays 9,
  detour costs 6) and IS the Part-2 relax demo (settle order 0 1 2 3 shows all
  three outcomes: discover ×3, improve 9→6, fail 13 ≥ 6; final 0 2 5 6).
  The 4-vertex graph 0→1(2) 0→2(5) 1→2(1) 1→3(7) 2→3(3) is the
  main trace (dist 0 2 3 6) — IT IS ICA 09's test T1. The practice graph
  0→1(4) 0→2(1) 2→1(2) 1→3(3) is ICA T2 (detour beats direct, dist[1]=3).
  The DEMOS run on the CANONICAL course graph, weighted — the SAME graph as
  L08 (traversals) and L11 (MST), circular layout (triples
  "0 1 4, 0 3 6, 1 2 1, 1 3 5, 2 3 8, 0 5 20, 3 4 2, 3 7 11, 4 5 3, 5 6 9,
  4 7 7") — mirrored on the "graph for tonight" slide and the your-turn
  (settle order 0 1 2 3 4 5 7 6; final dist 0 4 5 6 8 11 20 15; the detour
  0→3→4→5 = 11 beats the direct 0→5 = 20). Appending "7 1 -20" is the Part-4
  beat: dist[7]=15, so the post-run edge re-check flags dist[1]=4 as broken
  (7→1: 15−20 = −5 < 4), and 1→3→4→7→1 = 5+2+7−20 = −6 is a negative cycle.

  Covered in Spring-26 (Kim, Graph deck): Dijkstra single-source shortest path,
  pseudocode, undirected note, O(V²) analysis. Sedgewick §4.4 adds the PQ
  implementation (O(E log V)), the relaxation framing, and negative-weight limits.

  Session plan (150 min). 0:00 intro 0:04 P1 weighted+SP 20 0:24 P2 relaxation 18
  0:42 BREAK 10 0:52 P3 Dijkstra+PQ 32 1:24 P4 correctness+limits 28
  1:52 P5 wrap 6 1:58 ICA 2:30 end.
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

### Part 1 · Weighted graphs & shortest paths

<small>(~20 min)</small>

--

## Recall: BFS shortest paths

BFS found the path with the **fewest edges** — and we proved it, because every edge counted the same (1 step).

```text
   0 —— 1 —— 3      BFS: 0→3 in 2 edges
```

But what if edges have **different costs**?

--

## Weighted graphs

Each edge carries a **weight**:

```text
   0 —2→ 1        weights = distance, time,
   |     |        price, latency, …
   5     4
   ↓     ↓
   2 —8→ 3
```

The **cost of a path** is now the **sum** of its edge weights.

--

## Path cost — worked

```text
   path 0 → 1 → 3           path 0 → 2 → 3
   weights   2   4          weights   5   8
   cost = 2 + 4 = 6         cost = 5 + 8 = 13
```

Among all s→t paths, the **shortest** is the one with the **minimum sum**: here 0 → 1 → 3, at cost 6.

--

## Fewest edges ≠ least weight

Add one **direct edge** `0 —9→ 3` to our digraph:

```text
   fewest edges:  0 → 3          1 edge,  cost 9
   least weight:  0 → 1 → 3      2 edges, cost 6
```

**BFS picks the direct edge** (fewest edges = 1) — and pays **9** when **6** was available. Fewest ≠ cheapest.

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

Surprisingly, single-pair is **no easier**: the best known method is to run Dijkstra and **stop when t settles** (when its distance becomes final — Part 3).

--

## Why not enumerate all paths?

A graph can have **exponentially many** s → t paths — listing them is hopeless:

```text
   even a modest grid has millions of routes
```

Dijkstra finds shortest distances to **all V** vertices in **O(E log V)** — **without** enumerating a single path.

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

> Any **sub-path** of a shortest path is itself a **shortest path**.

```text
   if  s → … → u → … → t  is shortest,
   then  s → … → u  is the shortest route to u

   why: a cheaper s ⇝ u prefix could be swapped in,
        beating the "shortest" path — contradiction
```

This is *why* building paths from shorter ones can work at all.

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

Negative weights break the greedy logic — Part 4 shows the **exact line of the proof** that fails.

--

## The graph for tonight

```text
   0→1(4)  0→3(6)  1→2(1)  1→3(5)   2→3(8)  0→5(20)
   3→4(2)  3→7(11) 4→5(3)  5→6(9)   4→7(7)
```

<div class="algo-viz" data-algo="wgraph-tour">
<pre class="viz-fallback">
   8 vertices, 11 weighted directed edges.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>**Exactly L08's DAG, now weighted** — same 8 vertices, same 11 edges, weights added. You met this graph last week for DFS/BFS; tonight it carries distances. The triples above are its build string.</small>

---

### Part 2 · Edge relaxation

<small>(~18 min)</small>

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

## The invariant: dist never lies low

`dist[v]` is always the length of **some real path** s → v (or ∞):

```text
   δ(v) = the TRUE shortest distance

   δ(v)  ≤  dist[v]        a real path can't beat the best
   and relaxation keeps it that way:
   dist[u] + w  ≥  δ(u) + w  ≥  δ(v)
```

When **no edge relaxes** any more, every `dist[v] = δ(v)`.

--

## One primitive, many algorithms

All shortest-path algorithms just relax edges — differing only in the **order**:

| algorithm | relaxation order | cost |
|---|---|---|
| **BFS** | by layer (unit weights) | Θ(V+E) |
| **DAG-SP** | topological order (L08!) | Θ(V+E) |
| **Dijkstra** | nearest-first (greedy) | O(E log V) |
| **Bellman-Ford** | all edges, V−1 rounds | O(V·E) |

--

## The order of relaxation matters

- **bad order** → the same edge must relax **many times** (Bellman-Ford: V−1 full rounds)
- **right order** → process vertices **nearest-first**: each vertex is finished when its turn comes, each edge relaxes **once**

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
   relax 0→1 (2):  0+2 < ∞   → dist[1]=2
   relax 0→2 (5):  0+5 < ∞   → dist[2]=5
   relax 0→3 (9):  0+9 < ∞   → dist[3]=9
   relax 1→3 (4):  2+4=6 < 9 → dist[3]=6  improved!
   relax 2→3 (8):  5+8=13 ≥ 6 → no change
   final: 0, 2, 5, 6
</pre>
</div>

<small>Part 1's digraph, direct edge included. All three outcomes: **discover** (∞ → a value), **improve** (9 → 6 — BFS's wrong path corrected), **fail** (13 ≥ 6: no change). Part 3's demo runs the full algorithm on tonight's graph.</small>

---

### Part 3 · Dijkstra's algorithm

<small>(~32 min)</small>

--

## The greedy idea

Repeatedly pick the **unsettled vertex with the smallest tentative distance**, declare it **settled** (final), and **relax its out-edges**.

```text
   settled  = shortest distance is now KNOWN
   frontier = tentative distances, still improving
```

--

## Why the nearest is safe — intuition

When you settle the **nearest** unsettled vertex u, no other route to u can be shorter:

```text
   any other route must first EXIT the settled region
   through some other unsettled vertex — already as far
   as u — and then edges only ADD weight (≥ 0)
```

Part 4 turns this into a real proof. **Nonnegativity is doing the work.**

--

## Once settled, never revisited

Because settling the nearest vertex makes its distance **final**:

- each vertex is **settled exactly once**
- stale PQ entries are **skipped**, never reprocessed
- one pass — not Bellman-Ford's V−1 rounds

Correctness of the greedy step is what **buys the speed**.

--

## Dijkstra — the algorithm

```text
dist[s] = 0;  all others ∞;  PQ = { (0, s) }
while (PQ not empty) {
    u = PQ.extractMin();          // nearest unsettled
    if (settled[u]) continue;     // stale entry — skip
    settled[u] = true;
    for (Edge e : adj[u])         // relax out-edges
        if (!settled[e.to] && dist[u] + e.w < dist[e.to]) {
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

## Dijkstra — a worked example

```text
   0→1(2)  0→2(5)  1→2(1)  1→3(7)  2→3(3)

   settle 0 (0): relax → dist 1=2, 2=5
   settle 1 (2): relax → 2: 2+1=3 < 5 ✓;  3: 2+7=9
   settle 2 (3): relax → 3: 3+3=6 < 9 ✓
   settle 3 (6): done
   dist: 0 2 3 6
```

<small>This exact graph is **ICA 09's test T1**.</small>

--

## Practice — settle order

```text
   0→1 (4)   0→2 (1)   2→1 (2)   1→3 (3)

   from 0: which vertex settles 2nd?  what is dist[1]?
```

<small>Settle 0 (0) → relax: 1=4, 2=1. Nearest unsettled is **2** (dist 1) → **settles 2nd**; relax 2→1: 1+2=3 &lt; 4 → **dist[1]=3**. Then settle 1 (3), then 3 (6). This graph is **ICA test T2**.</small> <!-- .element: class="fragment" -->

--

## Your turn — tonight's graph

```text
   0→1(4)  0→3(6)  1→2(1)  1→3(5)   2→3(8)  0→5(20)
   3→4(2)  3→7(11) 4→5(3)  5→6(9)   4→7(7)

   from 0: which vertex settles 3rd?  what is dist[5]?
```

<small>Settle order starts 0 (0), 1 (4), **2 (5)** — so **2 settles 3rd**. And **dist[5] = 11** via 0→3→4→5 = 6+2+3, beating the direct 0→5 = 20: a three-hop detour crushes the expensive direct edge.</small> <!-- .element: class="fragment" -->

--

## 🎬 Demo — Dijkstra

<div class="algo-viz" data-algo="dijkstra">
<pre class="viz-fallback">
   Dijkstra on tonight's weighted digraph: repeatedly
   SETTLE the nearest unsettled vertex (label now final)
   and RELAX its out-edges. accent edges = the
   shortest-paths tree.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Run **Dijkstra from 0** — the settle → relax rhythm; watch dist[5] drop from 20 to 11 as the detour is found. Then **from 2**: vertices 0 and 1 stay **∞**. The `u v w` triples are editable.</small>

--

## Finding the min: the L06 heap

The bottleneck is "which unsettled vertex is nearest?" — a **min-heap priority queue**:

```text
   push({dist, v})    → heap insert  (swim)   O(log V)
   extractMin()       → heap delMin  (sink)   O(log V)
```

In C++: `priority_queue<pair<long,int>, …, greater<>>`. **This is why we built heaps first.**

--

## Lazy deletion

When we relax v, we **push a new** (smaller) entry — we don't update the old one. Old entries go **stale**:

```text
   pop a vertex → already settled?  SKIP it (stale)
```

Simpler than decrease-key; the duplicates cost only a log factor.

--

## Lazy vs eager

| | lazy (our code) | eager |
|---|---|---|
| on relax | **push** a new entry | **decrease-key** the old |
| PQ size | up to E | at most V |
| PQ needs | plain heap | **indexed** heap |
| simpler? | **yes** | no |

Both are O(E log V). Lazy is the standard choice with `std::priority_queue`.

--

## Cost — the aligned count

```text
   pushes:      ≤ E   (one per improving relaxation)
   pops:        ≤ E   (each O(log E))
   edge scans:  Σ out-deg = E
   settles:     V

   total = O( (V + E) · log V ) = O(E log V)

   log E ≤ log V² = 2·log V   — same order
```

--

## The array-scan version (O(V²))

No priority queue — just **scan all vertices** for the nearest unsettled one:

```text
   repeat V times:
       u = unsettled vertex with smallest dist   // O(V) scan
       settle u; relax its edges                  // O(deg u)
   total: O(V²)
```

Simpler; **better for dense graphs** (E ≈ V², where V² < E log V).

--

## Source → target: stop early

If you only need the distance to **one** target t:

```text
   as soon as t SETTLES, its dist is final → stop
```

No need to settle the rest — a real speedup for point-to-point queries (and the door to A*).

--

## Common Dijkstra bugs

- no **stale skip** → reprocessing old PQ entries (slow, or wrong with careless updates)
- **negative** weights → silently **wrong** answers
- lowering `dist[v]` but **not pushing** → the improvement never propagates
- settling on **push** instead of **pop** → a vertex is frozen while it could still improve

---

### Part 4 · Correctness & limits

<small>(~28 min)</small>

--

## The proof — setup

Let S = the settled set (labels already final). Dijkstra is about to settle **u**, the nearest unsettled vertex. **Claim: dist[u] = δ(u).**

```text
   take ANY path P from s to u.
   P starts inside S (at s) and ends outside (at u)
   → P crosses the boundary somewhere:

   let  x → y  be P's FIRST edge with  x ∈ S,  y ∉ S
```

--

## The proof — the chain

```text
   cost(P) =  cost(s ⇝ x)  +  w(x→y)  +  cost(y ⇝ u)

           ≥     δ(x)      +  w(x→y)  +  0      ← weights ≥ 0
           ≥   dist[y]                 ← y relaxed when x settled
           ≥   dist[u]                 ← u is the NEAREST unsettled

   every path to u costs ≥ dist[u]  ⇒  dist[u] = δ(u)  ∎
```

--

## Where negative weights break it

```text
   s ──1──→ a        greedy settles a at dist 1 — final!
   │        ↑
   2       −4        but s→b→a = 2 + (−4) = −2
   │        │        the cheaper route arrives too late
   └──→ b ──┘
```

The proof's `cost(y ⇝ u) ≥ 0` line **fails** — a negative tail CAN undercut a settled label. **Dijkstra silently returns 1, not −2.**

--

## 🎬 Demo — watch it break

<div class="algo-viz" data-algo="dijkstra-neg">
<pre class="viz-fallback">
   append "7 1 -20" to the edge triples and rebuild:
   Dijkstra still reports dist[1] = 4, but the final
   edge re-check finds 7→1 still relaxes (15−20 = −5):
   the settled label was WRONG.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Append `7 1 -20`, **Build**, run **Dijkstra from 0**: it happily reports dist[1] = 4 — then the final **edge re-check** flags 7 → 1 in **red**: 15 − 20 = −5 &lt; 4. The greedy guarantee is gone.</small>

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

Bellman-Ford **detects** this: an edge still relaxing on a **V-th** pass → a negative cycle.

--

## Aside: longest paths are hard

A surprising asymmetry:

```text
   SHORTEST path (nonneg) → easy    (Dijkstra, O(E log V))
   LONGEST simple path    → NP-hard (no efficient algorithm)
```

And you can't just negate weights — that **creates negative cycles**, which break everything.

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

Both grow a tree by greedily pulling the nearest frontier vertex from a PQ. They differ **only in the key**:

- **Dijkstra** — `dist[u] + w` (distance from the **source**)
- **Prim (MST, L11)** — `w` (cheapest edge to the **tree**)

--

## Which shortest-path algorithm?

| situation | use | cost |
|---|---|---|
| unweighted | **BFS** | Θ(V+E) |
| DAG (any weights) | **topo-order relax** | Θ(V+E) |
| nonnegative, sparse | **Dijkstra + heap** | O(E log V) |
| nonnegative, dense | **Dijkstra + array** | O(V²) |
| negative weights | **Bellman-Ford** | O(V·E) |

--

## A* — a preview

Dijkstra explores in **all** directions equally. **A\*** adds a **heuristic** estimate of the remaining distance:

```text
   priority = dist[u] + h(u)      h ≈ cost still to go
```

Same relaxation, smarter order — faster **point-to-point** (GPS).

--

## A* — when is it still exact?

Correct whenever `h` is **admissible** (never **overestimates** the remaining cost) — and, for our settle-once Dijkstra shape, **consistent** (h drops by at most the edge weight per step):

```text
   straight-line distance ≤ real road distance   ✓
   h ≡ 0   →   A* IS Dijkstra
```

An admissible `h` only **reorders** exploration; it never misses the shortest path.

--

## Dijkstra in the wild

- **GPS / maps** — plus A\*, **bidirectional** search, precomputed shortcuts (contraction hierarchies)
- **network routing** — least-latency paths (OSPF)
- **flight / transit planning** — cheapest itineraries
- **games** — pathfinding on weighted terrain

Every one of them is still the **settle → relax** core.

---

### Part 5 · Wrap & ICA 09

<small>(~6 min)</small>

--

## The shortest-path toolkit

- **relaxation** — the one operation; done when no edge relaxes
- **unweighted** → **BFS** · **DAG** → topo-order · **nonneg** → **Dijkstra** · **negatives** → Bellman-Ford
- **Dijkstra** — settle nearest (proved by the boundary chain), relax out-edges, **O(E log V)** with the L06 heap

--

## One frontier, three searches

| algorithm | frontier priority |
|---|---|
| **BFS** | insertion order (= #edges) |
| **Dijkstra** | `dist[u]` |
| **A\*** | `dist[u] + h(u)` |

Choose the priority → choose the algorithm. <small>(And DFS was the same loop with a stack — L08.)</small>

--

## Deliverables

- **PA2 due tonight** — submit before the deadline
- **PA3 out** — see the Assignments page

--

## ICA 09 — your turn

In `ica09/ica09.cpp`, one TODO on the given `WGraph`:

- **`dijkstra`** — min-heap; pop, **skip stale**, relax, push
- **T1 is tonight's worked example**; T2 the practice detour; T8 stress-tests your stale skip

Build `-g`, run the tests, Valgrind-clean.

