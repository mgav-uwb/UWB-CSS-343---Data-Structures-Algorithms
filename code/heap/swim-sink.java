// Restore heap order along ONE path. 1-based array a[1..n]; a[0] is unused.
// swim: a[k] may now exceed its parent -- lift it up. Cost Theta(log n).
static void swim(int[] a, int k) {
    while (k > 1 && a[k / 2] < a[k]) {     // parent smaller: heap order broken
        int t = a[k / 2]; a[k / 2] = a[k]; a[k] = t;   // lift the bigger key up
        k /= 2;                            // move up to the parent
    }
}
// sink: a[k] may now be smaller than a child -- push it down among a[1..n].
static void sink(int[] a, int k, int n) {
    while (2 * k <= n) {                   // while a[k] has a left child
        int j = 2 * k;                     // left child
        if (j < n && a[j] < a[j + 1]) j++; // pick the LARGER of the two children
        if (a[k] >= a[j]) break;           // already >= both children: done
        int t = a[k]; a[k] = a[j]; a[j] = t;           // demote under larger child
        k = j;                             // move down
    }
}
