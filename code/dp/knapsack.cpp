// Tabulated 0/1 knapsack. value[i], weight[i] describe item i (1-based, with a
// dummy slot 0). K[i][w] = best value using items 1..i within capacity w.
// Theta(nW) time and space.
int knapsack(int n, int W, const vector<int>& value, const vector<int>& weight,
             vector<vector<int>>& K) {
    K.assign(n + 1, vector<int>(W + 1, 0));           // row 0: no items -> 0
    for (int i = 1; i <= n; i++)
        for (int w = 0; w <= W; w++) {
            K[i][w] = K[i-1][w];                      // skip item i
            if (weight[i] <= w)                       // does it fit?
                K[i][w] = max(K[i][w],
                              value[i] + K[i-1][w - weight[i]]);   // take it
        }
    return K[n][W];                                   // the optimal value
}

// Traceback: recover WHICH items achieve K[n][W]. If a cell differs from the
// cell directly above, item i was taken; drop its weight and continue. O(n).
vector<int> knapsackItems(int n, int W, const vector<int>& weight,
                          const vector<vector<int>>& K) {
    vector<int> taken;
    int w = W;
    for (int i = n; i >= 1; i--)
        if (K[i][w] != K[i-1][w]) {                   // value changed: taken
            taken.push_back(i);
            w -= weight[i];
        }
    reverse(taken.begin(), taken.end());              // forward order
    return taken;
}
