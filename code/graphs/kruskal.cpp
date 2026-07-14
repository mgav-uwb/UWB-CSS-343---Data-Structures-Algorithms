// Kruskal: sort edges cheapest-first, then add each edge whose endpoints are not
// yet connected (union-find is the cycle check). Stop after V-1 edges.
struct Edge { int u, v; long w; };

vector<Edge> kruskal(int V, vector<Edge> edges) {
    sort(edges.begin(), edges.end(),
         [](const Edge& a, const Edge& b) { return a.w < b.w; });
    UF uf(V);                                    // from union-find.cpp
    vector<Edge> mst;
    for (const Edge& e : edges) {
        if (uf.connected(e.u, e.v)) continue;    // cycle — skip (cycle property)
        mst.push_back(e);                        // safe — take it (cut property)
        uf.unite(e.u, e.v);
        if ((int)mst.size() == V - 1) break;     // spanning tree complete
    }
    return mst;
}
