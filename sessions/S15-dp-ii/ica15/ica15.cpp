// CSS 343 · ICA 15 — dynamic programming II.  Fill in the TODOs, then run.
//
//   build:        g++ -std=c++17 -g -o ica15 ica15.cpp
//   run:          ./ica15
//
// The unit-test battery and main() are GIVEN — do not edit them. You
// implement three functions: 0/1 knapsack (the 2-D table), edit distance
// (Levenshtein, another 2-D table), and knapsack traceback (rebuild the
// table, then walk it backwards to recover WHICH items were chosen). All
// three use plain vectors — no `new`, no raw pointers. Run early and often:
// the tests report [PASS]/[FAIL] one by one.

#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
using namespace std;

// ---- TODO 1 — knapsack ----------------------------------------------------
// 0/1 knapsack: n items, value[i]/weight[i] for i = 0..n-1, capacity W.
// Build a 2-D table K where K[i][w] = the best value achievable using only
// the first i items with capacity w. K[0][w] = 0 for all w (no items yet).
// For item i (1-indexed into the table, 0-indexed into value/weight):
//   - if it doesn't fit (weight[i-1] > w): K[i][w] = K[i-1][w]
//   - else: K[i][w] = max(K[i-1][w], value[i-1] + K[i-1][w - weight[i-1]])
// Return K[n][W].
int knapsack(const vector<int>& value, const vector<int>& weight, int W) {
    // TODO — the recurrence above is L15's; mind the table-vs-array indexing
    //        (the deck flags this exact off-by-one).
    return 0;
}

// ---- TODO 2 — editDistance -------------------------------------------------
// Levenshtein distance between a (length m) and b (length n): the minimum
// number of single-character insertions, deletions, and substitutions to
// turn a into b. Build a 2-D table D where D[i][j] = the edit distance
// between a's first i characters and b's first j characters.
//   base cases: D[i][0] = i (delete all of a's first i chars)
//               D[0][j] = j (insert all of b's first j chars)
//   if a[i-1] == b[j-1]: D[i][j] = D[i-1][j-1]              (chars match, free)
//   else:                D[i][j] = 1 + min(D[i-1][j],       (delete from a)
//                                           D[i][j-1],       (insert into a)
//                                           D[i-1][j-1])     (substitute)
// Return D[m][n].
int editDistance(const string& a, const string& b) {
    // TODO — base cases first (they are NOT all zero here), then the fill.
    return 0;
}

// ---- TODO 3 — knapsackItems (traceback) -----------------------------------
// Same 0/1 knapsack, but this time report WHICH items were taken instead of
// just the best value. Rebuild the K table exactly as in knapsack() above,
// then walk it BACKWARDS from K[n][W]: start at i = n, w = W; while i > 0,
// if K[i][w] != K[i-1][w], item (i-1) was taken — add it to the result and
// reduce w by weight[i-1]; either way, move to i-1. Return the 0-indexed
// item indices taken (any order — the test sorts before comparing).
vector<int> knapsackItems(const vector<int>& value, const vector<int>& weight, int W) {
    // TODO — rebuild K, then the backward walk from the header (L15's
    //        "traceback" slide works the exact move).
    return {};
}

// ==========================================================================
// EXTRA CREDIT (optional, +5) — the DISTANCE vs the EDIT SCRIPT.
// TODO 3 already traces a table back to recover a SET of choices. This does
// the same walk on the OTHER table, where the choices are operations: what a
// spell-checker or `diff` actually reports. Skipping it costs you nothing —
// the battery below still exits 0.
// ==========================================================================

// ---- EC (+5) — editOps: the operations, not just how many ------------------
// Fill the same D table as editDistance, then walk BACK from D[m][n] to
// D[0][0] naming each step (L15 "Edit distance — the edit script"):
//   diagonal, a[i-1] == b[j-1]           -> 'M'  match, free
//   diagonal, D[i][j] == D[i-1][j-1] + 1 -> 'R'  replace a[i-1] with b[j-1]
//   up,       D[i][j] == D[i-1][j]   + 1 -> 'D'  delete a[i-1]
//   left,     D[i][j] == D[i][j-1]   + 1 -> 'I'  insert b[j-1]
// At i == 0 only inserts remain; at j == 0 only deletes. The walk finds the
// ops back to front, so REVERSE before returning.
//   editOps("kitten","sitting") -> R M M M R M I   (2 replaces + 1 insert = 3)
//   editOps("abc","abc")        -> M M M           (distance 0 — all matches)
// Ties are fine: several optimal scripts can exist. The tests REPLAY your ops
// on `a` and check they produce `b` in exactly editDistance(a,b) real edits,
// so any optimal script passes.
vector<char> editOps(const string& a, const string& b) {
    // TODO — build D as in TODO 2, then the backward walk above. Push one
    //        char per step, reverse, return.
    return {};
}

