// Failure function: fail[j] = length of the longest proper prefix of the
// pattern's first j+1 characters that is also a suffix of them. Built by
// matching the pattern against ITSELF — k falls back through the very table
// under construction. O(m).
fn failure_fn(p: &str) -> Vec<usize> {
    let p = p.as_bytes();
    let mut fail = vec![0usize; p.len()];
    let mut k = 0;                         // length of the current prefix-suffix
    for j in 1..p.len() {
        while k > 0 && p[j] != p[k] { k = fail[k - 1]; }  // shrink until extends
        if p[j] == p[k] { k += 1; }        // extend the prefix-suffix
        fail[j] = k;
    }
    fail
}

// KMP search: the text pointer i NEVER decreases — on a mismatch only the
// pattern pointer j falls back, via the table. O(n) scan after the O(m)
// build: O(n + m) total, guaranteed.
fn kmp_search(t: &str, p: &str) -> i32 {
    let fail = failure_fn(p);
    let (t, p) = (t.as_bytes(), p.as_bytes());
    let mut j = 0;                         // characters matched so far
    for i in 0..t.len() {
        while j > 0 && t[i] != p[j] { j = fail[j - 1]; }  // fall back in pattern
        if t[i] == p[j] { j += 1; }        // extend the partial match
        if j == p.len() { return (i + 1 - j) as i32; }    // full match: start
    }
    -1                                     // no occurrence
}
