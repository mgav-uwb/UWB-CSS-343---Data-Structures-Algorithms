// A BST node: key, value, two links, and a subtree-size count. get returns the
// value or null; put inserts, or updates the value on an equal key.
class Node {
    Key key; Value val; Node left, right; int size = 1;
    Node(Key k, Value v) { key = k; val = v; }
}
int size(Node t) { return t == null ? 0 : t.size; }   // null-safe

Value get(Node t, Key key) {
    if (t == null) return null;                 // miss: fell off a null link
    int c = key.compareTo(t.key);
    if (c == 0) return t.val;                    // hit
    return c < 0 ? get(t.left, key) : get(t.right, key);
}
Node put(Node t, Key key, Value val) {
    if (t == null) return new Node(key, val);    // grow at the null link
    int c = key.compareTo(t.key);
    if      (c < 0) t.left  = put(t.left,  key, val);
    else if (c > 0) t.right = put(t.right, key, val);
    else t.val = val;                            // equal key: update
    t.size = 1 + size(t.left) + size(t.right);   // recount on the way up
    return t;
}