// ==========================================================================
// UNIT TESTS + APPLICATION (given — do not edit).
// ==========================================================================
#ifndef ICA15_GRADER
static int passCnt = 0, failCnt = 0;
static void check(bool ok, const string& what) {
    (ok ? passCnt : failCnt)++;
    cout << (ok ? "  [PASS] " : "  [FAIL] ") << what << '\n';
}

// Extra credit reports separately and never touches passCnt/failCnt, so
// leaving the EC TODO empty still gives a clean ./ica15 run (exit 0).
static void checkEC(bool ok, const string& what) {
    cout << (ok ? "  [EC PASS] " : "  [ec ....] ") << what << '\n';
}

// Replays an edit script on `a`: 'M'/'R' consume one char of each, 'D' one of
// a, 'I' one of b. Returns true iff the ops turn a into b exactly, and sets
// `edits` to the number of NON-match operations.
static bool replayOps(const string& a, const string& b, const vector<char>& ops, int& edits) {
    size_t i = 0, j = 0;
    edits = 0;
    for (char op : ops) {
        if (op == 'M') { if (i >= a.size() || j >= b.size() || a[i] != b[j]) return false; i++; j++; }
        else if (op == 'R') { if (i >= a.size() || j >= b.size()) return false; i++; j++; edits++; }
        else if (op == 'D') { if (i >= a.size()) return false; i++; edits++; }
        else if (op == 'I') { if (j >= b.size()) return false; j++; edits++; }
        else return false;                       // not one of M/R/D/I
    }
    return i == a.size() && j == b.size();       // both strings fully consumed
}

// sums the value and weight of a chosen set of item indices
static pair<int, int> sumItems(const vector<int>& value, const vector<int>& weight,
                                const vector<int>& items) {
    int v = 0, w = 0;
    for (int i : items) {
        if (i < 0 || i >= (int)value.size()) continue;   // guard a bad/empty result
        v += value[i];
        w += weight[i];
    }
    return {v, w};
}

int main() {
    cout << "T1 · knapsack — small instance\n";
    vector<int> v1 = {3, 4, 5, 6}, w1 = {2, 3, 4, 5};
    check(knapsack(v1, w1, 5) == 7, "values {3,4,5,6} weights {2,3,4,5} W=5 -> 7");

    cout << "T2 · knapsack — classic textbook instance\n";
    vector<int> v2 = {60, 100, 120}, w2 = {10, 20, 30};
    check(knapsack(v2, w2, 50) == 220, "values {60,100,120} weights {10,20,30} W=50 -> 220");

    cout << "T3 · editDistance — classic instances\n";
    check(editDistance("kitten", "sitting") == 3, "kitten -> sitting is 3");
    check(editDistance("sunday", "saturday") == 3, "sunday -> saturday is 3");

    cout << "T4 · editDistance — edge cases\n";
    check(editDistance("abc", "abc") == 0, "identical strings -> 0");
    check(editDistance("", "abc") == 3, "empty vs \"abc\" -> 3");

    cout << "T5 · knapsackItems — traceback recovers an optimal item set\n";
    vector<int> items = knapsackItems(v1, w1, 5);
    sort(items.begin(), items.end());
    auto [tv, tw] = sumItems(v1, w1, items);
    check(!items.empty() && tw <= 5 && tv == 7,
          "traceback set fits (weight <= 5) and matches optimal value 7");

    cout << "T6 · knapsack — edge cases\n";
    check(knapsack(v1, w1, 0) == 0, "W=0 -> 0");
    check(knapsack({10}, {5}, 5) == 10, "single item that fits exactly -> 10");
    check(knapsack({10}, {5}, 4) == 0, "single item that doesn't fit -> 0");

    cout << "\nEXTRA CREDIT (optional — these do not affect the counts above)\n";
    cout << "EC · editOps — the edit script itself\n";
    {
        // expected distances are literal, so EC does not depend on your editDistance()
        struct Case { string a, b; int dist; };
        vector<Case> cases = {{"kitten", "sitting", 3}, {"sunday", "saturday", 3},
                              {"abc", "abc", 0}, {"", "abc", 3}, {"abc", "", 3}, {"", "", 0}};
        bool allOk = true;
        for (auto& c : cases) {
            int edits = 0;
            if (!replayOps(c.a, c.b, editOps(c.a, c.b), edits) || edits != c.dist) allOk = false;
        }
        checkEC(allOk, "six scripts replay onto the target in the optimal number of edits");
        vector<char> k = editOps("kitten", "sitting");
        int mCnt = 0;
        for (char op : k) if (op == 'M') mCnt++;
        checkEC(k.size() == 7 && mCnt == 4, "kitten->sitting is 7 ops: 4 matches + 3 real edits");
        checkEC(editOps("abc", "abc") == vector<char>({'M', 'M', 'M'}), "identical strings are all matches");
    }

    cout << passCnt << " passed, " << failCnt << " failed" << '\n';
    return failCnt ? 1 : 0;
}
#endif
