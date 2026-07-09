<!--
  CSS 343 · Lecture 15 (Session 15) — Dynamic Programming II.
  reveal.js: "---" = next part (→), "--" = next slide (↓). Notes follow "Note:".
  Concrete C++ (arrays, 2-D tables) — no templates/inheritance. KaTeX: never two
  "_" on one line. Verify at 1280×620; code/ASCII lines ≤ ~56 chars (0.46em).

  Reading (pre): Erickson, Algorithms Ch 3 §3.7–3.10 (DP is NOT in Sedgewick) +
  CLRS Ch 14 (optional).
  THROUGH-LINE: apply L14's DP recipe to real optimization. 0/1 KNAPSACK and
  EDIT DISTANCE are the two greedy-fails problems from L12, now solved by a 2-D
  table (state = index × capacity/prefix; transition = take-vs-skip / insert-
  delete-replace). GRID and INTERVAL DP generalize the table shape. Every one
  needs a TRACEBACK to recover the solution, and a rolling-array trick to cut
  space. Knapsack's O(nW) is "pseudo-polynomial" — a subtlety worth naming.

  Session plan (150 min). 0:00 intro 0:04 P1 knapsack 28 0:32 P2 edit distance 28
  1:00 BREAK 10 1:10 P3 grid+interval 26 1:36 P4 traceback+space 22 1:58 P5 wrap 8
  2:06 ICA 2:30 end.
-->

## CSS 343

### Data Structures, Algorithms & Discrete Mathematics II

**Lecture 15 — Dynamic Programming II**

<small>Summer 2026 · T/Th 6:00–8:30 · UW1 020 · Dr. Marcel Gavriliu</small>

---

## Reading

**Erickson Ch 3 §3.7–3.10** — more Dynamic Programming

- **0/1 knapsack** — take-or-leave, a 2-D table
- **edit distance** — insert / delete / replace
- **grid & interval** DP
- **reconstruction** + **space-saving**

_Optional:_ CLRS Ch 14. Reading quiz due before class.

---

### Part 1 · 0/1 knapsack

<small>(~28 min)</small>

--

## The 0/1 knapsack problem

Items with **value** and **weight**; a knapsack of capacity **W**. Take each item **whole or not** to maximize value:

```text
   item   A   B   C   D
   value  3   4   5   6
   weight 2   3   4   5      W = 5
```

Which subset fits and is worth the most?

--

## Tonight's plan

1. **0/1 knapsack** — take/skip (greedy failed)
2. **edit distance** — insert / delete / replace
3. **grid & interval** DP
4. **traceback** + **space-saving**

Same recipe as L14: **state → transition → fill → trace back**.

--

## Greedy fails (recall L12)

```text
   by value/weight ratio: A=1.5  B=1.33  C=1.25  D=1.2
   greedy takes A (2), then B (3) → weight 5, value 7
   … here that's optimal — but shift the weights and it isn't
```

One heavy high-value item can **block** two better light ones. **Try all → DP.**

--

## The exponential we avoid

```text
   brute force: n items → 2ⁿ subsets to check
      n = 40 → 10¹²  (a trillion) subsets
   DP: n·W cells
      n = 40, W = 1000 → 40,000 cells
```

**10¹² → 10⁴** — DP's payoff, on a real problem.

--

## The subproblem

`K[i][w]` = max value using the first **i** items within weight **w**:

```text
   K[i][w] = max(
       K[i-1][w],                       // SKIP item i
       value[i] + K[i-1][w - weight[i]] // TAKE item i (if it fits)
   )
   K[0][w] = 0                          // no items
```

The "last decision": **take item i or not?**

--

## Knapsack — a worked cell

`K[2][5]` (items A, B; capacity 5), B has value 4, weight 3:

```text
   skip B: K[1][5] = 3            (just A)
   take B: 4 + K[1][5−3] = 4 + K[1][2] = 4 + 3 = 7
   K[2][5] = max(3, 7) = 7        ← take both A and B
```

--

## Base cases & edges

Pin down the trivial cells before the loops:

```text
   K[0][w] = 0   for all w    // no items → no value
   K[i][0] = 0   for all i    // no capacity → nothing fits
```

Fill row 0 and column 0 first; the recurrence builds up from there.

--

