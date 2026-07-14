fn dfs(g: &Graph, u: usize, seen: &mut Vec<bool>) {
    seen[u] = true;                 // visit u
    for &v in &g.adj[u] {           // each neighbor
        if !seen[v] {
            dfs(g, v, seen);        // recurse; backtrack on return
        }
    }
}
