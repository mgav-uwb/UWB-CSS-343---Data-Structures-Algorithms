# CSS 343 — Practice Midterm (Summer 2026)

**100 points · 105 minutes · Session 10.** Closed book. One page of double-sided hand-written notes allowed. No devices other than the Canvas exam page. Where an order is requested, write the items **separated by commas, no spaces** (example: `1,2,3`). Whenever a choice exists (which neighbor to visit first, which zero-in-degree vertex to take), use **alphabetical / ascending** order.

*This practice exam has the same structure, length, and rules as the real midterm — the real one differs only in the data. A full answer key is at the end; do it cold, on paper, in 105 minutes, before you look.*

## Q1 — Recursion trace (10 pts)

A `BinTree` class has the member functions:

```cpp
int BinTree::play() const { return helper(root, 0); }

int BinTree::helper(Node* cur, int n) const {
    if (cur == nullptr) return n;
    if (cur->left != nullptr || cur->right != nullptr)
        return 1 + helper(cur->left, n + 1) + helper(cur->right, n + 3);
    return 0;                       // a leaf
}
```

The tree `TR` (drawn with the `Root:`/`L---`/`R---` convention from the PAs):

```text
Root: A
    L--- B
        L--- D
        R--- E
            R--- G
    R--- C
        R--- F
```

Trace `TR.play()` with the box-tracing method. **(a)** Show the expansion of every call on an internal node (6 pts). **(b)** What does `helper` return for the root's LEFT child's call (2 pts)? **(c)** What does `TR.play()` return (2 pts)?

## Q2 — Tight complexity bounds (10 pts)

Give the tight bound for each, chosen from: O(1) · O(log n) · O(n) · O(n log n) · O(n + e) · O((n + e) log n) · O(n²).

1. Find the smallest value in a binary MIN-heap of n nodes = ______

2. Build a binary heap from n items that arrive ONE AT A TIME (repeated insert) = ______

