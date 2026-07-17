# LCS table: L[i][j] = LCS length of A's first i chars and B's first j.
# Fill row by row -- up, left, and diagonal are ready when a cell needs them.
# Theta(mn) time and space.
def lcs_length(A, B):
    m, n = len(A), len(B)
    L = [[0] * (n + 1) for _ in range(m + 1)]  # row 0 / col 0 = empty prefix
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if A[i - 1] == B[j - 1]:
                L[i][j] = L[i - 1][j - 1] + 1            # match: diagonal + 1
            else:
                L[i][j] = max(L[i - 1][j], L[i][j - 1])  # drop one: up / left
    return L                                # L[m][n] = the answer

# Traceback: walk from L[m][n] toward L[0][0]. The matched characters,
# reversed, spell one LCS. O(m + n) steps -- needs the whole table.
def lcs_string(A, B, L):
    out = []
    i, j = len(A), len(B)
    while i > 0 and j > 0:
        if A[i - 1] == B[j - 1]:            # match: it's in the LCS
            out.append(A[i - 1])            # step diagonally
            i, j = i - 1, j - 1
        elif L[i - 1][j] >= L[i][j - 1]:    # follow the larger
            i -= 1                          #   of up / left
        else:
            j -= 1
    return "".join(reversed(out))           # AGCAT / GAC -> "AC"
