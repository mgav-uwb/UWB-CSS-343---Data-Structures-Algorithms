// Brute-force substring search: try the pattern at EVERY start position; on a
// mismatch, slide by ONE and restart the comparison. Worst case Theta(nm) —
// text characters get re-examined after a partial match.
static int bruteSearch(String t, String p) {
    int n = t.length(), m = p.length();
    for (int i = 0; i <= n - m; i++) {     // each start position
        int j = 0;
        while (j < m && t.charAt(i + j) == p.charAt(j)) j++;  // left to right
        if (j == m) return i;              // all m matched: found at i
    }
    return -1;                             // no occurrence
}
