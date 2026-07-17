// 0/1 knapsack value in Theta(W) space: ONE row, updated RIGHT-TO-LEFT so
// K[w - weight[i]] still holds the previous row's value (item i not yet
// used). Iterating forward would let item i be taken again -- that variant
// is exactly the UNBOUNDED knapsack. No table survives, so no traceback.
static int knapsackValue(int n, int W, int[] value, int[] weight) {
    int[] K = new int[W + 1];                     // row 0: no items
    for (int i = 1; i <= n; i++)
        for (int w = W; w >= weight[i]; w--)      // BACKWARD: 0/1
            K[w] = Math.max(K[w], value[i] + K[w - weight[i]]);
    return K[W];
}

// Edit-distance value in Theta(n) space: keep TWO rows, previous and
// current, swapping after each row. Same fill, same answer -- no traceback.
static int editDistanceValue(String a, String b) {
    int m = a.length(), n = b.length();
    int[] prev = new int[n + 1], cur = new int[n + 1];
    for (int j = 0; j <= n; j++) prev[j] = j;     // row 0: insert all of b
    for (int i = 1; i <= m; i++) {
        cur[0] = i;                               // column 0: delete all
        for (int j = 1; j <= n; j++)
            cur[j] = (a.charAt(i-1) == b.charAt(j-1))
                       ? prev[j-1]                          // match
                       : 1 + Math.min(prev[j],              // delete
                             Math.min(cur[j-1],             // insert
                                      prev[j-1]));          // replace
        int[] t = prev; prev = cur; cur = t;      // rows swap roles
    }
    return prev[n];                               // the last computed row
}
