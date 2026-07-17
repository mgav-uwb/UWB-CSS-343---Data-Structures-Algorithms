# Brute-force substring search: try the pattern at EVERY start position; on a
# mismatch, slide by ONE and restart the comparison. Worst case Theta(nm) —
# text characters get re-examined after a partial match.
def brute_search(t, p):
    n, m = len(t), len(p)
    for i in range(n - m + 1):             # each start position
        j = 0
        while j < m and t[i + j] == p[j]:  # compare left to right
            j += 1
        if j == m:                         # all m matched: found at i
            return i
    return -1                              # no occurrence