## The knapsack table

```text
   w →   0  1  2  3  4  5
   {}    0  0  0  0  0  0
   +A    0  0  3  3  3  3
   +B    0  0  3  4  4  7      (A+B: weight 5, value 7)
   +C    0  0  3  4  5  7
   +D    0  0  3  4  5  7
                          ↑ K[4][5] = 7
```

Fill row by row; each cell is max(skip, take).

--

## Knapsack — the code

```text
for (int i = 1; i <= n; i++)
    for (int w = 0; w <= W; w++) {
        K[i][w] = K[i-1][w];                       // skip item i
        if (weight[i] <= w)                        // does it fit?
            K[i][w] = max(K[i][w],
                          value[i] + K[i-1][w-weight[i]]);  // take
    }
return K[n][W];
```

Two loops, the recurrence in the body — the standard 2-D DP shape.

--

## 🎬 Demo — knapsack table

<div class="algo-viz" data-algo="knapsack">
<pre class="viz-fallback">
   items (value/weight): A 3/2, B 4/3, C 5/4, D 6/5; W = 5.
   fill K[i][w] = max( SKIP=above, TAKE=value+K[i-1][w-wt] ).
   the bottom-right is the best value; traceback marks the
   items taken (here A + B → value 7).
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Each cell is `max(skip = above, take = value + K[i−1][w − wt])`. The bottom-right is the **optimal value**; the **traceback** marks which items were taken (**A + B → 7**). Full sandbox: the **Explore** page.</small>

--

## Knapsack — reconstruction

The value is `K[n][W]`; recover the **items** by tracing back:

```text
   from K[n][W], for i = n down to 1:
     if K[i][w] != K[i-1][w]:      // value changed → item i taken
        take item i;  w -= weight[i]
```

Same traceback pattern as LCS and rod cutting.

--

## Knapsack variants

| variant | rule | transition tweak |
|---|---|---|
| **0/1** (tonight) | each item once | take reads `K[i-1][…]` |
| **unbounded** | unlimited copies | take reads `K[i][…]` (same row) |
| **bounded** | ≤ k of each | loop over counts |

**Coin change** is unbounded knapsack (minimizing *count*).

--

## Knapsack — cost

```text
   table size:  (n+1) × (W+1)
   each cell:   O(1)
   total:       Θ(n · W)   time and space
```

Fast when W is small — but W is a **number**, not the input size…

--

## Pseudo-polynomial

`Θ(nW)` depends on the **value** of W, not the number of **bits** to write it:

```text
   W = 1,000,000 → a million columns, from a 20-bit number
   input SIZE is ~log W bits, so nW is EXPONENTIAL in the input size
```

0/1 knapsack is **NP-hard**; Θ(nW) is "pseudo-polynomial."

---

### Part 2 · Edit distance

<small>(~28 min)</small>

--

## The edit distance problem

Fewest single-character **edits** (insert, delete, replace) to turn string A into string B:

```text
   kitten → sitting
   k→s (replace), e→i (replace), +g (insert)  =  3 edits
```

Also called **Levenshtein distance**.

--

## The subproblem

`D[i][j]` = edit distance between `A[0..i)` and `B[0..j)`:

```text
   if A[i-1] == B[j-1]:  D[i][j] = D[i-1][j-1]          // match, free
   else: D[i][j] = 1 + min( D[i-1][j],    // delete A[i-1]
                            D[i][j-1],    // insert B[j-1]
                            D[i-1][j-1] ) // replace
   D[i][0] = i;  D[0][j] = j              // to/from empty
```

--

## The edit-distance table

```text
        ""  s  i  t  t  i  n  g
    ""   0  1  2  3  4  5  6  7
    k    1  1  2  3  4  5  6  7
    i    2  2  1  2  3  4  5  6
    t    3  3  2  1  2  3  4  5
    ...                        → D[6][7] = 3
```

Each cell reads up, left, and diagonal; bottom-right is the answer.

--

## Edit distance — the code

```text
for (int i = 0; i <= m; i++) D[i][0] = i;   // base: delete all
for (int j = 0; j <= n; j++) D[0][j] = j;   // base: insert all
for (int i = 1; i <= m; i++)
    for (int j = 1; j <= n; j++)
        if (A[i-1] == B[j-1]) D[i][j] = D[i-1][j-1];
        else D[i][j] = 1 + min({D[i-1][j], D[i][j-1], D[i-1][j-1]});
return D[m][n];
```

