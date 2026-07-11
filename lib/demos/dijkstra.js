// CSS 343 unified library — demos/dijkstra.js
// Full-demo spec for Dijkstra shortest paths: fixed vertices 0–7 with an
// EDITABLE weighted edge list (triples "u v w"). After every run the trace
// re-checks all edges — append a negative edge (e.g. "7 1 -20") and watch the
// greedy guarantee break in red.

import { WeightedGraph, GraphRenderer } from "../index.js";

export const dijkstraDemo = {
  id: "dijkstra",
  title: "Dijkstra (shortest paths)",
  blurb: "Weighted digraph on vertices 0–7 with an editable edge list (triples \"u v w\"). Repeatedly settle the nearest unsettled vertex and relax its outgoing edges — labels become shortest-path distances and the accent edges form the shortest-paths tree. Append \"7 1 -20\" to see a negative weight break the greedy guarantee (flagged in red by the final edge re-check).",
  make: () => new WeightedGraph(),
  initial: "0 1 4, 0 2 2, 2 1 1, 1 3 5, 2 3 8, 2 4 10, 3 4 2, 3 5 6, 4 5 3, 5 6 1, 4 7 7",
  buildAll: (s, keys) => s.buildTrace(keys),
  initialPlaceholder: "u v w, … or RAND:8:12:W",
  initialTitle: "weighted edge triples, or a generator with the W flag: PATH:n:W / RING:n:W / STAR:n:W / COMPLETE:n:W / RAND:n:m:W (n ≤ 8)",
  stateMsg: (g) => `weighted digraph — ${g.inorder()}. Edit the "u v w" triples (or a generator like RAND:8:12:W), Build, then run.`,
  renderer: (c) => new GraphRenderer(c, { directed: true }),
  costs: ["visit", "compare"],
  ops: [{ name: "Dijkstra from", arg: "number", run: (s, v) => s.dijkstra(v) }],
  width: 820, height: 340,
};
