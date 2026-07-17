// Brute-force substring search: try the pattern at EVERY start position; on a
// mismatch, slide by ONE and restart the comparison. Worst case O(nm) —
// text characters get re-examined after a partial match.
fn brute_search(t: &str, p: &str) -> i32 {
    let (t, p) = (t.as_bytes(), p.as_bytes());
    let (n, m) = (t.len(), p.len());
    if m > n { return -1; }
    for i in 0..=(n - m) {                 // each start position
        let mut j = 0;
        while j < m && t[i + j] == p[j] { j += 1; }   // compare left to right
        if j == m { return i as i32; }     // all m matched: found at i
    }
    -1                                     // no occurrence
}
