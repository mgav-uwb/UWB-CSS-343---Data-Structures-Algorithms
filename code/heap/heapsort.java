// In-place heapsort of a 1-based array a[1..n] (a[0] unused), ascending.
// Theta(n log n), Theta(1) extra space, NOT stable. Uses sink from swim-sink.
static void heapsort(int[] a, int n) {
    for (int k = n / 2; k >= 1; k--)   // build-heap bottom-up: Theta(n)
        sink(a, k, n);                 // every internal node, last to first
    for (int end = n; end >= 2; end--) {   // sortdown: n-1 delMax steps
        int t = a[1]; a[1] = a[end]; a[end] = t;   // park the max at the boundary
        sink(a, 1, end - 1);           // re-heapify the shrunken heap a[1..end-1]
    }
}
