# Merge two adjacent sorted runs of a[lo..hi] (split at mid) using aux as
# scratch. Every element is copied once: Theta(n).
def merge(a, lo, mid, hi, aux):
    aux[lo:hi + 1] = a[lo:hi + 1]         # copy into scratch
    i, j = lo, mid + 1
    for k in range(lo, hi + 1):
        if i > mid:                       # left run exhausted
            a[k] = aux[j]
            j += 1
        elif j > hi:                      # right run exhausted
            a[k] = aux[i]
            i += 1
        elif aux[j] < aux[i]:             # take the smaller front (ties: left)
            a[k] = aux[j]
            j += 1
        else:                             # ties take left: STABLE
            a[k] = aux[i]
            i += 1

# Top-down mergesort. T(n) = 2T(n/2) + Theta(n).
def mergesort(a, lo, hi, aux):
    if hi <= lo:                          # base case: 0 or 1 element
        return
    mid = (lo + hi) // 2
    mergesort(a, lo, mid, aux)            # sort the left half
    mergesort(a, mid + 1, hi, aux)        # sort the right half
    merge(a, lo, mid, hi, aux)            # combine
