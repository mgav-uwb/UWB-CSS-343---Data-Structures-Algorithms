// The three recursive traversals are ONE recursion; only the line where you
// visit(n) moves. In-order of a BST visits the keys in SORTED order.
fn inorder(t: &Option<Box<Node>>) {
    if let Some(n) = t {
        // visit(n);        // PRE-order:  node BEFORE its subtrees
        inorder(&n.left);
        visit(n);           // IN-order:   node BETWEEN the subtrees (sorted!)
        inorder(&n.right);
        // visit(n);        // POST-order: node AFTER its subtrees
    }
}
