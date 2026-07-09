// CSS 343 · ICA 12 — Huffman coding.  Fill in the TODOs, then run the application.
//
//   build:        g++ -std=c++17 -g -o ica12 ica12.cpp
//   run:          ./ica12
//   leak-check:   valgrind --leak-check=full ./ica12     (ICA 12 IS LEAK-GRADED)
//
// The Node struct, destroy, the min-priority-queue setup, and main() (a
// unit-test battery) are GIVEN — do not edit them. You implement the two
// primitives: buildHuffman and extractCodes. Run early and often: the tests
// report [PASS]/[FAIL] one by one.

#include <iostream>
#include <vector>
#include <queue>
#include <map>
#include <string>
using namespace std;

struct Node {
    int freq; char sym;              // sym only meaningful at a leaf
    Node *left = nullptr, *right = nullptr;
    Node(int f, char s) : freq(f), sym(s) {}
    Node(int f, Node* l, Node* r) : freq(f), sym(0), left(l), right(r) {}
    bool leaf() const { return !left && !right; }
};

// ---- GIVEN — helpers ------------------------------------------------------
void destroy(Node* t) {
    if (!t) return;
    destroy(t->left); destroy(t->right);
    delete t;
}
struct Cmp { bool operator()(Node* a, Node* b) const { return a->freq > b->freq; } };
using MinPQ = priority_queue<Node*, vector<Node*>, Cmp>;

// ---- TODO 1 — buildHuffman -------------------------------------------------
// Push a leaf per symbol into a min-PQ (ordered by freq). While the PQ has
// more than one node, pop the two SMALLEST (x, y) and push a new internal
// node with freq = x->freq + y->freq and children x, y. The last remaining
// node is the root of the Huffman tree.
Node* buildHuffman(const vector<pair<char, int>>& freqs) {
    // TODO: push new Node(f, c) for every (c, f) in freqs into a MinPQ; while
    //       pq.size() > 1, pop the two smallest x, y and push
    //       new Node(x->freq + y->freq, x, y); return the last node (root).
    return nullptr;
}

// ---- TODO 2 — extractCodes -------------------------------------------------
// Walk the tree, accumulating the path ("0" for left, "1" for right). At a
// leaf, record codes[node->sym] = path (use "0" if the tree is a single leaf,
// i.e. path is empty). Otherwise recurse into both children.
void extractCodes(Node* node, const string& path, map<char, string>& codes) {
    // TODO: if node is null, return. If node is a leaf, set
    //       codes[node->sym] = path (or "0" if path is empty) and return.
    //       Otherwise recurse: extractCodes(node->left, path + "0", codes)
    //       and extractCodes(node->right, path + "1", codes).
}

// ==========================================================================
// UNIT TESTS (given — do not edit).
// ==========================================================================
#ifndef ICA12_GRADER
static int passCnt = 0, failCnt = 0;
static void check(bool ok, const string& what) {
    (ok ? passCnt : failCnt)++;
    cout << (ok ? "  [PASS] " : "  [FAIL] ") << what << '\n';
}
static bool isPrefixOf(const string& a, const string& b) {   // is a a proper prefix of b?
    if (a.size() >= b.size()) return false;
    return b.compare(0, a.size(), a) == 0;
}
static bool prefixFree(const map<char, string>& codes) {
    vector<string> cs;
    for (auto& [c, s] : codes) cs.push_back(s);
    for (size_t i = 0; i < cs.size(); i++)
        for (size_t j = 0; j < cs.size(); j++)
            if (i != j && isPrefixOf(cs[i], cs[j])) return false;
    return true;
}

int main() {
    // CLRS frequencies (Introduction to Algorithms, Huffman coding example)
    vector<pair<char, int>> freqs = {{'a', 5}, {'b', 9}, {'c', 12}, {'d', 13}, {'e', 16}, {'f', 45}};

    cout << "T1 · build produces a valid root\n";
    Node* root = buildHuffman(freqs);
    check(root && root->freq == 100, "root non-null with freq == sum of all frequencies (100)");

    cout << "T2 · every symbol gets a code\n";
    map<char, string> codes;
    extractCodes(root, "", codes);
    check(codes.size() == 6, "all 6 symbols present in codes");

    cout << "T3 · codes are prefix-free\n";
    check(!codes.empty() && prefixFree(codes), "no code is a prefix of another");

    cout << "T4 · optimal weighted code length\n";
    int total = 0;
    if (!codes.empty())
        for (auto& [c, f] : freqs)
            if (codes.count(c)) total += f * (int)codes[c].size();
    check(!codes.empty() && total == 224, "weighted total bit length == 224 (CLRS optimum)");

    cout << "T5 · most frequent symbol gets the shortest (or tied) code\n";
    bool monotonic = codes.count('f') > 0;
    if (monotonic)
        for (auto& [c, s] : codes)
            if (s.size() < codes['f'].size()) monotonic = false;
    check(monotonic, "'f' (freq 45) has code length <= every other symbol's");

    if (root) destroy(root);

    cout << "T6 · skewed frequencies force a deep, lopsided trie\n";
    // powers of two: each merge joins the running total with the next leaf,
    // so the rarest symbol's code is the deepest — length 5 for 6 symbols
    vector<pair<char, int>> skew = {{'u', 1}, {'v', 1}, {'w', 2}, {'x', 4}, {'y', 8}, {'z', 16}};
    Node* r6 = buildHuffman(skew);
    map<char, string> c6;
    extractCodes(r6, "", c6);
    check(c6.size() == 6 && prefixFree(c6), "6 prefix-free codes");
    check(c6.count('u') && c6.count('z') && c6['u'].size() == 5 && c6['z'].size() == 1,
          "rarest code is 5 bits deep; the dominant symbol gets 1 bit");
    if (r6) destroy(r6);

    cout << "T7 · two symbols\n";
    Node* r7 = buildHuffman({{'p', 3}, {'q', 9}});
    map<char, string> c7;
    extractCodes(r7, "", c7);
    check(c7.size() == 2 && c7['p'].size() == 1 && c7['q'].size() == 1 && c7['p'] != c7['q'],
          "both symbols get distinct 1-bit codes");
    if (r7) destroy(r7);

    cout << "T8 · decode(encode(word)) round-trips through YOUR trie\n";
    Node* r8 = buildHuffman(freqs);                       // the CLRS alphabet again
    map<char, string> c8;
    extractCodes(r8, "", c8);
    string word = "faced", bits, back;
    for (char ch : word) bits += c8[ch];
    Node* walk = r8;                                       // decode by walking the trie
    for (char b : bits) {
        walk = b == '0' ? walk->left : walk->right;
        if (!walk) break;
        if (walk->leaf()) { back += walk->sym; walk = r8; }
    }
    check(back == word, "\"faced\" encodes then decodes to itself");
    if (r8) destroy(r8);

    cout << passCnt << " passed, " << failCnt << " failed"
         << (failCnt ? "" : "  —  now run it under valgrind (must be clean)") << '\n';
    return failCnt ? 1 : 0;
}
#endif
