<!--
  CSS 343 · Lecture 8 (Session 8) — Graphs I: Representations, DFS/BFS, Topological Sort.
  reveal.js: "---" = next part (→), "--" = next slide (↓). Notes follow "Note:".
  Concrete C++ (structs, vectors, adjacency lists) — no templates/inheritance.
  KaTeX: never two "_" on one line. Verify at 1280×620; code/ASCII lines ≤ ~56 chars.

  Reading (pre): Sedgewick & Wayne §4.1 (Undirected Graphs) + §4.2 (Directed
  Graphs) + ODS Ch 12.
  THROUGH-LINE: a graph is vertices + edges — the most general structure we've
  met (trees are graphs with no cycles). Store it as an ADJACENCY LIST. Two
  searches explore it: DFS (go deep, a stack/recursion) and BFS (go wide, a
  queue → fewest-edge paths). Both are Θ(V+E). Post-order DFS on a DAG yields a
  TOPOLOGICAL order — the schedule that respects all dependencies.

  Covered in Spring-26 (Kim, Graph deck; Carrano 20, Cusack 10): graph ADT,
  adjacency matrix vs list, DFS (recursive + iterative stack), BFS, connectivity,
  topological sort (DFS + stack). [Dijkstra → L09; MST/articulation → L11.]

  Session plan (150 min). 0:00 intro 0:04 P1 vocab+repr 20 0:24 P2 DFS 26
  0:50 BREAK 10 1:00 P3 BFS 24 1:24 P4 digraphs+topo 30 1:54 P5 wrap 10
  2:04 ICA 2:30 end.
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

<small>(~20 min)</small>

--

## What is a graph?

A **graph** `G = (V, E)`: a set of **vertices** V and a set of **edges** E connecting them.

```text
     0 —— 1        V = {0,1,2,3}
     |  / |        E = {(0,1),(0,2),(1,2),(1,3)}
     2 —— 3? no… 2—0, 2—1, 1—3
```

The most general structure we've seen — trees are just graphs with **no cycles**.

--

## Graphs are everywhere

- **maps** — intersections (V) and roads (E)
- **social networks** — people and friendships
- **the web** — pages and hyperlinks
- **dependencies** — tasks and "must-come-before"
- **networks** — routers and links

--

## Tonight's plan

1. **represent** a graph — the adjacency list
2. **DFS** — depth-first (a stack): reachability, cycles
3. **BFS** — breadth-first (a queue): fewest-edge paths
4. **topological sort** — scheduling a DAG

All in **Θ(V + E)** — linear in the size of the graph.

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

## Degree & the handshake lemma

Sum of all degrees counts **each edge twice** (once at each endpoint):

```text
   Σ deg(v) = 2·|E|
```

So the average degree is `2E/V`. In a **digraph**, in-degree + out-degree, and `Σ in = Σ out = |E|`.

--

## How do we store a graph?

Two standard representations:

1. **adjacency matrix** — an `n × n` grid of 0/1
2. **adjacency list** — one list of neighbors per vertex

The choice drives the cost of every graph operation. Let's compare.

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

Real graphs are usually **sparse** (E ≪ V²) → **adjacency list**.

--

## Sparse vs dense

```text
   sparse:  E = O(V)      e.g. road maps, social graphs
   dense:   E = Θ(V²)     e.g. a fully-connected mesh
```

Most real graphs are **sparse** — that's why Θ(V + E) (list) beats Θ(V²) (matrix) in practice.

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

## The graph we'll trace

```text
   0 → 1, 2       3 → 5         6 → (none)
   1 → 3          4 → 5, 7      7 → (none)
   2 → 3, 4       5 → 6
```

A small **DAG** — the interactive DFS / BFS / topological-sort demos all run on a graph like this. Keep the adjacency list in mind as we trace each algorithm.

---

### Part 2 · Depth-first search

<small>(~26 min)</small>

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
   0 → [1,2]   1 → [3]   2 → [3]   3 → []

   dfs(0): visit 0 → dfs(1): visit 1 → dfs(3): visit 3  (dead end)
           back to 1 (done) → back to 0
           → dfs(2): visit 2 → 3 already seen, SKIP
   visit order: 0  1  3  2
```

The dive `0→1→3`, backtrack, then `0→2`; edge `2→3` is skipped (3 seen).

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

Same order, an **explicit stack** instead of recursion.

--

## Recursion depth — a caveat

Recursive DFS uses the **call stack** — its depth = the longest path explored.

```text
   a 1,000,000-vertex path → 1,000,000 stack frames → 💥 overflow
```

The **iterative** version keeps the stack on the **heap** — no such limit. Prefer it for very deep graphs.

--

## 🎬 Demo — DFS

<div class="algo-viz" data-algo="graph-dfs">
<pre class="viz-fallback">
   DFS from vertex 0: dive along tree edges (bold), mark
   each vertex visited, and BACK UP at a dead end. non-tree
   edges to already-visited vertices are skipped.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Watch DFS **dive** along tree edges and **back up** at dead ends. Visited vertices stay marked; edges to already-seen vertices are **skipped** (that's the cycle guard). The **post-order** finish times drive topological sort in Part 4.</small>

--

## DFS cost

Each vertex is visited **once**; each edge is examined **once** (twice for undirected).

```text
   total work = Θ(V + E)
