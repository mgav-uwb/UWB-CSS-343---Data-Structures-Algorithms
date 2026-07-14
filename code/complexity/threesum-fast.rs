// Fast 3-SUM: sort (n log n), then for each i sweep two pointers over the
// tail. Every step retires an index, so each sweep is <= n -> Theta(n^2).
fn count3fast(mut a: Vec<i64>) -> i64 {
    a.sort();                              // n log n preprocessing
    let n = a.len();
    let mut cnt = 0i64;
    for i in 0..n {                        // fix a[i] ...
        let (mut lo, mut hi) = (i + 1, n - 1);
        while lo < hi {
            let s = a[i] + a[lo] + a[hi];
            if      s < 0 { lo += 1; }     // too small: advance lo
            else if s > 0 { hi -= 1; }     // too big:   retreat hi
            else { cnt += 1; lo += 1; hi -= 1; }  // hit 0
        }
    }
    cnt
}
