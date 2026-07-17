# Failure function: fail[j] = length of the longest proper prefix of the
# pattern's first j+1 characters that is also a suffix of them. Built by
# matching the pattern against ITSELF — k falls back through the very table
# under construction. Theta(m).
def failure_fn(p):
    m = len(p)
    fail = [0] * m
    k = 0                                  # length of the current prefix-suffix
    for j in range(1, m):
        while k > 0 and p[j] != p[k]:      # shrink until it extends
            k = fail[k - 1]
        if p[j] == p[k]:                   # extend the prefix-suffix
            k += 1
        fail[j] = k
    return fail

# KMP search: the text pointer i NEVER decreases — on a mismatch only the
# pattern pointer j falls back, via the table. Theta(n) scan after the
# Theta(m) build: Theta(n + m) total, guaranteed.
def kmp_search(t, p):
    fail = failure_fn(p)
    j = 0                                  # characters matched so far
    for i in range(len(t)):
        while j > 0 and t[i] != p[j]:      # fall back in the pattern
            j = fail[j - 1]
        if t[i] == p[j]:                   # extend the partial match
            j += 1
        if j == len(p):                    # full match: report start index
            return i - j + 1
    return -1                              # no occurrence
