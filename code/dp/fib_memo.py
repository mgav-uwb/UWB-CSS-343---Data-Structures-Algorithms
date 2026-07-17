# Memoized Fibonacci: the natural recursion plus a cache. Each fib(k) is
# computed once; every later request is an O(1) hit. Theta(n) time and space.
def fib_memo(n, memo):
    if n < 2:                             # base cases: fib(0)=0, fib(1)=1
        return n
    if n in memo:                         # remember: cache hit, subtree skipped
        return memo[n]
    memo[n] = fib_memo(n - 1, memo) \
            + fib_memo(n - 2, memo)       # computed at most once per n ...
    return memo[n]                        # ... then stored for every caller

def fib(n):
    return fib_memo(n, {})                # dict cache: absent = not yet computed
