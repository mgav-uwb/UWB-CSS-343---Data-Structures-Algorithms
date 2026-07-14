// Lomuto partition around the last element as pivot. Elements < pivot are moved
// to the front; the pivot ends in its final sorted slot, whose index is returned.
fn partition(a: &mut [i32], lo: usize, hi: usize) -> usize {
    let pivot = a[hi];
    let mut i = lo;                       // next free slot of the "< pivot" region
    for j in lo..hi {
        if a[j] < pivot {
            a.swap(i, j);                 // swap the element into the region
            i += 1;
        }
    }
    a.swap(i, hi);                        // drop the pivot into its final slot
    i                                     // the pivot's final index
}

// Quicksort: partition, then recurse on each side. No combine step.
fn quicksort(a: &mut [i32], lo: usize, hi: usize) {
    if hi <= lo { return; }               // base case: 0 or 1 element
    let p = partition(a, lo, hi);         // pivot lands at its final index p
    if p > lo { quicksort(a, lo, p - 1); }   // guard: usize cannot go below 0
    quicksort(a, p + 1, hi);              // sort the larger side
}
