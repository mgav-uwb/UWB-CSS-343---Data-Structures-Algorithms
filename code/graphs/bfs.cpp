void bfs(Graph& g, int s) {
    queue<int> q; q.push(s);
    vector<bool> seen(g.V, false); seen[s] = true;
    while (!q.empty()) {
        int u = q.front(); q.pop();     // visit u
        for (int v : g.adj[u])
            if (!seen[v]) {
                seen[v] = true;         // mark on ENQUEUE
                q.push(v);
            }
    }
}
