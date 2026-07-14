# In-place heapsort of a 1-based list a[1..n] (a[0] unused), ascending.
# Theta(n log n), Theta(1) extra space, NOT stable. Uses sink from swim-sink.
def heapsort(a, n):
    for k in range(n // 2, 0, -1):     # build-heap bottom-up: Theta(n)
        sink(a, k, n)                  # every internal node, last to first
    for end in range(n, 1, -1):        # sortdown: n-1 delMax steps
        a[1], a[end] = a[end], a[1]    # park the current max at the boundary
        sink(a, 1, end - 1)            # re-heapify the shrunken heap a[1..end-1]
