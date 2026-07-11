---
title: "CSS 343 — Final Study Guide"
version: "1.2"
status: review
created_by: "Claude"
created_at: "2026-07-04T12:00"
last_modified_by: "Claude"
last_modified_at: "2026-07-11T22:00"
contributors:
  - "Dr. Marcel Gavriliu"
  - "Claude"
tags:
  - "css343"
  - "exam"
  - "study-guide"
related:
  - path: "./practice-final.md"
    desc: "Practice final (same blueprint as the real final, full worked key)"
  - path: "../S10-midterm/study-guide-s10.md"
    desc: "Midterm study guide (S1–S9) — the first-half companion"
  - path: "../S17-regex-automata/L17-regex-automata.md"
    desc: "S17 — regular expressions & finite automata"
---

# CSS 343 — Final Study Guide

**Session 18 (Thu Aug 20, 2026) — Review + Final Exam.** **Comprehensive**, covering **Sessions 1–17**, with emphasis on the **post-midterm** material (S11–S17): union-find & MST, greedy & Huffman, sorting & divide-and-conquer, dynamic programming, strings, and regular expressions.

> **Format:** a **Canvas quiz**, taken in class, like the midterm — **100 points, 120 minutes**, one attempt, closed book, **one page of double-sided handwritten notes** allowed. Answers are typed and auto-graded, so the conventions matter: orders and arrays **comma-separated, no spaces** (example: `1,2,3`); where a choice exists, ties break **alphabetically / in ascending order**; any question-specific determinism rule (union tie-breaking, Huffman tie-breaking) is stated inside the question. Expect: a complexity bank, tracing on given input (union-find + Kruskal, articulation points, Huffman, master theorem, LCS, knapsack, KMP + trie, hashing, a heap, Dijkstra), regexes, a DFA, and a design question. Roughly **two-thirds post-midterm**; for the first half (S1–S9), review the [midterm guide](../S10-midterm/study-guide-s10.md).
>
> **Rehearse the format:** the [practice final](./practice-final.md) has the identical structure with a full worked key — and it is also on Canvas as an **ungraded practice quiz** with unlimited attempts. Work it **cold, on paper, in 120 minutes** first, then take the Canvas version at least once so exam-day answer entry is automatic.

## 1 · Master reference table

`n` = elements/keys; `V,E` = vertices/edges; `M`,`W`,`m` = capacities/lengths; `α = n/M`.

| structure / algorithm | key op | cost | note |
|---|---|---|---|
| **BST / AVL / 2-3 / red-black** | search/ins/del | Θ(log n) balanced | AVL/2-3/RB guarantee it |
| **binary heap** | insert / delMax | Θ(log n) | build-heap Θ(n) |
| **hash table** | search | Θ(1) avg / Θ(n) worst | no order |
| **union-find** (weighted + path compr.) | union / find | ~Θ(1) amortized | α(N) < 5 |
| **DFS / BFS** | traverse | Θ(V + E) | topo sort too |
| **Dijkstra** | SSSP (nonneg) | O(E log V) | greedy + PQ |
| **Kruskal / Prim** | MST | O(E log V) | cut property |
| **Huffman** | build code | O(n log n) | optimal prefix code |
| **mergesort** | sort | Θ(n log n), stable | Θ(n) space |
| **quicksort** | sort | Θ(n log n) avg / Θ(n²) | in place |
| **quickselect** | k-th smallest | Θ(n) avg | one-sided |
| **DP** (LCS / edit dist) | 2-D table | Θ(mn) | knapsack Θ(nW) |
| **trie** | search / prefix | Θ(L) (key length) | R-way / TST |
| **KMP** | substring search | Θ(n + m) | DFA on the pattern |
| **NFA simulation** | regex match | O(mn) | m = |RE|, n = |text| |

## 2 · Key ideas — S11–S17 (post-midterm)