3. Topological sort (Kahn's algorithm) of a DAG with n vertices and e edges = ______

4. Expected cost of a SEARCH HIT in a linear-probing hash table kept at load factor α ≤ 1/2 = ______

5. Worst-case search in an AVL tree of n keys = ______

6. Dijkstra's algorithm with a binary-heap priority queue (n vertices, e edges) = ______

## Q3 — Binary min-heap (16 pts)

Build a binary **min-heap** with the **O(n) bottom-up algorithm** (load the array, then sink the internal nodes from n/2 down to 1) from:

**11, 7, 9, 13, 8, 5, 15, 3, 6**

**(a)** the heap as an array (1-indexed, root first) (4 pts). Then **remove the minimum three times**, showing the array after **(b)** the first, **(c)** the second, and **(d)** the third removal (4 pts each).

## Q4 — Graph traversals (16 pts)

The adjacency matrix of a **directed, unweighted** graph (a 1 = an edge row → column):

| | **A** | **B** | **C** | **D** | **E** | **F** |
|---|---|---|---|---|---|---|
| **A** |   | 1 |   |   | 1 |   |
| **B** |   |   | 1 |   |   |   |
| **C** |   |   |   |   |   | 1 |
| **D** | 1 | 1 |   |   |   |   |
| **E** |   |   |   |   |   | 1 |
| **F** |   |   |   |   |   |   |

**(a)** BFS order from **D** (4 pts). **(b)** DFS **preorder** from **D** (4 pts). **(c)** DFS **postorder** from **D** (4 pts). **(d)** A topological order via **Kahn's algorithm** (repeatedly remove a zero-in-degree vertex; ties alphabetically) (4 pts).

## Q5 — Dijkstra (14 pts)

A **directed, weighted** graph on vertices A, B, C, D, E, F, G, H with edges (weight in parentheses):

> G→C (1) · G→H (9) · C→B (4) · C→A (2) · A→D (1) · A→E (5) · D→H (4) · H→F (3) · E→G (3) · B→G (9) · F→E (7) · D→G (2)

Run Dijkstra from source **G**. For **every other vertex**, give the shortest **path** (source to target, comma-separated) and its **distance** (1 pt per cell).

## Q6 — Linear-probing hash table (10 pts)

An open-addressing table has **M = 11** slots (indices 0..10), hash h(k) = k mod 11, linear probing, no resize.

Insert, in order: **22, 11, 7, 5, 33, 44, 18, 29**

**(a)** Show the final table as slots 0..10, using `_` for empty (4 pts). **(b)** How many OCCUPIED slots does inserting **18** probe past before it lands (2 pts)? And **29** (1 pt)? **(c)** `search(51)`: how many slots are inspected before the search reports a MISS (2 pts)? **(d)** Under the resize-at-α ≥ ½ policy from ICA 07, after which insertion (count from the start) would this table have doubled (1 pt)?

## Q7 — Measurement & asymptotics (8 pts)

**(a)** A doubling experiment on a function produced:

| N | time (ms) |
|---|---|
| 1000 | 3 |
| 2000 | 12 |
| 4000 | 48 |
| 8000 | 193 |

What is the observed order of growth, and why (one sentence)? (4 pts)

**(b)** True or false (justify in ≤ 1 sentence each; 4 pts):

   1. 5n + 3 = Θ(n)

   2. n log n = Ω(n)

   3. 2n² + n = O(n)

## Q8 — BST and AVL (8 pts)

Insert, one at a time, into an initially empty **plain BST**:

**40, 30, 60, 20, 35, 15, 26, 38, 32, 50, 70**

**(a)** Give the tree's **preorder** (2 pts). **(b)** Insert **37**: which is the LOWEST unbalanced node (1 pt)? **(c)** Name the imbalance case (left-left / left-right / right-right / right-left) (1 pt). **(d)** Fix it with the appropriate rotation(s) at that node and give the new preorder (2 pts). **(e)** From the fixed tree, **delete 40** (two-child case: promote the in-order **successor**) and give the preorder (2 pts).

## Q9 — 2-3 tree (4 pts)

Build a 2-3 tree by inserting, in order: **11, 8, 5, 6, 1, 4, 7, 2**

**(a)** the key(s) in the root (1 pt) · **(b)** the keys in the internal (non-root, non-leaf) nodes, left to right (1 pt) · **(c)** the keys in the leaves, left to right (2 pts).

## Q10 — B+ trees & red-black BSTs (4 pts, 1 each)

**(a)** In a B+ tree, where do the actual data records (or record pointers) live?
1. in every node   2. only in the leaves   3. only in the root   4. only in internal nodes

**(b)** B+ tree leaves are linked left-to-right. What query does that make cheap?
1. point lookup   2. range scan / in-order sweep   3. insertion   4. finding the root

**(c)** In a left-leaning red-black BST, a `flipColors` at a node corresponds to which 2-3 tree event?
1. a rotation   2. a search miss   3. a node split — the middle key passes up   4. a deletion

**(d)** The height of a red-black BST with n keys is at most about:
1. log₂ n   2. 1.44·log₂ n   3. 2·log₂ n   4. √n


---

## Answer key

**Q1.**
```text
helper(E,4) = 1 + helper(NULL,5) + helper(G,7) = 1 + 5 + 0 = 6
helper(B,1) = 1 + helper(D,2) + helper(E,4) = 1 + 0 + 6 = 7
helper(C,3) = 1 + helper(NULL,4) + helper(F,6) = 1 + 4 + 0 = 5
helper(A,0) = 1 + helper(B,1) + helper(C,3) = 1 + 7 + 5 = 13
```
(b) the root's-left-child call returns **7** · (c) `TR.play()` = **13**

**Q2.** (1) O(1) · (2) O(n log n) · (3) O(n + e) · (4) O(1) · (5) O(log n) · (6) O((n + e) log n)

**Q3.** (a) `3,6,5,7,8,9,15,13,11` · (b) `5,6,9,7,8,11,15,13` · (c) `6,7,9,13,8,11,15` · (d) `7,8,9,13,15,11`

**Q4.** (a) `D,A,B,E,C,F` · (b) `D,A,B,C,F,E` · (c) `F,C,B,E,A,D` · (d) `D,A,B,C,E,F`

**Q5.** A: `G,C,A` = 3 · B: `G,C,B` = 5 · C: `G,C` = 1 · D: `G,C,A,D` = 4 · E: `G,C,A,E` = 8 · F: `G,C,A,D,H,F` = 11 · H: `G,C,A,D,H` = 8

**Q6.** (a) `22,11,33,44,_,5,_,7,18,29,_` · (b) 18: 1 · 29: 2 · (c) 4 inspections (3 occupied, then the empty slot) · (d) after insertion #6 (2n ≥ M first holds at n = 6)

**Q7.** (a) ratios ≈ 4.0, 4.0, 4.0 → **Θ(N²)** (ratio ≈ 2^b ⇒ b) · (b) (1) TRUE · (2) TRUE (n log n grows at least as fast as n) · (3) FALSE

**Q8.** (a) `40,30,20,15,26,35,32,38,60,50,70` · (b) 40 · (c) **left-right** · (d) `35,30,20,15,26,32,40,38,37,60,50,70` · (e) `35,30,20,15,26,32,50,38,37,60,70`

**Q9.** (a) `5` · (b) `2,8` · (c) `1,4,6,7,11`

**Q10.** (a) 2 — only in the leaves · (b) 2 — range scan · (c) 3 — a 2-3 split, middle key up · (d) 3 — 2·log₂ n
