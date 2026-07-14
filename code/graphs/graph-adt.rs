struct Graph {
    adj: Vec<Vec<usize>>,               // adj[u] = u's neighbors
}
impl Graph {
    fn new(n: usize) -> Self {
        Graph { adj: vec![Vec::new(); n] }
    }
    fn add_edge(&mut self, u: usize, v: usize) {
        self.adj[u].push(v);
        self.adj[v].push(u);            // omit this line for a digraph
    }
}
