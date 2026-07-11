// CSS 343 unified library — demos/mst.js
// Full-demo specs for Kruskal and Prim minimum spanning tree: fixed vertices
// 0–7 with an EDITABLE undirected weighted edge list (triples "u v w").

import { WeightedGraph, GraphRenderer } from "../index.js";

const INITIAL = "0 1 4, 0 2 2, 2 1 1, 1 3 5, 2 3 8, 2 4 10, 3 4 2, 3 5 6, 4 5 3, 5 6 1, 4 7 7";
const base = {
  make: () => new WeightedGraph({ directed: false }),
  initial: INITIAL,
  buildAll: (s, keys) => s.buildTrace(keys),
  stateMsg: (g) => `weighted graph (undirected) — ${g.inorder()}. Edit the "u v w" triples, Build, then run.`,
  renderer: (c) => new GraphRenderer(c, { directed: false }),
  width: 820, height: 340,
};

export const kruskalDemo = {
  ...base,
  id: "kruskal",
  title: "Kruskal (minimum spanning tree)",
  blurb: "Weighted undirected graph on vertices 0–7 with an editable edge list (triples \"u v w\"). Sort all edges by weight, then add each one unless it would connect two vertices already in the same union-find component (a cycle) — stop after V-1 edges.",
  costs: ["compare"],
  ops: [{ name: "Kruskal", run: (s) => s.kruskal() }],
};

export const primDemo = {
  ...base,
  id: "prim",
  title: "Prim (minimum spanning tree)",
  blurb: "Weighted undirected graph on vertices 0–7 with an editable edge list (triples \"u v w\"). Grow a tree from any start: repeatedly add the minimum-weight edge crossing from the tree to an outside vertex, until every vertex is in the tree.",
  costs: ["compare", "visit"],
  ops: [{ name: "Prim from", arg: "number", run: (s, v) => s.prim(v) }],
};
