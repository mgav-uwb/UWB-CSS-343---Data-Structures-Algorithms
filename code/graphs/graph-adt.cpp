struct Graph {
    int V;                        // number of vertices
    vector<vector<int>> adj;      // adj[u] = u's neighbors
    Graph(int n) : V(n), adj(n) {}
    void addEdge(int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);      // omit this line for a digraph
    }
};
