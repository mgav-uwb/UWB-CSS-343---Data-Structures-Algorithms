# Tabulated Fibonacci: fill fib(0..n) smallest-first -- every dependency is
# already in the table when a cell needs it. Theta(n) time, Theta(n) space.
def fib_tab(n):
    t = [0] * (n + 2)
    t[0], t[1] = 0, 1                     # base cases seed the table
    for i in range(2, n + 1):
        t[i] = t[i - 1] + t[i - 2]        # dependencies already filled
    return t[n]

# Two variables: each value needs only the previous TWO, so keep just those.
# Theta(n) time, Theta(1) space -- the optimization tabulation makes natural.
def fib_two_var(n):
    a, b = 0, 1                           # invariant: a = fib(i), b = fib(i+1)
    for _ in range(n):
        a, b = b, a + b                   # one addition; slide the window right
    return a                              # after n steps, a = fib(n)
