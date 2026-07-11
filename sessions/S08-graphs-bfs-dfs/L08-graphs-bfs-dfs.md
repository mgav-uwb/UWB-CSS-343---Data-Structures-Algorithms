<!--
  CSS 343 · Lecture 8 (Session 8) — Graphs I: Representations, DFS/BFS, Topological Sort.
  reveal.js: "---" = next part (→), "--" = next slide (↓). Notes follow "Note:".
  Concrete C++ (structs, vectors, adjacency lists) — no templates/inheritance.
  KaTeX: never two "_" on one line. Verify at 1280×620; code/ASCII lines ≤ ~56 chars.

  Reading (pre): Sedgewick & Wayne §4.1 (Undirected Graphs) + §4.2 (Directed
  Graphs) + ODS Ch 12.
  THROUGH-LINE: a graph is vertices + edges — the most general structure we've
  met (trees are the acyclic special case). Store it as an ADJACENCY LIST. One
  generic loop explores it; the FRONTIER container decides everything: stack →
  DFS (reachability, cycles, topo), queue → BFS (fewest-edge paths), and a PQ →
  Dijkstra (next session). Both searches are Θ(V+E), PROVEN via the handshake
  lemma. Topological sort = Kahn's peeling (with the source-lemma proof) or
  reverse DFS post-order (with the 3-case proof).

  Worked examples: ONE 4-vertex diamond DAG (0→1, 0→2, 1→3, 2→3) carries every
  hand trace (DFS order 0 1 3 2, BFS dists 0 1 1 2, Kahn 0 1 2 3, post-order
  3 1 2 0 → reversed 0 2 1 3). The DEMOS run on the lib's 8-vertex DAG
  (0→1,2 · 1→3,4 · 2→3,4 · 3→5 · 4→5,7 · 5→6) — mirrored on the "graph for
  tonight" slide and in the your-turn answers (DFS 0 1 3 5 6 4 7 2, BFS layers
  {0}{1,2}{3,4}{5,7}{6}, Kahn 0 1 2 3 4 5 6 7). Demo build string is the edge
  list "0 1, 0 2, 1 3, 1 4, 2 3, 2 4, 3 5, 4 5, 4 7, 5 6"; adding "6 2" closes
  the cycle 2→3→5→6→2 for the cycle-detection beats.

  Covered in Spring-26 (Kim, Graph deck; Carrano 20, Cusack 10): graph ADT,
  adjacency matrix vs list, DFS (recursive + iterative stack), BFS, connectivity,
  topological sort (DFS + stack). [Dijkstra → L09; MST/articulation → L11.]

  Session plan (150 min). 0:00 intro 0:04 P1 vocab+repr 22 0:26 P2 DFS 28
  0:54 BREAK 10 1:04 P3 BFS 24 1:28 P4 digraphs+topo 32 2:00 P5 wrap 6
  2:06 ICA 2:30 end.
-->

## CSS 343

### Data Structures, Algorithms & Discrete Mathematics II

**Lecture 8 — Graphs I: Representation, DFS, BFS & Topological Sort**

<small>Summer 2026 · T/Th 6:00–8:30 · UW1 020 · Dr. Marcel Gavriliu</small>

---

## Reading

**Sedgewick & Wayne §4.1–4.2** — Undirected & Directed Graphs

- **representation** — the **adjacency list**
- **DFS** — go deep (recursion / a stack)
- **BFS** — go wide (a queue) → **fewest-edge** paths
- **topological sort** — scheduling a DAG

_Secondary:_ ODS Ch 12. Reading quiz due before class.

---

### Part 1 · Vocabulary & representation

<small>(~22 min)</small>

--

## What is a graph?

A **graph** `G = (V, E)`: a set of **vertices** V and a set of **edges** E connecting pairs of them.

```text
   0 —— 1       V = { 0, 1, 2, 3 }
   |  / |       E = { 0–1, 0–2, 1–2, 1–3 }
   | /  |
   2    3       4 vertices, 4 edges, a cycle 0–1–2–0
```

The most general structure we've seen — and the data model for maps, social networks, the web, dependencies, circuits…

--

