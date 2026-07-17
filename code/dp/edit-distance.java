// Edit (Levenshtein) distance. D[i][j] = fewest edits turning the first i
// characters of a into the first j characters of b. Theta(mn) time and space.
static int editDistance(String a, String b, int[][] D) {
    int m = a.length(), n = b.length();
    for (int i = 0; i <= m; i++) D[i][0] = i;     // base: delete all of a
    for (int j = 0; j <= n; j++) D[0][j] = j;     // base: insert all of b
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            if (a.charAt(i-1) == b.charAt(j-1))
                D[i][j] = D[i-1][j-1];            // match: free diagonal
            else
                D[i][j] = 1 + Math.min(D[i-1][j],           // delete
                              Math.min(D[i][j-1],           // insert
                                       D[i-1][j-1]));       // replace
    return D[m][n];
}

// Traceback: read the edit script off the table, bottom-right to origin.
// Each step asks which neighbor produced this cell's value. O(m + n).
static List<String> editScript(String a, String b, int[][] D) {
    List<String> ops = new ArrayList<>();
    int i = a.length(), j = b.length();
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && a.charAt(i-1) == b.charAt(j-1)
                && D[i][j] == D[i-1][j-1]) {
            ops.add("match " + a.charAt(i-1));    // free
            i--; j--;
        } else if (i > 0 && j > 0 && D[i][j] == D[i-1][j-1] + 1) {
            ops.add("replace " + a.charAt(i-1) + "->" + b.charAt(j-1));
            i--; j--;
        } else if (i > 0 && D[i][j] == D[i-1][j] + 1) {
            ops.add("delete " + a.charAt(i-1));
            i--;
        } else {
            ops.add("insert " + b.charAt(j-1));
            j--;
        }
    }
    Collections.reverse(ops);                     // forward order
    return ops;
}
