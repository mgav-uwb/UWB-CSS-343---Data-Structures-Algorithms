# Edit (Levenshtein) distance. D[i][j] = fewest edits turning the first i
# characters of a into the first j characters of b. Theta(mn) time and space.
def edit_distance(a, b):
    m, n = len(a), len(b)
    D = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): D[i][0] = i            # base: delete all of a
    for j in range(n + 1): D[0][j] = j            # base: insert all of b
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                D[i][j] = D[i - 1][j - 1]         # match: free diagonal
            else:
                D[i][j] = 1 + min(D[i - 1][j],    # delete a[i-1]
                                  D[i][j - 1],    # insert b[j-1]
                                  D[i - 1][j - 1])  # replace a[i-1]->b[j-1]
    return D                                      # D[m][n] is the distance

# Traceback: read the edit script off the table, bottom-right to origin. Each
# step asks which neighbor produced this cell's value. O(m + n).
def edit_script(a, b, D):
    ops, i, j = [], len(a), len(b)
    while i > 0 or j > 0:
        if i > 0 and j > 0 and a[i-1] == b[j-1] and D[i][j] == D[i-1][j-1]:
            ops.append("match " + a[i - 1])       # free
            i, j = i - 1, j - 1
        elif i > 0 and j > 0 and D[i][j] == D[i-1][j-1] + 1:
            ops.append("replace " + a[i - 1] + "->" + b[j - 1])
            i, j = i - 1, j - 1
        elif i > 0 and D[i][j] == D[i-1][j] + 1:
            ops.append("delete " + a[i - 1])
            i -= 1
        else:
            ops.append("insert " + b[j - 1])
            j -= 1
    return ops[::-1]                              # forward order
