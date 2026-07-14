// Lazy Prim: grow one tree from s. A min-heap holds candidate crossing edges
// keyed by weight; pop the lightest, skip it if it now leads back into the tree,
// otherwise take it. adj[u] = u's weighted edges. Returns the MST total weight.
struct Edge { int to; long w; };

long prim(int V, vector<vector<Edge>>& adj, int s) {
    vector<bool> inTree(V, false);
    priority_queue<pair<long,int>, vector<pair<long,int>>,
                   greater<>> pq;                 // min-heap keyed by edge weight
    long total = 0; int picked = 0;
    inTree[s] = true;
    for (Edge e : adj[s]) pq.push({e.w, e.to});   // edges leaving the start
    while (picked < V - 1 && !pq.empty()) {
        auto [w, u] = pq.top(); pq.pop();
        if (inTree[u]) continue;                  // stale — both ends already in
        inTree[u] = true; total += w; picked++;   // take the crossing edge
        for (Edge e : adj[u])
            if (!inTree[e.to]) pq.push({e.w, e.to});
    }
    return total;
}
