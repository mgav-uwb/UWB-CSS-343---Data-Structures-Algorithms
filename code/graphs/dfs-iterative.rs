fn dfs(g: &Graph, s: usize) {
    let mut st = vec![s];
    let mut seen = vec![false; g.adj.len()];
    while let Some(u) = st.pop() {
        if seen[u] { continue; }
        seen[u] = true;             // visit u
        for &v in &g.adj[u] {
            if !seen[v] { st.push(v); }
        }
    }
}
