// CSS 343 unified library — demos/unionfind.js
// Full-demo spec for weighted quick-union with path compression: parent[]
// is drawn as a DISPLAY array (cell i shows parent[i]; a root is a cell where
// parent[i] === i). Union links the smaller tree under the larger by size;
// find flattens every element on its path onto the root. Drawn with the
// shared ArrayRenderer.

import { UnionFind, ArrayRenderer } from "../index.js";

export const unionFindDemo = {
  id: "union-find",
  title: "Union-Find (weighted quick-union + path compression)",
  blurb: "Each cell holds its element's parent; roots point to themselves. Union links the smaller tree under the larger by size; find flattens the path it walks onto the root.",
  make: () => new UnionFind(),
  initial: "10",
  renderer: (c) => new ArrayRenderer(c, { mode: "cells" }),
  costs: ["read", "write", "compare"],
  ops: [
    { name: "Union", arg: "pair", run: (s, v) => s.union(v[0], v[1]) },
    { name: "Find", arg: "number", run: (s, v) => s.find(v) },
    { name: "Connected?", arg: "pair", ghost: true, run: (s, v) => s.connected(v[0], v[1]) },
  ],
};