## Undirected vs directed

```text
   undirected:  0 —— 1     edge goes both ways
   directed:    0 ——> 1    edge has a direction
```

- **undirected** — friendship, roads (two-way)
- **directed (digraph)** — web links, task order, one-way streets

--

## Vocabulary

- **adjacent** — two vertices joined by an edge
- **degree** — number of edges at a vertex (in-/out-degree for digraphs)
- **path** — a sequence of edges from one vertex to another
- **cycle** — a path that returns to its start
- **connected** — a path exists between every pair

--

## The handshake lemma

Each edge has exactly **2 endpoints**, so summing all degrees counts every edge **exactly twice**:

```text
   Σ deg(v) = 2·E

   our graph: degrees 2, 3, 2, 1 → sum 8 = 2·4 ✓
```

In a **digraph**: Σ in-deg = Σ out-deg = E. <br><small>Remember this — it's the engine of tonight's Θ(V + E) proofs.</small>

--

## How many edges can there be?

Simple undirected graph (no self-loops, no repeats):

```text
   0  ≤  E  ≤  V(V−1)/2 = Θ(V²)      (every pair)
```

- **sparse** — E = O(V): roads, social networks, the web
- **dense** — E = Θ(V²): an all-pairs mesh

Real graphs are almost always **sparse** — that fact will pick our representation.

--

## Trees are the sparsest graphs

A **tree** = a connected graph with **no cycles**:

- every tree on V vertices has **exactly V − 1** edges
- two of {connected, acyclic, E = V−1} force the third
- +1 edge → a cycle · −1 edge → disconnected

All our tree structures were special-case graphs — tonight removes the restrictions.

--

## Adjacency matrix

`a[u][v] = 1` if there's an edge `u–v`, else 0:

```text
        0 1 2 3
     0 [0 1 1 0]      edge 0–1? → a[0][1] = 1
     1 [1 0 1 1]      Θ(1) lookup
     2 [1 1 0 0]
     3 [0 1 0 0]      space: Θ(V²)
```

**Edge query O(1)**, but **Θ(V²) space** — wasteful for sparse graphs.

--

## Adjacency list

One list of neighbors per vertex:

```text
   0 → [1, 2]        space: Θ(V + E)
   1 → [0, 2, 3]     iterate 1's neighbors: O(deg(1))
   2 → [0, 1]        edge query 0–2: scan 0's list
   3 → [1]
```

**Θ(V + E) space** and **fast neighbor iteration** — the default.

--

## Matrix vs list

| | matrix | list |
|---|---|---|
| space | Θ(V²) | **Θ(V + E)** |
| edge query u–v | **O(1)** | O(deg u) |
| iterate neighbors | O(V) | **O(deg u)** |
| best for | **dense** | **sparse** |

