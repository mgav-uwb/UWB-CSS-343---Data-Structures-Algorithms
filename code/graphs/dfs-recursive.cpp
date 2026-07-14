void dfs(Graph& g, int u, vector<bool>& seen) {
    seen[u] = true;                 // visit u
    for (int v : g.adj[u])          // each neighbor
        if (!seen[v])
            dfs(g, v, seen);        // recurse; backtrack on return
}
