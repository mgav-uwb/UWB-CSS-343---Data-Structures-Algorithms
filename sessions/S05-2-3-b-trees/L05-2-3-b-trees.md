<!--
  CSS 343 · Lecture 5 (Session 5) — Balanced Trees II: 2-3, B & B+ Trees.
  reveal.js: "---" = next part (→), "--" = next slide (↓). Notes follow "Note:".
  Concrete C++ (structs, pointers) — no templates/inheritance. KaTeX: never two
  "_" on one line. Verify slides at 1280×620; code/ASCII lines ≤ ~56 chars (0.46em).

  Reading (pre): Sedgewick & Wayne §3.3 (2-3 search trees & red-black BSTs) +
  ODS Ch 14 (B-trees). THROUGH-LINE: L04 hit Θ(log n) via a tight ±1 invariant
  restored by ROTATIONS. Tonight: the SAME guarantee via a different mechanism —
  let a node hold more keys, keep every leaf at the same depth, and grow the tree
  UPWARD by splitting. 2-3 trees are the idea; red-black BSTs are how we code it;
  B/B+ trees are how databases scale it to disk.

  Session plan (150 min).  0:00 intro  0:04 P1 AVL→multiway 20  0:24 P2 2-3 insert
  30  0:54 P3 red-black 26  1:20 BREAK 10  1:30 P4 B/B+ trees 30  2:00 P5 which +
  wrap 24  2:24 ICA  2:30 end.
-->

## CSS 343

### Data Structures, Algorithms & Discrete Mathematics II

**Lecture 5 — Balanced Trees II: 2-3, B & B+ Trees**

<small>Summer 2026 · T/Th 6:00–8:30 · UW1 020 · Dr. Marcel Gavriliu</small>

---

## Reading

**Sedgewick & Wayne §3.3** — Balanced Search Trees · algs4.cs.princeton.edu

- how a **2-3 tree** stays perfectly balanced with **no rotations**
- how a **red-black BST** encodes a 2-3 tree as a BST + one color bit

_Secondary:_ ODS Ch 14 (B-trees). Reading quiz due before class.

---

### Part 1 · From AVL to multiway

<small>(≈20 min)</small>

--

## Recap: balance by rotation

L04's AVL tree kept a **binary** tree balanced:

- one invariant — balance factor **∈ {−1, 0, +1}**
- restored after each op by **rotations**
- result: height **≤ 1.44 log₂ n** — a **guarantee**

It works — but rotations are fiddly: LL/RR/LR/RL on insert, and delete can **cascade** rotations up the path.

--

## Tonight: three trees, one idea

- **2-3 tree** — the *idea*: perfect balance, no rotations
- **red-black BST** — how we *code* it: a BST + one color bit
- **B / B+ trees** — how databases *scale* it: fat nodes on disk

All reach the same **Θ(log n)** guarantee as AVL — a completely different way.

--

## A different idea: fatter nodes

What if a node could hold **more than one key** — and have **more than two children**?

Then we can absorb new keys **into** a node instead of growing a lopsided path. Balance becomes a property we get "for free" instead of one we repair.

That is the **2-3 tree**.

--

## 2-3 nodes

Every node is one of two kinds:

```text
   2-node (1 key)          3-node (2 keys)
       [ b ]                 [ a | c ]
       /   \                /    |    \
    < b     > b          < a  a..c    > c
```

- **2-node**: 1 key, 2 children (an ordinary BST node)
- **3-node**: 2 keys `a < c`, **3 children** — less than `a`, between `a` and `c`, greater than `c`

--

## The invariant: perfect balance

> **A 2-3 tree keeps *every* leaf at the *same* depth — always.**

No "±1 slack" like AVL. Perfect balance, maintained on every insert, with **no rotations**.

Height is therefore between **log₃ n** (all 3-nodes) and **log₂ n** (all 2-nodes) → **Θ(log n)**, guaranteed.

--

## Search is just "pick a door"

```text
                  [ 50 ]
           /                \
     [ 20 | 35 ]        [ 70 | 85 ]
    /    |     \       /    |     \
 [10] [25|30] [40|45][60|65][75|80][90|95]
```

Search **65**: `65 > 50` → right → `[70|85]`; `65 < 70` → left → leaf `[60|65]` → found.

