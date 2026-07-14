// A BST node (Sedgewick's ordered symbol table): key, value, two links, and a
// subtree-size count. get returns a pointer to the value or null; put inserts.
struct Node {
    Key   key;   Value val;
    Node* left  = nullptr;
    Node* right = nullptr;
    int   size  = 1;                    // # nodes in this subtree
};
int size(Node* t) { return t ? t->size : 0; }      // null-safe

Value* get(Node* t, const Key& key) {
    if (!t) return nullptr;             // miss: fell off a null link
    if (key == t->key) return &t->val;  // hit
    return key < t->key ? get(t->left, key) : get(t->right, key);
}
Node* put(Node* t, const Key& key, const Value& val) {
    if (!t) return new Node{key, val};  // grow at the null link
    if      (key < t->key) t->left  = put(t->left,  key, val);
    else if (key > t->key) t->right = put(t->right, key, val);
    else t->val = val;                  // equal key: update the value
    t->size = 1 + size(t->left) + size(t->right);   // recount on the way up
    return t;
}
