// Left-leaning red-black BST: the three constant-time moves. A node's `red`
// flag = the colour of the link to its PARENT; a null link counts as black.
static class Node {
    int key; Node left, right; boolean red = true;
    Node(int k) { key = k; }
}

static boolean isRed(Node h) { return h != null && h.red; }

static Node rotateLeft(Node h) {      // right link leans red -> lean it left
    Node x = h.right;
    h.right = x.left;
    x.left  = h;
    x.red = h.red;                     // x inherits h's colour
    h.red = true;                      // h is now glued under x by a red link
    return x;
}

static Node rotateRight(Node h) {     // mirror image of rotateLeft
    Node x = h.left;
    h.left  = x.right;
    x.right = h;
    x.red = h.red;
    h.red = true;
    return x;
}

static void flipColors(Node h) {      // two red children = a temporary 4-node
    h.red       = !h.red;              // push the middle key UP (h "promotes")
    h.left.red  = !h.left.red;         // children become black 2-nodes
    h.right.red = !h.right.red;
}
