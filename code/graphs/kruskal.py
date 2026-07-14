# Kruskal: sort edges cheapest-first, then add each edge whose endpoints are not
# yet connected. Each edge is a tuple (w, u, v). Stop after V-1 edges.
def kruskal(V, edges):
    uf = UF(V)                               # from union-find.py
    mst = []
    for w, u, v in sorted(edges):            # sorts by weight (first tuple field)
        if uf.connected(u, v):               # cycle — skip (cycle property)
            continue
        mst.append((w, u, v))                # safe — take it (cut property)
        uf.unite(u, v)
        if len(mst) == V - 1:                # spanning tree complete
            break
    return mst
