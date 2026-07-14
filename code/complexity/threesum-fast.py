# Fast 3-SUM: sort (n log n), then for each i sweep two pointers over the
# tail. Every step retires an index, so each sweep is <= n -> Theta(n^2).
def count3fast(a):
    a = sorted(a)                          # n log n preprocessing
    n = len(a)
    cnt = 0
    for i in range(n):                     # fix a[i] ...
        lo, hi = i + 1, n - 1              # ... two pointers on the tail
        while lo < hi:
            s = a[i] + a[lo] + a[hi]
            if   s < 0: lo += 1            # too small: advance lo
            elif s > 0: hi -= 1            # too big:   retreat hi
            else:                          # hit 0 (distinct values)
                cnt += 1; lo += 1; hi -= 1
    return cnt
