// CSS 343 unified library — demos/graph.js
// Full-demo spec for the directed graph on fixed vertices 0–7 with an EDITABLE
// edge list ("u v, u v, …" pairs). DFS (with back-edge/cycle detection), BFS
// (distance labels), and topological sort, step by step. GraphRenderer.

import { Graph, GraphRenderer } from "../index.js";

export const graphDemo = {
  id: "graph",
  title: "Graph (DFS / BFS / topo-sort)",
  blurb: "Vertices 0–7 with an editable edge list (pairs \"u v\"). DFS dives (tree edges; a back edge = a cycle); BFS explores in layers (each label = fewest edges from the start); topological sort peels in-degree-0 vertices — add edge 6 2 to close a cycle and watch both searches catch it.",
  make: () => new Graph(),
  initial: "0 1, 0 2, 1 3, 1 4, 2 3, 2 4, 3 5, 4 5, 4 7, 5 6",
  buildAll: (s, keys) => s.buildTrace(keys),
  stateMsg: (g) => `directed graph — ${g.inorder()}. Edit the edge pairs, Build, then run.`,
  renderer: (c) => new GraphRenderer(c, { directed: true }),
  costs: ["visit", "compare"],
  ops: [
    { name: "DFS from", arg: "number", run: (s, v) => s.dfs(v) },
    { name: "BFS from", arg: "number", run: (s, v) => s.bfs(v) },
    { name: "Topo sort", run: (s) => s.topo() },
  ],
  width: 820, height: 340,
};
