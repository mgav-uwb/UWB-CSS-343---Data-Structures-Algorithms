// CSS 343 · ICA 05 — 2-3 trees.  Fill in the TODOs, then run the application.
//
//   build:        g++ -std=c++17 -g -o ica05 ica05.cpp
//   run:          ./ica05
//   leak-check:   valgrind --leak-check=full ./ica05     (ICA 05 IS LEAK-GRADED)
//
// The Node struct, the recursive insert DRIVER (ins / insert), search, and
// main() (a unit-test battery + the worst-case application) are GIVEN — do not
// edit them. You implement the two split-and-promote primitives: addKey and
// split. Run early and often: the tests report [PASS]/[FAIL] one by one.

#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>
#include <string>
using namespace std;

struct Node {
    int   key[3];                       // key[0..n-1] sorted; slot 2 only during overflow
    Node* child[4] = {nullptr, nullptr, nullptr, nullptr};
    int   n = 0;                        // number of keys: 1 or 2 (temporarily 3)
    Node(int k) { key[0] = k; n = 1; }
    bool  leaf() const { return child[0] == nullptr; }
};

// ---- GIVEN — helpers -----------------------------------------------------
// which child to descend into for `k` (0 = left, 1 = middle, 2 = right)
int childIndex(Node* x, int k) {
    if (k < x->key[0]) return 0;
    if (x->n == 1 || k < x->key[1]) return 1;
    return 2;
}
void inorder(Node* t, vector<int>& out) {
    if (!t) return;
    inorder(t->child[0], out); out.push_back(t->key[0]);
    inorder(t->child[1], out);
    if (t->n == 2) { out.push_back(t->key[1]); inorder(t->child[2], out); }
}
int sizeOf(Node* t) {
    if (!t) return 0;
    int s = t->n; for (int i = 0; i <= t->n; i++) s += sizeOf(t->child[i]);
    return s;
}
void destroy(Node* t) {
    if (!t) return;
    for (int i = 0; i <= t->n; i++) destroy(t->child[i]);
    delete t;
}
bool contains(Node* t, int k) {                 // search is given
    while (t) {
        if (k == t->key[0] || (t->n == 2 && k == t->key[1])) return true;
        t = t->child[childIndex(t, k)];
    }
    return false;
}

// ---- TODO 1 — addKey -----------------------------------------------------
// Insert `k` (with `rc` as the child to k's RIGHT) into node x, keeping key[]
// sorted and children aligned. x has 1 or 2 keys before the call; 2 or 3 after.
// (For a leaf insert, rc is nullptr.)
void addKey(Node* x, int k, Node* rc) {
    // TODO: find where k belongs, shifting larger keys — and their right
    //       children — up by one slot; place k and set the child to its right
    //       to rc; then x->n++.
}

// ---- TODO 2 — split ------------------------------------------------------
// Precondition: x has 3 keys (a temporary 4-node). Keep key[0] in x, move
// key[2] (and its children) into a NEW right node, and PROMOTE key[1] via
// `mid`. Return the new right node. After this, x and the new node are 2-nodes.
Node* split(Node* x, int& mid) {
    // TODO: mid = x->key[1]; make a new node from x->key[2] with children
    //       x->child[2], x->child[3]; leave x with only key[0] (n = 1) and
    //       null its moved child pointers; return the new node.
    return nullptr;
}

// ---- GIVEN — the recursive insert driver (uses your two functions) -------
static Node* ins(Node* x, int k, int& upKey, Node*& upRight) {
    upRight = nullptr;
    if (x->leaf()) {
        addKey(x, k, nullptr);
    } else {
        int i = childIndex(x, k);
        int ck; Node* cr;
        x->child[i] = ins(x->child[i], k, ck, cr);
        if (cr) addKey(x, ck, cr);               // absorb a promoted key from below
    }
    if (x->n == 3) upRight = split(x, upKey);     // overflow → split-and-promote
    return x;
}
Node* insert(Node* root, int k) {
    if (!root) return new Node(k);
    if (contains(root, k)) return root;          // no duplicates
    int upKey; Node* upRight;
    root = ins(root, k, upKey, upRight);
    if (upRight) {                               // the ROOT split → grow up
        Node* nr = new Node(upKey);
        nr->child[0] = root; nr->child[1] = upRight;
        root = nr;
    }
    return root;
}

