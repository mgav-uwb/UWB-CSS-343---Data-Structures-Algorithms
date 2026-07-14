// AVL rotations. Each re-hangs one parent/child pair, updates the two heights,
// and returns the new subtree root. O(1); the in-order sequence is unchanged.
static int height(Node t) { return t == null ? -1 : t.height; }   // null: -1
static void fix(Node t) {                              // recompute from children
    t.height = 1 + Math.max(height(t.left), height(t.right));
}
static Node rotateRight(Node y) {   // LL fix: left child x rises, y sinks
    Node x = y.left;
    y.left = x.right;               // B (keys between x and y) re-hangs under y
    x.right = y;
    fix(y); fix(x);                 // y is now lower, so fix its height first
    return x;                       // x is the new subtree root
}
static Node rotateLeft(Node x) {    // RR fix: the mirror of rotateRight
    Node y = x.right;
    x.right = y.left;               // B re-hangs under x
    y.left = x;
    fix(x); fix(y);
    return y;
}
