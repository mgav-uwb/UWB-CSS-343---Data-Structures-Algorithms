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
// UNIT TESTS + APPLICATION (given — do not edit).
// ==========================================================================
#ifndef ICA15_GRADER
static int passCnt = 0, failCnt = 0;
static void check(bool ok, const string& what) {
    (ok ? passCnt : failCnt)++;
    cout << (ok ? "  [PASS] " : "  [FAIL] ") << what << '\n';
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

    cout << passCnt << " passed, " << failCnt << " failed" << '\n';
    return failCnt ? 1 : 0;
}
#endif