--

## Edit distance — a worked cell

`D[1][1]` for `"k"` → `"s"`:

```text
   'k' != 's' → 1 + min( D[0][1]=1,   // delete 'k'
                         D[1][0]=1,   // insert 's'
                         D[0][0]=0 )  // replace k→s
             = 1 + 0 = 1              (one replace)
```

The cheapest of the three operations wins — here, replace.

--

## Edit distance is a metric

With unit costs, edit distance obeys the **metric** axioms:

```text
   d(A,A) = 0                       identity
   d(A,B) = d(B,A)                  symmetric
   d(A,C) ≤ d(A,B) + d(B,C)         triangle inequality
```

So strings live in a **metric space** — you can cluster and nearest-neighbor them.

--

## 🎬 Demo — edit-distance table

<div class="algo-viz" data-algo="edit-distance">
<pre class="viz-fallback">
   "kitten" → "sitting": fill D[i][j] = match ? diagonal :
   1 + min(up=delete, left=insert, diagonal=replace).
   the bottom-right is the distance (3); traceback recovers
   the edit script (2 replaces + 1 insert).
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Match → inherit the **diagonal** (free); else **1 + min(up, left, diagonal)** = delete / insert / replace. Bottom-right = the distance (**3**); the **traceback** recovers the edit script.</small>

--

## Edit distance — the edit script

The number is the **distance**; trace back for the **operations**:

```text
   diagonal, same char → match (no edit)
   diagonal, diff      → replace
   up                  → delete from A
   left                → insert from B
```

Reverse the path → the sequence of edits.

--

## LCS vs edit distance

The two 2-D string DPs are close cousins:

| | LCS | edit distance |
|---|---|---|
| goal | **max** common length | **min** edits |
| transition | match: diag+1; else max(up,left) | match: diag; else 1+min(3) |
| relates | `edits ≥ m + n − 2·LCS` | — |

Same table, opposite objective (max vs min).

--

## Edit script — worked

`kitten → sitting`, along the optimal path:

```text
   k → s   replace
   i → i   match      t → t   match      t → t   match
   e → i   replace
   n → n   match
   ε → g   insert
   → 2 replaces + 1 insert = 3 edits
```

--

## Edit distance in the wild

- **spell-check / autocorrect** — nearest dictionary word
- **fuzzy search** / record linkage — "did you mean…?"
- **DNA / protein alignment** — with weighted edits
- **`diff`** and version control (a cousin of LCS)

--

## Weighting the edits

Operations need not cost the same — swap the `+1` for a per-operation cost:

```text
   replace = 2,  insert = delete = 1     (a typo vs an omission)
   DNA: a substitution-cost matrix by mutation type
```

Same DP, different constants. **Needleman–Wunsch** alignment *is* weighted edit distance.

---

### Part 3 · DP on grids & intervals

<small>(~26 min)</small>

--

## Grid DP: minimum-cost path

Move only **right or down** through a grid of costs; minimize the total:

```text
   cost[i][j] + min( path from above, path from left )
   dp[i][j] = cost[i][j] + min(dp[i-1][j], dp[i][j-1])
```

```text
   1 3 1        dp fills to     1 4 5
   1 5 1    →   the corner:     2 7 6
   4 2 1                        6 8 7  → min path cost 7
```

--

## The three table shapes

Almost every DP is one of:

| shape | state | neighbors read |
|---|---|---|
| **1-D** | `dp[i]` | earlier indices |
| **2-D grid** | `dp[i][j]` | up / left / diagonal |
| **interval** | `dp[i][j]` | all splits `k` in `(i,j)` |

Recognize the shape → you know the state and the fill order.

--

## Grid DP — variations

- **count paths** — `dp[i][j] = dp[i-1][j] + dp[i][j-1]` (sum instead of min)
- **obstacles** — set blocked cells to ∞ (or 0 paths)
- **8-directional / diagonal moves** — more neighbors per cell

Same table, different transition.

--

## Grid paths — worked

Count monotone (right/down) paths across a 3×3 grid:

