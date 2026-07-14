# Quickselect: the k-th smallest element (0-indexed). Partition, then recurse
# into ONLY the side that contains rank k. Average Theta(n). Reuses partition().
def quickselect(a, lo, hi, k):
    if lo == hi:                          # one element left
        return a[lo]
    p = partition(a, lo, hi)              # pivot lands at rank p
    if k == p:
        return a[p]                       # found it
    elif k < p:
        return quickselect(a, lo, p - 1, k)    # recurse into the left side only
    else:
        return quickselect(a, p + 1, hi, k)    # recurse into the right side only