**S11 — Union-find & MST.** Union-find progression: quick-find → quick-union → **weighting** → **path compression** → near-constant. An **MST** connects all V vertices at min total weight (V−1 edges); the **cut property** (min crossing edge of any cut is safe) justifies both **Kruskal** (sort edges + union-find for cycle checks) and **Prim** (grow one tree via a PQ). Both O(E log V).

**S12 — Greedy & Huffman.** A **greedy** algorithm makes the locally-best choice and never reconsiders; correct iff **greedy-choice property** + **optimal substructure**, proved by an **exchange argument**. **Huffman**: repeatedly merge the two least-frequent nodes (a min-heap) → an optimal **prefix-free** code minimizing Σ freq·len. Greedy fails on 0/1 knapsack and coins {1,3,4} → DP.

**S13 — Sorting & divide-and-conquer.** D&C = divide, conquer, combine; the **master theorem** reads T(n)=a·T(n/b)+f(n). **Mergesort** (work in the merge, stable, Θ(n) space) vs **quicksort** (work in the partition, in place, Θ(n²) worst tamed by randomization). Comparison sorts need **Ω(n log n)** (decision-tree argument). **Quickselect** finds the k-th smallest in Θ(n) average.

**S14 — Dynamic programming I.** DP = recursion + remembering, for **overlapping subproblems** + **optimal substructure**. **Memoization** (top-down cache) vs **tabulation** (bottom-up table). Fibonacci (exp→linear), rod cutting, **LCS** (Θ(mn)). The recipe: **subproblem, recurrence (last decision), base cases, order, answer** (+ traceback).

**S15 — Dynamic programming II.** **0/1 knapsack** (take/skip, Θ(nW) — **pseudo-polynomial**, NP-hard), **edit distance** (insert/delete/replace, Θ(mn)), **grid** and **interval** DP (matrix-chain, optimal BST). Recover the solution by **traceback**; shrink space with a **rolling array** (losing traceback).

**S16 — Strings & tries.** A **trie** stores strings by character path → search/prefix in Θ(key length), independent of n; supports `keysWithPrefix`, `longestPrefixOf`. Substring search: **brute force** Θ(nm) worst → **KMP** Θ(n+m) (build a DFA/failure function on the pattern; never back up in the text); **Boyer-Moore** skips ahead (sublinear in practice).

**S17 — Regular expressions & automata.** A **regex** describes a language via concatenation, `|` (or), `*` (closure), `()`. An **NFA** (nondeterministic finite automaton) recognizes it; **Kleene's theorem**: regexes ↔ finite automata describe exactly the **regular languages**. Build an NFA from a RE (ε-transitions), then **simulate** by tracking the *set* of reachable states — O(mn).

## 3 · Cross-cutting themes

- **The three design paradigms:** greedy (one safe choice) · divide-and-conquer (independent subproblems) · dynamic programming (overlapping subproblems). Try greedy first; fall back to DP.
- **The heap recurs:** heapsort (S6), Dijkstra (S9), Prim (S11), Huffman (S12).
- **Reuse over reinvention:** Kruskal = union-find + sort; Prim/Dijkstra = the heap; Huffman = the heap; KMP = a DFA. New algorithms from familiar structures.
- **Optimal substructure** links shortest paths (S9), greedy (S12), and DP (S14–15).
- **Choosing a structure** = choosing which queries are cheap (hash vs tree; sort vs select; trie vs hash for prefixes).

## 4 · Common pitfalls (post-midterm)

- **build-heap is Θ(n)**, not Θ(n log n) (still true on the final).
- **Dijkstra needs nonnegative weights**; negatives → Bellman-Ford.
- **quicksort worst case Θ(n²)** on sorted input with a bad pivot → randomize.
- **0/1 knapsack Θ(nW) is pseudo-polynomial** (W is a value, not a size) — it's NP-hard.
- **DP traceback needs the full table**; the rolling-array space trick gives only the value.
- **KMP never backs up in the text** — the failure function shifts the pattern, not i.
- **Greedy needs a proof** (exchange argument) or a counterexample — never assume.
- **union-find without weighting/compression** degrades to Θ(n) per op.

