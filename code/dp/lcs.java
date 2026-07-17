// LCS table: L[i][j] = LCS length of A's first i chars and B's first j.
// Fill row by row -- up, left, and diagonal are ready when a cell needs them.
// Theta(mn) time and space.
static int lcsLength(String A, String B, int[][] L) {
    int m = A.length(), n = B.length();     // L is (m+1) x (n+1), zero-filled:
    for (int i = 1; i <= m; i++)            //   row 0 / col 0 = empty prefix
        for (int j = 1; j <= n; j++)
            if (A.charAt(i - 1) == B.charAt(j - 1))
                L[i][j] = L[i - 1][j - 1] + 1;             // match: diagonal + 1
            else
                L[i][j] = Math.max(L[i - 1][j], L[i][j - 1]); // drop one
    return L[m][n];                         // bottom-right = the answer
}

// Traceback: walk from L[m][n] toward L[0][0]. The matched characters,
// reversed, spell one LCS. O(m + n) steps -- needs the whole table.
static String lcsString(String A, String B, int[][] L) {
    StringBuilder out = new StringBuilder();
    int i = A.length(), j = B.length();
    while (i > 0 && j > 0) {
        if (A.charAt(i - 1) == B.charAt(j - 1)) {   // match: it's in the LCS
            out.append(A.charAt(i - 1)); i--; j--;  // step diagonally
        }
        else if (L[i - 1][j] >= L[i][j - 1]) i--;   // follow the larger
        else j--;                                   //   of up / left
    }
    return out.reverse().toString();        // AGCAT / GAC -> "AC"
}
