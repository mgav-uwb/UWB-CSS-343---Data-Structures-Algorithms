# 0/1 knapsack value in Theta(W) space: ONE row, updated RIGHT-TO-LEFT so
# K[w - weight[i]] still holds the previous row's value (item i not yet
# used). Iterating forward instead would let item i be taken again -- that
# variant is exactly the UNBOUNDED knapsack. No table, so no traceback.
def knapsack_value(n, W, value, weight):
    K = [0] * (W + 1)                             # row 0: no items
    for i in range(1, n + 1):
        for w in range(W, weight[i] - 1, -1):     # BACKWARD: 0/1
            K[w] = max(K[w], value[i] + K[w - weight[i]])
    return K[W]

# Edit-distance value in Theta(n) space: keep TWO rows, previous and current,
# swapping after each row. Same fill, same answer -- no traceback.
def edit_distance_value(a, b):
    m, n = len(a), len(b)
    prev = list(range(n + 1))                     # row 0: insert all of b
    for i in range(1, m + 1):
        cur = [i] + [0] * n                       # column 0: delete all
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]              # match: free diagonal
            else:
                cur[j] = 1 + min(prev[j],         # delete
                                 cur[j - 1],      # insert
                                 prev[j - 1])     # replace
        prev = cur                                # this row becomes "previous"
    return prev[n]                                # the last computed row
