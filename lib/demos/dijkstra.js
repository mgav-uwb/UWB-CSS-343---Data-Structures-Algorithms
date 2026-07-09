// CSS 343 unified library — demos/dijkstra.js
// Full-demo spec for Dijkstra shortest paths on the sample weighted digraph.

import { WeightedGraph, GraphRenderer } from "../index.js";

export const dijkstraDemo = {
  id: "dijkstra",
  title: "Dijkstra (shortest paths)",
  blurb: "Weighted digraph, nonnegative weights. Repeatedly settle the nearest unsettled vertex and relax its outgoing edges — labels become shortest-path distances and the accent edges form the shortest-paths tree.",
  make: () => new WeightedGraph(),
  initial: "",
  stateMsg: (g) => `weighted digraph — ${g.inorder()}. Run Dijkstra from vertex 0.`,
  renderer: (c) => new GraphRenderer(c, { directed: true }),
  costs: ["visit", "compare"],
  ops: [{ name: "Dijkstra (from 0)", run: (s) => s.dijkstra(0) }],
  width: 820, height: 340,
};
