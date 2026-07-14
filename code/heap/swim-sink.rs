// Restore heap order along ONE path. 1-based slice a[1..=n]; a[0] is unused.
// swim: a[k] may now exceed its parent -- lift it up. Cost Theta(log n).
fn swim(a: &mut [i32], mut k: usize) {
    while k > 1 && a[k / 2] < a[k] {       // parent smaller: heap order broken
        a.swap(k / 2, k);                  // lift the bigger key up
        k /= 2;                            // move up to the parent
    }
}
// sink: a[k] may now be smaller than a child -- push it down among a[1..=n].
fn sink(a: &mut [i32], mut k: usize, n: usize) {
    while 2 * k <= n {                     // while a[k] has a left child
        let mut j = 2 * k;                 // left child
        if j < n && a[j] < a[j + 1] { j += 1; }  // pick the LARGER child
        if a[k] >= a[j] { break; }         // already >= both children: done
        a.swap(k, j);                      // demote a[k] under the larger child
        k = j;                             // move down
    }
}
