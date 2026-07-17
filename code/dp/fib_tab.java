// Tabulated Fibonacci: fill fib(0..n) smallest-first -- every dependency is
// already in the table when a cell needs it. Theta(n) time, Theta(n) space.
static long fibTab(int n) {
    long[] t = new long[n + 2];
    t[0] = 0; t[1] = 1;                   // base cases seed the table
    for (int i = 2; i <= n; i++)
        t[i] = t[i - 1] + t[i - 2];       // dependencies already filled
    return t[n];
}

// Two variables: each value needs only the previous TWO, so keep just those.
// Theta(n) time, Theta(1) space -- the optimization tabulation makes natural.
static long fibTwoVar(int n) {
    long a = 0, b = 1;                    // invariant: a = fib(i), b = fib(i+1)
    for (int i = 0; i < n; i++) {
        long c = a + b;                   // one addition per step
        a = b; b = c;                     // slide the two-cell window right
    }
    return a;                             // after n steps, a = fib(n)
}
