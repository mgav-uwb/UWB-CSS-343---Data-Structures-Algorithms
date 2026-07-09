// CSS 343 · ICA 08 — graph traversals.  Fill in the TODOs, then run the app.
//
//   build:        g++ -std=c++17 -g -o ica08 ica08.cpp
//   run:          ./ica08
//   leak-check:   valgrind --leak-check=full ./ica08     (ICA 08 IS LEAK-GRADED)
//
// The Graph struct, the dfs() wrapper, and main() (a unit-test battery) are
// GIVEN — do not edit them. You implement dfsVisit (the DFS recursion) and bfs;
// topoSort is a STRETCH goal (optional — do it if you finish early). Run early
// and often: the tests report [PASS]/[FAIL] one by one.

#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
#include <string>
using namespace std;

struct Graph {
    int V;
    vector<vector<int>> adj;                 // directed adjacency list
    Graph(int n) : V(n), adj(n) {}
    void addEdge(int u, int v) { adj[u].push_back(v); }
    void sortAdj() { for (auto& a : adj) sort(a.begin(), a.end()); }  // deterministic order
};

// ---- TODO 1 — dfsVisit (the DFS recursion) -------------------------------
// Mark u visited, append it to `order`, then recurse into each UNVISITED
// neighbor (in g.adj[u]).  The given dfs() wrapper below calls this.
void dfsVisit(const Graph& g, int u, vector<bool>& seen, vector<int>& order) {
    // TODO: seen[u] = true; order.push_back(u);
    //       for (int v : g.adj[u]) if (!seen[v]) dfsVisit(g, v, seen, order);
}
// GIVEN — the DFS wrapper (uses your dfsVisit):
vector<int> dfs(const Graph& g, int s) {
    vector<bool> seen(g.V, false);
    vector<int> order;
    dfsVisit(g, s, seen, order);
    return order;
}

// ---- TODO 2 — bfs --------------------------------------------------------
// Breadth-first search from s using a queue<int>; return vertices in dequeue
// order. Mark a vertex seen when you ENQUEUE it (not when you dequeue).
vector<int> bfs(const Graph& g, int s) {
    // TODO: seen[s]=true; q.push(s); while q not empty: pop u, append to order,
    //       for each unseen neighbor v: mark seen, push v.
    return {};
}

// ---- TODO 3 · STRETCH (optional) — topoSort ------------------------------
// Kahn's algorithm: compute in-degrees, queue every in-degree-0 vertex, then
// repeatedly output one and decrement its neighbors (enqueue any that hit 0).
// Return the order (its size is < V when the graph has a cycle).
vector<int> topoSort(const Graph& g) {
    // TODO: build indeg[]; queue in-degree-0 vertices; pop u → append u →
    //       for each neighbor v: if (--indeg[v] == 0) push v.  Return order.
    return {};
}

// ==========================================================================
// UNIT TESTS + APPLICATION (given — do not edit).
// ==========================================================================
#ifndef ICA08_GRADER
static int passCnt = 0, failCnt = 0;
static void check(bool ok, const string& what) {
    (ok ? passCnt : failCnt)++;
    cout << (ok ? "  [PASS] " : "  [FAIL] ") << what << '\n';
}
// every edge u→v must have u BEFORE v; order must list all V vertices
static bool validTopo(const Graph& g, const vector<int>& order) {
    if ((int)order.size() != g.V) return false;
    vector<int> pos(g.V, -1);
    for (int i = 0; i < (int)order.size(); i++) pos[order[i]] = i;
    for (int u = 0; u < g.V; u++)
        for (int v : g.adj[u])
            if (pos[u] < 0 || pos[v] < 0 || pos[u] >= pos[v]) return false;
    return true;
}
// the sample DAG: 0→1 0→2 1→3 2→3 2→4 3→5 4→5
static Graph sample() {
    Graph g(6);
    g.addEdge(0,1); g.addEdge(0,2); g.addEdge(1,3);
    g.addEdge(2,3); g.addEdge(2,4); g.addEdge(3,5); g.addEdge(4,5);
    g.sortAdj();
    return g;
}

int main() {
    Graph g = sample();

    cout << "T1 · DFS visits every reachable vertex\n";
    vector<int> d = dfs(g, 0);
    check((int)d.size() == 6, "DFS from 0 visits all 6 vertices");
    check(!d.empty() && d.front() == 0, "DFS starts at the source (0)");

    cout << "T2 · DFS is depth-first\n";
    // dive 0→1→3→5, backtrack, then 0→2→4
    check(d == vector<int>({0,1,3,5,2,4}), "DFS order is 0 1 3 5 2 4");

    cout << "T3 · BFS is breadth-first (by layer)\n";
    vector<int> b = bfs(g, 0);
    check((int)b.size() == 6, "BFS visits all 6 vertices");
    check(b == vector<int>({0,1,2,3,4,5}), "BFS order is 0 1 2 3 4 5 (layer by layer)");
    check(d != b, "DFS and BFS orders differ");

    cout << "T4 · topological sort is valid\n";
    vector<int> t = topoSort(g);
    check((int)t.size() == 6, "topo order lists all 6 vertices (no cycle)");
    check(validTopo(g, t), "every edge points forward in the topo order");

    cout << "T5 · a cycle has no topological order\n";
    Graph c = sample();
    c.addEdge(5, 0); c.sortAdj();             // 5→0 closes a cycle
    check((int)topoSort(c).size() < c.V, "cyclic graph → topo order incomplete (< V)");

    cout << "T6 · a second graph (a chain)\n";
    Graph chain(5);                            // 0→1→2→3→4
    for (int i = 0; i < 4; i++) chain.addEdge(i, i+1);
    chain.sortAdj();
    check(dfs(chain, 0) == vector<int>({0,1,2,3,4}), "DFS of a chain is 0 1 2 3 4");
    check(bfs(chain, 0) == vector<int>({0,1,2,3,4}), "BFS of a chain is 0 1 2 3 4");
    check(validTopo(chain, topoSort(chain)), "chain topo order is valid");

    cout << passCnt << " passed, " << failCnt << " failed"
         << (failCnt ? "" : "  —  now run it under valgrind (must be clean)") << '\n';
    return failCnt ? 1 : 0;
}
#endif
