class Graph {
    int V;                                  // number of vertices
    List<List<Integer>> adj;                // adj.get(u) = u's neighbors
    Graph(int n) {
        V = n;
        adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    }
    void addEdge(int u, int v) {
        adj.get(u).add(v);
        adj.get(v).add(u);                  // omit this line for a digraph
    }
}
