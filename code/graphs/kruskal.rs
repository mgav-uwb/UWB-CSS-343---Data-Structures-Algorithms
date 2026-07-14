// Kruskal: sort edges cheapest-first, then add each edge whose endpoints are not
// yet connected. Each edge is (weight, u, v). Stop after V-1 edges.
fn kruskal(v: usize, mut edges: Vec<(i64, usize, usize)>)
    -> Vec<(i64, usize, usize)>
{
    edges.sort();                            // tuples sort by weight first
    let mut uf = UF::new(v);                 // from union-find.rs
    let mut mst = Vec::new();
    for (w, a, b) in edges {
        if uf.connected(a, b) { continue; }  // cycle — skip (cycle property)
        mst.push((w, a, b));                 // safe — take it (cut property)
        uf.unite(a, b);
        if mst.len() == v - 1 { break; }     // spanning tree complete
    }
    mst
}
