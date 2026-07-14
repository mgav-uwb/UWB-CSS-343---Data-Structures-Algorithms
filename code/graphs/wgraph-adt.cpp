struct Edge { int to; long w; };     // a weighted out-edge

struct WGraph {
    int V;                            // number of vertices
    vector<vector<Edge>> adj;         // adj[u] = u's weighted out-edges
    WGraph(int n) : V(n), adj(n) {}
    void addEdge(int u, int v, long w) {
        adj[u].push_back({v, w});
        // adj[v].push_back({u, w});  // add this line for an UNDIRECTED edge
    }
};
