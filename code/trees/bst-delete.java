// Hibbard deletion. 0/1-child: splice the lone child. 2-child: copy the
// in-order successor (min of the right subtree) up, then deleteMin it out.
Node deleteMin(Node t) {
    if (t.left == null) return t.right;      // the min; GC frees it
    t.left = deleteMin(t.left);
    t.size = 1 + size(t.left) + size(t.right);
    return t;
}
Node erase(Node t, Key key) {
    if (t == null) return null;
    int c = key.compareTo(t.key);
    if      (c < 0) t.left  = erase(t.left,  key);
    else if (c > 0) t.right = erase(t.right, key);
    else {                                   // found the node to remove
        if (t.left  == null) return t.right; // 0 or 1 child
        if (t.right == null) return t.left;
        Node s = t.right;                    // in-order successor:
        while (s.left != null) s = s.left;   //   min of the right subtree
        t.key = s.key; t.val = s.val;        // copy it up
        t.right = deleteMin(t.right);        // remove the duplicate
    }
    t.size = 1 + size(t.left) + size(t.right);
    return t;
}
