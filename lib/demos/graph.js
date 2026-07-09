// CSS 343 unified library — demos/graph.js
// Full-demo spec for the sample directed graph: DFS, BFS, and topological sort,
// each step by step with node/edge highlights. Rendered with GraphRenderer.

import { Graph, GraphRenderer } from "../index.js";

export const graphDemo = {
  id: "graph",
  title: "Graph (DFS / BFS / topo-sort)",
  blurb: "A directed acyclic graph. DFS goes deep (tree edges vs already-visited); BFS explores in layers (each label = fewest edges from the source); topological sort repeatedly outputs an in-degree-0 vertex.",
  make: () => new Graph(),
  initial: "",
  stateMsg: (g) => `sample DAG — ${g.inorder()}. Run DFS / BFS (from vertex 0) or a topological sort.`,
  renderer: (c) => new GraphRenderer(c, { directed: true }),
  costs: ["visit", "compare"],
  ops: [
    { name: "DFS", run: (s) => s.dfs(0) },
    { name: "BFS", run: (s) => s.bfs(0) },
    { name: "Topological sort", run: (s) => s.topo() },
  ],
  width: 820, height: 340,
};
