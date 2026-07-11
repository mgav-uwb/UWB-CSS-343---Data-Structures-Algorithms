---
title: "CSS 343 — Midterm Study Guide"
version: "1.2"
status: draft
created_by: "Claude"
created_at: "2026-07-04T12:00"
last_modified_by: "Claude"
last_modified_at: "2026-07-11T21:00"
contributors:
  - "Dr. Marcel Gavriliu"
  - "Claude"
tags:
  - "css343"
  - "exam"
  - "study-guide"
related:
  - path: "./practice-midterm.md"
    desc: "Practice midterm (same blueprint, worked key; also an ungraded Canvas quiz)"
  - path: "../S01-time-analysis/L01-time-analysis.md"
    desc: "S1 — analysis of algorithms (time)"
  - path: "../S09-graphs-dijkstra/L09-graphs-dijkstra.md"
    desc: "S9 — Dijkstra shortest paths"
---

# CSS 343 — Midterm Study Guide

**Session 10 (Thu Jul 23, 2026) — Review + Midterm Exam.** Covers **Sessions 1–9**: analysis of algorithms, trees (BST / AVL / 2-3 / B), heaps, hashing, and graphs (DFS/BFS/topo/Dijkstra).

> **Format:** a **Canvas quiz**, taken in class — 100 points, **120 minutes**, one attempt, closed book, **one page of double-sided handwritten notes** allowed. Answers are typed and auto-graded, so the format conventions matter: orders and arrays are entered **comma-separated, no spaces** (example: `1,2,3`), and whenever a choice exists, ties break **alphabetically / in ascending order** — the same conventions as the ICAs. Expect: complexity bounds, tracing algorithms on given input (recursion, heap, BFS/DFS/topo, Dijkstra, hashing, BST/AVL, 2-3), and short concept questions.
>
> **Rehearse the format:** the [practice midterm](./practice-midterm.md) has the identical structure with a full worked key — and it is also on Canvas as an **ungraded practice quiz** with unlimited attempts. Take the Canvas version at least once so exam-day answer entry is automatic.

## 1 · The master reference table

Cost of the core operations. `n` = number of keys/elements; `V, E` = vertices, edges; `M` = hash-table size; `α = n/M`.

| structure / algorithm | search / key op | insert | delete | space | ordered? |
|---|---|---|---|---|---|
| unsorted array / list | Θ(n) | Θ(1) | Θ(n) | Θ(n) | no |
| sorted array | Θ(log n) | Θ(n) | Θ(n) | Θ(n) | yes |
| **BST** (avg / worst) | Θ(log n) / Θ(n) | Θ(log n) / Θ(n) | Θ(log n) / Θ(n) | Θ(n) | yes |
| **AVL** | **Θ(log n)** | Θ(log n) | Θ(log n) | Θ(n) | yes |
| **2-3 / B-tree** | **Θ(log n)** | Θ(log n) | Θ(log n) | Θ(n) | yes |
| **red-black** | **Θ(log n)** | Θ(log n) | Θ(log n) | Θ(n) | yes |
| **binary heap** | max/min Θ(1) | Θ(log n) | delMax Θ(log n) | Θ(n) | partial |
| **hash table** (avg / worst) | **Θ(1)** / Θ(n) | Θ(1) / Θ(n) | Θ(1) / Θ(n) | Θ(n) | **no** |

| algorithm | cost | note |
|---|---|---|
| **heapsort** | Θ(n log n), in place | not stable |
| **build-heap** (heapify) | **Θ(n)** | not n·log n |
| **DFS / BFS** | Θ(V + E) | adjacency list |
| **topological sort** | Θ(V + E) | DAG only |
| **Dijkstra** (heap / array) | O(E log V) / O(V²) | nonnegative weights |

## 2 · Key ideas by session

**S1 — Time analysis.** Count a basic operation as a function of input size; drop lower-order terms (tilde ~) and constants (order of growth). The **doubling ratio** 2^b reveals the exponent b empirically. 3-sum: brute Θ(n³) → sort+search Θ(n² log n).

**S2 — Space & asymptotic notation.** Space = a function of n too (array Θ(n), matrix Θ(n²)). **O** = upper bound, **Ω** = lower bound, **Θ** = tight (both). Best/avg/worst **case** ≠ O/Ω/Θ **bound** — a bound applies to a case. A bound is a property of an *algorithm* (or a problem).

**S3 — Trees & BST.** BST order: left < node < right. Search/insert cost = **tree height**. A random BST has height ~1.39 log n; a sorted-input BST degenerates to a Θ(n) path. Hibbard deletion (replace with successor). Traversals: in-order = sorted.

**S4 — AVL.** Height-balanced BST (child heights differ ≤ 1) → height ≤ 1.44 log n. Insert may unbalance → fix with **rotations**: LL/RR = single, LR/RL = double. Rotation is O(1); insert stays Θ(log n).

**S5 — 2-3, B & red-black.** 2-3 tree: 2- and 3-nodes; insert by **split-and-promote**; grows at the **root** → perfect balance, **no rotations**. Red-black = a 2-3 tree encoded as a BST + one color bit. B-tree: wide nodes = disk blocks → log_M n, for databases/filesystems.

