// Priority-queue operations on a 1-based max-heap: a[0] unused, size n.
// insert appends then swims up; delMax swaps the root out then sinks. Each Theta(log n).
struct MaxHeap { int a[CAP + 1]; int n = 0; };   // a[0] wasted so root sits at 1

int max(MaxHeap& h) { return h.a[1]; }            // the root -- Theta(1)

void insert(MaxHeap& h, int x) {
    h.a[++h.n] = x;                  // append at the end: tree stays complete
    swim(h.a, h.n);                  // restore heap order up one path
}

int delMax(MaxHeap& h) {
    int top = h.a[1];                // the maximum, to be returned
    std::swap(h.a[1], h.a[h.n--]);   // move max to the end, then shrink
    sink(h.a, 1, h.n);               // restore heap order down one path
    return top;                      // old max is now parked at a[n+1]
}
