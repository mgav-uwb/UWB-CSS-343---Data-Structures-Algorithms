// CSS 343 · ICA 03 — Tree Recursion
// ---------------------------------------------------------------------------
// Implement each function marked TODO. Do NOT edit buildExample(), main(), or
// the provided helpers (insert / destroy / buildExpr). Figure out the
// recursion yourself — that's the point of the exercise.
//
// Build & run on the CSS Linux lab:
//     g++ -std=c++17 ica03.cpp -o ica03 && ./ica03
//
// Tip: hand-draw the tree that buildExample() builds, then check your program's
// numbers against your drawing.
// ---------------------------------------------------------------------------
#include <iostream>
#include <vector>
using namespace std;

struct Node {
    int   key;
    Node* left;
    Node* right;
};

// ---- provided: BST insert (used only to build the test tree) --------------
void insert(Node*& root, int key) {
    if (root == nullptr)      root = new Node{key, nullptr, nullptr};
    else if (key < root->key) insert(root->left,  key);
    else if (key > root->key) insert(root->right, key);
    // equal key: ignored (no duplicates)
}

// ---- provided: the tree you will test against -----------------------------
Node* buildExample() {
    Node* root = nullptr;
    for (int k : {50, 30, 70, 20, 40, 60, 80, 10, 45}) insert(root, k);
    return root;
}

// ---- provided: free the whole tree ----------------------------------------
void destroy(Node* t) {
    if (!t) return;
    destroy(t->left);
    destroy(t->right);
    delete t;
}

// ===========================================================================
//  YOUR WORK — replace each stub.
// ===========================================================================

// TODO 1 — height of the tree rooted at t.
//   An empty tree has height -1; a single node has height 0.
int height(Node* t) {
    return 0;                      // TODO: replace
}

// TODO 2 — number of LEAVES (nodes with no children) in the tree.
int countLeaves(Node* t) {
    return 0;                      // TODO: replace
}

// TODO 3 — number of nodes that have EXACTLY ONE child.
int countOneChild(Node* t) {
    return 0;                      // TODO: replace
}

// TODO 4 — does the tree contain `key`?
//   Use the BST ordering so you follow only ONE root-to-leaf path.
bool contains(Node* t, int key) {
    return false;                  // TODO: replace
}

// STRETCH (optional) — return true iff t is a valid BST: for EVERY node, its
//   key is greater than every key in its left subtree and less than every key
//   in its right subtree.
bool isValidBST(Node* t) {
    return false;                  // TODO: replace
}

// ===========================================================================
//  EXTRA CREDIT — expression trees
// ===========================================================================
// An expression tree stores an OPERAND in each leaf and a binary OPERATOR
// ('+','-','*','/') in each internal node. `val` is meaningful only in leaves;
// `op` is meaningful only in internal nodes.
struct ExprNode {
    char      op;                  // '+','-','*','/'  (internal nodes)
    int       val;                 // operand value     (leaves)
    ExprNode* left;
    ExprNode* right;
};
ExprNode* leaf(int v)                              { return new ExprNode{0, v, nullptr, nullptr}; }
ExprNode* opNode(char o, ExprNode* a, ExprNode* b) { return new ExprNode{o, 0, a, b}; }

void destroyExpr(ExprNode* t) { if (!t) return; destroyExpr(t->left); destroyExpr(t->right); delete t; }

// provided: several expression trees of increasing complexity, each labeled
struct Expr { const char* name; ExprNode* root; };
vector<Expr> buildExprs() {
    return {
        { "(2 + 3) * 4",
              opNode('*', opNode('+', leaf(2), leaf(3)), leaf(4)) },
        { "20 / (2 + 3)",
              opNode('/', leaf(20), opNode('+', leaf(2), leaf(3))) },
        { "(8 - 3) * (2 + 6)",
              opNode('*', opNode('-', leaf(8), leaf(3)), opNode('+', leaf(2), leaf(6))) },
        { "5 * ((3 * 4) + (6 / 2) - (8 + 2))",
              opNode('*', leaf(5),
                  opNode('-',
                      opNode('+', opNode('*', leaf(3), leaf(4)), opNode('/', leaf(6), leaf(2))),
                      opNode('+', leaf(8), leaf(2)))) },
        { "((10 - 2) * (3 + 1)) / (6 - 2)",
              opNode('/',
                  opNode('*', opNode('-', leaf(10), leaf(2)), opNode('+', leaf(3), leaf(1))),
                  opNode('-', leaf(6), leaf(2))) },
    };
}

// TODO EC — evaluate the expression tree rooted at t.
//   A leaf evaluates to its `val`; an internal node applies its `op` to the
//   values its two subtrees evaluate to.
int evalExprTree(ExprNode* t) {
    return 0;                      // TODO: replace
}

// ===========================================================================
//  main — prints your results. Do not edit.
// ===========================================================================
#ifndef ICA03_GRADER          // (the autograder defines this and supplies its own main)
int main() {
    Node* root = buildExample();
    cout << "height        = " << height(root)                            << "\n";
    cout << "countLeaves   = " << countLeaves(root)                       << "\n";
    cout << "countOneChild = " << countOneChild(root)                     << "\n";
    cout << "contains(45)  = " << (contains(root, 45) ? "true" : "false") << "\n";
    cout << "contains(35)  = " << (contains(root, 35) ? "true" : "false") << "\n";
    cout << "isValidBST    = " << (isValidBST(root)  ? "true" : "false")  << "\n";

    cout << "\nextra credit — evalExprTree:\n";
    for (Expr& e : buildExprs()) {
        cout << "  " << evalExprTree(e.root) << "\t=  " << e.name << "\n";
        destroyExpr(e.root);
    }

    destroy(root);
    return 0;
}
#endif