```text
   1  1  1
   1  2  3
   1  3  6     → 6 paths  = C(4,2)
```

Each cell = up + left; the corner counts all paths. Add an obstacle → set that cell to 0.

--

## Interval DP

The state is a **range** `[i, j]`; combine over a **split point** `k`:

```text
   dp[i][j] = best over k in [i, j) of
              ( dp[i][k] + dp[k+1][j] + cost(i,j) )
```

Examples: **matrix-chain multiplication**, **optimal BST**, **balloon burst**.

--

## Interval DP — matrix chain

Multiply `A₁·A₂·…·Aₙ`: the **parenthesization** changes the scalar-multiply count.

```text
   dp[i][j] = min over k of
              dp[i][k] + dp[k+1][j] + rows_i · cols_k · cols_j
```

The split `k` = "which multiply happens **last**." Θ(n³).

--

## Interval DP — optimal BST

Given keys with **access frequencies**, build the BST of minimum expected search cost:

```text
   dp[i][j] = min over root r in [i,j] of
              dp[i][r-1] + dp[r+1][j] + Σ freq(i..j)
```

The split = **which key is the root**. Frequent keys settle **near the root**. Θ(n³).

--

## Coin change (revisited)

L12's greedy failed on `{1,3,4}` — DP solves it:

```text
   dp[a] = 1 + min over coins c ≤ a of dp[a - c]
   dp[0] = 0
```

`dp[6]` with `{1,3,4}` = 2 (two 3s) — the answer greedy missed.

--

## Coin change — worked

Coins `{1, 3, 4}`, fill `dp[0..6]`:

```text
   dp[0]=0  dp[1]=1  dp[2]=2
   dp[3]=min(1+dp[2], 1+dp[0]) = 1
   dp[4]=min(1+dp[3], 1+dp[1], 1+dp[0]) = 1
   dp[5]=min(1+dp[4], 1+dp[2], 1+dp[1]) = 2
   dp[6]=min(1+dp[5], 1+dp[3], 1+dp[2]) = 2   ← 3+3, greedy said 3
```

--

## Grid DP — counting paths

Swap `min` for **sum** to count the ways to reach each cell:

```text
   dp[i][j] = dp[i-1][j] + dp[i][j-1]      (paths from up + from left)
   dp[0][*] = dp[*][0] = 1                 (one way along an edge)
```

An m×n grid has `C(m+n, m)` monotone paths — a DP that computes a binomial.

--

## Longest increasing subsequence

Find the longest strictly-increasing subsequence — a 1-D DP:

```text
   dp[i] = 1 + max( dp[j] for j < i with a[j] < a[i] )
   answer = max over all dp[i]
```

```text
   [3 1 4 1 5 9 2 6]  →  LIS = 1,4,5,9 (or 1,4,5,6) → length 4
```

--

## LIS in practice

- **patience sorting** (the card game that names the Θ(n log n) method)
- **longest chain** of nested boxes / compatible upgrades
- **scheduling** — longest set of compatible tasks by one axis
- version / dependency **compatibility** chains

---

### Part 4 · Reconstruction & space-saving

<small>(~22 min)</small>

--

## Traceback — the general pattern

Every optimization DP recovers its solution the same way:

```text
   start at the ANSWER cell
   at each step, ask which neighbor PRODUCED this value
   move there, record the choice
   stop at a base case; reverse
```

Store the choice while filling, or recompute it on the way back.

--

## The universal DP skeleton

Every DP you've seen is the same code shape:

```text
   1. allocate the table; set BASE cells
   2. loop over states in dependency ORDER
   3. each cell = combine(smaller cells)   // the recurrence
   4. read the ANSWER cell
   5. (optional) TRACE BACK for the solution
```

Change the state and the recurrence — the skeleton never changes.

--

## Traceback — worked (knapsack)

`K[4][5] = 7`, walk up comparing to the cell above:

```text
   K[4][5]=7 == K[3][5]=7 → D skipped   (w=5)
   K[3][5]=7 == K[2][5]=7 → C skipped   (w=5)
   K[2][5]=7 != K[1][5]=3 → B TAKEN     (w = 5−3 = 2)
   K[1][2]=3 != K[0][2]=0 → A TAKEN     (w = 2−2 = 0)
   → items {A, B}, value 7
```

--

