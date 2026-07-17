// Failure function: fail[j] = length of the longest proper prefix of the
// pattern's first j+1 characters that is also a suffix of them. Built by
// matching the pattern against ITSELF — k falls back through the very table
// under construction. Theta(m).
vector<int> failureFn(const string& p) {
    int m = p.size();
    vector<int> fail(m, 0);
    int k = 0;                             // length of the current prefix-suffix
    for (int j = 1; j < m; j++) {
        while (k > 0 && p[j] != p[k]) k = fail[k - 1];  // shrink until it extends
        if (p[j] == p[k]) k++;             // extend the prefix-suffix
        fail[j] = k;
    }
    return fail;
}

// KMP search: the text pointer i NEVER decreases — on a mismatch only the
// pattern pointer j falls back, via the table. Theta(n) scan after the
// Theta(m) build: Theta(n + m) total, guaranteed.
int kmpSearch(const string& t, const string& p) {
    vector<int> fail = failureFn(p);
    int j = 0;                             // characters matched so far
    for (int i = 0; i < (int)t.size(); i++) {
        while (j > 0 && t[i] != p[j]) j = fail[j - 1];  // fall back in the pattern
        if (t[i] == p[j]) j++;             // extend the partial match
        if (j == (int)p.size()) return i - j + 1;       // full match: report start
    }
    return -1;                             // no occurrence
}
