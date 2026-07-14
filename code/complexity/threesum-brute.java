// Brute-force 3-SUM: count unordered triples i<j<k with a[i]+a[j]+a[k]==0.
// The inner-loop body runs C(n,3) ~ n^3/6 times -> Theta(n^3).
static long count3(int[] a) {
    int n = a.length;
    long cnt = 0, ops = 0;
    for (int i = 0;   i < n; i++)
      for (int j = i+1; j < n; j++)
        for (int k = j+1; k < n; k++) {
            ops++;                         // one tick per triple tested
            if (a[i] + a[j] + a[k] == 0)
                cnt++;
        }
    return cnt;                            // ops ends at n(n-1)(n-2)/6
}
