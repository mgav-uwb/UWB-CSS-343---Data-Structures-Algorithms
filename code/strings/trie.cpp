// R-way trie: each node has one child slot per alphabet character plus an
// is-word flag. Operations walk ONE character per step: Theta(L) for a key of
// length L, independent of how many keys are stored.
const int R = 26;                          // alphabet: lowercase a..z

struct Node {
    Node* next[R] = {};                    // one slot per possible character
    bool  isWord = false;
};

// search: follow next[c] for each character. Fall off -> absent; reach the
// end -> present iff the final node is word-marked (a path is NOT a key).
bool search(Node* t, const string& key) {
    for (char ch : key) {
        int c = ch - 'a';
        if (!t->next[c]) return false;     // fell off: no such path
        t = t->next[c];
    }
    return t->isWord;                      // path exists — is it a word?
}

// insert: the same walk, creating only the MISSING nodes; mark the last one.
void insert(Node* t, const string& key) {
    for (char ch : key) {
        int c = ch - 'a';
        if (!t->next[c]) t->next[c] = new Node();   // create the missing suffix
        t = t->next[c];
    }
    t->isWord = true;                      // mark: a key ends here
}

// collect: emit every key stored in the subtree under t (DFS, in order).
void collect(Node* t, string& path, vector<string>& out) {
    if (t->isWord) out.push_back(path);    // a stored key ends here
    for (int c = 0; c < R; c++)
        if (t->next[c]) {
            path.push_back('a' + c);       // extend the path by this character
            collect(t->next[c], path, out);
            path.pop_back();
        }
}

// keysWithPrefix (autocomplete): walk down the prefix, then collect the
// subtree below it. Theta(prefix length + output size).
vector<string> keysWithPrefix(Node* t, const string& prefix) {
    for (char ch : prefix) {               // 1. walk down the prefix path
        if (!t->next[ch - 'a']) return {}; // no key has this prefix
        t = t->next[ch - 'a'];
    }
    vector<string> out;
    string path = prefix;
    collect(t, path, out);                 // 2. gather the whole subtree below
    return out;
}