Three levels, three "pick a door" decisions. Search cost = one comparison group per level = **Θ(height) = Θ(log n)**.

--

## Search — when it's not there

```text
                  [ 50 ]
           /                \
     [ 20 | 35 ]        [ 70 | 85 ]
    /    |     \       /    |     \
 [10] [25|30] [40|45][60|65][75|80][90|95]
```

Search **68**: `68 > 50` → right → `[70|85]`; `68 < 70` → left → leaf `[60|65]`; `68` isn't 60 or 65 → **not present**.

Same rule as a BST miss — you fall off the bottom at a leaf, having done Θ(height) work either way.

--

## 2-3 vs. a plain BST

Why a 2-3 tree, when a BST already searches in Θ(height)?

- a 2-3 node may hold **two** keys → **fewer levels**
- but the win isn't raw comparisons (you may test 2 keys per node)
- the win is that **balance is automatic** — and *keeping* it is simple

--

## Why balance comes for free

Preview of the trick: a 2-3 tree **grows at the root, not the leaves**.

- a BST adds a new **leaf** → one side can get deeper → imbalance
- a 2-3 tree pushes growth **upward** (via splits) → every leaf rises together

So the "same depth" invariant is preserved by *construction*, not repaired.

---

### Part 2 · 2-3 insert: split & promote

<small>(≈30 min)</small>

--

## Insertions always land in a leaf

Search down for the key as usual; it isn't there, so you stop at a **leaf**. Insert **there** — but never as a new deeper leaf (that would break "all leaves same depth"). Instead, **absorb** the key into the leaf node.

Two cases: the leaf is a **2-node** or a **3-node**.

--

## Case 1 — into a 2-node: just grow it

The leaf has room. A 2-node becomes a 3-node. **No height change.**

```text
 insert 15 into [10]        →     [10 | 15]
```

Done. The tree stayed perfectly balanced because nothing moved.

--

## Case 2 — into a 3-node: it overflows

A 3-node is full. Adding a key makes a temporary **4-node** (3 keys) — not allowed. **Split** it:

```text
 insert 40 into [30|50]  →  temp [30|40|50]

        promote the MIDDLE (40) up
                 [40]
                /    \
             [30]    [50]
```

The middle key **moves up to the parent**; the node splits into two 2-nodes.

--

## …and the split can cascade

The promoted key joins the **parent**. If the parent was a 3-node, **it** overflows and splits too — promoting up again. This can ripple to the root.

**If the root splits, the promoted key becomes a *new root*.** That is the *only* way a 2-3 tree gets taller — and it adds a level at the **top**, so **all leaves stay at the same depth**.

--

## Split — where the three pieces go

A full leaf `[a|c]` plus a new key `b` (temp `[a|b|c]`) splits cleanly:

```text
       temp [ a | b | c ]
                 ↓
              [ b ]          b promotes
             /     \
          [a]      [c]       a, c become two 2-nodes
```

The **middle** key always promotes; the smaller and larger stay as leaves. In-order order is untouched.

--

## The root split — the tree grows up

```text
  promote reaches a full ROOT [p|q], new middle m:

       temp [ p | m | q ]          [ m ]     ← NEW root
                          →       /     \
                               [p]      [q]     +1 level
```

A new root appears and **every** leaf is one level deeper — all still level. This is the **only** way the height grows.

--

## A worked insertion sequence

Insert **50, 30, 70, 10, 20** into an empty 2-3 tree:

```text
 50 → [50]
 30 → [30|50]
 70 → [30|50|70]  split → [50] over [30] [70]
 10 → into [30] → [10|30]
 20 → [10|20|30]  split → promote 20 → root [20|50]
```

The root fills, then splits — the tree gains its second level at the top.

--

## A cascade that reaches an already-tall root

Insert **25** into a tree whose root is *already full*:

```text
 before:      [ 30 | 60 ]
             /     |      \
       [10|20]  [40|50]  [70|80]

 25: leaf splits (promote 20) → root
 overflows → root splits too → new root:

 after:          [ 30 ]
             /            \
        [ 20 ]            [ 60 ]
       /      \          /      \
    [10]    [25]    [40|50]   [70|80]
```

**One insert, two splits** — every leaf still lands at depth 2.

--