```

Linear in the size of the graph — you can't do better; you must at least look at every vertex and edge.

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

## What DFS is good for

- **connectivity** — which vertices are reachable
- **cycle detection** — a back edge to an ancestor = a cycle
- **path finding** — is there a route from a to b?
- **topological sort** — via post-order (Part 4)
- **connected components** — restart DFS from each unvisited vertex

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

**Breadth-first search** visits all vertices at distance 1, then all at distance 2, and so on — expanding in **rings** from the start.

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
   0 → [1,2]   1 → [3]   2 → [3]   3 → []

   queue [0]           dist: 0→0
   pop 0 → enqueue 1,2   queue [1,2]   dist: 1→1, 2→1
   pop 1 → enqueue 3     queue [2,3]   dist: 3→2
   pop 2 → 3 seen, skip  queue [3]
   pop 3 → done
   visit order: 0 1 2 3   distances: 0 1 1 2
```

--

## Why mark on enqueue?

If you marked a vertex only when **dequeued**, two neighbors could both enqueue it → it enters the queue **twice** → re-processed, wrong distances.

Mark the instant you **enqueue** → each vertex enters the queue **once** → Θ(V + E).

--

## BFS finds shortest paths (unweighted)

Because BFS reaches vertices in **distance order**, the first time it sees a vertex is by a **fewest-edge** path:

```text
   dist[s] = 0
   dist[v] = dist[u] + 1   when v is discovered from u
```

For **unweighted** graphs, BFS = single-source shortest paths.

--

## Practice — BFS distances

```text
   0 → 1, 2      1 → 3      2 → 3, 4      3 → 5      4 → 5

   BFS from 0 — what is dist[5]?
```

<small>Layer 0: {0}. Layer 1: {1, 2}. Layer 2: {3, 4}. Layer 3: {5}. So **dist[5] = 3** — the fewest edges from 0 to 5, via 0→1→3→5 (or 0→2→4→5).</small>

--

## 🎬 Demo — BFS

<div class="algo-viz" data-algo="graph-bfs">
<pre class="viz-fallback">
   BFS from vertex 0: expand in LAYERS via a queue. each
   vertex gets a distance label = fewest edges from 0.
   tree edges (bold) form the shortest-path tree.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>BFS expands in **rings**; each vertex's label is its **distance** (fewest edges) from vertex 0. The bold **tree edges** form the shortest-path tree. Compare the exploration order with DFS's dive-and-backtrack.</small>

--

## DFS vs BFS

| | DFS | BFS |
|---|---|---|
| frontier | **stack** / recursion | **queue** |
| shape | deep, then backtrack | wide, in layers |
| finds | reachability, cycles, topo | **shortest (unweighted)** |
| memory | O(path length) | O(width) |
| cost | Θ(V+E) | Θ(V+E) |

Same cost, one data-structure apart — different questions.

--

## Same loop, different container

```text
   FRONTIER f;  f.add(start);  seen[start] = true;
   while (!f.empty()) {
       u = f.remove();                 // visit u
       for (v : adj[u])
           if (!seen[v]) { seen[v] = true; f.add(v); }
   }
```

`f` a **stack** → DFS.  `f` a **queue** → BFS.  **One algorithm.**

--

## What BFS is good for

- **shortest path** in an unweighted graph (fewest edges)
- **levels / distances** from a source (e.g. "degrees of separation")
- **is v reachable from s?** (like DFS, wider)
- **nearest** matching vertex — BFS finds the closest first

--

## BFS beyond graphs: grids

A grid or maze is an **implicit** graph — each cell is a vertex, edges to its 4 (or 8) neighbors:

```text
   . . # .        BFS from S → fewest moves to every
   S . # .        reachable cell; '#' = wall (no edge)
   . . . E
```

Same BFS code — just compute neighbors `(r±1,c), (r,c±1)` on the fly.

---

### Part 4 · Digraphs & topological sort

<small>(~30 min)</small>

--

## Directed acyclic graphs (DAGs)

A **DAG** is a directed graph with **no cycles**:

```text
   0 → 1 → 3       "must come before" relationships
   0 → 2 → 3       (no way to loop back)
```

DAGs model **dependencies**: prerequisites, build order, task scheduling.

--

## Topological order

A **topological order** lists the vertices so that **every edge points forward** (u before v for each u → v).

```text
   0 → 1 → 3,  0 → 2 → 3
   valid orders:  0 1 2 3   or   0 2 1 3
```

It's a schedule that **respects all dependencies**. Exists **iff** the graph is a DAG.

--

## Topological sort via DFS

Run DFS; record each vertex's **post-order** (finish) time; the topological order is the **reverse** of post-order.

```text
   dfs(u): ... recurse into neighbors ...
           on finishing u, push u onto a stack
   answer = pop the stack until empty (reverse post-order)
```

