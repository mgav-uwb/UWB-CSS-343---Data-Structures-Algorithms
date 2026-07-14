use std::collections::VecDeque;

fn bfs(g: &Graph, s: usize) {
    let mut q = VecDeque::from([s]);
    let mut seen = vec![false; g.adj.len()];
    seen[s] = true;
    while let Some(u) = q.pop_front() {  // visit u
        for &v in &g.adj[u] {
            if !seen[v] {
                seen[v] = true;          // mark on ENQUEUE
                q.push_back(v);
            }
        }
    }
}
