class Edge {
    int to; long w;
    Edge(int t, long weight) { to = t; w = weight; }
}

class WGraph {
    int V;                                  // number of vertices
    List<List<Edge>> adj;                   // adj.get(u) = u's out-edges
    WGraph(int n) {
        V = n;
        adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    }
    void addEdge(int u, int v, long w) {
        adj.get(u).add(new Edge(v, w));
        // adj.get(v).add(new Edge(u, w));  // add this line for an UNDIRECTED edge
    }
}
