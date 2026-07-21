use std::collections::BinaryHeap;
use std::cmp::Reverse;

// Lazy Dijkstra. BinaryHeap is a MAX-heap, so wrap each (dist, vertex) in
// Reverse to pop the SMALLEST distance. Settle on pop; skip stale pops.
fn dijkstra(g: &WGraph, s: usize) -> Vec<i64> {
    let n = g.adj.len();
    let mut dist = vec![i64::MAX; n];    // dist[v] = best-known cost s->v
    let mut settled = vec![false; n];    // settled[v] = dist[v] is final
    let mut pq = BinaryHeap::new();
    dist[s] = 0;
    pq.push(Reverse((0i64, s)));
    while let Some(Reverse((_d, u))) = pq.pop() {   // nearest unsettled
        if settled[u] { continue; }                 // stale entry — skip
        settled[u] = true;                          // dist[u] is now FINAL
        for &(v, w) in &g.adj[u] {
            if !settled[v] && dist[u] + w < dist[v] {
                dist[v] = dist[u] + w;              // relax: cheaper route to v
                pq.push(Reverse((dist[v], v)));
            }
        }
    }
    dist
}