## 5 · Practice questions (S11–S17)

1. **Union-find.** On elements 1..6, run weighted quick-union on `union(1,2), union(3,4), union(2,4), union(5,6)`. How many components remain, and what is the tallest tree's height? Why does path compression not change the *answer*, only the *speed*?
2. **MST.** On a small weighted graph, run Kruskal and Prim. Do they always produce the same tree? The same total weight? When can the trees differ?
3. **Cut property.** State it, and use an exchange argument to explain why Kruskal never adds a cycle-closing edge.
4. **Greedy vs DP.** For each, say greedy or DP and why: (a) fractional knapsack, (b) 0/1 knapsack, (c) making change with US coins, (d) making change with {1,3,4}.
5. **Huffman.** Build the Huffman tree for frequencies `a:5 b:2 c:1 d:1`. Give each code and the weighted total bits. Which symbol gets the shortest code?
6. **Master theorem.** Solve: (a) `T(n)=2T(n/2)+Θ(n)`, (b) `T(n)=T(n/2)+Θ(1)`, (c) `T(n)=4T(n/2)+Θ(n)`, (d) `T(n)=T(n-1)+Θ(n)`.
7. **Sorting.** Which sort is stable? Which is in place? Which has a Θ(n²) worst case, and on what input? Why is the comparison lower bound Ω(n log n)?
8. **Quickselect.** Trace quickselect for the median of `[7,2,9,4,1,6,3]`. How many partitions? Why is the average cost Θ(n), not Θ(n log n)?
9. **DP — LCS.** Fill the LCS table for `A="ABCB"`, `B="BDCB"`. Give the length and one LCS. What are the three cells each interior cell reads?
10. **DP — knapsack.** Items (value, weight) `(3,2),(4,3),(5,4)`, W=6. Give the optimal value and the items taken. Why can't greedy-by-ratio be trusted here?
11. **DP — edit distance.** Compute `edit("cat","cart")` and give the edit script. Why is edit distance a metric?
12. **Strings.** For pattern `"AABAA"`, give the KMP failure function (one value per position). After matching the first 4 pattern chars, a mismatch occurs at index 4 — to what value does the failure function reset j (i.e., f[3])? Why does this beat brute force?
13. **Trie.** Insert `{bat, bath, bad, bed}` into a trie. How many nodes (not counting the root)? What does `longestPrefixOf("bathing")` return? Why is trie search independent of the number of keys?
14. **Regex/NFA.** Give three strings matched by `(A|B)*C` and two that aren't. Sketch the NFA. Why does NFA *simulation* track a *set* of states?
15. **Choose a structure.** Best structure for: (a) autocomplete on a prefix, (b) cheapest network wiring, (c) fewest coins for an odd denomination set, (d) the 90th-percentile latency, (e) "have I seen this URL?".

---

## Change Log

| Version | Date | Author | Summary |
| ------- | ---------------- | ------ | ------------- |
| 1.2 | 2026-07-11T22:00 | Claude | Final is a Canvas quiz like the midterm: 100 pts / 120 min (was 110/140); merge-step question cut in the resize; pointed students at the ungraded Canvas practice quiz. |
| 1.1 | 2026-07-11T20:00 | Claude | Format finalized to match the built exam kit (110 pts, 140 min, closed book + 1 note page, comma/alphabetical conventions, in-question determinism rules, ~2/3 post-midterm); pointed students at the practice final ("work it cold, under time"). Practice-question precision: union-find universe pinned to 1..6, KMP reset phrased as f[3], trie count excludes the root — matching the practice-final conventions. |
| 1.0 | 2026-07-05T13:00 | Claude | Fleshed out from scaffold: master table (S1–S17), post-midterm key ideas (S11–S17), cross-cutting themes, pitfalls, and 15 practice questions. Format left to the instructor; first-half detail deferred to the midterm guide. |
| 0.1 | 2026-07-04T12:00 | Claude | Scaffold: covered-topics list (S1–S17) from schedule, format + TODO placeholders. |
