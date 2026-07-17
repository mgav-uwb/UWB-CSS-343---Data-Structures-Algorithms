// Rod cutting, tabulated: best[len] = max over first cuts i of
// price[i] + best[len-i], recording the winning i in cut[len] for the
// traceback. n subproblems x O(n) choices each = Theta(n^2) time, Theta(n) space.
fn rod_cut(price: &[i32], n: usize) -> (i32, Vec<usize>) {
    let mut best = vec![0i32; n + 1];     // base case: best[0] = 0 (empty rod)
    let mut cut = vec![0usize; n + 1];
    for len in 1..=n {
        let mut m = -1;
        for i in 1..=len {                // try every first cut
            if price[i] + best[len - i] > m {
                m = price[i] + best[len - i];
                cut[len] = i;             // remember the choice that won
            }
        }
        best[len] = m;                    // reuses smaller best[] -- the overlap
    }
    (best[n], cut)
}

// Traceback: repeatedly take the recorded first cut until nothing is left.
fn pieces(cut: &[usize], mut n: usize) -> Vec<usize> {
    let mut out = Vec::new();
    while n > 0 {
        out.push(cut[n]);                 // the winning first cut at length n
        n -= cut[n];                      // cut it off, continue on the rest
    }
    out                                   // prices 1,5,8,9 at n=4: [2, 2]
}
