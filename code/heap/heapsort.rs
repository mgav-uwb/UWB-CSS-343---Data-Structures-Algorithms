// In-place heapsort of a 1-based slice a[1..=n] (a[0] unused), ascending.
// Theta(n log n), Theta(1) extra space, NOT stable. Uses sink from swim-sink.
fn heapsort(a: &mut [i32], n: usize) {
    for k in (1..=n / 2).rev() {       // build-heap bottom-up: Theta(n)
        sink(a, k, n);                 // every internal node, last to first
    }
    for end in (2..=n).rev() {         // sortdown: n-1 delMax steps
        a.swap(1, end);                // park the current max at the boundary
        sink(a, 1, end - 1);           // re-heapify the shrunken heap a[1..=end-1]
    }
}
