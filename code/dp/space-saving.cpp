// 0/1 knapsack value in Theta(W) space: ONE row, updated RIGHT-TO-LEFT so that
// K[w - weight[i]] still holds the previous row's value (item i not yet used).
// Iterating forward instead would let item i be taken again -- that variant is
// exactly the UNBOUNDED knapsack. No table survives, so no traceback.
int knapsackValue(int n, int W, const vector<int>& value,
                  const vector<int>& weight) {
    vector<int> K(W + 1, 0);                          // row 0: no items
    for (int i = 1; i <= n; i++)
        for (int w = W; w >= weight[i]; w--)          // BACKWARD: 0/1
            K[w] = max(K[w], value[i] + K[w - weight[i]]);
    return K[W];
}

// Edit-distance value in Theta(n) space: keep TWO rows, the previous and the
// current, swapping after each row. Same fill, same answer -- no traceback.
int editDistanceValue(const string& a, const string& b) {
    int m = a.size(), n = b.size();
    vector<int> prev(n + 1), cur(n + 1);
    for (int j = 0; j <= n; j++) prev[j] = j;         // row 0: insert all of b
    for (int i = 1; i <= m; i++) {
        cur[0] = i;                                   // column 0: delete all
        for (int j = 1; j <= n; j++)
            cur[j] = (a[i-1] == b[j-1])
                       ? prev[j-1]                    // match: free diagonal
                       : 1 + min({prev[j],            // delete
                                  cur[j-1],           // insert
                                  prev[j-1]});        // replace
        swap(prev, cur);                              // this row becomes "previous"
    }
    return prev[n];                                   // the last computed row
}
