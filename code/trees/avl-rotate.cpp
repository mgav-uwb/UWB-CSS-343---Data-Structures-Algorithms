// AVL rotations. Each re-hangs one parent/child pair, updates the two heights,
// and returns the new subtree root. O(1) work; the in-order sequence is
// unchanged, so the tree stays a valid BST. (Node stores an int height field.)
int height(Node* t) { return t ? t->height : -1; }   // null has height -1
void fix(Node* t) {                                   // recompute from children
    t->height = 1 + max(height(t->left), height(t->right));
}
Node* rotateRight(Node* y) {      // LL fix: left child x rises, y sinks
    Node* x = y->left;
    y->left = x->right;           // B (keys between x and y) re-hangs under y
    x->right = y;
    fix(y); fix(x);               // y is now lower, so recompute its height first
    return x;                     // x is the new root of this subtree
}
Node* rotateLeft(Node* x) {       // RR fix: the exact mirror of rotateRight
    Node* y = x->right;
    x->right = y->left;           // B re-hangs under x
    y->left = x;
    fix(x); fix(y);
    return y;
}
