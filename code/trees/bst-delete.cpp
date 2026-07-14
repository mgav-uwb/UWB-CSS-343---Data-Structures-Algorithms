// Hibbard deletion. 0/1-child: splice in the lone child. 2-child: copy the
// in-order successor (min of the right subtree) up, then deleteMin it out.
Node* deleteMin(Node* t) {
    if (!t->left) { Node* r = t->right; delete t; return r; }   // free the min
    t->left = deleteMin(t->left);
    t->size = 1 + size(t->left) + size(t->right);
    return t;
}
Node* erase(Node* t, const Key& key) {
    if (!t) return nullptr;
    if      (key < t->key) t->left  = erase(t->left,  key);
    else if (key > t->key) t->right = erase(t->right, key);
    else {                                   // found the node to remove
        if (!t->left || !t->right) {         // 0 or 1 child
            Node* c = t->left ? t->left : t->right;
            delete t;                        // free the node (no leak)
            return c;                        // splice in the lone child
        }
        Node* s = t->right;                  // in-order successor:
        while (s->left) s = s->left;         //   min of the right subtree
        t->key = s->key; t->val = s->val;    // copy it up
        t->right = deleteMin(t->right);      // remove (and free) the duplicate
    }
    t->size = 1 + size(t->left) + size(t->right);
    return t;
}
