// Tabulated 0/1 knapsack. value[i], weight[i] describe item i (1-based arrays
// with a dummy slot 0). K[i][w] = best value using items 1..i within
// capacity w. Theta(nW) time and space.
static int knapsack(int n, int W, int[] value, int[] weight, int[][] K) {
    for (int w = 0; w <= W; w++) K[0][w] = 0;     // row 0: no items -> 0
    for (int i = 1; i <= n; i++)
        for (int w = 0; w <= W; w++) {
            K[i][w] = K[i-1][w];                  // skip item i
            if (weight[i] <= w)                   // does it fit?
                K[i][w] = Math.max(K[i][w],
                    value[i] + K[i-1][w - weight[i]]);   // take it
        }
    return K[n][W];                               // the optimal value
}

// Traceback: recover WHICH items achieve K[n][W]. If a cell differs from
// the cell directly above, item i was taken; drop its weight. O(n).
static List<Integer> knapsackItems(int n, int W, int[] weight, int[][] K) {
    List<Integer> taken = new ArrayList<>();
    int w = W;
    for (int i = n; i >= 1; i--)
        if (K[i][w] != K[i-1][w]) {               // value changed: taken
            taken.add(i);
            w -= weight[i];
        }
    Collections.reverse(taken);                   // forward order
    return taken;
}
