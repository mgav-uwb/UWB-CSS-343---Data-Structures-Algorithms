// Lomuto partition around the last element as pivot. Elements < pivot are moved
// to the front; the pivot ends in its final sorted slot, whose index is returned.
int partition(int a[], int lo, int hi) {
    int pivot = a[hi];
    int i = lo - 1;                       // boundary of the "< pivot" region
    for (int j = lo; j < hi; j++)
        if (a[j] < pivot)
            swap(a[++i], a[j]);           // grow the region, swap the element in
    swap(a[i + 1], a[hi]);                // drop the pivot just past the region
    return i + 1;                         // the pivot's final index
}

// Quicksort: partition, then recurse on each side. No combine step.
void quicksort(int a[], int lo, int hi) {
    if (hi <= lo) return;                 // base case: 0 or 1 element
    int p = partition(a, lo, hi);         // pivot lands at its final index p
    quicksort(a, lo, p - 1);              // sort the smaller side
    quicksort(a, p + 1, hi);              // sort the larger side
}
