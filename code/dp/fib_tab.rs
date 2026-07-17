// Tabulated Fibonacci: fill fib(0..n) smallest-first -- every dependency is
// already in the table when a cell needs it. Theta(n) time, Theta(n) space.
fn fib_tab(n: usize) -> u64 {
    let mut t = vec![0u64; n + 2];
    t[1] = 1;                             // base cases seed the table
    for i in 2..=n {
        t[i] = t[i - 1] + t[i - 2];       // dependencies already filled
    }
    t[n]
}

// Two variables: each value needs only the previous TWO, so keep just those.
// Theta(n) time, Theta(1) space -- the optimization tabulation makes natural.
fn fib_two_var(n: usize) -> u64 {
    let (mut a, mut b) = (0u64, 1u64);    // invariant: a = fib(i), b = fib(i+1)
    for _ in 0..n {
        let c = a + b;                    // one addition per step
        a = b; b = c;                     // slide the two-cell window right
    }
    a                                     // after n steps, a = fib(n)
}