## Space-saving: the rolling array

If a cell needs only the **previous row**, keep **two rows** (or one):

```text
   LCS / edit / knapsack:  dp[i][*] depends on dp[i-1][*]
   → keep the last row → Θ(min(m,n)) or Θ(W) space
```

Cuts space from **Θ(mn)** to **Θ(n)** — but you lose the full table for traceback.

--

## Rolling array — the code

1-D knapsack, one row updated **right-to-left**:

```text
   vector<int> K(W+1, 0);
   for (int i = 1; i <= n; i++)
       for (int w = W; w >= weight[i]; w--)   // BACKWARD!
           K[w] = max(K[w], value[i] + K[w - weight[i]]);
   return K[W];
```

Θ(W) space. The **backward** order stops item i from being taken twice.

--

## Top-down works too

Prefer recursion? **Memoize** instead of tabulate:

```text
   long knap(int i, int w) {
       if (i == 0) return 0;
       if (memo[i][w] != -1) return memo[i][w];
       long best = knap(i-1, w);                    // skip
       if (weight[i] <= w)
           best = max(best, value[i] + knap(i-1, w-weight[i]));
       return memo[i][w] = best;
   }
```

Same Θ(nW); computes only the **reached** cells.

--

## Value or solution? — the trade

| you need | space |
|---|---|
| just the optimal **value** | **Θ(n)** — rolling array |
| the full **solution** (traceback) | **Θ(mn)** — keep the table |

Decide up front which you need.

--

## Hirschberg: solution in linear space

You **can** have both — the LCS/edit *solution* in **Θ(n) space** — via divide-and-conquer:

```text
   find the midpoint of the optimal path with two half-tables,
   then recurse on the two halves
   → Θ(mn) time, Θ(n) space, full traceback
```

---

### Part 5 · Wrap & ICA 15

<small>(~8 min)</small>

--

## Recap — the problems

- **0/1 knapsack** — take/skip; `Θ(nW)`, **pseudo-polynomial**
- **edit distance** — insert/delete/replace; `Θ(mn)`
- **grid DP** — paths from up/left; **interval DP** — split a range
- **coin change** — the greedy-failure, solved

--

## Recap — the techniques

- every DP: **state**, **transition**, **base**, **order**, **answer**
- recover the solution with a **traceback**
- shrink space with a **rolling array** (losing traceback)

> Define the table cell; fill it from smaller cells; trace back for the solution.

--

## The DP problem zoo

| problem | state | transition | cost |
|---|---|---|---|
| Fibonacci | `dp[i]` | +2 prev | Θ(n) |
| rod cutting | `dp[len]` | max first cut | Θ(n²) |
| LCS | `dp[i][j]` | match/skip | Θ(mn) |
| knapsack | `dp[i][w]` | take/skip | Θ(nW) |
| edit distance | `dp[i][j]` | min 3 ops | Θ(mn) |
| coin change | `dp[a]` | min over coins | Θ(a·k) |

--

## When you're stuck on a DP

- can't write the recurrence? → the **subproblem is wrong** — redefine the state
- recurrence uses a value you don't have? → **add a dimension** to the state
- exponential still? → subproblems aren't **overlapping** — maybe it's not DP
- works but too slow/big? → tighten the state or use a **rolling array**

--

## The design-paradigm capstone

You now hold the full toolkit — try them in this order:

```text
   1. GREEDY        — one locally-best choice   (if provably safe)
   2. DIVIDE & CONQ — split INDEPENDENT parts   (if no overlap)
   3. DYNAMIC PROG  — cache OVERLAPPING parts    (greedy's fallback)
   4. brute force   — last resort
```

--

## DP: worth the effort

Once mastered, DP is a **superpower**:

- turns exponential brute force into polynomial
- solves optimization, counting, and feasibility problems alike
- underlies **spell-check, diff, alignment, routing, scheduling, ML** (Viterbi, CTC)

The hard part is the **state**; everything else is mechanical.

--

## ICA 15 — your turn

In `ica15/ica15.cpp`:

- implement **0/1 knapsack** (max value) with a 2-D table
- implement **edit distance** (Levenshtein) with a 2-D table
- add **traceback** for one of them (items taken / edit script)

Build `-g`, run the self-tests, Valgrind-clean.

