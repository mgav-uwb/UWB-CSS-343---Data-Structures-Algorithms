# Rod cutting, tabulated: best[len] = max over first cuts i of
# price[i] + best[len-i], recording the winning i in cut[len] for the
# traceback. n subproblems x O(n) choices each = Theta(n^2) time, Theta(n) space.
def rod_cut(price, n):                    # price[1..n]; price[0] unused
    best = [0] * (n + 1)                  # base case: best[0] = 0 (empty rod)
    cut = [0] * (n + 1)
    for length in range(1, n + 1):
        m = -1
        for i in range(1, length + 1):    # try every first cut
            if price[i] + best[length - i] > m:
                m = price[i] + best[length - i]
                cut[length] = i           # remember the choice that won
        best[length] = m                  # reuses smaller best[] -- the overlap
    return best[n], cut

# Traceback: repeatedly take the recorded first cut until nothing is left.
def pieces(cut, n):
    out = []
    while n > 0:
        out.append(cut[n])                # the winning first cut at length n
        n -= cut[n]                       # cut it off, continue on the rest
    return out                            # prices 1,5,8,9 at n=4: [2, 2]
