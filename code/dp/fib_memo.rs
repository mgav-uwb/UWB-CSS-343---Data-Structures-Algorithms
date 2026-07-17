// Memoized Fibonacci: the natural recursion plus a cache. Each fib(k) is
// computed once; every later request is an O(1) hit. Theta(n) time and space.
fn fib_memo(n: usize, memo: &mut Vec<u64>) -> u64 {
    if n < 2 { return n as u64; }         // base cases: fib(0)=0, fib(1)=1
    if memo[n] != 0 { return memo[n]; }   // remember: cache hit, subtree skipped
    memo[n] = fib_memo(n - 1, memo)       // computed at most once per n ...
            + fib_memo(n - 2, memo);
    memo[n]                               // ... then stored for every caller
}

fn fib(n: usize) -> u64 {
    let mut memo = vec![0u64; n + 1];     // 0 = "not yet computed"
    fib_memo(n, &mut memo)
}
