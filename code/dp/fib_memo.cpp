// Memoized Fibonacci: the natural recursion plus a cache. Each fib(k) is
// computed once; every later request is an O(1) hit. Theta(n) time and space.
long fibMemo(int n, vector<long>& memo) {
    if (n < 2) return n;                  // base cases: fib(0)=0, fib(1)=1
    if (memo[n] != 0) return memo[n];     // remember: cache hit, subtree skipped
    memo[n] = fibMemo(n - 1, memo)        // computed at most once per n ...
            + fibMemo(n - 2, memo);
    return memo[n];                       // ... then stored for every caller
}

long fib(int n) {
    vector<long> memo(n + 1, 0);          // 0 = "not yet computed"
    return fibMemo(n, memo);
}
