// Edit (Levenshtein) distance. D[i][j] = fewest edits turning the first i
// characters of a into the first j characters of b. Theta(mn) time and space.
int editDistance(const string& a, const string& b, vector<vector<int>>& D) {
    int m = a.size(), n = b.size();
    D.assign(m + 1, vector<int>(n + 1, 0));
    for (int i = 0; i <= m; i++) D[i][0] = i;         // base: delete all of a
    for (int j = 0; j <= n; j++) D[0][j] = j;         // base: insert all of b
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            if (a[i-1] == b[j-1])
                D[i][j] = D[i-1][j-1];                // match: free diagonal
            else
                D[i][j] = 1 + min({D[i-1][j],         // delete a[i-1]
                                   D[i][j-1],         // insert b[j-1]
                                   D[i-1][j-1]});     // replace a[i-1]->b[j-1]
    return D[m][n];
}

// Traceback: read the edit script off the table, bottom-right to origin. Each
// step asks which neighbor produced this cell's value. O(m + n).
vector<string> editScript(const string& a, const string& b,
                          const vector<vector<int>>& D) {
    vector<string> ops;
    int i = a.size(), j = b.size();
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && a[i-1] == b[j-1] && D[i][j] == D[i-1][j-1]) {
            ops.push_back(string("match ") + a[i-1]);            // free
            i--; j--;
        } else if (i > 0 && j > 0 && D[i][j] == D[i-1][j-1] + 1) {
            ops.push_back(string("replace ") + a[i-1] + "->" + b[j-1]);
            i--; j--;
        } else if (i > 0 && D[i][j] == D[i-1][j] + 1) {
            ops.push_back(string("delete ") + a[i-1]);
            i--;
        } else {
            ops.push_back(string("insert ") + b[j-1]);
            j--;
        }
    }
    reverse(ops.begin(), ops.end());                  // forward order
    return ops;
}