**S6 — Heaps & PQ.** Complete binary tree in an array (1-indexed: parent k/2, children 2k, 2k+1), heap-ordered (parent ≥ children). insert = append + **swim**; delMax = swap root/last + **sink**; both Θ(log n). **build-heap is Θ(n)** (sink bottom-up). Heapsort = heapify + repeated delMax, in place.

**S7 — Hashing.** Array + hash function h(key)→[0,M). Collisions are unavoidable — resolve by **separate chaining** (list per slot) or **open addressing** (linear/quadratic/double probing). Keep the **load factor** α bounded (resize by doubling) → amortized O(1). Trades **order** for speed.

**S8 — Graphs I.** Store as an **adjacency list** (Θ(V+E)). **DFS** (stack/recursion) — reachability, cycles, topo. **BFS** (queue) — **fewest-edge** shortest paths. Both Θ(V+E), differing only by the frontier container. **Topological sort** (Kahn / DFS post-order) exists iff the graph is a DAG.

**S9 — Dijkstra.** Weighted shortest paths via **edge relaxation** + a greedy rule: settle the nearest unsettled vertex, relax its edges. A **priority queue** gives O(E log V). Correct only for **nonnegative** weights (else Bellman-Ford). Dijkstra = BFS with a priority queue.

## 3 · Common pitfalls

- **O vs Θ:** "the running time is O(n²)" only bounds it above; it may be faster. Use Θ for the exact growth.
- **build-heap is Θ(n), not Θ(n log n)** — a favorite exam trap.
- **BST worst case is Θ(n)** (sorted input); balanced trees (AVL/2-3/RB) fix this to Θ(log n).
- **Hashing has no order** — no min/max/floor/range/in-order iteration. Need those? Use a balanced tree.
- **Open-addressing delete** can't just blank a slot (breaks probe chains) — tombstone or re-insert the cluster.
- **BFS shortest path only counts edges** — weighted graphs need Dijkstra.
- **Dijkstra breaks on negative weights** — the greedy "settle nearest is final" argument fails.
- **Mark BFS vertices on enqueue**, not dequeue, or they enter the queue twice.

## 4 · Practice questions

1. **Growth.** Rank by order of growth: `n log n`, `2ⁿ`, `n²`, `log n`, `n`. Which two are hardest to distinguish with a doubling test at small n?
2. **Cases vs bounds.** Give the best-, average-, and worst-case cost of *search* in (a) an unsorted array, (b) a BST, (c) a hash table. Which of these has a Θ(1) best case but Θ(n) worst case?
3. **BST → AVL.** Insert `10, 20, 30, 40, 50` into (a) a plain BST and (b) an AVL tree. Give the height of each. Which AVL rotation(s) fire?
4. **2-3 insert.** Insert `50, 30, 70, 10, 20` into an empty 2-3 tree, drawing it after each split. What is the final height?
5. **Heap.** Draw the array after inserting `30, 90, 20, 70, 95` into a max-heap one at a time. Then perform one `delMax` and show the result. Is `[95, 90, 70, 30, 20]` a valid max-heap?
6. **Build-heap.** Why is heapifying `n` keys bottom-up Θ(n) rather than Θ(n log n)? (One sentence about where most nodes are.)
7. **Hashing.** Insert `23, 14, 9, 36` into a linear-probing table with `M = 11`, `h(k) = k mod 11`. Which keys collide, and where does each land? What is the load factor afterward?
8. **Chaining vs probing.** State one advantage of separate chaining over open addressing, and one advantage of the reverse.
9. **DFS/BFS.** On the DAG `0→1, 0→2, 1→3, 2→3, 2→4, 3→5, 4→5`, give the DFS visit order and the BFS visit order from 0, and the BFS distance to vertex 5.
10. **Topo sort.** Give a valid topological order of the graph in Q9. Then add the edge `5→0`; does a topological order still exist? Why?
11. **Dijkstra.** On edges `0→1(2), 0→2(5), 1→2(1), 2→3(3)`, run Dijkstra from 0. Give `dist[]`. Which vertex's tentative distance improves before it settles?
12. **Choose a structure.** For each need, name the best structure and justify in one phrase: (a) O(1) membership test on 10⁶ URLs; (b) always retrieve the highest-priority task; (c) range query "all keys in [50, 80]"; (d) shortest driving route with distances.

---

## Change Log

| Version | Date | Author | Summary |
| ------- | ---------------- | ------ | ------------- |
| 1.2 | 2026-07-11T21:00 | Claude | Exam duration set to 120 minutes (was 105); QTIs regenerated to match. |
| 1.1 | 2026-07-10T14:00 | Claude | Format finalized: in-class Canvas quiz (100 pts, 105 min, 1 attempt, closed book + 1 notes page, auto-graded with the comma/alphabetical conventions); pointed students at the practice midterm md + ungraded Canvas practice quiz. |
| 1.0 | 2026-07-05T12:00 | Claude | Fleshed out from scaffold: master complexity table, per-session key ideas (S1–S9), common pitfalls, and 12 practice questions. Format details left to the instructor. |
| 0.1 | 2026-07-04T12:00 | Claude | Scaffold: covered-topics list (S1–S9) from schedule, format + TODO placeholders. |
