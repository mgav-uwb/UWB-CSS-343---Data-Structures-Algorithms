// Merge two adjacent sorted runs a[lo..mid] and a[mid+1..hi] into sorted order,
// using aux[] as scratch. Every element is copied once: Theta(n).
void merge(int a[], int lo, int mid, int hi, int aux[]) {
    for (int k = lo; k <= hi; k++) aux[k] = a[k];    // copy into scratch
    int i = lo, j = mid + 1;
    for (int k = lo; k <= hi; k++) {
        if (i > mid)              a[k] = aux[j++];    // left run exhausted
        else if (j > hi)          a[k] = aux[i++];    // right run exhausted
        else if (aux[j] < aux[i]) a[k] = aux[j++];    // take the smaller front
        else                      a[k] = aux[i++];    // ties take left: STABLE
    }
}

// Top-down mergesort: sort each half, then merge. T(n) = 2T(n/2) + Theta(n).
void mergesort(int a[], int lo, int hi, int aux[]) {
    if (hi <= lo) return;                 // base case: 0 or 1 element
    int mid = lo + (hi - lo) / 2;
    mergesort(a, lo, mid, aux);           // sort the left half
    mergesort(a, mid + 1, hi, aux);       // sort the right half
    merge(a, lo, mid, hi, aux);           // combine
}