// ==========================================================================
// UNIT TESTS + APPLICATION (given — do not edit).
// ==========================================================================
#ifndef ICA05_GRADER
static int passCnt = 0, failCnt = 0;
static void check(bool ok, const string& what) {
    (ok ? passCnt : failCnt)++;
    cout << (ok ? "  [PASS] " : "  [FAIL] ") << what << '\n';
}
// uniform leaf depth, or -1 if the tree is not perfectly balanced
static int leafDepth(Node* t) {
    if (!t || t->leaf()) return 0;
    int d = leafDepth(t->child[0]);
    for (int i = 1; i <= t->n; i++) if (leafDepth(t->child[i]) != d) return -1;
    return d < 0 ? -1 : d + 1;
}
static bool valid23(Node* t) {                   // every node a 2- or 3-node, well formed
    if (!t) return true;
    if (t->n < 1 || t->n > 2) return false;
    if (t->n == 2 && t->key[0] >= t->key[1]) return false;
    if (!t->leaf()) {
        for (int i = 0; i <= t->n; i++) if (!t->child[i] || !valid23(t->child[i])) return false;
        for (int i = t->n + 1; i < 4; i++) if (t->child[i]) return false;
    }
    return true;
}
static bool sortedInorder(Node* t) { vector<int> v; inorder(t, v); return is_sorted(v.begin(), v.end()); }
static Node* build(const vector<int>& ks) { Node* r = nullptr; for (int k : ks) r = insert(r, k); return r; }

int main() {
    cout << "T1 · basics\n";
    Node* one = build({42});
    check(one && sizeOf(one) == 1 && one->n == 1 && one->key[0] == 42, "single insert: a 2-node with key 42");
    check(contains(one, 42) && !contains(one, 7), "contains: hit and miss");
    destroy(one);

    cout << "T2 · a 2-node grows to a 3-node (no split)\n";
    Node* g = build({50, 30});
    check(g->n == 2 && g->key[0] == 30 && g->key[1] == 50 && g->leaf(), "[30|50] in one leaf node");
    destroy(g);

    cout << "T3 · a leaf splits, the root grows up\n";
    Node* s = build({50, 30, 70});                       // [30|50|70] → promote 50
    check(s->n == 1 && s->key[0] == 50, "root is the promoted middle key 50");
    check(s->child[0] && s->child[0]->key[0] == 30 &&
          s->child[1] && s->child[1]->key[0] == 70, "children are [30] and [70]");
    check(leafDepth(s) == 1, "all leaves at depth 1");
    destroy(s);

    cout << "T4 · a cascading split (root split from below)\n";
    Node* c = build({50, 30, 70, 10, 20});               // 20 cascades: root becomes [20|50]
    check(valid23(c) && sortedInorder(c) && leafDepth(c) >= 0, "valid 2-3, sorted, balanced");
    check(sizeOf(c) == 5, "all 5 keys present");
    destroy(c);

    cout << "T5 · duplicates ignored\n";
    Node* d = build({5, 5, 5, 5});
    check(sizeOf(d) == 1, "inserting 5 four times keeps 1 key");
    destroy(d);

    cout << "T6 · a shuffled batch\n";
    Node* sh = build({50, 100, 20, 30, 40, 70, 60, 45, 55, 120, 65, 67, 68, 35, 52, 31, 32});
    vector<int> in; inorder(sh, in);
    check(sizeOf(sh) == 17 && (int)in.size() == 17, "all 17 keys present");
    check(valid23(sh) && sortedInorder(sh), "valid 2-3 and in-order sorted");
    check(leafDepth(sh) >= 0, "every leaf at the SAME depth (perfectly balanced)");
    destroy(sh);

    // -- T7: THE APPLICATION — worst-case sorted stream --------------------
    // sorted input is the worst case for a plain BST (a path). A 2-3 tree
    // stays perfectly balanced with no rotations.
    cout << "T7 · worst case: sorted 1..1000\n";
    const int N = 1000;
    Node* root = nullptr;
    for (int k = 1; k <= N; ++k) root = insert(root, k);
    check(sizeOf(root) == N, "all 1000 keys inserted");
    check(sortedInorder(root) && valid23(root), "sorted + valid 2-3");
    int dep = leafDepth(root);
    cout << "     2-3 tree depth = " << dep << "   (a plain BST would be " << N - 1 << ")\n";
    check(dep >= 0, "perfectly balanced (all leaves same depth)");
    check(dep <= (int)ceil(log2((double)N)), "depth <= log2(N) — logarithmic");
    check(contains(root, 500) && !contains(root, 9999), "contains: hit 500, miss 9999");
    destroy(root);

    cout << "T8 · worst case: reverse-sorted 1000..1\n";
    Node* rev = nullptr;
    for (int k = N; k >= 1; --k) rev = insert(rev, k);
    check(sizeOf(rev) == N && valid23(rev) && leafDepth(rev) >= 0, "same guarantees on the mirror input");
    destroy(rev);

    cout << passCnt << " passed, " << failCnt << " failed"
         << (failCnt ? "" : "  —  now run it under valgrind (must be clean)") << '\n';
    return failCnt ? 1 : 0;
}
#endif
