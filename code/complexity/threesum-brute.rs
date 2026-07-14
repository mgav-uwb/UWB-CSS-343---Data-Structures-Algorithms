// Brute-force 3-SUM: count unordered triples i<j<k with a[i]+a[j]+a[k]==0.
// The inner-loop body runs C(n,3) ~ n^3/6 times -> Theta(n^3).
fn count3(a: &[i64]) -> i64 {
    let n = a.len();
    let mut cnt = 0i64;
    for i in 0..n {
        for j in (i + 1)..n {
            for k in (j + 1)..n {          // one tick per triple tested
                if a[i] + a[j] + a[k] == 0 {
                    cnt += 1;
                }
            }
        }
    }
    cnt                                    // body runs n(n-1)(n-2)/6 times
}
