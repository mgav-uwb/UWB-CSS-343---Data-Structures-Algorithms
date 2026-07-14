void dfs(Graph g, int u, boolean[] seen) {
    seen[u] = true;                 // visit u
    for (int v : g.adj.get(u))      // each neighbor
        if (!seen[v])
            dfs(g, v, seen);        // recurse; backtrack on return
}
