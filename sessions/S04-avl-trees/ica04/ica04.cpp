// CSS 343 · ICA 04 — AVL trees.  Fill in the TODOs, then run the application.
//
//   build:        g++ -std=c++17 -g -o ica04 ica04.cpp
//   run:          ./ica04
//   leak-check:   valgrind --leak-check=full ./ica04     (ICA 04 IS LEAK-GRADED)
//
// The Node struct, the helpers, and main() (a unit-test battery + the
// worst-case application) are GIVEN — do not edit them. You implement bf, fix,
// the two rotations, rebalance, insert, isAVL, and contains. Run early and
// often: the tests report [PASS]/[FAIL] one by one as you fill in the TODOs.

#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>
#include <string>
using namespace std;

struct Node {
    int   key;
    Node* left   = nullptr;
    Node* right  = nullptr;
    int   height = 0;                 // leaf = 0, empty subtree = -1
    Node(int k) : key(k) {}
};

// ---- GIVEN ---------------------------------------------------------------
int height(Node* t) { return t ? t->height : -1; }   // null-safe height

void inorder(Node* t, vector<int>& out) {            // collect keys in order
    if (!t) return;
    inorder(t->left, out);
    out.push_back(t->key);
    inorder(t->right, out);
}

int sizeOf(Node* t) { return t ? 1 + sizeOf(t->left) + sizeOf(t->right) : 0; }

void destroy(Node* t) {                              // free the whole tree
    if (!t) return;
    destroy(t->left);
    destroy(t->right);
    delete t;
}

// ---- TODO 1 — balance factor and height maintenance ----------------------
int bf(Node* t) {
    // TODO — L04's "balance factor" definition; decide what a null node returns.
    return 0;
}
void fix(Node* t) {
    // TODO — one line; height() above is null-safe.
}

// ---- TODO 2 — rotations (each O(1); remember to fix() heights) ------------
Node* rotateRight(Node* y) {
    // TODO — L04's rotation diagram IS this function. Re-fix() the two nodes
    //        whose subtrees changed (order matters); return the new root.
    return y;
}
Node* rotateLeft(Node* x) {
    // TODO — the mirror image of rotateRight.
    return x;
}

// ---- TODO 3 — rebalance: the four cases (LL / RR / LR / RL) ---------------
Node* rebalance(Node* t) {
    // TODO — fix(t) first; then bf(t) (and the taller CHILD's bf, for the
    //        double cases) selects among LL / RR / LR / RL — the L04
    //        "rebalance, four cases" slide. Return the subtree's new root.
    return t;
}

// ---- TODO 4 — insert: BST insert, then rebalance on the way up ------------
Node* insert(Node* t, int k) {
    // TODO — plain BST insert (ignore duplicates), then hand the node to
    //        rebalance on the way back up.
    return t;
}

// ---- TODO 5 — checks (stretch: also write erase with rebalancing) --------
bool isAVL(Node* t) {
    // TODO — "act on the node, recurse on the subtrees" (L03). An honest
    //        answer matters: the battery and grader both feed a hand-built
    //        UNBALANCED tree; a lazy constant fails it.
    return true;
}
bool contains(Node* t, int k) {
    // TODO: standard BST search.
    return false;
}

// ==========================================================================
// UNIT TESTS + APPLICATION (given — do not edit).
// ==========================================================================
#ifndef ICA04_GRADER
static int passCnt = 0, failCnt = 0;
static void check(bool ok, const string& what) {
    (ok ? passCnt : failCnt)++;
    cout << (ok ? "  [PASS] " : "  [FAIL] ") << what << '\n';
}
static Node* build(const vector<int>& ks) { Node* r = nullptr; for (int k : ks) r = insert(r, k); return r; }
static bool sortedInorder(Node* t) { vector<int> v; inorder(t, v); return is_sorted(v.begin(), v.end()); }