Real graphs are sparse → **adjacency list** tonight. <small>(A third form — a plain list of edges — returns for Kruskal's MST in L11.)</small>

--

## Graph ADT in C++

```text
struct Graph {
    int V;                          // number of vertices
    vector<vector<int>> adj;        // adj[u] = u's neighbors

    Graph(int n) : V(n), adj(n) {}
    void addEdge(int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);        // omit for a digraph
    }
};
```

--

## The graph for tonight

```text
   0 → 1, 2      2 → 3, 4      4 → 5, 7      6 → —
   1 → 3, 4      3 → 5         5 → 6         7 → —
```

<div class="algo-viz" data-algo="graph-tour">
<pre class="viz-fallback">
   V = 8, E = 10, no directed cycle — a DAG.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>V = 8, E = 10, edges only "forward" — a **DAG**. All three demos run on this graph; keep the adjacency list in mind.</small>

---

### Part 2 · Depth-first search

<small>(~28 min)</small>

--

## The search problem

Given a start vertex, **visit every vertex reachable** from it — exactly once.

The challenge vs a tree: graphs have **cycles** and **multiple paths**, so we must remember **who we've visited**.

```text
   without a visited[] set → infinite loop around a cycle
```

--

## DFS: go deep, then backtrack

**Depth-first search** follows one path as far as it can, then **backtracks** and tries the next.

```text
   from 0: dive to a neighbor, then ITS neighbor, …
   dead end (or all visited) → back up one, try the next
```

It's **pre-order tree traversal**, generalized to graphs — the recursion IS the backtracking.

--

## DFS — recursive

```text
void dfs(Graph& g, int u, vector<bool>& seen) {
    seen[u] = true;                 // visit u
    for (int v : g.adj[u])          // each neighbor
        if (!seen[v])
            dfs(g, v, seen);        // recurse (backtrack on return)
}
```

Mark, then recurse into each unvisited neighbor. The **call stack** does the backtracking.

--

## DFS — a worked trace

```text
   0 → 1        adj:  0 → [1,2]   1 → [3]
   ↓   ↓              2 → [3]     3 → []
   2 → 3

   dfs(0): visit 0 → dfs(1): visit 1 → dfs(3): visit 3
           back to 1 (done) → back to 0
           → dfs(2): visit 2 → 3 already seen, SKIP
   visit order: 0  1  3  2
```

--

## Your turn — order matters

Same diamond, but vertex 0 stores its list as `[2, 1]`:

```text
   0 → [2,1]   1 → [3]   2 → [3]   3 → []

   what is the DFS visit order now?
```

<small>Answer: dive 0 → 2 → 3, backtrack, then 1 (its edge to 3 is skipped) — order **0 2 3 1**. The **set** of visited vertices never changes; the **order** depends on how each adjacency list is stored.</small>

--

## DFS visits exactly the reachable set

```text
   claim: dfs(s) marks v  ⟺  a path s ⇝ v exists

   (⇒) DFS only ever moves along edges out of marked
       vertices — every mark is genuinely reached
   (⇐) suppose some reachable w is missed. On a path
       s ⇝ w, let q be the FIRST missed vertex, and
       p the vertex before it (p was visited).
       dfs(p) scanned every out-edge of p — including
       p → q  →  q got visited. Contradiction. ∎
```

--

## DFS cost — cashing in the handshake lemma

Each vertex is visited once, and its **whole list** is scanned once:

```text
   work = Σ over v of ( 1  +  deg(v) )
        = Σ 1    +    Σ deg(v)
        =  V     +    2·E            ← handshake lemma
        = Θ(V + E)
```

Linear in the size of the graph — optimal: you must at least **look** at every vertex and edge.

--

## 🎬 Demo — DFS

<div class="algo-viz" data-algo="graph-dfs">
<pre class="viz-fallback">
   DFS on tonight's DAG: dive along tree edges (bold),
   mark each vertex, BACK UP at a dead end. edges into
   already-visited vertices are skipped.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Predict first: DFS from 0 — the first four vertices? Then **DFS from 2**: 0 and 1 stay unreached. The edge pairs are editable; **Build** replays the construction.</small>

--

## DFS — iterative (explicit stack)

```text
void dfs(Graph& g, int s) {
    stack<int> st; st.push(s);
    vector<bool> seen(g.V, false);
    while (!st.empty()) {
        int u = st.top(); st.pop();
        if (seen[u]) continue;
        seen[u] = true;             // visit u
        for (int v : g.adj[u])
            if (!seen[v]) st.push(v);
    }
}
```

Same idea, an **explicit stack** instead of recursion.

--

## Recursion depth — a caveat

Recursive DFS uses the **call stack** — its depth = the longest path explored.

```text
   a 1,000,000-vertex path → 1,000,000 stack frames → 💥
```

The **iterative** version keeps the stack on the **heap** — no such limit. Prefer it for very deep graphs.

--

## Tree edges vs back edges

DFS classifies every edge it examines:

- **tree edge** — leads to an **unvisited** vertex (we recurse) → forms the DFS tree
- **back edge** — leads to a vertex **still on the recursion stack** (an ancestor) → a **cycle!**

```text
   tree edge:  0 → 1 (new)      back edge: 3 → 0 (ancestor)
```

--

## Connected components

Restart DFS from every **unvisited** vertex; each restart discovers one **component**:

```text
   for v in 0..V-1:
       if not seen[v]:
           componentCount++
           dfs(v)         // labels this whole component
```

Counts components; labels which vertices are mutually reachable.

--

## DFS in action: is t reachable?

```text
bool reach(Graph& g, int s, int t, vector<bool>& seen) {
    if (s == t) return true;
    seen[s] = true;
    for (int v : g.adj[s])
        if (!seen[v] && reach(g, v, t, seen))
            return true;
    return false;
}
```

A tiny tweak to DFS answers "is there a path from s to t?"

---

### Part 3 · Breadth-first search

<small>(~24 min)</small>

--

## BFS: go wide, layer by layer

**Breadth-first search** visits all vertices at distance 1, then all at distance 2, … — expanding in **rings** from the start.

```text
   layer 0: {start}
   layer 1: start's neighbors
   layer 2: their unseen neighbors
   …
```

The frontier is a **queue** (FIFO) instead of a stack.

--

## BFS — the code

```text
void bfs(Graph& g, int s) {
    queue<int> q; q.push(s);
    vector<bool> seen(g.V, false); seen[s] = true;
    while (!q.empty()) {
        int u = q.front(); q.pop();     // visit u
        for (int v : g.adj[u])
            if (!seen[v]) {
                seen[v] = true;         // mark on ENQUEUE
                q.push(v);
            }
    }
}
```

--

## BFS — a worked trace

```text
   0 → 1        adj:  0 → [1,2]   1 → [3]
   ↓   ↓              2 → [3]     3 → []
   2 → 3

   queue [0]             dist: 0→0
   pop 0 → enq 1, 2      queue [1,2]   dist: 1→1, 2→1
   pop 1 → enq 3         queue [2,3]   dist: 3→2
   pop 2 → 3 seen, skip  queue [3]
   pop 3 → done
   visit order: 0 1 2 3     distances: 0 1 1 2
```

--

## Why mark on enqueue?

If you marked a vertex only when **dequeued**, two neighbors could both enqueue it → it enters the queue **twice** → re-processed, wrong distances.

Mark the instant you **enqueue** → each vertex enters the queue **once** → Θ(V + E).

--

## Lemma — the queue is sorted by distance

While distance-d vertices are dequeued, only distance-(d+1) vertices are **enqueued**:

```text
   queue:  [ d  d  …  d | d+1  d+1  …  d+1 ]
```

At most **two** values, never out of order → vertices are dequeued in **non-decreasing distance** order.

--

## Theorem — BFS distances are shortest

```text
   claim:  dist[v] = δ(v), the true fewest-edge distance

   ≥  BFS reached v along REAL edges — a path with
      dist[v] edges exists, and none is shorter than δ ✓

   ≤  take a shortest path  s = v0 → v1 → … → vk = v.
      induction: each vi is discovered by the time
      v(i−1) is dequeued → dist[vi] ≤ dist[v(i−1)] + 1 ≤ i ✓
```

Both directions → **dist[v] = δ(v)**. ∎

--

## Your turn — BFS on tonight's DAG

```text
   0 → 1, 2      2 → 3, 4      4 → 5, 7
   1 → 3, 4      3 → 5         5 → 6

   BFS from 0 — what is dist[6]?
```

<small>Layers: {0} → {1, 2} → {3, 4} → {5, 7} → {6}. So **dist[6] = 4** (e.g. 0→1→3→5→6). Vertex 7 sits at distance 3 — closer than 6, found a full layer earlier.</small>

--

## 🎬 Demo — BFS vs DFS

<div class="algo-viz" data-algo="graph-bfs">
<pre class="viz-fallback">
   BFS from vertex 0: expand in LAYERS via a queue. each
   vertex gets a distance label = fewest edges from 0.
   then run DFS from the same start and compare orders.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Run **BFS from 0** and read the distance labels ring by ring — then **DFS from 0** on the same graph: 0 1 2 3 4 5 7 6 vs 0 1 3 5 6 4 7 2. Same edges, different frontier.</small>

--

## DFS vs BFS

| | DFS | BFS |
|---|---|---|
| frontier | **stack** / recursion | **queue** |
| shape | deep, then backtrack | wide, in layers |
| finds | reachability, cycles, topo | **shortest (unweighted)** |
| memory | O(longest path) | O(widest layer) |
| cost | Θ(V+E) | Θ(V+E) |

Same cost, one data-structure apart — different questions.

--

## One loop, four algorithms

```text
   FRONTIER f;  f.add(start);
   while (!f.empty()) {
       u = f.remove();                 // visit u
       for (v : adj[u])
           if (!seen[v]) { seen[v] = true; f.add(v); }
   }
```

| frontier | explores | you get |
|---|---|---|
| stack (LIFO) | deepest first | **DFS** |
| queue (FIFO) | oldest first | **BFS** |
| PQ by path cost | cheapest first | **Dijkstra** (L09) |
| PQ by "looks close" | most promising | **A\*** (games/AI) |

--

## BFS beyond graphs: grids

A grid or maze is an **implicit** graph — each cell a vertex, edges to its 4 neighbors:

```text
   . . # .        BFS from S → fewest moves to every
   S . # .        reachable cell; '#' = wall (no edge)
   . . . E
```

Same BFS code — just compute neighbors `(r±1, c), (r, c±1)` on the fly.

---

### Part 4 · Digraphs & topological sort

<small>(~32 min)</small>

--

## Directed acyclic graphs (DAGs)

A **DAG** is a directed graph with **no cycles**:

```text
   0 → 1 → 3       "must come before" relationships
   0 → 2 → 3       (no way to loop back)
```

DAGs model **dependencies**: course prerequisites, build order, spreadsheet formulas, package installs.

--

## Topological order

A **topological order** lists the vertices so that **every edge points forward** (u before v for each u → v).

```text
   0 → 1 → 3,  0 → 2 → 3
   valid orders:  0 1 2 3   or   0 2 1 3
```

A schedule that **respects all dependencies**. When does one exist?

--

## A cycle kills it

```text
   a cycle  a → b → … → a  demands:
      a before b,  b before …,  … before a
   — no linear order can satisfy that
```

So: topological order exists **⟹** the graph is a DAG.

The converse — every DAG **has** one — needs an algorithm. First, a lemma.

--

## Lemma — every DAG has a source

A **source** = a vertex with in-degree 0. Proof it exists:

```text
   start anywhere; while the current vertex has ANY
   incoming edge, step BACKWARD along one:
        … → u → v      (v current → step to u)

   if you could always step, after V steps you'd have
   listed V+1 vertices → one REPEATS → a cycle. ✗ DAG!
```

So the walk gets stuck — at a vertex with **no incoming edge**. ∎

--

## Kahn's algorithm

Repeatedly output a **source**, delete it, repeat:

```text
   compute in-degree of every vertex
   queue all vertices with in-degree 0
   repeat: dequeue u → OUTPUT u
           for each edge u → v: in-degree(v)--
                if v hits 0 → enqueue v
```

Output order = a topological order. Θ(V + E).

--

## Why Kahn works

- a DAG **always has a source** (the lemma) — no early stall
- deleting a vertex → still a DAG → **induction** to the end
- u → v is deleted only when u is **output** → u before v ✓
- a cycle waits on itself → output stops **short** (< V)

--

## Kahn — a worked run

```text
   0 → 1  0 → 2  1 → 3  2 → 3    in-deg: 0:0 1:1 2:1 3:2

   queue [0]                 (only source: 0)
   out 0 → dec 1, 2 → both hit 0 → queue [1,2]
   out 1 → dec 3 → 3:1
   out 2 → dec 3 → 3:0 → queue [3]
   out 3
   order: 0 1 2 3   ✓  (all 4 output → no cycle)
```

--

## Your turn — Kahn on tonight's DAG

```text
   0 → 1, 2      2 → 3, 4      4 → 5, 7
   1 → 3, 4      3 → 5         5 → 6

   in-degrees?  first three vertices output?
```

<small>In-degrees: 0:0 · 1:1 · 2:1 · 3:2 · 4:2 · 5:2 · 6:1 · 7:1. Only source: 0. Output 0 frees 1 and 2; taking the smaller first: **0, 1, 2** — and the full run continues 3, 4, 5, 6, 7.</small>

--

## 🎬 Demo — topological sort

<div class="algo-viz" data-algo="graph-topo">
<pre class="viz-fallback">
   Kahn's algorithm: repeatedly remove a vertex with
   in-degree 0, output it, decrement its neighbors.
   add edge "6 2" and rebuild → a cycle → stuck vertices.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Run **Topo sort** (labels = live in-degrees). Then append `6 2`, **Build**, re-run: the cycle 2→3→5→6→2 strands six vertices in **red**. **DFS from 0** flags the back edge.</small>

--

## Cycle detection — two free detectors

A digraph has a topological order **iff** it has no cycle. Both methods report cycles:

- **Kahn** — fewer than V vertices come out; the leftovers contain the cycle
- **DFS** — an edge to a vertex **still on the recursion stack** = a back edge = a cycle

--

## Topological sort via DFS

Run DFS; record each vertex's **post-order** (finish time); the answer is the **reverse** of post-order.

```text
   dfs(u): … recurse into all of u's neighbors …
           on FINISHING u, push u onto a stack
   answer = pop the stack (reverse finish order)
```

A vertex finishes only **after** everything reachable from it → it belongs **before** all of that.

--

## DFS post-order — worked

```text
   0 → 1  0 → 2  1 → 3  2 → 3

   dfs(0) → dfs(1) → dfs(3): 3 finishes   (post #1)
            1 finishes                    (post #2)
            dfs(2): 3 seen → 2 finishes   (post #3)
            0 finishes                    (post #4)

   post-order: 3 1 2 0
   REVERSE →   0 2 1 3   ✓ a topological order
```

--

## Proof — why reverse post-order works

```text
   claim: in a DAG, for EVERY edge u → v,
          v finishes BEFORE u

   when dfs(u) examines the edge u → v, v is either
   1. unvisited    → dfs(v) runs INSIDE dfs(u)
                     → v finishes first            ✓
   2. finished     → v already done                ✓
   3. on the stack → v is an ancestor: v ⇝ u exists,
                     plus u → v  ⇒ a CYCLE — not a DAG ✗
```

Reverse finish order ⇒ u before v, for every edge. ∎

--

## Many valid orders

Independent tasks can go in **either** order:

```text
   0 → 1  0 → 2  1 → 3  2 → 3
   Kahn:              0 1 2 3
   reverse post-order: 0 2 1 3     — both valid
```

Unless the DAG is a single chain, the topological order is **not unique**.

--

## Kahn vs DFS post-order

| | Kahn (BFS-like) | DFS post-order |
|---|---|---|
| frontier | queue of sources | recursion / stack |
| detects a cycle | output stops short | back edge |
| feel | "peel off ready tasks" | "finish deep, reverse" |

Both **Θ(V + E)**, both detect cycles — pick by taste.

--

## Applications of topological sort

- **build systems** (Make, compilers) — compile in dependency order
- **course prerequisites** — a valid class schedule
- **spreadsheets** — recompute cells in formula order
- **package managers** — install dependencies first
- **task scheduling** with precedence constraints

--

## Strongly connected (preview)

In a **digraph**, *connected* splits in two:

- **weakly** — connected once you ignore directions
- **strongly** — directed paths **both ways**, every pair

Kosaraju / Tarjan find the strong components — built on tonight's DFS post-order.

---

### Part 5 · Wrap & ICA 08

<small>(~6 min)</small>

--

## The graph toolkit

- **represent** — adjacency list, Θ(V + E)
- **explore** — stack = **DFS**, queue = **BFS**, PQ = Dijkstra (next)
- **shortest, unweighted** — BFS labels (proven)
- **schedule a DAG** — Kahn or reverse post-order (proven)
- **detect cycles** — DFS back edge, Kahn stopping short

--

## ICA 08 — your turn

In `ica08/ica08.cpp`, on an **adjacency-list** `Graph`:

- implement **DFS** (`dfsVisit`) and **BFS** (mark on enqueue)
- **stretch (extra credit):** `topoSort` — Kahn
- core tests: T1–T3, T6; **T4–T5 test the stretch**

Build `-g`, run the tests, **Valgrind-clean** (leak-graded).

