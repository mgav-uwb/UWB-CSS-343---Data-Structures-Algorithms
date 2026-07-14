void bfs(Graph g, int s) {
    Queue<Integer> q = new ArrayDeque<>();
    q.add(s);
    boolean[] seen = new boolean[g.V];
    seen[s] = true;
    while (!q.isEmpty()) {
        int u = q.poll();               // visit u
        for (int v : g.adj.get(u))
            if (!seen[v]) {
                seen[v] = true;         // mark on ENQUEUE
                q.add(v);
            }
    }
}
