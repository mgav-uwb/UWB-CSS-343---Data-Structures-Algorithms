// LCS table: L[i][j] = LCS length of A's first i chars and B's first j.
// Fill row by row -- up, left, and diagonal are ready when a cell needs them.
// Theta(mn) time and space.
int lcsLength(const string& A, const string& B, vector<vector<int>>& L) {
    int m = A.size(), n = B.size();
    L.assign(m + 1, vector<int>(n + 1, 0)); // row 0 / col 0 = 0: empty prefix
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            if (A[i - 1] == B[j - 1])
                L[i][j] = L[i - 1][j - 1] + 1;             // match: diagonal + 1
            else
                L[i][j] = max(L[i - 1][j], L[i][j - 1]);   // drop one: up / left
    return L[m][n];                         // bottom-right = the answer
}

// Traceback: walk from L[m][n] toward L[0][0]. The matched characters,
// reversed, spell one LCS. O(m + n) steps -- needs the whole table.
string lcsString(const string& A, const string& B,
                 const vector<vector<int>>& L) {
    string out;
    int i = A.size(), j = B.size();
    while (i > 0 && j > 0) {
        if (A[i - 1] == B[j - 1]) {         // match: it's in the LCS
            out += A[i - 1]; i--; j--;      // step diagonally
        }
        else if (L[i - 1][j] >= L[i][j - 1]) i--;   // follow the larger
        else j--;                                   //   of up / left
    }
    reverse(out.begin(), out.end());
    return out;                             // AGCAT / GAC -> "AC"
}
