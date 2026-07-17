// Rod cutting, tabulated: best[len] = max over first cuts i of
// price[i] + best[len-i], recording the winning i in cut[len] for the
// traceback. n subproblems x O(n) choices each = Theta(n^2) time, Theta(n) space.
int rodCut(const vector<int>& price, int n, vector<int>& cut) {
    vector<int> best(n + 1, 0);           // base case: best[0] = 0 (empty rod)
    cut.assign(n + 1, 0);
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
vector<int> pieces(const vector<int>& cut, int n) {
    vector<int> out;
    while (n > 0) {
        out.push_back(cut[n]);            // the winning first cut at length n
        n -= cut[n];                      // cut it off, continue on the rest
    }
    return out;                           // prices 1,5,8,9 at n=4: {2, 2}
}
