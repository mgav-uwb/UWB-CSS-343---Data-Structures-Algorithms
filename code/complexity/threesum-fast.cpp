// Fast 3-SUM: sort (n log n), then for each i sweep two pointers over the
// tail. Every step retires an index, so each sweep is <= n -> Theta(n^2).
long count3fast(vector<int> a) {
    sort(a.begin(), a.end());              // n log n preprocessing
    int n = a.size();
    long cnt = 0;
    for (int i = 0; i < n; i++) {          // fix a[i] ...
        int lo = i + 1, hi = n - 1;        // ... two pointers on the tail
        while (lo < hi) {
            int s = a[i] + a[lo] + a[hi];
            if      (s < 0) lo++;          // too small: advance lo
            else if (s > 0) hi--;          // too big:   retreat hi
            else { cnt++; lo++; hi--; }    // hit 0 (distinct values)
        }
    }
    return cnt;
}
