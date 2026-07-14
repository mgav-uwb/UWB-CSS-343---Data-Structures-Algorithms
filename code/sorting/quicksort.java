// Lomuto partition around the last element as pivot. Elements < pivot are moved
// to the front; the pivot ends in its final sorted slot, whose index is returned.
static int partition(int[] a, int lo, int hi) {
    int pivot = a[hi];
    int i = lo - 1;                       // boundary of the "< pivot" region
    for (int j = lo; j < hi; j++)
        if (a[j] < pivot) {
            i++;
            int t = a[i]; a[i] = a[j]; a[j] = t;    // swap the element in
        }
    int t = a[i + 1]; a[i + 1] = a[hi]; a[hi] = t;  // drop the pivot into place
    return i + 1;                         // the pivot's final index
}

// Quicksort: partition, then recurse on each side. No combine step.
static void quicksort(int[] a, int lo, int hi) {
    if (hi <= lo) return;                 // base case: 0 or 1 element
    int p = partition(a, lo, hi);         // pivot lands at its final index p
    quicksort(a, lo, p - 1);              // sort the smaller side
    quicksort(a, p + 1, hi);              // sort the larger side
}
