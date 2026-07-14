void dfs(Graph g, int s) {
    Deque<Integer> st = new ArrayDeque<>();
    st.push(s);
    boolean[] seen = new boolean[g.V];
    while (!st.isEmpty()) {
        int u = st.pop();
        if (seen[u]) continue;
        seen[u] = true;             // visit u
        for (int v : g.adj.get(u))
            if (!seen[v]) st.push(v);
    }
}
