// Horner's method: fold a string into one index, base R = 31.
fn hash(s: &str, m: i64) -> i64 {
    let mut h: i64 = 0;
    for c in s.chars() {
        h = (R * h + c as i64) % m;   // reduce each step
    }
    h
}
