<!--
  CSS 343 · Lecture 4 (Session 4) — Balanced Trees I: AVL.
  reveal.js: "---" = next part (→), "--" = next slide (↓). Notes follow "Note:".
  Concrete C++ (structs, pointers, new/delete) — no templates/inheritance.
  KaTeX gotcha: never put two "_" on one line (use a/b, not c_1/c_2). Verify
  every slide at 1280×620 before shipping. Code/ASCII lines ≤ ~56 chars (0.46em).

  Reading (pre): OpenDSA §26.1–26.2 (Balanced Trees / The AVL Tree) — free
  interactive VT modules: the invariant, the four rotation cases, O(log n).
  Secondary: re-skim Sedgewick §3.2 (BST insert/delete + the Θ(n) worst case).
  Sedgewick has no AVL section — §3.3's tree is 2-3 / red-black (node-capacity
  balance), that family is S05. AVL keeps L03's `balanced` shape (heights
  differ ≤1) as a live invariant — the lecture vehicle.
  TERMS: use L03's vocabulary — `balanced` (heights ≤1), `perfectly balanced`
  (min height). "height-balanced" is the textbook synonym for `balanced`; kept
  only as a one-time aside so we don't need S03↔S04 reconciliation callbacks.

  THROUGH-LINE: L03 left a cliffhanger — a BST's height can be Θ(n). AVL adds ONE
  local invariant (balance factor ∈ {−1,0,+1}), restored by O(1) rotations, and
  turns Θ(log n) from an AVERAGE into a worst-case GUARANTEE. Proof: min nodes
  N(h) is Fibonacci ⇒ height ≤ ~1.44 log₂ n.

  Session plan (150 min, 6:00–8:30).
    0:00  Intro (title + reading)          ~3 min
    0:03  Part 1  The balance problem       14 min
    0:17  Part 2  The AVL invariant         18 min
    0:35  Part 3  Rotations                 20 min
    0:55  Part 4  Insertion & rebalancing   27 min
    1:22  ☕ BREAK                          10 min
    1:32  Part 5  Deletion                  16 min
    1:48  Part 6  The Θ(log n) guarantee    24 min
    2:12  Part 7  Where AVL is used         12 min
    2:24  Part 8  Wrap & ICA 04              6 min
    2:30  end
-->

## CSS 343

### Data Structures, Algorithms & Discrete Mathematics II

**Lecture 4 — Balanced Trees I: AVL**

<small>Summer 2026 · T/Th 6:00–8:30 · UW1 020 · Dr. Marcel Gavriliu</small>

---

## Reading

**OpenDSA §26.1–26.2 — Balanced Trees · The AVL Tree** (free, interactive: opendsa-server.cs.vt.edu)

- the **balance invariant** — subtree heights differ by **≤ 1** at every node
- the **four rotation cases** — single + double rotations
- why every operation stays **O(log n)**

_Review:_ Sedgewick §3.2 — the **Θ(n)** worst-case path we fix tonight. Reading quiz due before class.

---

### Part 1 · The balance problem

<small>(~14 min)</small>

--

## Recap: cost is the height

From L03: every BST operation walks **one root-to-leaf path**, so

- search / insert / delete are all **Θ(height)**
- a binary tree's height ranges from **log₂ n** (balanced) to **n − 1** (a path)

The whole game is: **keep the height small**.

--

## The worst case: sorted input

Insert **1, 2, 3, 4, 5** into a plain BST — each key is the largest so far, so it hangs off the right, forming a path:

```text
   1
    \
     2
      \
       3          height = n − 1
        \         search / insert = Θ(n)
         4
          \
           5
```

A sorted (or reverse-sorted) sequence — common in practice — reduces a BST to a linked list.

--

## "But random BSTs are shallow…"

True — a random BST is ~**1.39 log₂ n** deep (L03, Prop C). But that is an **average**, not a promise:

- **adversarial / sorted** input → the Θ(n) path above
- **Hibbard deletes** skew the tree toward ~√n (L03)
- you rarely control the insertion order

We want a **worst-case guarantee**, for any input.

