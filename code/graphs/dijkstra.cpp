// Lazy Dijkstra: a min-heap of (dist, vertex) pairs. Settle a vertex the moment
// it POPS as the minimum; skip stale pops; relax its out-edges and push any
// improved neighbor. Needs all weights >= 0.
vector<long> dijkstra(WGraph& g, int s) {
    vector<long> dist(g.V, LONG_MAX);
    vector<bool> settled(g.V, false);
    priority_queue<pair<long,int>, vector<pair<long,int>>,
                   greater<>> pq;              // min-heap keyed by distance
    dist[s] = 0;
    pq.push({0, s});
    while (!pq.empty()) {
        int u = pq.top().second; pq.pop();     // nearest unsettled
        if (settled[u]) continue;              // stale entry — skip
        settled[u] = true;                     // dist[u] is now FINAL
        for (Edge e : g.adj[u])
            if (!settled[e.to] && dist[u] + e.w < dist[e.to]) {
                dist[e.to] = dist[u] + e.w;     // relax: a cheaper route to e.to
                pq.push({dist[e.to], e.to});    // push, don't decrease-key
            }
    }
    return dist;
}
