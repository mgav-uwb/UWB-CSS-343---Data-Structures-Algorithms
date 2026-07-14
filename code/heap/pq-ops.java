// Priority-queue operations on a 1-based max-heap: a[0] unused, size n.
// insert appends then swims up; delMax swaps the root out then sinks. Each Theta(log n).
class MaxHeap {
    int[] a; int n = 0;                   // a[0] wasted so the root sits at 1
    MaxHeap(int cap) { a = new int[cap + 1]; }

    int max() { return a[1]; }            // the root -- Theta(1)

    void insert(int x) {
        a[++n] = x;                       // append at the end: tree stays complete
        swim(a, n);                       // restore heap order up one path
    }
    int delMax() {
        int top = a[1];                   // the maximum, to be returned
        int t = a[1]; a[1] = a[n]; a[n] = t;   // move max to the end
        n--;                              // shrink (old max parked at a[n+1])
        sink(a, 1, n);                    // restore heap order down one path
        return top;
    }
}
