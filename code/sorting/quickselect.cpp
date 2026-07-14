// Quickselect: the k-th smallest element (0-indexed). Partition, then recurse
// into ONLY the side that contains rank k. Average Theta(n). Reuses partition().
int quickselect(int a[], int lo, int hi, int k) {
    if (lo == hi) return a[lo];           // one element left
    int p = partition(a, lo, hi);         // pivot lands at rank p
    if (k == p)      return a[p];          // found it
    else if (k < p)  return quickselect(a, lo, p - 1, k);   // left side only
    else             return quickselect(a, p + 1, hi, k);   // right side only
}