--

## 🎬 Demo — plain BST vs AVL

<div class="algo-viz" data-algo="avl-vs-bst">
<pre class="viz-fallback">
  SAME keys 1..16, inserted in order:
  plain BST → a path                AVL → rebalances as it goes
   1                                        8
    \                                    /     \
     2                                  4       12
      \                               / \     /  \
       3                             2   6   10    14
        \                           / \ / \  / \   / \
         4  … height 15            1  3 5 7 9 11 13  15…16
            (= n−1)                height 4 = log2 16 (bound ≤ 1.44·log2 n ≈ 5.8)
 
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>The **same** keys 1…16: the **plain BST** grows a path, the **AVL** stays flat (live heights: **15 vs 4**). **Reset**, then **Insert** key-by-key to watch them diverge.</small>

--

## What would "balanced" even mean?

Ideally: **perfectly balanced** — every leaf at depth ⌊log₂ n⌋. But keeping a tree _perfectly_ balanced on each insert costs too much (you'd rebuild large chunks).

The AVL idea: **relax** perfect balance just enough that

- it's **cheap** to restore on each insert, yet
- the height stays **Θ(log n)**

--

## Why not just rebuild?

You _could_ periodically rebuild into perfect balance — but:

- a rebuild is **Θ(n)**; one insert shouldn't cost that
- between rebuilds the tree can already be a **Θ(n)** path
- the **per-operation** worst case is what we must bound

AVL instead: a **local** invariant — heights differ by **≤ 1** at every node (L03's *balanced*) — restored **incrementally**, O(1) work per level: **O(log n) per op, always**.

---

### Part 2 · The AVL invariant

<small>(~18 min)</small>

--

## What "AVL" means

**AVL** = **A**delson-**V**elsky & **L**andis (1962), the two mathematicians who invented it — the **first self-balancing BST**.

> **The AVL invariant.** Every node stays **balanced** — its two subtrees' heights differ by **at most 1** (L03's `balanced` shape).

The **balance factor** is the lean: **bf(x) = height(left) − height(right)** — the invariant is **bf ∈ {−1, 0, +1}**.

--

## Balance factor, by picture

```text
   bf = 0        bf = +1        bf = +2  ✗
     •             •               •
    / \           /               /
   •   •         •               •
                                 /
                                •
```

- heights within **1** → balanced (`−1, 0, +1`)
- a difference of **2** → we must fix it (a rotation)

Height convention: **height(null) = −1**, a leaf has height **0**.

--

## Perfectly balanced vs balanced

- **perfectly balanced** — all leaves at depth ≈ log₂ n; beautiful, but too rigid to maintain per insert
- **balanced (AVL)** — L03's shape: subtree heights differ by ≤ 1 at every node; a little slack → cheap to maintain

AVL is **not** perfectly balanced — just **balanced**, which is _close enough_ that height stays **Θ(log n)**.

--

## The node carries its height

```cpp
struct Node {
    Key   key;   Value val;
    Node* left  = nullptr;
    Node* right = nullptr;
    int   height = 0;        // leaf = 0, null = -1
};

int height(Node* t){ return t ? t->height : -1; }
int bf(Node* t){ return height(t->left) - height(t->right); }
void fix(Node* t){ t->height = 1 + max(height(t->left),
                                       height(t->right)); }
```

--

## Reading a tree: the balance factors

```text
      8   bf = +1
     / \
    4   9    bf 0, 0
   / \
  2   6    bf 0, 0
```

Left subtree of 8 has height 1, right has height 0 → **bf(8) = +1** (still legal). Every other node is 0.

--

## Verifying the invariant: `isAVL`

```cpp
bool isAVL(Node* t) {
    if (!t) return true;                 // empty is AVL
    if (abs(bf(t)) > 1) return false;    // this node violates
    return isAVL(t->left) && isAVL(t->right);
}
```

Checks **every** node's bf ∈ {−1, 0, +1}, recursively.

--

## Where can a violation appear?

An insert or delete changes heights **only along its root-to-leaf path**. So:

- only nodes **on that path** can reach bf ±2
- we check and fix **on the way back up** — nowhere else

That is why **one upward pass** is enough.

--

## 🎬 Demo — only the path is touched

<div class="algo-viz" data-algo="avl-path" data-example="8,4,12,2,6,10,14,1,3,5,7,9,11,15">
<pre class="viz-fallback">
              8
           /     \
          4       12          insert(16): plain-insert the leaf,
        /  \     /  \         then recompute bf up the path.
       2    6   10   14       A node hits bf ±2 (the imbalance) —
      / \  / \  / \    \      only PATH nodes change; off-path
     1  3 5  7 9 11    15     bf stay 0. (The FIX is Part 3.)

[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Every node shows its **bf**. **Insert** does a **plain insert** (the leaf appears), then recomputes bf **up the path** — a node **hits bf ±2** (red), and it can *only* be **on the path** (off-path **bf stay 0**). The demo **pauses** on that imbalance: the **rotation** that fixes it is **Part 3**.</small>

--

## The plan

1. **insert / delete** like an ordinary BST
2. update **heights** on the way back up
3. wherever a node's **bf hits ±2**, apply a **rotation** to restore it

The one new tool is the **rotation** — Part 3.

---

### Part 3 · Rotations

<small>(~20 min)</small>

--

## A rotation rebalances — without breaking order

A **rotation** re-hangs a parent/child pair. It:

- changes the two nodes' **heights** (fixing balance)
- **preserves the in-order** sequence → still a valid BST

It is the _only_ structural move AVL needs.

--

## Right rotation — the picture

```text
      y                 x
     / \              /   \
    x   C     →      A     y
   / \                    / \
  A   B                  B   C
```

`B` (keys between x and y) moves from x's right to y's left. `x` rises, `y` sinks.

--

## Right rotation — the code

```cpp
Node* rotateRight(Node* y) {
    Node* x = y->left;
    y->left = x->right;      // B re-hangs under y
    x->right = y;
    fix(y); fix(x);          // y is now lower → fix it first
    return x;                // x is the new subtree root
}
```

Three pointer writes, two height updates — all **O(1)**.

--

## Left rotation — the mirror

```text
    x                     y
   / \                  /   \
  A   y       →        x     C
     / \              / \
    B   C            A   B
```

```cpp
Node* rotateLeft(Node* x) {
    Node* y = x->right;
    x->right = y->left;      // B re-hangs under x
    y->left = x;
    fix(x); fix(y);
    return y;
}
```

--

## Order is preserved

In-order of both trees is the same: **A · x · B · y · C**.

```text
   y            x
  / \          / \
 x   C   ≡    A   y      in-order:  A x B y C
/ \              / \
A  B            B  C
```

Rotations move _structure_, never _order_ — so search still works after any rotation.

--

## The middle subtree re-hangs

Right-rotate at **50** (child **30** rises). **B = `40(35,45)`** — the keys *between* 30 and 50 — is the one subtree that **changes parent**:

```text
       50                        30
      /  \                      /   \
    30    75        →         20     50
   /  \                      /      /  \
  20   40                   10    40    75
 /    /  \                        /  \
10  35  45                       35  45
```

Only **B** re-hangs (30's right → 50's left) — the single line **`y->left = x->right`**; the whole subtree follows one pointer, in-order unchanged.

--

## 🎬 Demo — rotate a subtree

<div class="algo-viz" data-algo="avl-rotate">
<pre class="viz-fallback">
   RIGHT rotation about y (the LL case):        mirror = LEFT rotation
         y                     x
        / \                  / \
       x   C      ⇒         A   y          subtrees keep their order:
      / \                      / \         A ≤ x ≤ B ≤ y ≤ C
     A   B                    B   C        (in-order is unchanged)
 
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>**Click any node**, then **rotate**: only that subtree reshapes; the **in-order strip** never changes. The **orange** nodes are **B — the middle subtree that re-hangs** to the other node (the only parent change). Auto: node 50 is picked — right-rotate to watch `40(35,45)` swing from 30 to 50, everything else fixed.</small>

--

## The four imbalance shapes

When a node `z` goes to **bf ±2**, the direction of the two steps below it names the case:

| case   | the two steps     | fix                           |
| ------ | ----------------- | ----------------------------- |
| **LL** | left, then left   | one **right** rotation        |
| **RR** | right, then right | one **left** rotation         |
| **LR** | left, then right  | **double** (left, then right) |
| **RL** | right, then left  | **double** (right, then left) |

Straight (LL/RR) → one rotation. Kinked (LR/RL) → two.

--

## 🎬 Demo — the four styles

<div class="algo-viz" data-algo="avl-cases">
<pre class="viz-fallback">
   LL → right rotation        RR → left rotation
   LR → left, then right      RL → right, then left
   (straight leans = 1 rotation · kinks = 2)

[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Read the case from the **bf**s: the **±2 node**'s bf picks the **taller child** (edge 1); that child's bf picks edge 2. **Same** direction = **LL/RR → one** rotation; **opposite** = **LR/RL → two** (it pauses between them).</small>

---

### Part 4 · Insertion & rebalancing

<small>(~27 min)</small>

--

## Insert like a BST, then fix on the way up

1. **insert** the new key at a leaf (ordinary BST insert)
2. returning up the path, **`fix`** each node's height
3. at the **first** node whose **bf becomes ±2**, apply **one** rotation

That single rotation restores the height the subtree had _before_ the insert → the whole tree is balanced again.

--

## LL — a single right rotation

`z` is left-heavy and its left child leans left too. Insert **1** into `3 ← 2`:

```text
    3 (bf +2)             2
   /                     / \
  2          →          1   3
 /
1
```

One **rotateRight(3)** — and `2` becomes the root of a balanced subtree.

--

## RR — a single left rotation

`z` is right-heavy and its right child leans right. Insert **3** into `1 → 2`:

```text
  1 (bf −2)              2
   \                    / \
    2         →        1   3
     \
      3
```

One **rotateLeft(1)** — the sorted-ascending case from Part 1, now self-correcting.

--

## LR — a double rotation

`z` is left-heavy but its left child leans **right** (a kink). Insert **2** into `3 ← 1`:

```text
    3            3            2
   /            /            / \
  1     →      2      →     1   3
   \          /
    2        1
```

**rotateLeft(1)** straightens it into LL, then **rotateRight(3)** finishes.

--

## RL — a double rotation

`z` is right-heavy but its right child leans **left**. Insert **2** into `1 → 3`:

```text
  1            1                2
   \            \              / \
    3     →      2      →     1   3
   /              \
  2                3
```

**rotateRight(3)** straightens into RR, then **rotateLeft(1)** finishes.

--

## Why exactly one rotation is enough

One insert adds **at most 1** to any subtree height, so the lowest violating node is off by exactly 1 too much.

- the rotation there **lowers that subtree's height by 1**
- back to its pre-insert height → every ancestor is balanced again

So insertion needs **at most one** (single or double) rotation.

--

## `rebalance` — pick the case from balance factors

```cpp
Node* rebalance(Node* t) {
    fix(t);
    if (bf(t) > 1) {                 // left-heavy (LL or LR)
        if (bf(t->left) < 0)         // LR → straighten first
            t->left = rotateLeft(t->left);
        return rotateRight(t);
    }
    if (bf(t) < -1) {                // right-heavy (RR or RL)
        if (bf(t->right) > 0)        // RL → straighten first
            t->right = rotateRight(t->right);
        return rotateLeft(t);
    }
    return t;                        // |bf| ≤ 1 → balanced
}
```

--

## Insertion — the whole thing

```cpp
Node* insert(Node* t, const Key& k, const Value& v) {
    if (!t) return new Node{k, v};       // leaf, height 0
    if      (k < t->key) t->left  = insert(t->left,  k, v);
    else if (k > t->key) t->right = insert(t->right, k, v);
    else { t->val = v; return t; }       // duplicate → update
    return rebalance(t);                 // fix + rotate up
}
```

Same shape as the L03 BST insert — plus **`rebalance`** on the way up.

--

## Worked trace: insert 1…7 in order

Sorted input — a **height-6 path** in a plain BST. The AVL rotates as it goes:

```text
 after 1,2,3     after 4,5         after 6,7
   2               2                  4
  / \             / \                / \
 1   3           1   4              2   6
                    / \            / \ / \
                   3   5          1  3 5  7
```

Seven worst-case inserts → **height 2**, never a path.

--

## 🎬 Demo — AVL insertion

<div class="algo-viz" data-algo="avl-insert" data-example="80,40,120,20,60,100,140,10,30,50,70,90,110,130,150,15,25,35,45,55,65,75,85,95,105,115,145,155">
<pre class="viz-fallback">
  insert 160: descend → PLAIN-insert the leaf → recompute bf up →
  node 140 hits bf −2 → ONE rotation (left) → balanced again.
  every node shows its bf; only the path changes.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Auto-runs **insert 160**: descend → **plain-insert** the leaf → recompute **bf** up the path — it **pauses** at bf −2 (node **140**) so you can **predict the rotation**, then **▶ continue** rotates it. Every node shows its bf; only the path changes. (Full sandbox with all ops: the **Demos** page.)</small>

---

## ☕ Break (10 min)

Halfway: insert is done. After the break — **deletion**, then the **Θ(log n) proof**.

---

### Part 5 · Deletion

<small>(~16 min)</small>

--

## Delete like a BST — then rebalance up

Deletion starts exactly like L03:

- **0 or 1 child** → splice the node out
- **2 children** → copy the **in-order successor** up, delete it from the right subtree

…then, on the way back up, **`fix` heights and `rebalance`** each node — same four-case tool as insert.

--

## The catch: deletion can rotate at _every_ level

Insertion needs **one** rotation. Deletion is different:

- a delete **shortens** a subtree by 1
- rebalancing there can shorten the _parent_ — which may now violate
- so a rotation may be needed at **each** node up the path

Still **O(log n)** rotations total (the path is log-tall), but not just one.

--

## Which rotation? Same balance factors

At a node that hit **bf ±2** after a delete, read the **taller** side's child:

- **left-heavy**, left child bf ≥ 0 → **right** rotation (LL)
- **left-heavy**, left child bf < 0 → **double** (LR)
- **right-heavy**, mirror → **left** / **double** (RL)

Exactly the `rebalance` from Part 4 — no new cases.

--

## Deletion — the code

```cpp
Node* erase(Node* t, const Key& k) {
    if (!t) return nullptr;
    if      (k < t->key) t->left  = erase(t->left,  k);
    else if (k > t->key) t->right = erase(t->right, k);
    else {                               // found it
        if (!t->left || !t->right) {     // 0 or 1 child
            Node* c = t->left ? t->left : t->right;
            delete t;  return c;
        }
        Node* s = minNode(t->right);     // successor
        t->key = s->key;  t->val = s->val;
        t->right = erase(t->right, s->key);
    }
    return rebalance(t);                 // fix + rotate up
}
```

--

## Worked: delete 4 from a small AVL

```text
     4             5             5
    / \           / \           / \
   2   6    →    2   6    →     2   6
      / \           / \            \
     5   7         5   7            7
   delete      copy succ 5     remove leaf 5
```

Delete 4 (two children): copy its **successor 5** up, then remove 5 from the right subtree. `rebalance` checks each node on the way up — here all stay within ±1, no rotation.

--

## Worked: a delete that rotates

Delete **1** — the right side is now too tall (bf −2):

```text
     3            3 (bf −2)        4
    / \            \              / \
   1   4    →        4      →     3   5
        \            \
         5            5
```

Removing 1 leaves 3 right-heavy (RR) → one **rotateLeft(3)** restores it.

--

## 🎬 Demo — deletion, all cases

<div class="algo-viz" data-algo="avl-del">
<pre class="viz-fallback">
  the five cases (pick one):
   leaf         · just remove it
   one child    · splice it out
   two children · copy the successor up, remove its node
   + rotation   · a bf ±2 on the path → one rotation
   + cascade    · a delete can rotate at MORE THAN ONE level

[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Pick a case — **leaf · one child · two children · + rotation · + cascade**. Each animates **descend → remove → recompute bf up the path**, pausing at any **bf ±2** so you can predict the rotation. Unlike insert, a delete can rotate at **several levels** (the cascade).</small>

---

### Part 6 · The Θ(log n) guarantee

<small>(~24 min)</small>

--

## How tall can an AVL tree get?

Turn it around: the **fewest nodes** in an AVL tree of height **h** — call it **N(h)**.

A _minimal_ tree: a root, one subtree of height **h−1**, the other as short as the invariant allows — **h−2**.

$$N(h) = 1 + N(h{-}1) + N(h{-}2)$$

with **N(−1) = 0**, **N(0) = 1**.

--

## The minimal AVL tree

```text
 h=0   h=1     h=2         h=3
  •     •       •           •
       /       / \         / \
      •       •   •       •   •
             /           / \   \
            •           •   •   •
                       /
                      •
N:  1     2       4           7
```

Each is a root over the two smallest legal subtrees — height h−1 and h−2.

--

## That recurrence is Fibonacci — in disguise

```text
 h      :  0   1   2   3   4    5    6    7
 N(h)   :  1   2   4   7  12   20   33   54
 N(h)+1 :  2   3   5   8  13   21   34   55   ← Fibonacci!
```

**N(h) = 1 + N(h−1) + N(h−2)**, with N(0)=1, N(1)=2. The **+1** is the only thing hiding Fibonacci: the third row, **N(h)+1**, *is* Fibonacci.

--

## Fibonacci — absorbing the +1

Soak up the pesky **+1** with a shifted sequence **M(h) = N(h) + 1**:

```text
N(h) = 1 + N(h−1) + N(h−2)          N(0) = 1, N(1) = 2

M(h) = N(h) + 1
     = N(h−1) + N(h−2) + 2
     = (N(h−1) + 1) + (N(h−2) + 1)
     = M(h−1) + M(h−2)              ← pure Fibonacci

M(0) = 2 = Fib(3)    M(1) = 3 = Fib(4)
  ⇒  M(h) = Fib(h+3)
  ⇒  N(h) = Fib(h+3) − 1  ≥  φ^h    (φ = 1.618…)
```

--

## Solve for the height

An AVL tree with n nodes and height h has **n ≥ N(h) ≥ φ^h** (easy induction, using φ² = φ+1). Taking logs (base φ = 1.618):

$$h \le 1.44 \log_2 n$$

So its height is **Θ(log n)** — for **any** sequence of inserts and deletes.

--

## The height is sandwiched

Two bounds pin the height of an n-node AVL tree:

- **lower** — even perfect balance needs height ≥ **log₂ n**
- **upper** — the Fibonacci argument gives height ≤ **1.44 log₂ n**

So **log₂ n ≤ h ≤ 1.44 log₂ n** — the height is **Θ(log n)**, tight to a constant.

--

## Three levels of "balanced"

| tree                        | height bound    |
| --------------------------- | --------------- |
| perfectly balanced          | **1.00** log₂ n |
| **AVL** (balanced)          | **1.44** log₂ n |
| red-black (S05)             | **2.00** log₂ n |

AVL is **stricter** than red-black → shorter trees, faster lookups (but more rotations on update — Part 7).

--

## One billion keys

Concretely, for **n = 1,000,000,000**:

- a plain BST's worst case: up to **1,000,000,000** compares
- an AVL tree: at most **1.44 · log₂ 10⁹ ≈ 43** compares

Any search, insert, or delete touches **at most ~43 nodes** — guaranteed, for any input.

--

## Every operation is Θ(log n) — guaranteed

Each operation walks one path, and the path is now **≤ 1.44 log₂ n**:

| operation | plain BST (worst) | **AVL (worst)** |
| --------- | ----------------- | --------------- |
| search    | Θ(n)              | **Θ(log n)**    |
| insert    | Θ(n)              | **Θ(log n)**    |
| delete    | Θ(n)              | **Θ(log n)**    |

L03 gave Θ(log n) **on average**. AVL gives it as a **worst-case guarantee**.

--

## The price of balance

Not free, but cheap:

- **+1 int** per node (the height)
- each insert: **one** rotation; each delete: **O(log n)** rotations
- a few extra `fix`/`bf` checks per node on the way up

You trade a little constant overhead for a hard worst-case bound.

---

### Part 7 · Where AVL is used

<small>(~12 min)</small>

--

## AVL vs red-black — the tradeoff

Both guarantee Θ(log n); they balance differently:

- **AVL** — stricter (≤ 1.44 log₂ n) → **shorter** trees, **faster search**, but **more rotations** per update
- **red-black** — looser (≤ 2 log₂ n) → taller, but **fewer rotations** per update

Rule of thumb: **search-heavy → AVL**; **update-heavy → red-black**.

--

## AVL vs plain BST vs red-black

|                    | plain BST | **AVL**         | red-black     |
| ------------------ | --------- | --------------- | ------------- |
| height (worst)     | n − 1     | **1.44 log₂ n** | 2 log₂ n      |
| search             | Θ(n)      | **Θ(log n)**    | Θ(log n)      |
| rotations / insert | 0         | **≤ 1** (single or double) | ≤ 2 + recolors |
| rotations / delete | 0         | **O(log n)**    | ≤ 3           |
| extra per node     | —         | 1 int           | 1 bit         |

--

## Where the guarantee matters

A plain BST is fine until the input is adversarial. Balance makes **Θ(log n) worst-case** a promise:

- **sorted input** → a **DoS** on a plain BST
- **real-time / embedded** — a _bounded_ worst case
- **`std::map` / `std::set`** — balanced (red-black) trees
- **Linux kernel** — scheduler, timers, memory maps
- **databases** — **B-trees** power every index

--

## A concrete win: guaranteed-fast lookups

A ticket system hands out **strictly increasing** IDs — the exact input that turns a plain BST into a Θ(n) path.

- plain BST: the millionth lookup can cost **~1,000,000** compares
- **AVL**: every lookup stays **≤ ~20** compares — it self-balances as IDs arrive

Same code shape as a BST; the invariant does the rest. _(You build this in ICA 04.)_

---

### Part 8 · Wrap & ICA 04

<small>(~6 min)</small>

--

## The template for every balanced tree

AVL is one instance of a universal recipe:

1. pick a **local invariant** that bounds height
2. after each update, **restore it with O(1) rotations**, bottom-up
3. prove the invariant ⇒ **Θ(log n)** height

Red-black, 2-3, and B-trees change the _invariant_ — never the goal.

--

## Recap

- BST cost = **height**; a plain BST's worst case is a **Θ(n)** path
- **AVL invariant**: balance factor **∈ {−1, 0, +1}** at every node
- **rotations** restore it (single LL/RR, double LR/RL) — O(1), order-preserving
- **insert** → one `rebalance`; **delete** → `rebalance` up the whole path
- min nodes **N(h)** = **Fibonacci** ⇒ height **≤ 1.44 log₂ n** ⇒ **Θ(log n)**

--

## ICA 04 — your turn

In `ica04/ica04.cpp` — node, helpers, and a **self-running test battery** are given; fill the `TODO`s, re-run, watch tests flip:

- **write:** `bf`/`fix` · rotations · `rebalance` (4 cases) · `insert` · `isAVL` + `contains`
- **stretch (+1 EC):** `erase` with rebalancing
- **T1–T9:** basics · one test **per rotation case** · duplicates · shuffled · **sorted & reverse 1..1023** (height ≤ 14)

--

## ICA 04 — memory & submit

- **memory:** the first **leak-graded** ICA — **2 of 10 pts** = Valgrind-clean (handout on the Handouts page)
- **grading:** 5 mechanics · 2 battery · 1 isAVL+contains · 2 Valgrind · +1 EC (full table in the ICA 04 page)
- **submit:** `ica04.cpp` in the Canvas quiz — resubmits allowed, **due Fri 11:59 pm**

