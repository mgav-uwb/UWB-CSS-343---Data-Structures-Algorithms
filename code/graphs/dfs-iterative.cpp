void dfs(Graph& g, int s) {
    stack<int> st; st.push(s);
    vector<bool> seen(g.V, false);
    while (!st.empty()) {
        int u = st.top(); st.pop();
        if (seen[u]) continue;
        seen[u] = true;             // visit u
        for (int v : g.adj[u])
            if (!seen[v]) st.push(v);
    }
}