int main() {
    // -- T1: basics --------------------------------------------------------
    cout << "T1 · basics\n";
    check(height(nullptr) == -1, "height(empty) == -1");
    Node* one = build({42});
    check(one != nullptr && sizeOf(one) == 1 && height(one) == 0, "single insert: 1 node, height 0");
    check(contains(one, 42) && !contains(one, 7), "contains: hit and miss on 1 node");
    destroy(one);

    // -- T2..T5: one test per rotation case --------------------------------
    // each inserts 3 keys that force exactly one case; a correct AVL ends
    // with the MIDDLE key at the root and height 1.
    struct Case { const char* name; vector<int> ks; };
    vector<Case> cases = {
        {"T2 · RR (rotateLeft)",        {1, 2, 3}},
        {"T3 · LL (rotateRight)",       {3, 2, 1}},
        {"T4 · LR (double: left-right)", {3, 1, 2}},
        {"T5 · RL (double: right-left)", {1, 3, 2}},
    };
    for (auto& c : cases) {
        cout << c.name << '\n';
        Node* t = build(c.ks);
        check(t != nullptr && t->key == 2, "root is the middle key (2)");
        check(t && t->left && t->left->key == 1 && t->right && t->right->key == 3, "children are 1 and 3");
        check(height(t) == 1, "height is 1 (not a path)");
        destroy(t);
    }

    // -- T6: duplicates are ignored -----------------------------------------
    cout << "T6 · duplicates\n";
    Node* d = build({5, 5, 5, 5});
    check(sizeOf(d) == 1, "inserting 5 four times keeps 1 node");
    destroy(d);

    // -- T7: a shuffled batch stays a valid, sorted, balanced BST -----------
    cout << "T7 · shuffled input\n";
    Node* s = build({9, 3, 14, 1, 6, 12, 16, 2, 5, 8, 10, 13, 15, 4, 7, 11});
    check(sizeOf(s) == 16, "all 16 keys inserted");
    check(sortedInorder(s), "in-order is sorted (still a BST)");
    check(isAVL(s), "isAVL holds everywhere");
    check(height(s) <= 5, "height <= 5 for 16 keys");
    destroy(s);
    {   // honesty check: a hand-built path (never touched by insert) must FAIL
        Node* bad = new Node(1); bad->right = new Node(2); bad->right->right = new Node(3);
        bad->right->right->height = 0; bad->right->height = 1; bad->height = 2;
        check(!isAVL(bad), "isAVL rejects a hand-built unbalanced path");
        destroy(bad);
    }

    // -- T8: THE APPLICATION — worst-case input, sorted stream --------------
    // a ticket registry hands out strictly increasing ids; sorted input is the
    // worst case for a plain BST (a path of height N-1). The AVL must stay
    // logarithmic.
    cout << "T8 · worst case: sorted 1..1023\n";
    const int N = 1023;                          // 2^10 - 1 ids
    Node* root = nullptr;
    for (int k = 1; k <= N; ++k) root = insert(root, k);
    int bound = (int)floor(1.44 * log2((double)N));        // = 14, matching the handout
    cout << "     AVL height = " << height(root) << "   (a plain BST would be " << N - 1 << ")\n";
    check(sizeOf(root) == N, "all 1023 keys inserted");
    check(height(root) <= bound, "height <= 1.44*log2(N) = " + to_string(bound));
    check(isAVL(root), "isAVL holds everywhere");
    check(sortedInorder(root), "in-order is sorted");
    check(contains(root, 512) && !contains(root, 9999), "contains: hit 512, miss 9999");
    destroy(root);

    // -- T9: the mirror worst case, reverse-sorted --------------------------
    cout << "T9 · worst case: reverse-sorted 1023..1\n";
    Node* rev = nullptr;
    for (int k = N; k >= 1; --k) rev = insert(rev, k);
    check(sizeOf(rev) == N && height(rev) <= bound && isAVL(rev), "same guarantees on the mirror input");
    destroy(rev);

    cout << passCnt << " passed, " << failCnt << " failed"
         << (failCnt ? "" : "  —  now run it under valgrind (must be clean)") << '\n';
    return failCnt ? 1 : 0;
}
#endif
