# Lomuto partition around the last element as pivot. Elements < pivot are moved
# to the front; the pivot ends in its final sorted slot, whose index is returned.
def partition(a, lo, hi):
    pivot = a[hi]
    i = lo - 1                            # boundary of the "< pivot" region
    for j in range(lo, hi):
        if a[j] < pivot:
            i += 1
            a[i], a[j] = a[j], a[i]       # swap the element into the region
    a[i + 1], a[hi] = a[hi], a[i + 1]     # drop the pivot into its final slot
    return i + 1                          # the pivot's final index

# Quicksort: partition, then recurse on each side. No combine step.
def quicksort(a, lo, hi):
    if hi <= lo:                          # base case: 0 or 1 element
        return
    p = partition(a, lo, hi)              # pivot lands at its final index p
    quicksort(a, lo, p - 1)               # sort the smaller side
    quicksort(a, p + 1, hi)               # sort the larger side
