// Lazy Dijkstra: a min-heap of {dist, vertex}. Settle a vertex the moment it
// POPS as the minimum; skip stale pops; relax and push improved neighbors.
long[] dijkstra(WGraph g, int s) {
    long[] dist = new long[g.V];         // dist[v] = best-known cost s->v
    Arrays.fill(dist, Long.MAX_VALUE);   // MAX_VALUE plays the role of infinity
    boolean[] settled = new boolean[g.V]; // settled[v] = dist[v] is final
    // min-heap of {dist, vertex}, ordered by distance
    PriorityQueue<long[]> pq =
        new PriorityQueue<>((a, b) -> Long.compare(a[0], b[0]));
    dist[s] = 0;
    pq.add(new long[]{0, s});
    while (!pq.isEmpty()) {
        int u = (int) pq.poll()[1];          // nearest unsettled
        if (settled[u]) continue;            // stale entry — skip
        settled[u] = true;                   // dist[u] is now FINAL
        for (Edge e : g.adj.get(u))
            if (!settled[e.to] && dist[u] + e.w < dist[e.to]) {
                dist[e.to] = dist[u] + e.w;   // relax: a cheaper route to e.to
                pq.add(new long[]{dist[e.to], e.to});
            }
    }
    return dist;
}
