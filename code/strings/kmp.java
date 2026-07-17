// Failure function: fail[j] = length of the longest proper prefix of the
// pattern's first j+1 characters that is also a suffix of them. Built by
// matching the pattern against ITSELF — k falls back through the very table
// under construction. Theta(m).
static int[] failureFn(String p) {
    int m = p.length();
    int[] fail = new int[m];
    int k = 0;                             // length of the current prefix-suffix
    for (int j = 1; j < m; j++) {
        while (k > 0 && p.charAt(j) != p.charAt(k)) k = fail[k - 1];
        if (p.charAt(j) == p.charAt(k)) k++;   // extend the prefix-suffix
        fail[j] = k;
    }
    return fail;
}

// KMP search: the text pointer i NEVER decreases — on a mismatch only the
// pattern pointer j falls back, via the table. Theta(n) scan after the
// Theta(m) build: Theta(n + m) total, guaranteed.
static int kmpSearch(String t, String p) {
    int[] fail = failureFn(p);
    int j = 0;                             // characters matched so far
    for (int i = 0; i < t.length(); i++) {
        while (j > 0 && t.charAt(i) != p.charAt(j)) j = fail[j - 1];
        if (t.charAt(i) == p.charAt(j)) j++;   // extend the partial match
        if (j == p.length()) return i - j + 1; // full match: report start
    }
    return -1;                             // no occurrence
}
