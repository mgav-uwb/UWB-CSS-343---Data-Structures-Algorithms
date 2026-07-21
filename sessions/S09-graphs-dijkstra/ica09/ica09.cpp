// CSS 343 · ICA 09 — Dijkstra's shortest paths.  Fill in the TODO, then run.
//
//   build:        g++ -std=c++17 -g -o ica09 ica09.cpp
//   run:          ./ica09
//   leak-check:   valgrind --leak-check=full ./ica09     (no `new` — clean by construction)
//
// The WGraph struct and main() (a unit-test battery) are GIVEN — do not edit
// them. You implement dijkstra, which USES a lazy min-heap (priority_queue)
// to compute single-source shortest paths on a directed, non-negatively
// weighted graph. Run early and often: the tests report [PASS]/[FAIL] one by one.

#include <iostream>
#include <vector>
#include <queue>
#include <climits>
#include <string>
using namespace std;

const long INF = LONG_MAX;

struct WGraph {
    int V;                                  // number of vertices
    vector<vector<pair<int,int>>> adj;      // adj[u] = { {v, weight}, ... }, DIRECTED
    WGraph(int n) : V(n), adj(n) {}
    void addEdge(int u, int v, int w) { adj[u].push_back({v, w}); }
};

// ---- TODO 1 — dijkstra ----------------------------------------------------
// Single-source shortest paths via a lazy min-heap. Returns dist, where
// dist[v] is the shortest-path distance from src to v (INF if unreachable).
vector<long> dijkstra(const WGraph& g, int src) {
    // TODO — the L09 "Dijkstra — the algorithm" slide is this function in
    //        pseudocode; translate it. A lazy min-heap of {dist, vertex} pairs:
    //          priority_queue<pair<long,int>, vector<pair<long,int>>, greater<>> pq;
    //        T8 stress-tests the one subtle line — ask yourself what a POPPED
    //        entry might no longer be.
    return {};
}

// ==========================================================================
// UNIT TESTS (given — do not edit).
// ==========================================================================
#ifndef ICA09_GRADER
static int passCnt = 0, failCnt = 0;
static void check(bool ok, const string& what) {
    (ok ? passCnt : failCnt)++;
    cout << (ok ? "  [PASS] " : "  [FAIL] ") << what << '\n';
}

int main() {
    cout << "T1 · basics — a small weighted DAG with known distances\n";
    {
        WGraph g(4);
        g.addEdge(0, 1, 2);
        g.addEdge(0, 2, 5);
        g.addEdge(1, 2, 1);
        g.addEdge(1, 3, 7);
        g.addEdge(2, 3, 3);
        vector<long> d = dijkstra(g, 0);
        check(d.size() == 4 && d[0] == 0 && d[1] == 2 && d[2] == 3 && d[3] == 6,
              "dist = {0, 2, 3, 6} from source 0");
    }

    cout << "T2 · two-hop beats direct — Dijkstra finds the detour (L09's practice graph)\n";
    {
        WGraph g(4);
        g.addEdge(0, 1, 4);   // direct: 0->1 costs 4
        g.addEdge(0, 2, 1);
        g.addEdge(2, 1, 2);   // detour: 0->2->1 costs 3
        g.addEdge(1, 3, 3);   // and 3 rides the detour: 0->2->1->3 costs 6
        vector<long> d = dijkstra(g, 0);
        check(d.size() == 4 && d[1] == 3, "dist[1] == 3 (via the 0->2->1 detour, not the direct edge)");
        check(d.size() == 4 && d[3] == 6, "dist[3] == 6 (the detour propagates downstream)");
    }

    cout << "T3 · unreachable vertex has dist == INF\n";
    {
        WGraph g(4);
        g.addEdge(0, 1, 1);
        g.addEdge(1, 2, 1);
        // vertex 3 has no incoming edge — unreachable from 0
        vector<long> d = dijkstra(g, 0);
        check(d.size() == 4 && d[3] == INF, "dist[3] == INF (no path reaches vertex 3)");
    }

    cout << "T4 · a larger graph with hand-computed distances (6 vertices)\n";
    {
        WGraph g(6);
        g.addEdge(0, 1, 7);
        g.addEdge(0, 2, 9);
        g.addEdge(0, 5, 14);
        g.addEdge(1, 2, 10);
        g.addEdge(1, 3, 15);
        g.addEdge(2, 3, 11);
        g.addEdge(2, 5, 2);
        g.addEdge(3, 4, 6);
        g.addEdge(5, 4, 9);
        vector<long> d = dijkstra(g, 0);
        check(d.size() == 6 && d[0] == 0 && d[1] == 7 && d[2] == 9 && d[3] == 20 && d[4] == 20 && d[5] == 11,
              "dist = {0, 7, 9, 20, 20, 11} from source 0");
    }

    cout << "T5 · linear chain 0->1->2->...->k with unit weights\n";
    {
        const int k = 9;
        WGraph g(k + 1);
        for (int i = 0; i < k; i++) g.addEdge(i, i + 1, 1);
        vector<long> d = dijkstra(g, 0);
        bool ok = d.size() == (size_t)(k + 1);
        if (ok) for (int i = 0; i <= k; i++) ok = ok && d[i] == i;
        check(ok, "dist[i] == i for every vertex on the chain");
    }

    cout << "T6 · ties — two equal-cost routes agree\n";
    {
        WGraph g(4);
        g.addEdge(0, 1, 5);
        g.addEdge(0, 2, 5);
        g.addEdge(1, 3, 5);   // 0->1->3 costs 10 …
        g.addEdge(2, 3, 5);   // … and so does 0->2->3
        vector<long> d = dijkstra(g, 0);
        check(d.size() == 4 && d[1] == 5 && d[2] == 5 && d[3] == 10,
              "equal-cost routes give dist = {0, 5, 5, 10}");
    }

    cout << "T7 · zero-weight edges are legal (weights are non-negative, not positive)\n";
    {
        WGraph g(3);
        g.addEdge(0, 1, 0);
        g.addEdge(1, 2, 0);
        vector<long> d = dijkstra(g, 0);
        check(d.size() == 3 && d[1] == 0 && d[2] == 0, "a zero-cost chain: every dist is 0");
    }

    cout << "T8 · stale-entry stress — every vertex improves after it was pushed\n";
    {
        // each vertex is reachable directly (expensive) AND via a cheap unit
        // chain, so the pq fills with stale entries your `d > dist[u]` skip
        // must ignore. dist[v] must end at v (the chain), never 100*v.
        const int n = 8;
        WGraph g(n);
        for (int v = 1; v < n; v++) g.addEdge(0, v, 100 * v);
        for (int v = 0; v < n - 1; v++) g.addEdge(v, v + 1, 1);
        vector<long> d = dijkstra(g, 0);
        bool ok = d.size() == (size_t)n;
        if (ok) for (int v = 0; v < n; v++) ok = ok && d[v] == v;
        check(ok, "the cheap chain wins everywhere (dist[v] == v)");
    }

    cout << passCnt << " passed, " << failCnt << " failed" << '\n';
    return failCnt ? 1 : 0;
}
#endif
