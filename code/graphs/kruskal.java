// Kruskal: sort edges cheapest-first, then add each edge whose endpoints are not
// yet connected. Stop after V-1 edges.
class Edge {
    int u, v; long w;
    Edge(int u, int v, long w) { this.u = u; this.v = v; this.w = w; }
}

List<Edge> kruskal(int V, List<Edge> edges) {
    edges.sort((a, b) -> Long.compare(a.w, b.w));
    UF uf = new UF(V);                           // from union-find.java
    List<Edge> mst = new ArrayList<>();
    for (Edge e : edges) {
        if (uf.connected(e.u, e.v)) continue;    // cycle — skip (cycle property)
        mst.add(e);                              // safe — take it (cut property)
        uf.unite(e.u, e.v);
        if (mst.size() == V - 1) break;          // spanning tree complete
    }
    return mst;
}
