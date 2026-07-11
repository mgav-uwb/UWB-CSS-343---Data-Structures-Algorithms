<!--
  CSS 343 · Lecture 14 (Session 14) — Dynamic Programming I.
  reveal.js: "---" = next part (→), "--" = next slide (↓). Notes follow "Note:".
  Concrete C++ (arrays, recursion + a memo/table) — no templates/inheritance.
  KaTeX: never two "_" on one line. Verify at 1280×620; code/ASCII lines ≤ ~56 chars.

  Reading (pre): Erickson, Algorithms Ch 3 §3.1–3.6 (DP is NOT in Sedgewick) +
  CLRS Ch 14 (optional reference).
  THROUGH-LINE: DYNAMIC PROGRAMMING = recursion + remembering. When subproblems
  OVERLAP (a plain recursion recomputes them exponentially) and the problem has
  OPTIMAL SUBSTRUCTURE, cache each subproblem's answer once. MEMOIZATION is
  top-down (recurse + a cache); TABULATION is bottom-up (fill a table in
  dependency order). Fibonacci (exp → linear), rod cutting, and LCS show the
  method; the DP RECIPE (subproblem, recurrence, order, base, reconstruct)
  generalizes it. DP is NEW this term (greedy's fallback when a single choice
  isn't safe).

  Session plan (150 min). 0:00 intro 0:04 P1 memo/tab 22 0:26 P2 fib/rod 26
  0:52 BREAK 10 1:02 P3 LCS 30 1:32 P4 the recipe 22 1:54 P5 wrap 12
  2:06 ICA 2:30 end.
-->

## CSS 343

### Data Structures, Algorithms & Discrete Mathematics II

**Lecture 14 — Dynamic Programming I**

<small>Summer 2026 · T/Th 6:00–8:30 · UW1 020 · Dr. Marcel Gavriliu</small>

---

## Reading

**Erickson Ch 3 §3.1–3.6** — Dynamic Programming

- **overlapping subproblems** + **optimal substructure**
- **memoization** (top-down) vs **tabulation** (bottom-up)
- **Fibonacci, rod cutting, LCS** · the **DP recipe**

_(DP isn't in Sedgewick.) Optional: CLRS Ch 14. Quiz due before class._

---

### Part 1 · Memoization vs tabulation

<small>(~22 min)</small>

--

## What is dynamic programming?

> **DP = recursion + remembering.**

Solve a problem by combining answers to **overlapping** subproblems — and **store** each subproblem's answer so you compute it **once**.

```text
   plain recursion:  recompute subproblems → exponential
   DP:               cache them → polynomial
```

--

## Why "dynamic programming"?

Richard Bellman coined it in the **1950s**:

```text
   "programming" = tabular PLANNING (as in "linear programming"),
                    NOT writing code
   "dynamic"     = multistage decisions over time
```

The name is opaque; the idea — **remember subproblems** — is simple.

--

## The two hallmarks

DP applies when a problem has **both**:

1. **overlapping subproblems** — the same subproblem recurs many times
2. **optimal substructure** — an optimal solution is built from optimal solutions to subproblems

--

## Overlap, concretely

The **same** subproblem is needed by many callers:

```text
   fib(5) needs fib(3) …  and so does fib(4)
   LCS(i,j) needs LCS(i−1,j−1) … shared by its neighbors too
```

Same subproblem, **many parents** → compute once, reuse many times.

--

## Memoization (top-down)

Write the **natural recursion**, then add a **cache**:

```text
   solve(x):
       if x in memo: return memo[x]      // remember
       result = ... solve(smaller) ...   // recurse
       memo[x] = result
       return result
```

Same recursion tree, but each node computed **once**.

--

## Why caching pays off

Cost = (**# distinct subproblems**) × (cost each):

```text
   fib:  n subproblems × O(1)  = Θ(n)     (was ≈ φⁿ)
   LCS:  m·n subproblems × O(1) = Θ(mn)   (was ≈ 2ᵐ)
```

The speedup is exactly the **repeats you avoid** — and overlap means *many* repeats.

--

## Tabulation (bottom-up)

Fill a **table** of subproblem answers in **dependency order**:

```text
   for subproblems from SMALLEST to largest:
       table[x] = ... table[smaller] ...   // already computed
   return table[goal]
```

No recursion — an explicit loop over the table.

--

## Memoization vs tabulation

| | memoization | tabulation |
|---|---|---|
| direction | **top-down** | **bottom-up** |
| structure | recursion + cache | loop + table |
| computes | only needed subproblems | usually all |
| order | automatic | you choose it |

Same answers, same asymptotic cost — pick by convenience.

--

## Memoize or tabulate?

- **memoize** when: the recursion is natural, or only **some** subproblems are reached
- **tabulate** when: you need the **speed** (no call overhead) or a **space** optimization (keep few rows)

**Advice:** write it memoized first (hard to get wrong), then tabulate if it matters.

--

## DP vs greedy

```text
   greedy:  commit to ONE locally-best choice, never reconsider
   DP:      TRY all choices, keep the best subproblem answers
```

DP is greedy **without the leap of faith** — it explores every option but shares work. Greedy fails (0/1 knapsack, coins {1,3,4})? → **DP**.

--

## The three paradigms

| paradigm | idea | when |
|---|---|---|
| **divide & conquer** | split into **independent** subproblems | no overlap |
| **greedy** | one **locally-best** choice, commit | choice provably safe |
| **dynamic programming** | try all, **cache overlapping** subproblems | overlap + optimal substructure |

---

### Part 2 · Fibonacci → rod cutting

<small>(~26 min)</small>

--

## Fibonacci: the naive recursion

```text
   fib(n) = fib(n-1) + fib(n-2)
```

```text
   long fib(int n) {
       if (n < 2) return n;
       return fib(n-1) + fib(n-2);
   }
```

Correct — but how many calls?

--

## The recursion tree overlaps

```text
              fib(5)
            /        \
        fib(4)       fib(3)
        /    \       /    \
    fib(3) fib(2) fib(2) fib(1)
     ...     ...   ...
   fib(3) computed TWICE, fib(2) THREE times …
```

**Exponential** — exactly `calls(n) = 2·fib(n+1) − 1`:<br><small>fib(10) → 177 calls · fib(40) → ≈ 3×10⁸ · fib(50) → ≈ 4×10¹⁰</small>

--

## Fibonacci, memoized → linear

```text
   long fib(int n, vector<long>& memo) {
       if (n < 2) return n;
       if (memo[n]) return memo[n];       // remember
       return memo[n] = fib(n-1,memo) + fib(n-2,memo);
   }
```

Each `fib(k)` computed **once** → **Θ(n)** time, Θ(n) space.

--

## Fibonacci, tabulated → O(1) space

Bottom-up, and we only need the **last two** values:

```text
   long fib(int n) {
       long a = 0, b = 1;
       for (int i = 0; i < n; i++) {
           long c = a + b; a = b; b = c;
       }
       return a;
   }
```

Θ(n) time, **Θ(1) space** — the space optimization tabulation enables.

--

## Fibonacci: the whole arc

| version | time | space |
|---|---|---|
| naive recursion | **Θ(φⁿ)** | Θ(n) stack |
| memoized | Θ(n) | Θ(n) |
| tabulated | Θ(n) | Θ(n) |
| tabulated + 2 vars | Θ(n) | **Θ(1)** |

From a **billion** calls to **fifty** additions — the DP payoff in one table.

--

## 🎬 Memoization collapses the tree

<div class="algo-viz" data-algo="fib-memo">
<pre class="viz-fallback">
   fib(6) WITHOUT memo — every node recomputed:
              fib(6)
          fib(5)      fib(4)      ← fib(4) appears again below fib(5)
       fib(4) fib(3) fib(3) fib(2)   … 25 calls in all

   fib(6) WITH memo — each fib(k) computed ONCE, the rest are
   cache hits. exponential tree → a linear memo row.
</pre>
</div>

<small>Type `n`, press **Memo fib**: the recursion replays over the **memo row** — each `fib(k)` computed **once**, every repeat a **cache hit** that skips a whole subtree. For n = 10: **19 calls vs 177** naive.</small>

--

## Rod cutting

Cut a rod of length `n` into pieces to **maximize** total value (piece of length `i` sells for `price[i]`):

```text
   length  1  2  3  4
   price   1  5  8  9
   n = 4:  best = 5 + 5 = 10  (two 2-pieces), not 9 (whole rod)
```

--

## Rod cutting: greedy fails

Greedy "best price-per-length first"?

```text
   price/length:  len1=1.0  len2=2.5  len3=2.67  len4=2.25
   greedy takes len3 (best ratio): 8 + best(1) = 8 + 1 = 9
   optimal: two len2 = 5 + 5 = 10   ✗ greedy loses
```

The best first cut depends on the **whole** rod → try them all → **DP**.

--

## Rod cutting — the recurrence

Try **every first cut** `i`, then optimally cut the rest:

```text
   best(n) = max over i in 1..n of ( price[i] + best(n - i) )
   best(0) = 0
```

`best(n-i)` overlaps across choices → **DP**.

--

## Rod cutting — tabulated

```text
   best[0] = 0;
   for (int len = 1; len <= n; len++) {
       int m = 0;
       for (int i = 1; i <= len; i++)
           m = max(m, price[i] + best[len - i]);
       best[len] = m;
   }
   return best[n];
```

Θ(n²) time, Θ(n) space. Store the chosen `i` to reconstruct the cuts.

--

## Rod cutting — which cuts?

Store the winning first cut `cut[len]` at each length, then trace back:

```text
   cut[4] = 2 → take a length-2, remainder 4−2 = 2
   cut[2] = 2 → take a length-2, remainder 0
   → cuts: 2 + 2   (value 10)
```

The same "store the choice, walk back" traceback as LCS.

--

## Rod cutting — worked

Prices `[_,1,5,8,9]` (length 1..4):

```text
   best[0] = 0
   best[1] = 1+best[0] = 1
   best[2] = max(1+best[1], 5+best[0]) = max(2,5) = 5
   best[3] = max(1+5, 5+1, 8+0) = 8
   best[4] = max(1+8, 5+5, 8+1, 9+0) = 10   ← two length-2 cuts
```

Each cell reuses the smaller `best[]` — that's the overlap DP exploits.

--

## Your turn — rod cutting

Prices `[_, 2, 5, 7, 8]` (lengths 1..4). Fill `best[1..4]`:

```text
   best[1] = ?     best[2] = ?
   best[3] = ?     best[4] = ?
```

<small>`best[1]`=2 · `best[2]`=max(2+2, 5)=**5** · `best[3]`=max(2+5, 5+2, 7)=**7** · `best[4]`=max(2+7, 5+5, 7+2, 8)=**10** — two length-2 pieces again. Every cell reuses the smaller cells.</small>

---

### Part 3 · Longest common subsequence

<small>(~30 min)</small>

--

## The LCS problem

A **subsequence** keeps order but may skip characters. Find the **longest** common to two strings:

```text
   A = A G C A T
   B = G A C
   LCS = "AC" (or "GC")  → length 2
```

Powers `diff`, version control, DNA alignment.

--

## Subsequence ≠ substring

```text
   SUBSTRING:    contiguous       "GCA" in "AGCAT"
   SUBSEQUENCE:  keeps order,     "ACT" in "AGCAT"
                 may skip
```

LCS allows **gaps** → "AC" from "AGCAT". (Longest common *substring* is a different — also DP — problem.)

--

## LCS — the subproblem

Let `L[i][j]` = LCS length of `A[0..i)` and `B[0..j)`:

```text
   if A[i-1] == B[j-1]:  L[i][j] = L[i-1][j-1] + 1   (match: extend diagonal)
   else:                 L[i][j] = max(L[i-1][j], L[i][j-1])
   L[0][j] = L[i][0] = 0                              (empty prefix)
```

--

## Why the recurrence works

Look at the **last** characters `A[i−1]`, `B[j−1]`:

```text
   MATCH    → both can end the LCS → 1 + LCS of shorter prefixes (diagonal)
   MISMATCH → at least one is NOT in the LCS → drop it → max(up, left)
```

Every case reduces to a **smaller prefix pair** — optimal substructure.

--

## LCS — the table

```text
        ""  G  A  C
    ""   0  0  0  0
    A    0  0  1  1
    G    0  1  1  1
    C    0  1  1  2
    A    0  1  2  2
    T    0  1  2  2     → L[5][3] = 2 = LCS length
```

Fill row by row; each cell reads up, left, and diagonal.

--

## LCS — the code

```text
for (int i = 1; i <= m; i++)
    for (int j = 1; j <= n; j++)
        if (A[i-1] == B[j-1])
            L[i][j] = L[i-1][j-1] + 1;        // match
        else
            L[i][j] = max(L[i-1][j], L[i][j-1]);
return L[m][n];
```

Two nested loops over the table — **Θ(mn)**, the recurrence line-for-line.

--

## 🎬 Demo — LCS

<div class="algo-viz" data-algo="lcs">
<pre class="viz-fallback">
   LCS of "AGCAT" and "GAC": fill the (m+1)×(n+1) table cell
   by cell. on a character match, take the DIAGONAL + 1; else
   the max of UP and LEFT. then trace the path back for the LCS.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Match → **diagonal + 1**, else max(**up**, **left**); the **traceback** spells an LCS. Type two words (try `SUNDAY SATURDAY`) and press **LCS**.</small>

--

## LCS — reconstructing the string

The table gives the **length**; trace back for the **string**:

```text
   from L[m][n], walk toward L[0][0]:
     if A[i-1]==B[j-1]: it's in the LCS → move DIAGONAL
     else: move toward the larger of up / left
```

The matches you step through, reversed, are an LCS.

--

## A sanity check

The LCS table has structure worth knowing:

- values **never decrease** going down or right (bigger prefixes → ≥ LCS)
- adjacent cells differ by **at most 1**
- the bottom-right is the largest value = the answer

If your filled table breaks these, there's a bug.

--

## LCS — cost

```text
   table size:  (m+1) × (n+1)
   each cell:   O(1)
   total:       Θ(m · n)   time and space
```

Space can drop to **Θ(min(m,n))** — keep only the current and previous row.

--

## LCS in the wild

The same 2-D table powers:

- **`diff`** / version control — longest matching lines between file versions
- **DNA / protein alignment** — similarity of biological sequences
- **spell-check / autocorrect** — closeness of strings (with edit distance, L15)
- **plagiarism detection**, merge tools

--

## Practice — fill a cell

Filling LCS of `A="AB"`, `B="CB"` — compute `dp[2][2]`:

```text
        ""  C  B
    ""   0  0  0
    A    0  0  0
    B    0  0  ?      A[2-1]='B', B[2-1]='B'
```

<small>`A[1]='B'` matches `B[1]='B'` → **diagonal + 1** = dp[1][1] + 1 = 0 + 1 = **1**. LCS is "B", length 1.</small>

---

### Part 4 · The DP recipe

<small>(~22 min)</small>

--

## Five questions

Every DP problem answers the same five:

1. **subproblem** — what does `dp[...]` mean?
2. **recurrence** — how does it build from smaller ones?
3. **base cases** — the smallest subproblems
4. **order** — evaluate dependencies first
5. **answer** — which cell (+ how to reconstruct)?

--

## Common DP shapes

Most DP problems fit a few table shapes:

| shape | subproblem | examples |
|---|---|---|
| **1-D** | `dp[i]` over a prefix/length | Fibonacci, rod cutting |
| **2-D grid** | `dp[i][j]` over two indices | LCS, edit distance, knapsack |
| **interval** | `dp[i][j]` over a range | matrix-chain, optimal BST |

Recognizing the shape suggests the subproblem.

--

## The recipe, on tonight's examples

| step | Fibonacci | LCS |
|---|---|---|
| subproblem | `fib(i)` | LCS of prefixes `i, j` |
| recurrence | `fib(i-1)+fib(i-2)` | match? diag+1 : max(up,left) |
| base | `fib(0)=0, fib(1)=1` | empty prefix → 0 |
| answer | `fib(n)` | `L[m][n]` (+ traceback) |

--

## Step 1 — define the subproblem

The hardest, most important step. State **exactly** what `dp[i]` (or `dp[i][j]`) means:

```text
   fib:   dp[i] = the i-th Fibonacci number
   rod:   dp[n] = best value for a rod of length n
   LCS:   dp[i][j] = LCS length of the two prefixes
```

Precise meaning → the recurrence writes itself.

--

## Step 2 — write the recurrence

Express `dp[x]` using **strictly smaller** subproblems:

```text
   consider the LAST decision (last cut, last character, last item)
   → each choice reduces to a smaller subproblem
   → combine (max / min / sum) over the choices
```

--

## State & transition

The two words that describe every DP:

```text
   STATE       = a subproblem (a table cell):  dp[i]  or  dp[i][j]
   TRANSITION  = the recurrence linking states
   total time  = (# states) × (transition cost)
```

**Design the state, then the transition** — that's the whole of DP.

--

## Step 3–4 — base cases & order

- **base cases** — the smallest subproblems, answered directly (empty string → 0, length 0 → 0)
- **order** — evaluate so every dependency is ready first

```text
   memoization: order is AUTOMATIC (recursion finds it)
   tabulation:  YOU pick it (e.g. increasing length / row by row)
```

--

## Reading off the complexity

A DP's cost is a simple product:

```text
   time  = (# subproblems) × (work per subproblem)
   space = (# subproblems)   — often reducible
```

```text
   LCS:  mn cells × O(1)  = Θ(mn)
   rod:  n cells × O(n)   = Θ(n²)   (each tries n cuts)
```

--

## Step 5 — value vs solution

The table stores the optimal **VALUE**; the **choices** need a traceback:

```text
   store the decision at each cell (or recompute it),
   then walk from the answer cell back to a base case
```

Only need the value? Keep **two rows**. Need the solution? Keep the **whole table** — the traceback needs it.

---

### Part 5 · Wrap & ICA 14

<small>(~12 min)</small>

--

## Recap — what DP is

- **DP = recursion + remembering** — cache overlapping subproblems
- applies with **overlapping subproblems** + **optimal substructure**
- **memoize** (top-down cache) or **tabulate** (bottom-up table) — same cost

--

## Recap — the recipe

| step | question |
|---|---|
| subproblem | what does `dp[...]` mean? |
| recurrence | build from smaller (the last decision) |
| base cases | the trivial subproblems |
| order | dependencies first |
| answer | which cell + reconstruct |

--

## Common DP mistakes

- **wrong subproblem** — vague or missing state → the recurrence won't close
- **wrong order** (tabulation) — using a cell before it's filled
- **forgetting base cases** — off-by-one at the table edges
- **memoizing a non-DP** — if subproblems don't overlap, DP just adds overhead

--

## Reach for DP when…

- an **optimum** over exponentially many choices
- choices form **overlapping** subproblems
- **greedy** isn't provably safe (L12)

Then: **subproblem → recurrence → cache** — exponential collapses to polynomial.

--

## ICA 14 — your turn

In `ica14/ica14.cpp`:

- **memoized** + **tabulated** Fibonacci (compare call counts)
- **rod cutting** (max value) with a DP table
- **LCS length** with the 2-D table

Build `-g`, run the self-tests, Valgrind-clean.

