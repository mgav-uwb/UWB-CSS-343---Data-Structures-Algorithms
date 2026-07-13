// CSS 343 · ICA 16 — tries & substring search.  Fill in the TODOs, then run.
//
//   build:        g++ -std=c++17 -g -o ica16 ica16.cpp
//   run:          ./ica16
//   leak-check:   valgrind --leak-check=full ./ica16     (ICA 16 IS LEAK-GRADED)
//
// The TrieNode struct, destroy() (recursively frees the trie), bruteForce()
// (a naive O(nm) reference substring search), and main() (a unit-test
// battery) are GIVEN — do not edit them. You implement insert, search,
// startsWith (the trie primitives), and failure/kmp (KMP substring search).
// Run early and often: the tests report [PASS]/[FAIL] one by one.

#include <iostream>
#include <vector>
#include <string>
using namespace std;

// ---- GIVEN ----------------------------------------------------------------
struct TrieNode {
    TrieNode* next[26] = {};   // lowercase a-z
    bool isWord = false;
};
void destroy(TrieNode* t) {
    if (!t) return;
    for (int i = 0; i < 26; i++) destroy(t->next[i]);
    delete t;
}
// naive substring search: try every start position (reference for testing)
int bruteForce(const string& text, const string& pat) {
    int n = (int)text.size(), m = (int)pat.size();
    for (int i = 0; i + m <= n; i++) {
        int j = 0;
        while (j < m && text[i + j] == pat[j]) j++;
        if (j == m) return i;
    }
    return -1;
}

// ---- TODO 1 — insert -------------------------------------------------------
// Walk `key` from root, creating any missing child nodes along the way
// (next[c - 'a']); mark the LAST node's isWord = true.
void insert(TrieNode* root, const string& key) {
    // TODO — a walk that creates what's missing; the header says what to mark
    //        at the end. (L16 "trie insert".)
}

// ---- TODO 2 — search --------------------------------------------------------
// Walk `key` from root; if any child along the path is missing, return false.
// At the end (whole key consumed), return whether that node isWord.
bool search(TrieNode* root, const string& key) {
    // TODO — walk the path; remember the deck's warning: a reachable path is
    //        NOT the same as a stored word.
    return false;
}

// ---- TODO 3 — startsWith ----------------------------------------------------
// Walk `prefix` from root; return true if the whole prefix path exists,
// regardless of isWord (unlike search, a prefix need not itself be a word).
bool startsWith(TrieNode* root, const string& prefix) {
    // TODO — one line different from search. Which line, and why?
    return false;
}

// ---- TODO 4 — failure -------------------------------------------------------
// The KMP failure function: fail[i] = length of the longest proper prefix of
// p[0..i] that is also a suffix of p[0..i].
vector<int> failure(const string& p) {
    // TODO — build it the way L16's "failure function — the builder" slide
    //        does: the pattern matched against itself, falling back through
    //        the part of the table already built. Hand-check on AABAA (the
    //        deck's worked table) before trusting it.
    return {};
}

// ---- TODO 5 — kmp -----------------------------------------------------------
// Knuth-Morris-Pratt substring search using failure(). Return the index of
// the first occurrence of `pat` in `text`, or -1 if `pat` does not occur.
int kmp(const string& text, const string& pat) {
    // TODO — L16's "KMP — the search" slide is this function; it mirrors the
    //        builder loop (empty pattern: a match at 0). Write the real thing —
    //        delegating to string::find or the given bruteForce forfeits the
    //        KMP points (checked by eye at grading).
    return -1;
}

// ==========================================================================
// UNIT TESTS (given — do not edit).
// ==========================================================================
#ifndef ICA16_GRADER
static int passCnt = 0, failCnt = 0;
static void check(bool ok, const string& what) {
    (ok ? passCnt : failCnt)++;
    cout << (ok ? "  [PASS] " : "  [FAIL] ") << what << '\n';
}

int main() {
    cout << "T1 · trie insert/search\n";
    TrieNode* root = new TrieNode();
    for (const string& w : {"she", "shell", "shells", "sea"}) insert(root, w);
    check(search(root, "she") == true,    "search \"she\" == true (inserted word)");
    check(search(root, "sh") == false,    "search \"sh\" == false (prefix, not a word)");
    check(search(root, "shell") == true,  "search \"shell\" == true (inserted word)");
    check(search(root, "cat") == false,   "search \"cat\" == false (not in trie)");

    cout << "T2 · trie startsWith\n";
    check(startsWith(root, "she") == true, "startsWith \"she\" == true");
    check(startsWith(root, "sh") == true,  "startsWith \"sh\" == true (path exists)");
    check(startsWith(root, "xyz") == false, "startsWith \"xyz\" == false (no path)");

    cout << "T3 · KMP failure function\n";
    vector<int> f1 = failure("AABAA");
    check(f1 == vector<int>({0, 1, 0, 1, 2}), "failure(\"AABAA\") == {0,1,0,1,2}");
    vector<int> f2 = failure("ABABC");
    check(f2 == vector<int>({0, 0, 1, 2, 0}), "failure(\"ABABC\") == {0,0,1,2,0}");

    cout << "T4 · KMP search vs. std::string::find\n";
    string text4 = "ABABABCABABABCAB";
    check(kmp(text4, "ABABC") == (int)text4.find("ABABC"), "kmp finds \"ABABC\" at the correct index");
    struct Case { string text, pat; };
    vector<Case> cases = {
        {"hello world", "world"},
        {"aaaaaaaaaa", "aaa"},
        {"mississippi", "issi"},
        {"abcdefgh", "xyz"},        // no match
    };
    for (auto& c : cases) {
        size_t want = c.text.find(c.pat);
        int wantIdx = (want == string::npos) ? -1 : (int)want;
        check(kmp(c.text, c.pat) == wantIdx,
              "kmp(\"" + c.text + "\", \"" + c.pat + "\") matches string::find");
    }

    cout << "T5 · KMP on repetitive input (near-worst-case for naive search)\n";
    string manyA(2000, 'A');
    string patAB = string(30, 'A') + "B";
    check(kmp(manyA, patAB) == -1, "pattern with a trailing B never found in all-A text");
    string textAB = string(2000, 'A') + "B";
    check(kmp(textAB, patAB) == 2000 - 30, "pattern found right before the trailing B");
    check(kmp(textAB, patAB) == bruteForce(textAB, patAB), "kmp agrees with bruteForce reference");

    cout << "T6 · trie stress: 50 words, presence & absence\n";
    TrieNode* big = new TrieNode();
    vector<string> words;
    for (int i = 0; i < 50; i++) {
        string w = "word";
        int n = i;
        do { w += char('a' + n % 26); n /= 26; } while (n > 0);
        words.push_back(w);
        insert(big, w);
    }
    bool allPresent = true;
    for (const string& w : words) if (!search(big, w)) allPresent = false;
    check(allPresent, "all 50 inserted words are found");
    check(search(big, "notinserted") == false, "an absent word is correctly reported missing");
    check(search(big, "word") == false, "a proper prefix of inserted words is not itself a word");
    check(startsWith(big, "word") == true, "startsWith \"word\" is true (path exists)");
    destroy(big);

    destroy(root);   // free T1/T2's trie — leak-clean run

    cout << passCnt << " passed, " << failCnt << " failed"
         << (failCnt ? "" : "  —  now run it under valgrind (must be clean)") << '\n';
    return failCnt ? 1 : 0;
}
#endif
