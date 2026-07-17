// R-way trie: each node has one child slot per alphabet character plus an
// is-word flag. Operations walk ONE character per step: Theta(L) for a key of
// length L, independent of how many keys are stored.
static final int R = 26;                   // alphabet: lowercase a..z

static class Node {
    Node[] next = new Node[R];             // one slot per possible character
    boolean isWord = false;
}

// search: follow next[c] for each character. Fall off -> absent; reach the
// end -> present iff the final node is word-marked (a path is NOT a key).
static boolean search(Node t, String key) {
    for (char ch : key.toCharArray()) {
        int c = ch - 'a';
        if (t.next[c] == null) return false;   // fell off: no such path
        t = t.next[c];
    }
    return t.isWord;                       // path exists — is it a word?
}

// insert: the same walk, creating only the MISSING nodes; mark the last one.
static void insert(Node t, String key) {
    for (char ch : key.toCharArray()) {
        int c = ch - 'a';
        if (t.next[c] == null) t.next[c] = new Node();  // create missing suffix
        t = t.next[c];
    }
    t.isWord = true;                       // mark: a key ends here
}

// collect: emit every key stored in the subtree under t (DFS, in order).
static void collect(Node t, StringBuilder path, List<String> out) {
    if (t.isWord) out.add(path.toString());    // a stored key ends here
    for (int c = 0; c < R; c++)
        if (t.next[c] != null) {
            path.append((char) ('a' + c)); // extend the path by this character
            collect(t.next[c], path, out);
            path.deleteCharAt(path.length() - 1);
        }
}

// keysWithPrefix (autocomplete): walk down the prefix, then collect the
// subtree below it. Theta(prefix length + output size).
static List<String> keysWithPrefix(Node t, String prefix) {
    for (char ch : prefix.toCharArray()) { // 1. walk down the prefix path
        if (t.next[ch - 'a'] == null) return List.of();  // no key has it
        t = t.next[ch - 'a'];
    }
    List<String> out = new ArrayList<>();
    collect(t, new StringBuilder(prefix), out);  // 2. gather the subtree below
    return out;
}
