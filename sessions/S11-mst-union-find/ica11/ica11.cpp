// CSS 343 · ICA 11 — union-find + Kruskal's MST.  Fill in the TODOs, then run the application.
//
//   build:        g++ -std=c++17 -g -o ica11 ica11.cpp
//   run:          ./ica11
//   leak-check:   valgrind --leak-check=full ./ica11     (only STL containers — should be clean)
//
// The UF and Edge structs, connected() (which USES your find), and main() (a
// unit-test battery) are GIVEN — do not edit them. You implement the three
// primitives: find (with path compression), unite (union by size), and
// kruskal (sort edges ascending by weight, union endpoints that are not
// already connected, and sum the weight of every edge you add).
// Run early and often: the tests report [PASS]/[FAIL] one by one.

#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
using namespace std;

// ---- GIVEN ----------------------------------------------------------------
struct UF {
    vector<int> parent, sz;
    UF(int n) : parent(n), sz(n, 1) { for (int i = 0; i < n; i++) parent[i] = i; }
};
struct Edge { int u, v, w; };

// ---- TODO 1 — find --------------------------------------------------------
// Walk parent pointers from x up to the root, WITH path compression: repoint
// nodes toward the root as you go (path-halving parent[x]=parent[parent[x]]
// or full compression — either is fine). Return the root.
int find(UF& uf, int x) {
    // TODO — L11's "path compression" slides show both variants; the grader
    //        accepts either, but the walk must actually REPOINT nodes.
    return x;
}

// ---- GIVEN — connected() uses your find -----------------------------------
bool connected(UF& uf, int a, int b) { return find(uf, a) == find(uf, b); }

// ---- TODO 2 — unite --------------------------------------------------------
// Find both roots. If they differ, link the SMALLER tree (by sz) under the
// LARGER, and update the surviving root's sz.
void unite(UF& uf, int a, int b) {
    // TODO — find both roots; same root means nothing to do. The header says
    //        which root survives; keep the surviving root's sz honest.
}

// ---- TODO 3 — kruskal ------------------------------------------------------
// Sort edges ascending by weight. Build a UF(V). For each edge (in sorted
// order), if its endpoints are NOT already connected, unite them and add its
// weight to a running total (on a CONNECTED graph that accepts exactly V-1
// edges; a disconnected one yields the minimum spanning FOREST).
// Return the total weight. A ready-made comparator (the lambda syntax is not
// course material):
//     sort(edges.begin(), edges.end(),
//          [](const Edge& a, const Edge& b) { return a.w < b.w; });
long kruskal(vector<Edge> edges, int V) {
    // TODO — L11's "Kruskal — the algorithm" slide is this function; your
    //        union-find above is the cycle check.
    return 0;
}

// ==========================================================================
// UNIT TESTS (given — do not edit).
// ==========================================================================
#ifndef ICA11_GRADER
static int passCnt = 0, failCnt = 0;
static void check(bool ok, const string& what) {
    (ok ? passCnt : failCnt)++;
    cout << (ok ? "  [PASS] " : "  [FAIL] ") << what << '\n';
}

int main() {
    cout << "T1 · find / connected after a few unites\n";
    UF uf1(5);
    unite(uf1, 0, 1);
    unite(uf1, 2, 3);
    unite(uf1, 1, 3);
    check(connected(uf1, 0, 3), "0 and 3 end up in the same set");
    check(!connected(uf1, 0, 4), "4 was never unioned — stays its own set");

    cout << "T2 · union-by-size doesn't break a longer chain of unions\n";
    UF uf2(10);
    for (int i = 0; i < 9; i++) unite(uf2, i, i + 1);   // 0-1,1-2,...,8-9
    check(connected(uf2, 0, 9), "chained unions connect the whole range 0..9");
    check(connected(uf2, 3, 7), "any two nodes in the chain end up connected");

    cout << "T3 · path compression flattens a deliberately deep chain\n";
    UF uf3(6);
    // bypass unite()'s union-by-size to hand-build a worst-case deep chain:
    // 5 -> 4 -> 3 -> 2 -> 1 -> 0 (0 is its own root)
    for (int i = 1; i <= 5; i++) uf3.parent[i] = i - 1;
    int before = uf3.parent[5];                    // 4, before any find()
    int root   = find(uf3, 5);
    check(root == 0, "find(5) walks all the way to the true root 0");
    check(uf3.parent[5] != before, "path compression moved 5's parent closer to the root");
    check(find(uf3, 5) == find(uf3, 0), "find is idempotent and connectivity is preserved");

    cout << "T4 · kruskal on a small hand-computed graph (5 vertices)\n";
    vector<Edge> g4 = {
        {0, 1, 2}, {1, 2, 3}, {1, 4, 5}, {0, 3, 6}, {2, 4, 7}, {1, 3, 8}, {3, 4, 9}
    };
    check(kruskal(g4, 5) == 16, "MST weight is 2+3+5+6 = 16");

    cout << "T5 · kruskal skips a heavy cycle-closing edge\n";
    vector<Edge> g5 = { {0, 1, 1}, {1, 2, 2}, {0, 2, 10} };
    check(kruskal(g5, 3) == 3, "the heavy 0-2:10 edge (closes a triangle) is excluded — weight 1+2=3");

    cout << "T6 · kruskal on the lecture sample (8 vertices)\n";
    vector<Edge> g6 = {
        {0, 1, 4}, {0, 3, 6}, {1, 2, 1}, {1, 3, 5}, {2, 3, 8},
        {0, 5, 20}, {3, 4, 2}, {3, 7, 11}, {4, 5, 3}, {5, 6, 9}, {4, 7, 7}
    };
    check(kruskal(g6, 8) == 31, "MST weight over all 8 vertices is 31");

    cout << passCnt << " passed, " << failCnt << " failed" << '\n';
    return failCnt ? 1 : 0;
}
#endif
