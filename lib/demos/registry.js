// CSS 343 unified library — demos/registry.js
// Registry of full-demo specs, keyed by ?ds= slug. Add one import + one entry
// per structure as it is ported onto the core (bst, heap, hashing, graph, …).

import { avlDemo } from "./avl.js";
import { bstDemo } from "./bst.js";
import { twoThreeDemo } from "./two-three.js";
import { btreeDemo } from "./btree.js";
import { redblackDemo } from "./redblack.js";
import { heapDemo } from "./heap.js";
import { huffmanDemo } from "./huffman.js";
import { hashingDemo } from "./hashing.js";
import { graphDemo } from "./graph.js";
import { unionFindDemo } from "./unionfind.js";
import { dijkstraDemo } from "./dijkstra.js";
import { kruskalDemo, primDemo } from "./mst.js";
import { mergesortDemo, quicksortDemo, quickselectDemo } from "./sorting.js";
import { lcsDemo, knapsackDemo, editDistanceDemo } from "./dp.js";
import { nfaBuildDemo, nfaSimDemo } from "./nfa.js";
import { trieDemo } from "./trie.js";
import { stringSearchDemo } from "./string-search.js";

export const DEMOS = {
  bst: bstDemo,
  avl: avlDemo,
  "two-three": twoThreeDemo,
  btree: btreeDemo,
  redblack: redblackDemo,
  heap: heapDemo,
  huffman: huffmanDemo,
  "hash-lp": hashingDemo,
  graph: graphDemo,
  dijkstra: dijkstraDemo,
  "union-find": unionFindDemo,
  kruskal: kruskalDemo,
  prim: primDemo,
  mergesort: mergesortDemo,
  quicksort: quicksortDemo,
  quickselect: quickselectDemo,
  lcs: lcsDemo,
  knapsack: knapsackDemo,
  "edit-distance": editDistanceDemo,
  "nfa-build": nfaBuildDemo,
  "nfa-sim": nfaSimDemo,
  trie: trieDemo,
  "string-search": stringSearchDemo,
};

export const DEMO_LIST = Object.values(DEMOS);
