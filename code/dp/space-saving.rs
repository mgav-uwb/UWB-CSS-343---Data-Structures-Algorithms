// 0/1 knapsack value in Theta(W) space: ONE row, updated RIGHT-TO-LEFT so
// k[w - weight[i]] still holds the previous row's value (item i not yet
// used). Iterating forward would let item i be taken again -- that variant
// is exactly the UNBOUNDED knapsack. No table survives, so no traceback.
fn knapsack_value(n: usize, cap: usize, value: &[i64], weight: &[usize]) -> i64 {
    let mut k = vec![0i64; cap + 1];                  // row 0: no items
    for i in 1..=n {
        for w in (weight[i]..=cap).rev() {            // BACKWARD: 0/1
            k[w] = k[w].max(value[i] + k[w - weight[i]]);
        }
    }
    k[cap]
}

// Edit-distance value in Theta(n) space: keep TWO rows, previous and current,
// swapping after each row. Same fill, same answer -- no traceback.
fn edit_distance_value(a: &[u8], b: &[u8]) -> usize {
    let (m, n) = (a.len(), b.len());
    let mut prev: Vec<usize> = (0..=n).collect();     // row 0: insert all of b
    let mut cur = vec![0usize; n + 1];
    for i in 1..=m {
        cur[0] = i;                                   // column 0: delete all
        for j in 1..=n {
            cur[j] = if a[i - 1] == b[j - 1] {
                prev[j - 1]                           // match: free diagonal
            } else {
                1 + prev[j]                           // delete
                    .min(cur[j - 1])                  // insert
                    .min(prev[j - 1])                 // replace
            };
        }
        std::mem::swap(&mut prev, &mut cur);          // rows swap roles
    }
    prev[n]                                           // the last computed row
}
