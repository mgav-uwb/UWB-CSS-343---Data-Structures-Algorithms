struct WGraph {
    adj: Vec<Vec<(usize, i64)>>,        // adj[u] = list of (v, weight) pairs
}
impl WGraph {
    fn new(n: usize) -> Self {
        WGraph { adj: vec![Vec::new(); n] }
    }
    fn add_edge(&mut self, u: usize, v: usize, w: i64) {
        self.adj[u].push((v, w));
        // self.adj[v].push((u, w));      // add this line for an UNDIRECTED edge
    }
}
