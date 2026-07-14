// Lazy Prim: grow one tree from s. Min-heap of {weight, vertex}; skip stale pops.
// adj.get(u) = u's weighted edges. Returns the MST total weight.
long prim(int V, List<List<Edge>> adj, int s) {
    boolean[] inTree = new boolean[V];
    PriorityQueue<long[]> pq =
        new PriorityQueue<>((a, b) -> Long.compare(a[0], b[0]));  // by weight
    long total = 0; int picked = 0;
    inTree[s] = true;
    for (Edge e : adj.get(s)) pq.add(new long[]{e.w, e.to});
    while (picked < V - 1 && !pq.isEmpty()) {
        long[] top = pq.poll();
        long w = top[0]; int u = (int) top[1];
        if (inTree[u]) continue;                  // stale — both ends already in
        inTree[u] = true; total += w; picked++;   // take the crossing edge
        for (Edge e : adj.get(u))
            if (!inTree[e.to]) pq.add(new long[]{e.w, e.to});
    }
    return total;
}