## 2-3 insert — the node, in C++

```cpp
struct Node {
    int   key[3];          // 1-2 keys; slot 2 mid-overflow
    Node* child[4] = {};   // one more slot than keys
    int   n = 0;           // how many keys right now
    Node(int k) { key[0] = k; n = 1; }  // k: the new key
    bool  leaf() const { return child[0] == nullptr; }
};
```

Fixed-size arrays, not `vector` — a node never holds more than 3 keys, even briefly.

--

## 2-3 insert — descend and cascade

```cpp
// x: subtree to insert into (never null). k: the key.
// upKey/upR: OUT — if x's subtree splits, they receive
// the promoted key and its new right sibling.
Node* ins(Node* x, int k, int& upKey, Node*& upR) {
    upR = nullptr;
    if (x->leaf()) addKey(x, k, nullptr);
    else {
        int i = childIndex(x, k), ck; Node* cr;
        x->child[i] = ins(x->child[i], k, ck, cr);
        if (cr) addKey(x, ck, cr);  // absorb from below
    }
    if (x->n == 3) upR = split(x, upKey);  // overflow
    return x;
}
```

`addKey`/`split` are tonight's ICA — everything else here is given.

--

## 2-3 insert — growing the root

```cpp
// root: current root (nullptr if empty). k: the key.
Node* insert(Node* root, int k) {
    if (!root) return new Node(k);
    if (contains(root, k)) return root;  // it's a SET
    int upKey; Node* upRight;
    root = ins(root, k, upKey, upRight);
    if (upRight) {        // the ROOT itself split
        Node* nr = new Node(upKey);
        nr->child[0] = root; nr->child[1] = upRight;
        root = nr;          // tree grows +1 level
    }
    return root;
}
```

`insert` (given) handles two things `ins` can't: rejecting a duplicate up front, and — when the **root itself** splits — creating a new root.

--

## Practice — you try

Insert **65** into:

```text
        [ 40 ]
       /      \
   [20|30]   [60|70]
```

<small>65 > 40 → leaf `[60|70]` is full → temp `[60|65|70]` → **split**, promote **65** → root becomes `[40|65]`, leaves `[20|30] [60] [70]`. Every leaf still at depth 1. ✓</small>

--

## 🎬 Demo — 2-3 insert

<div class="algo-viz" data-algo="tt-insert">
<pre class="viz-fallback">
  insert into a full leaf → temporary 4-node → promote the
  middle key up → split into two 2-nodes → (repeat up if the
  parent overflows; a root split adds a level at the TOP).
  every leaf stays at the same depth.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Watch a **full leaf split**: the **middle key promotes** up, the node becomes two 2-nodes, every leaf stays level. Full sandbox on the **Explore** page.</small>

--

## Cost — Θ(log n), no rotations

- **height**: between `log₃ n` and `log₂ n`
- **search / insert**: `Θ(log n)` — a constant amount of work per level
- **splits per insert**: at most one per level, usually far fewer

A guaranteed-balanced search tree, and we never wrote a rotation.

--

## Delete — is it really that complicated?

Short answer: **not conceptually** — it's the mirror image of insert. **Merge and demote** instead of split and promote. The extra cases are real, but there's no new idea. Let's actually do it.

--

## Step 1 — always remove from a leaf

Search down for the key. Two cases:

- it's in a **leaf** → remove it directly
- it's **internal** → swap with the **in-order predecessor** (rightmost key of its left subtree — always a leaf), remove *that* copy instead

Either way, removal always happens at a leaf — same discipline as insert's "always land in a leaf."

--

## Underflow: BORROW from a sibling

Removing a key can leave a node with **0 keys**. If a sibling has **2 keys** (can spare one), rotate a key through the parent:

```text
 before:        [ 30 ]      delete 10: [10] underflows
                /      \     (0 keys); right sibling has
            [10]     [40|50] 2 keys, can lend one
 after (borrow through the parent):
                [ 40 ]
               /      \
           [30]      [50]
```

30 drops down to fill the gap; 40 rises to replace it — done in one step.

--

## Otherwise: MERGE with a sibling

If every sibling is at the minimum (1 key), merge instead — pull the parent's key down:

```text
 before:      [ 20 | 50 ]    delete 10: [10] underflows;
             /     |     \    [30] has only 1 key too —
         [10]   [30]    [60]  no one can lend. MERGE.
 after (merge [ ] + 20 + [30], parent shrinks):
             [ 50 ]
            /      \
       [20|30]    [60]
```

The parent **loses** a key — which may underflow **it** too, cascading up. If the **root** empties, its child becomes the new root: the tree **shrinks** a level.

--

## 2-3 delete — in C++

Delete's natural shape needs one thing insert didn't: a way back **up**. The simplest fix is a `parent` pointer on `Node` (insert never needed one — it only ever walked down).

```cpp
// n: the node that just underflowed to 0 keys (never
// null — it's always a real node). borrowFrom/mergeWith
// are the moves worked out on the last 2 slides.
void fixUnderflow(Node* n) {
    while (n->parent && n->n == 0) {
        Node* p = n->parent;
        Node* sib = richSiblingOf(p, n);  // has 2 keys?
        if (sib) { borrowFrom(p, n, sib); return; }
        mergeWith(p, n);        // Step 2b
        n = p;                  // may cascade
    }
}
```

--

## 🎬 Demo — 2-3 delete

<div class="algo-viz" data-algo="tt-insert">
<pre class="viz-fallback">
  delete → find the key (swap to a leaf if internal) →
  remove it → if the leaf underflows, BORROW from a
  richer sibling through the parent, or MERGE with a
  sibling (pulling the parent's key down) — cascading up.
  a merge that empties the root shrinks the tree by one level.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Same box as the insert demo — it has a **Delete** button too. Delete a leaf key (borrow), then delete enough neighbors to force a **merge**.</small>

---

### Part 3 · Red-black BSTs

<small>(≈26 min)</small>

--

## 2-3 is elegant… but painful to code

Two node types, split logic, promotion, new roots — lots of cases, lots of pointer surgery. In real code we'd rather have **one** node type.

**Idea:** represent a 2-3 tree as an ordinary **binary** tree, using a **color bit** on each link to remember where the 3-nodes were.

--

## Encode a 3-node with a red link

A **3-node** `[a | c]` becomes two BST nodes joined by a **RED** link; all other links are **BLACK**:

```text
   3-node            red-black BST
  [ a | c ]      →        c            (red link
   /  |  \               / \            a—c glues
  A   B   C          a(red) C           the 3-node)
                     /  \
                    A    B
```

A 2-node is just a black-linked BST node. Red links **lean left** (a convention that halves the cases).

--

## The color is on the *link*

Convention: a node's **color** = the color of the link **to its parent**.

- **red** link → this node is glued into its parent as a **3-node**
- **black** link → an ordinary 2-3 tree edge
- the **root** link is **black** by definition

So "a red node" just means "a red link above it."

--

## The red-black invariants

1. Red links **lean left** (no right-leaning red links).
2. **No node has two red links** in a row (no 3-node has a third key — that's the "4-node" we must split).
3. **Black balance:** every root-to-null path has the **same number of black links**.

Invariant 3 = "all 2-3 leaves at the same depth," restated for the binary encoding.

--

## The three restoring moves

Insert like a normal BST (the new link is **red**), then on the way up apply whichever fixes a violation:

```text
   right child red, left black     →  rotateLeft
   left red AND left-left red       →  rotateRight
   both children red                →  flipColors
```

Each move mirrors a 2-3 split or promote — and there are only **three** of them.

--

## rotateLeft / rotateRight

The order-preserving pointer surgery from L04 — now it also **carries the red color**:

```cpp
// h: subtree root to fix (its right link leans red).
// x (=h->right) can't be null — a null link is black.
// x rises and inherits h's color; h drops to x's left
// and turns red.
Node* rotateLeft(Node* h) {
    Node* x = h->right;
    h->right = x->left;
    x->left  = h;
    x->red = h->red;   // x takes h's old color
    h->red = true;      // h is now glued to x as red
    return x;
}
```

`rotateRight` mirrors it (swap `left`/`right`). Nodes only move; in-order is unchanged, exactly as in L04.

--

## flipColors = a 2-3 split

When a node has **two red children**, it is a temporary **4-node**. Flip all three colors:

```cpp
// h: node with two red children — a temporary 4-node.
// Neither child is null (red implies non-null). Push
// the color up (h "promotes"); children turn black.
void flipColors(Node* h) {
    h->red        = !h->red;
    h->left->red  = !h->left->red;
    h->right->red = !h->right->red;
}
```

`h` turning red is it "joining its parent" — which may now have two reds itself, cascading exactly like a 2-3 split. That is precisely "promote the middle and split," expressed in color.

--

## 🎬 Demo — red-black insert

<div class="algo-viz" data-algo="rb-insert">
<pre class="viz-fallback">
   left-leaning red-black BST. insert = BST insert (the new
   link is RED) + fix-ups on the way up: rotateLeft,
   rotateRight, flipColors. RED links drawn thick red; every
   root-to-null path keeps the same number of BLACK links.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>**Red links** (thick, red) are the glued 3-nodes. Insert and watch the fix-ups: a **rotateLeft** leans a red left, a **flipColors** splits a 4-node. Black-height stays equal on every path. (Delete works too — more on that next.)</small>

--

## Delete — same idea, more cases

Insert only fixes up on the way **back up**. Delete can't wait — descending through an all-**black** link and deleting under it would break black-balance immediately. So delete fixes up on the way **down**, too.

**moveRedLeft** / **moveRedRight**: before stepping into a black-linked child, borrow a red onto it first — so we're always deleting out of (at least) a 3-node.

--

## moveRedLeft, in C++

```cpp
// h: red subtree root about to be descended into on the
// LEFT; h->left and h->left->left are black. h has BOTH
// children here (2-3: a non-leaf's children all exist).
Node* moveRedLeft(Node* h) {
    flipColors(h);
    if (isRed(h->right->left)) {
        h->right = rotateRight(h->right);
        h = rotateLeft(h);
        flipColors(h);
    }
    return h;
}
```

`moveRedRight` is the mirror image. Both are built **entirely** from the three moves already on the table — nothing new, just applied going down instead of up.

--

## Is it really that complicated?

- **Conceptually**: no new idea — still rotateLeft, rotateRight, flipColors
- **Casework**: yes, roughly **2×** insert — fix-ups going down *and* back up
- **that's why** `TreeMap` / `std::map` implement it **once**, carefully, for good

Try it yourself — the red-black demo above has a working **Delete** button.

--

## Proof, part 1 — bounding b

**Collapse every red link into its parent** — two nodes glued by red merge into one 2-3 node, recovering the **2-3 tree** this encoding started from.

- the tree's **black** links = the 2-3 tree's **edges**, so `b` = **that 2-3 tree's height**
- Part 2 showed a 2-3 tree's height is `≤ log₂ n` (worst case, all 2-nodes)

So: **b ≤ log₂ n**.

--

## Proof, part 2 — no double-reds

Between any two **black** links, invariant 2 allows **at most one red** (two in a row is the violation `flipColors` removes) — so **height ≤ 2b**.

Combine with part 1 (`b ≤ log₂ n`): **height ≤ 2 log₂ n = Θ(log n)**, guaranteed for any insert order. ∎

--

## Why we care

Because a red-black BST is **one node type + one color bit**, it's the balanced tree that real libraries ship:

- C++ `std::map` / `std::set`
- Java `TreeMap` / `TreeSet`
- the Linux kernel scheduler, and more

Guaranteed **Θ(log n)**, height **≤ 2 log₂ n**, with plain-BST code plus recoloring.

--

## Red-black vs AVL

| | AVL | red-black |
|---|---|---|
| height | ≤ 1.44 log₂n | ≤ 2 log₂n |
| balance | **tighter** | looser |
| restructuring / insert | up to log n | **≤ 2 rotations** |
| best for | **read**-heavy | **write**-heavy |

Both guaranteed Θ(log n) — AVL searches a bit faster, red-black updates a bit faster.

---

### Part 4 · B-trees & B+ trees

<small>(≈30 min)</small>

--

## Generalize: let nodes hold *many* keys

A 2-3 node holds 1–2 keys. Why stop at 2? A **B-tree of order M** lets each node hold up to **M − 1 keys** (M children), and keeps every leaf at the same depth — same split-and-promote, splitting when a node reaches **M** keys.

2-3 trees are just **B-trees of order 3**.

--

## Why fat nodes? The disk.

Reading from disk/SSD isn't ≈1× RAM — it's **≈10⁵× slower**, and it comes a whole **block** (page) at a time. So the cost that matters is **number of node accesses = disk reads**, not comparisons.

```text
   register  ~1 ns
   RAM      ~100 ns
   SSD      ~100 µs      ← ~1000× RAM
   disk     ~10 ms       ← ~100000× RAM
```

--

## Make each node one disk block

Size a node to fill **one block** → each node holds **hundreds** of keys → the tree is only a few levels deep. Height = **log_M n**.

```text
   order M = 1000,  n = 1,000,000,000 keys
   height ≈ log_1000(10^9) = 3
```

A **billion** keys, any lookup in **≈3 disk reads**. That is why databases and filesystems use B-trees.

--

## An M-ary search tree

Generalize the search rule: a node holds a **sorted array** of up to `M−1` keys and `M` child pointers.

```text
   [ k1 | k2 | … | k_{M-1} ]
    /   |    |         \
  <k1  k1..k2  …       >k_{M-1}
```

One block read brings the whole key array into memory; a single in-memory binary search picks the child. **1 disk read per level.**

--

## The order property

A **B-tree of order M** requires:

- every node has at most **M** children (M−1 keys)
- every **non-root** node has at least **⌈M/2⌉** children
- the **root** has at least 2 children (unless it's a leaf)
- **all leaves at the same depth**

The min-children rule keeps nodes **at least half full** → guaranteed shallow.

--

## A B-tree node, in code

```cpp
struct BTreeNode {
    int   key[M - 1];     // sorted keys
    BTreeNode* child[M];  // one more than keys
    int   n;              // current # of keys
    bool  leaf;
};
```

Search: binary-search `key[]` in RAM, follow `child[i]`. **One node = one block = one disk read.**

--

## Why not a plain BST on disk?

A balanced **binary** tree over `10⁹` keys is ≈**30 levels** → up to **30 disk reads** per lookup (≈0.3 s on a spinning disk).

The same keys in an order-1000 B-tree: **3 reads** (≈30 ms). **10× fewer** block I/Os — the branching factor is doing all the work.

--

## 🎬 Demo — B-tree insert

<div class="algo-viz" data-algo="btree-insert">
<pre class="viz-fallback">
   B-tree order 5 (each node holds up to 4 keys):

        [ 30 | 60 ]
        /    |     \
  [10|20] [40|50] [70|80|90]

   insert → find the leaf → if it reaches 5 keys, split,
   promoting the middle key up (same rule as 2-3, wider).
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Same **split-and-promote** as a 2-3 tree, just wider: a node splits when it fills (here at 5 keys). Watch the middle key rise and the fan-out stay high.</small>

--

## B-tree insert — worked (M = 5)

Insert **55** into a full leaf `[60|70|80|90]`:

```text
  temp [55|60|70|80|90]   (5 keys — overflow at M)
              ↓  split, promote the middle (70)
        parent gains 70
      [ … | 70 | … ]
       /          \
  [55|60]        [80|90]
```

Split at **M keys**, promote the **middle**, two half-full nodes remain — same rule, wider node.

--

## B+ trees: values in the leaves

Databases use a variant — the **B+ tree**:

- **internal nodes hold only keys** (routing), no values
- **all values live in the leaves**, which are **linked** in a list → fast **range scans** (`WHERE age BETWEEN 20 AND 40`)

Value-free internal nodes fan out even wider → even shorter trees.

--

## B+ tree structure

An index on `age`, order 3 (routers only — no records upstairs):

```text
  internal:          [ 30 | 60 ]
                    /      |      \
  leaves:   [10|20] → [30|45] → [60|90] → ∅
             ●  ●       ●  ●      ●  ●
             (each leaf key carries its own record)
```

- **internal** nodes: keys + child pointers, **no records**
- **leaves**: every key with its record, chained left → right
- a key can appear **twice** — as a router (30, 60) and in a leaf

--

## Range scans for free

Because the leaves form a **sorted linked list**, a range query descends **once**, then **walks the chain**:

```text
   SELECT * WHERE age BETWEEN 20 AND 40
   → find 20 in the leaves → follow leaf links until 40
```

`ORDER BY`, `BETWEEN`, and pagination are all just sequential leaf walks.

--

## B-tree vs B+ tree

| | B-tree | B+ tree |
|---|---|---|
| records stored | in **all** nodes | **leaves only** |
| internal node | keys + records | **keys only** (wider) |
| range scan | full tree walk | **leaf-chain** walk |
| a key appears | once | router **and** leaf |

B+ packs more keys per internal block → higher fan-out, shorter tree, faster ranges.

--

## Choosing the order M

Pick M so a node **fills one disk block**:

```text
   block 4096 B, key 8 B, pointer 8 B
   internal ≈ M·8 (ptrs) + (M−1)·8 (keys) ≈ 4096
   →  M ≈ 256
```

Bigger blocks or smaller keys → larger M → shallower tree.

--

## Sizing example

Order **M = 256**, height **3**:

```text
   level 0:  1 node
   level 1:  256 nodes
   level 2:  256² ≈ 65,000 leaves
   → ≈ 65,000 · 255 ≈ 16 MILLION keys in 3 reads
```

Push to M = 1000 and one more level → **billions**, still ≈4 reads.

--

## Wait — are nodes actually always full?

That 16-million figure assumed every node packed with **M − 1** keys. The order property only *guarantees* **at least half full** — a node can legally sit anywhere between half and completely full.

And one node is *never* even that full: the **root** is explicitly exempt from the minimum. Right after **any** root split, the brand-new root has **exactly 1 key** — regardless of how large M is.

--

## Best case vs. guaranteed worst case (M = 256)

Same order, same 3 levels — count the **minimum** (128 children, 127 keys) instead of the maximum:

```text
   best case (full):        ≈ 16,000,000 keys, 3 reads
   worst case (half-full):  ≈     33,000 keys, 3 reads
```

**≈500× fewer**, guaranteed, at the same depth — but the fix is **one more level**, not a taller tree than you'd like:

```text
   worst case, 4 reads:  ≈ 4.2 million keys
   worst case, 5 reads:  ≈ 537 million keys
```

---

### Part 5 · When to use which; wrap

<small>(≈24 min)</small>

--

## One goal, several tools

| structure | balance kept by | height | best when |
|---|---|---|---|
| plain BST | nothing | up to n−1 | keys already random |
| **AVL** | rotations, bf ∈ ±1 | ≤ 1.44 log₂n | **read-heavy** (tightest) |
| **red-black** | rotations + colors | ≤ 2 log₂n | **write-heavy** (std lib) |
| **2-3** | split & promote | log n | teaching / basis of RB |
| **B / B+** | split & promote | log_M n | **disk / databases** |

--

## The split-and-promote family

2-3, red-black, and B trees are **one algorithm**, different node widths:

| | node width | splits at |
|---|---|---|
| **2-3** | 1–2 keys | 3 keys |
| **red-black** | 1 key + bit | two reds (flip) |
| **B-tree (M)** | ≤ M−1 keys | M keys |

--

## The big idea

The same **Θ(log n)** guarantee, three ways:

- **AVL / red-black:** keep a *binary* tree balanced (rotations)
- **2-3:** keep *every leaf level* by splitting (grow at the root)
- **B / B+:** the same split, sized to the **memory hierarchy**

Balance is a **goal**, not one algorithm.

--

## Which one do I reach for?

```text
   in RAM, read-heavy      →  AVL
   in RAM, general/mutable  →  red-black  (std::map)
   on disk / a database     →  B+ tree
   learning / interviews    →  2-3  (explains red-black)
```

All Θ(log n); the machine and the workload pick the winner.

--

## Recap

- **2-3 tree:** 2/3-nodes; **split-and-promote**; grows at the **root** → perfect balance, **no rotations**
- **red-black BST:** a 2-3 tree as a BST + one **color bit** → the standard-library tree
- **B / B+ trees:** wide nodes = disk blocks → **log_M n** → databases & filesystems

All **Θ(log n)** — same idea (split, promote the middle), different node width.

--

## ICA 5 — your turn

Implement **2-3 tree `insert`** from a skeleton in `ica05/ica05.cpp`:

- search down to the correct leaf
- absorb into a 2-node, or **split a 3-node** and promote the middle
- keep every leaf at the same depth (grow at the root)

Build `-g`, run the self-tests, Valgrind-clean.

