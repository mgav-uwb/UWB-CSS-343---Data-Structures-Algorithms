// CSS 343 unified library — demos/mst.js
// Full-demo specs for Kruskal and Prim minimum spanning tree on the sample
// weighted graph — TREATED AS UNDIRECTED (MST is defined on undirected graphs).

import { WeightedGraph, GraphRenderer } from "../index.js";

export const kruskalDemo = {
  id: "kruskal",
  title: "Kruskal (minimum spanning tree)",
  blurb: "Weighted undirected graph. Sort all edges by weight, then add each one unless it would connect two vertices already in the same union-find component (a cycle) — stop after V-1 edges.",
  make: () => new WeightedGraph(),
  initial: "",
  stateMsg: (g) => `weighted graph (undirected) — ${g.inorder()}. Run Kruskal's MST.`,
  renderer: (c) => new GraphRenderer(c, { directed: false }),
  costs: ["compare"],
  ops: [{ name: "Kruskal", run: (s) => s.kruskal() }],
  width: 820, height: 340,
};

export const primDemo = {
  id: "prim",
  title: "Prim (minimum spanning tree)",
  blurb: "Weighted undirected graph. Grow a tree from vertex 0: repeatedly scan for the minimum-weight edge crossing from the tree to an outside vertex and add it, until every vertex is in the tree.",
  make: () => new WeightedGraph(),
  initial: "",
  stateMsg: (g) => `weighted graph (undirected) — ${g.inorder()}. Run Prim's MST from vertex 0.`,
  renderer: (c) => new GraphRenderer(c, { directed: false }),
  costs: ["compare", "visit"],
  ops: [{ name: "Prim (from 0)", run: (s) => s.prim(0) }],
  width: 820, height: 340,
};
