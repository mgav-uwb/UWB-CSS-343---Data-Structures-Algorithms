use std::collections::BinaryHeap;
use std::cmp::Reverse;

// Lazy Prim from s. adj[u] holds (v, weight) pairs. Reverse turns the max-heap
// into a min-heap on weight; skip stale pops. Returns the MST total weight.
fn prim(n: usize, adj: &Vec<Vec<(usize, i64)>>, s: usize) -> i64 {
    let mut in_tree = vec![false; n];
    let mut pq = BinaryHeap::new();
    let (mut total, mut picked) = (0i64, 0usize);
    in_tree[s] = true;
    for &(v, w) in &adj[s] { pq.push(Reverse((w, v))); }
    while picked < n - 1 {
        let Some(Reverse((w, u))) = pq.pop() else { break };
        if in_tree[u] { continue; }           // stale — both ends already in
        in_tree[u] = true;                    // take the crossing edge
        total += w;
        picked += 1;
        for &(v, wt) in &adj[u] {
            if !in_tree[v] { pq.push(Reverse((wt, v))); }
        }
    }
    total
}
