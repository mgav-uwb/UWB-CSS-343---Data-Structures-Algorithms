// CSS 343 unified library — demos/registry.js
// Registry of full-demo specs, keyed by ?ds= slug. Add one import + one entry
// per structure as it is ported onto the core (bst, heap, hashing, graph, …).

import { avlDemo } from "./avl.js";
import { bstVsAvlDemo, fibRaceDemo, hashDeleteRaceDemo, lomutoHoareRaceDemo, probeRaceDemo, rodcutRaceDemo, searchRaceDemo, sortRaceDemo } from "./compare.js";
import { bstDemo } from "./bst.js";
import { twoThreeDemo } from "./two-three.js";
import { btreeDemo } from "./btree.js";
import { redblackDemo } from "./redblack.js";
import { heapDemo, minHeapDemo } from "./heap.js";
import { huffmanDemo, huffmanCodecDemo } from "./huffman.js";
import { adaptiveHuffmanDemo } from "./adaptive-huffman.js";
import { chainingDemo, chainResizeDemo, doubleDemo, hashingDemo, quadDemo } from "./hashing.js";
import { hashPitfallsDemo } from "./hash-pitfalls.js";
import { graphDemo } from "./graph.js";
import { unionFindDemo } from "./unionfind.js";
import { dijkstraDemo } from "./dijkstra.js";
import { kruskalDemo, primDemo } from "./mst.js";
import { mergesortDemo, quicksortDemo, quickselectDemo } from "./sorting.js";
import { recurrenceDemo } from "./recurrence.js";
import { fibDemo, rodcutDemo, rodcutTreeDemo, gridDpDemo, lcsDemo, lcsTreeDemo, knapsackDemo, editDistanceDemo } from "./dp.js";
import { nfaBuildDemo, nfaSimDemo, dfaDemo } from "./nfa.js";
import { trieDemo } from "./trie.js";
import { tstDemo } from "./tst.js";
import { stringSearchDemo, kmpFailDemo } from "./string-search.js";

export const DEMOS = {
  bst: bstDemo,
  avl: avlDemo,
  "bst-vs-avl": bstVsAvlDemo,
  "two-three": twoThreeDemo,
  btree: btreeDemo,
  redblack: redblackDemo,
  heap: heapDemo,
  "min-heap": minHeapDemo,
  huffman: huffmanDemo,
  "huffman-codec": huffmanCodecDemo,
  "adaptive-huffman": adaptiveHuffmanDemo,
  "hash-lp": hashingDemo,
  "hash-quad": quadDemo,
  "hash-double": doubleDemo,
  "hash-chain": chainingDemo,
  "hash-chain-resize": chainResizeDemo,
  "hash-delete-race": hashDeleteRaceDemo,
  "hash-race": hashDeleteRaceDemo, // legacy slug — old links land on the delete story
  "probe-race": probeRaceDemo,
  "probe-delete-pitfalls": hashPitfallsDemo,
  graph: graphDemo,
  "search-race": searchRaceDemo,
  dijkstra: dijkstraDemo,
  "union-find": unionFindDemo,
  kruskal: kruskalDemo,
  prim: primDemo,
  recurrence: recurrenceDemo,
  mergesort: mergesortDemo,
  quicksort: quicksortDemo,
  quickselect: quickselectDemo,
  "sort-race": sortRaceDemo,
  "lomuto-vs-hoare": lomutoHoareRaceDemo,
  fib: fibDemo,
  "fib-race": fibRaceDemo,
  rodcut: rodcutDemo,
  "rodcut-tree": rodcutTreeDemo,
  "rodcut-race": rodcutRaceDemo,
  lcs: lcsDemo,
  "lcs-tree": lcsTreeDemo,
  "grid-dp": gridDpDemo,
  knapsack: knapsackDemo,
  "edit-distance": editDistanceDemo,
  dfa: dfaDemo,
  "nfa-build": nfaBuildDemo,
  "nfa-sim": nfaSimDemo,
  trie: trieDemo,
  tst: tstDemo,
  "string-search": stringSearchDemo,
  "kmp-fail": kmpFailDemo,
};

export const DEMO_LIST = [...new Set(Object.values(DEMOS))]; // Set: alias slugs share one spec — list it once
