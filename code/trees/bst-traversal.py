# The three recursive traversals are ONE recursion; only the line where you
# visit(t) moves. In-order of a BST visits the keys in SORTED order.
def inorder(t):
    if t is None:
        return
    # visit(t)            # PRE-order:  node BEFORE its subtrees
    inorder(t.left)
    visit(t)              # IN-order:   node BETWEEN the subtrees (sorted!)
    inorder(t.right)
    # visit(t)            # POST-order: node AFTER its subtrees
