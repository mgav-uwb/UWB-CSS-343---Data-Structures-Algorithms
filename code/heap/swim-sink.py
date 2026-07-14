# Restore heap order along ONE path. 1-based list a[1..n]; a[0] is unused.
# swim: a[k] may now exceed its parent -- lift it up. Cost Theta(log n).
def swim(a, k):
    while k > 1 and a[k // 2] < a[k]:      # parent smaller: heap order broken
        a[k // 2], a[k] = a[k], a[k // 2]  # lift the bigger key up
        k //= 2                            # move up to the parent

# sink: a[k] may now be smaller than a child -- push it down among a[1..n].
def sink(a, k, n):
    while 2 * k <= n:                      # while a[k] has a left child
        j = 2 * k                          # left child
        if j < n and a[j] < a[j + 1]:
            j += 1                         # pick the LARGER of the two children
        if a[k] >= a[j]:
            break                          # already >= both children: done
        a[k], a[j] = a[j], a[k]            # demote a[k] under the larger child
        k = j                              # move down
