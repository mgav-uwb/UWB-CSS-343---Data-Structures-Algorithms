// Tabulated 0/1 knapsack. value[i], weight[i] describe item i (1-based slices
// with a dummy slot 0). k[i][w] = best value using items 1..=i within
// capacity w. Theta(nW) time and space. Returns the full table.
fn knapsack(n: usize, cap: usize, value: &[i64], weight: &[usize]) -> Vec<Vec<i64>> {
    let mut k = vec![vec![0i64; cap + 1]; n + 1];     // row 0: no items -> 0
    for i in 1..=n {
        for w in 0..=cap {
            k[i][w] = k[i - 1][w];                    // skip item i
            if weight[i] <= w {                       // does it fit?
                k[i][w] = k[i][w].max(value[i] + k[i - 1][w - weight[i]]);
            }
        }
    }
    k                                                 // k[n][cap] is the optimum
}

// Traceback: recover WHICH items achieve k[n][cap]. If a cell differs from
// the cell directly above, item i was taken; drop its weight. O(n).
fn knapsack_items(n: usize, cap: usize, weight: &[usize], k: &[Vec<i64>]) -> Vec<usize> {
    let mut taken = Vec::new();
    let mut w = cap;
    for i in (1..=n).rev() {
        if k[i][w] != k[i - 1][w] {                   // value changed: taken
            taken.push(i);
            w -= weight[i];
        }
    }
    taken.reverse();                                  // forward order
    taken
}
