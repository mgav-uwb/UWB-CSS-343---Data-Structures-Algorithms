# Tabulated 0/1 knapsack. value[i], weight[i] describe item i (1-based lists
# with a dummy slot 0). K[i][w] = best value using items 1..i within
# capacity w. Theta(nW) time and space. Returns the full table.
def knapsack(n, W, value, weight):
    K = [[0] * (W + 1) for _ in range(n + 1)]     # row 0: no items -> 0
    for i in range(1, n + 1):
        for w in range(W + 1):
            K[i][w] = K[i - 1][w]                 # skip item i
            if weight[i] <= w:                    # does it fit?
                K[i][w] = max(K[i][w],
                              value[i] + K[i - 1][w - weight[i]])   # take it
    return K                                      # K[n][W] is the optimum

# Traceback: recover WHICH items achieve K[n][W]. If a cell differs from the
# cell directly above, item i was taken; drop its weight and continue. O(n).
def knapsack_items(n, W, weight, K):
    taken, w = [], W
    for i in range(n, 0, -1):
        if K[i][w] != K[i - 1][w]:                # value changed: taken
            taken.append(i)
            w -= weight[i]
    return taken[::-1]                            # forward order