A vertex finishes only **after** all its descendants → it belongs **before** them.

--

## DFS post-order — worked

```text
   0→1  0→2  1→3  2→3

   dfs(0) → dfs(1) → dfs(3): 3 finishes   (post #1)
            1 finishes                     (post #2)
            dfs(2): 3 seen → 2 finishes    (post #3)
            0 finishes                     (post #4)
   post-order: 3 1 2 0
   REVERSE →   0 2 1 3   ✓ a topological order
```

--

## Strongly connected (preview)

In a **digraph**, *connected* splits into two ideas:

- **weakly connected** — connected if you ignore directions
- **strongly connected** — a directed path **both ways** between every pair

Finding strongly-connected components is another DFS application (Kosaraju / Tarjan) — beyond tonight.

--

## Topological sort via Kahn (in-degree)

An alternative, BFS-flavored:

```text
   compute in-degree of every vertex
   queue all vertices with in-degree 0
   repeat: dequeue u, output u,
           decrement in-degree of each neighbor;
           enqueue any that hit 0
```

Output order = a topological order. Leftover vertices ⇒ a **cycle**.

--

## Kahn — a worked run

```text
   0→1  0→2  1→3  2→3      in-degree: 0:0 1:1 2:1 3:2

   queue [0]                (only 0 has in-degree 0)
   out 0 → dec 1,2 → both hit 0 → queue [1,2]
   out 1 → dec 3 → 3:1
   out 2 → dec 3 → 3:0 → queue [3]
   out 3
   order: 0  1  2  3   ✓  (all 4 output → no cycle)
```

--

## Many valid orders

Independent tasks can go in **either** order:

```text
   0→1  0→2  1→3  2→3
   valid:  0 1 2 3   AND   0 2 1 3
```

1 and 2 don't depend on each other, so both orders respect every edge. Topological order is **not unique** (unless the DAG is a single chain).

--

## Practice — is it a DAG?

```text
   A → B → C → A          B → C → D
        (has A→B→C→A)          A → B, A → C

   left: a CYCLE → no topo order
   right: acyclic → e.g. A B C D
```

If Kahn can't output all vertices (or DFS finds a back edge) → **not a DAG**.

--

## 🎬 Demo — topological sort

<div class="algo-viz" data-algo="graph-topo">
<pre class="viz-fallback">
   Kahn's algorithm: repeatedly remove a vertex with
   in-degree 0 (no unmet prerequisites), output it, and
   decrement its neighbors. the output is a valid schedule.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Repeatedly take a vertex with **in-degree 0** (all prerequisites done), output it, and relax its out-edges. The emitted sequence is a **topological order** — a schedule where every edge points forward.</small>

--

## Cycle detection

A digraph has a topological order **iff** it has **no cycle**. Both methods detect cycles for free:

- **DFS** — an edge to a vertex still **on the recursion stack** = a back edge = a cycle
- **Kahn** — if fewer than V vertices are output, the rest form a cycle

--

## Kahn vs DFS post-order

| | Kahn (BFS-like) | DFS post-order |
|---|---|---|
| frontier | queue of in-degree-0 | recursion / stack |
| detects a cycle | queue empties early | finds a back edge |
| feel | "peel off ready tasks" | "finish deep, reverse" |

Both are **Θ(V + E)** and both detect cycles — pick by taste.

--

## Applications of topological sort

- **build systems** (Make, compilers) — compile in dependency order
- **course prerequisites** — a valid class schedule
- **spreadsheet** recalculation — evaluate cells in order
- **package managers** — install dependencies first
- **task scheduling** with precedence constraints

---

### Part 5 · Wrap & ICA 08

<small>(~10 min)</small>

--

## Recap — representation & search

- a graph is `(V, E)`; store it as an **adjacency list** — Θ(V + E)
- **DFS** — stack/recursion, go deep, backtrack; connectivity, cycles, topo
- **BFS** — queue, go wide in layers; **fewest-edge** shortest paths
- both are **Θ(V + E)** — one data structure apart

--

## Recap — DFS, BFS, topo

| tool | frontier | answers |
|---|---|---|
| **DFS** | stack | reachable? cycle? topo order |
| **BFS** | queue | fewest-edge shortest path |
| **topo sort** | DFS post-order / Kahn | a dependency-respecting schedule |

> DFS and BFS differ only by stack vs queue — deep vs wide — yet answer different questions.

--

## The graph toolkit

One representation, two searches, a handful of applications:

- **represent** — adjacency list, Θ(V + E)
- **explore** — DFS (deep, stack) · BFS (wide, queue)
- **shortest (unweighted)** — BFS distance labels
- **schedule / order** — topological sort (DAG only)
- **detect cycles** — DFS back edge · Kahn leftover

--

## ICA 08 — your turn

In `ica08/ica08.cpp`, on an **adjacency-list** `Graph`:

- implement **DFS** (recursive) and **BFS** (queue)
- implement **topological sort** (Kahn or DFS post-order)
- self-tests check reachability, BFS distances, a valid topo order

Build `-g`, run the self-tests, Valgrind-clean.

