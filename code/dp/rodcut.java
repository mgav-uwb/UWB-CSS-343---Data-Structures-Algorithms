// Rod cutting, tabulated: best[len] = max over first cuts i of
// price[i] + best[len-i], recording the winning i in cut[len] for the
// traceback. n subproblems x O(n) choices each = Theta(n^2) time, Theta(n) space.
static int rodCut(int[] price, int n, int[] cut) {
    int[] best = new int[n + 1];          // base case: best[0] = 0 (empty rod)
    for (int len = 1; len <= n; len++) {
        int m = -1;
        for (int i = 1; i <= len; i++)    // try every first cut
            if (price[i] + best[len - i] > m) {
                m = price[i] + best[len - i];
                cut[len] = i;             // remember the choice that won
            }
        best[len] = m;                    // reuses smaller best[] -- the overlap
    }
    return best[n];
}

// Traceback: repeatedly take the recorded first cut until nothing is left.
static List<Integer> pieces(int[] cut, int n) {
    List<Integer> out = new ArrayList<>();
    while (n > 0) {
        out.add(cut[n]);                  // the winning first cut at length n
        n -= cut[n];                      // cut it off, continue on the rest
    }
    return out;                           // prices 1,5,8,9 at n=4: [2, 2]
}
