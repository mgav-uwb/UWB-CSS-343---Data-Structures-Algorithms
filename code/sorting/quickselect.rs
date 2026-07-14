// Quickselect: the k-th smallest element (0-indexed). Partition, then recurse
// into ONLY the side that contains rank k. Average O(n). Reuses partition().
fn quickselect(a: &mut [i32], lo: usize, hi: usize, k: usize) -> i32 {
    if lo == hi { return a[lo]; }         // one element left
    let p = partition(a, lo, hi);         // pivot lands at rank p
    if k == p { a[p] }                    // found it
    else if k < p { quickselect(a, lo, p - 1, k) }   // left side only
    else { quickselect(a, p + 1, hi, k) }            // right side only
}
