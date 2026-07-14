# Brute-force 3-SUM: count unordered triples i<j<k with a[i]+a[j]+a[k]==0.
# The inner-loop body runs C(n,3) ~ n^3/6 times -> Theta(n^3).
def count3(a):
    n = len(a)
    cnt = ops = 0
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                ops += 1                   # one tick per triple tested
                if a[i] + a[j] + a[k] == 0:
                    cnt += 1
    return cnt                             # ops ends at n(n-1)(n-2)/6
