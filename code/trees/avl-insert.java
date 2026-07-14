// AVL insert: descend like a plain BST, then on the way back up recompute each
// height and, at the first node whose balance factor reaches +/-2, rotate. The
// balance factor bf = height(left) - height(right); positive means left-heavy.
static int bf(Node t) { return height(t.left) - height(t.right); }

static Node rebalance(Node t) {
    fix(t);
    if (bf(t) > 1) {                      // left-heavy: LL or LR
        if (bf(t.left) < 0)               // LR: left child leans right -> straighten
            t.left = rotateLeft(t.left);
        return rotateRight(t);            // now a plain LL
    }
    if (bf(t) < -1) {                     // right-heavy: RR or RL
        if (bf(t.right) > 0)              // RL: right child leans left -> straighten
            t.right = rotateRight(t.right);
        return rotateLeft(t);             // now a plain RR
    }
    return t;                             // |bf| <= 1: already balanced
}
static Node insert(Node t, int key) {
    if (t == null) return new Node(key);  // new leaf, height 0
    if      (key < t.key) t.left  = insert(t.left,  key);
    else if (key > t.key) t.right = insert(t.right, key);
    else return t;                        // duplicate key: nothing to do
    return rebalance(t);                  // fix heights + rotate on the way up
}
