// CSS 343 unified library — demos/graph.js
// Full-demo spec for the directed graph on fixed vertices 0–7 with an EDITABLE
// edge list ("u v, u v, …" pairs). DFS (with back-edge/cycle detection), BFS
// (distance labels), and topological sort, step by step. GraphRenderer.

import { ArrayRenderer, Graph, GraphRenderer } from "../index.js";

// second-canvas adapter: the traversal's CONTAINER (BFS queue / DFS recursion
// stack / Kahn ready set), carried in each frame's snapshot.frontier
const frontierView = (inner) => ({
  draw: (snap) => inner.draw(snap?.frontier?.items ?? [], {}),
});

export const graphDemo = {
  id: "graph",
  title: "Graph (DFS / BFS / topo-sort)",
  blurb: "Vertices 0–7 with an editable edge list (pairs \"u v\") — or a generator: PATH:8, RING:8 (a cycle — topo sort reports it), STAR:8, COMPLETE:5, RAND:8:12. DFS dives (tree edges; a back edge = a cycle); BFS explores in layers (each label = fewest edges from the start); topological sort peels in-degree-0 vertices. The second row shows each search's hidden container — the QUEUE that makes BFS breadth-first, the recursion STACK that makes DFS depth-first, and Kahn's ready set.",
  make: () => new Graph(),
  initial: "0 1, 0 2, 1 3, 1 4, 2 3, 2 4, 3 5, 4 5, 4 7, 5 6",
  buildAll: (s, keys) => s.buildTrace(keys),
  proto: "graph",
  labels: ["the graph", "the frontier — BFS: the queue · DFS: the recursion stack · topo: the in-degree-0 ready set"],
  initialPlaceholder: "u v, u v, … or RING:8",
  initialTitle: "edge pairs, or a generator: PATH:n / RING:n / STAR:n / COMPLETE:n / RAND:n:m (n ≤ 8)",
  stateMsg: (g) => `directed graph — ${g.inorder()}. Edit the edge pairs (or type a generator like RING:8), Build, then run.`,
  renderer: [
    (c) => new GraphRenderer(c, { directed: true }),
    (c) => frontierView(new ArrayRenderer(c, { mode: "cells", pointers: false })),
  ],
  costs: ["visit", "compare"],
  ops: [
    { name: "DFS from", arg: "number", run: (s, v) => s.dfs(v) },
    { name: "BFS from", arg: "number", run: (s, v) => s.bfs(v) },
    { name: "Topo sort", run: (s) => s.topo() },
  ],
  width: 820, height: [300, 56],
};
