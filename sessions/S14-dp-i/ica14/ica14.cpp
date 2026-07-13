// CSS 343 · ICA 14 — dynamic programming I.  Fill in the TODOs, then run the application.
//
//   build:        g++ -std=c++17 -g -o ica14 ica14.cpp
//   run:          ./ica14
//   leak-check:   valgrind --leak-check=full ./ica14     (no new/delete — should be clean)
//
// Four independent DP warm-ups, all using vector (no new/delete):
//   1-2) Fibonacci: top-down memoization, then bottom-up tabulation.
//   3)   Rod cutting: 1-D DP over cut length.
//   4)   Longest common subsequence: 2-D DP table.
// main() (a unit-test battery) is GIVEN — do not edit it.
// Run early and often: the tests report [PASS]/[FAIL] one by one.

#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

// ---- GIVEN — naive exponential fib, instrumented with a call counter -----
// Used only so a test can demonstrate the exponential blow-up that memoization
// avoids. Do not call fibNaive with n much above ~30 — it really is Θ(2^n).
static long naiveCallCount = 0;
long fibNaive(int n) {
    naiveCallCount++;
    if (n <= 1) return n;
    return fibNaive(n - 1) + fibNaive(n - 2);
}

// ---- TODO 1 — fibMemo (top-down memoization) ------------------------------
// memo is sized n+1 and initialized to -1 (meaning "not yet computed").
// If memo[n] is already computed, return it. Otherwise compute it recursively
// (fibMemo(n-1) + fibMemo(n-2)), STORE it in memo[n], and return it.
// Base case: fib(0) = 0, fib(1) = 1.
long fibMemo(int n, vector<long>& memo) {
    // TODO — the header is the contract; L14's "Memoization (top-down)" slide
    //        is the pattern. Don't forget to STORE before returning.
    return 0;
}

// ---- TODO 2 — fibTab (bottom-up tabulation) -------------------------------
// Build a table tab[0..n] with tab[0]=0, tab[1]=1 (guard n==0), then fill
// tab[i] = tab[i-1] + tab[i-2] for i = 2..n. Return tab[n].
long fibTab(int n) {
    // TODO — bottom-up: base cases first, then fill in dependency order.
    //        Watch the n==0 edge (a size-1 table has no tab[1]).
    return 0;
}

// ---- TODO 3 — rodCut (1-D DP) ---------------------------------------------
// price[i] is the price of a rod of length i (price[0] is unused/0). Given a
// rod of length n, find the maximum total value obtainable by cutting it into
// pieces of integer length (a piece may also be left uncut).
// best[0] = 0; for len = 1..n: best[len] = max over cut i = 1..len of
//   price[i] + best[len - i].
int rodCut(const vector<int>& price, int n) {
    // TODO — the header's recurrence is the L14 "Rod cutting" slide; your job
    //        is turning it into the two loops.
    return 0;
}

// ---- TODO 4 — lcs (2-D DP: longest common subsequence) --------------------
// L is an (m+1) x (n+1) table, L[i][j] = length of the LCS of a[0..i) and
// b[0..j). Row/col 0 are 0 (empty prefix). If a[i-1] == b[j-1], L[i][j] =
// L[i-1][j-1] + 1; else L[i][j] = max(L[i-1][j], L[i][j-1]). Return L[m][n].
int lcs(const string& a, const string& b) {
    // TODO — the header's recurrence is the L14 LCS table; mind the ±1 between
    //        table indices (prefix lengths) and string indices.
    return 0;
}

// ==========================================================================
// UNIT TESTS + APPLICATION (given — do not edit).
// ==========================================================================
#ifndef ICA14_GRADER
static int passCnt = 0, failCnt = 0;
static void check(bool ok, const string& what) {
    (ok ? passCnt : failCnt)++;
    cout << (ok ? "  [PASS] " : "  [FAIL] ") << what << '\n';
}

int main() {
    cout << "T1 · fibMemo (top-down)\n";
    {
        vector<long> memo(11, -1);
        check(fibMemo(10, memo) == 55, "fibMemo(10) == 55");
    }
    {
        vector<long> memo(41, -1);
        long v = fibMemo(40, memo);
        check(v == 102334155, "fibMemo(40) == 102334155 (instant — no exponential blow-up)");
    }
    {
        // Show the exponential blow-up fibMemo avoids: fibNaive(30) alone
        // makes over a million recursive calls; fibMemo(30) makes 59 calls
        // (2n−1, the deck's convention), each of its 31 subproblems computed once.
        naiveCallCount = 0;
        long naiveVal = fibNaive(30);
        long naiveCalls = naiveCallCount;
        vector<long> memo(31, -1);
        long memoVal = fibMemo(30, memo);
        check(naiveVal == memoVal, "fibNaive(30) == fibMemo(30) (same answer)");
        check(naiveCalls > 1000000, "fibNaive(30) makes > 1,000,000 calls (exponential)");
    }

    cout << "T2 · fibTab (bottom-up) matches fibMemo\n";
    bool allMatch = true;
    for (int n : {0, 1, 2, 5, 10, 20, 30}) {
        vector<long> memo(n + 1, -1);
        if (fibTab(n) != fibMemo(n, memo)) allMatch = false;
    }
    check(allMatch, "fibTab(n) == fibMemo(n) for n in {0,1,2,5,10,20,30}");
    check(fibTab(30) == 832040, "fibTab(30) == 832040");
    check(fibTab(0) == 0 && fibTab(1) == 1, "fibTab base cases: fibTab(0)=0, fibTab(1)=1");

    cout << "T3 · rodCut (1-D DP)\n";
    {
        vector<int> price = {0, 1, 5, 8, 9};             // price[len], len=1..4
        check(rodCut(price, 4) == 10, "rodCut([_,1,5,8,9], n=4) == 10");
    }
    {
        // standard CLRS example, extended to length 8
        vector<int> price = {0, 1, 5, 8, 9, 10, 17, 17, 20};
        check(rodCut(price, 8) == 22, "rodCut(CLRS prices, n=8) == 22");
    }

    cout << "T4 · lcs (2-D DP)\n";
    check(lcs("AGCAT", "GAC") == 2, "lcs(\"AGCAT\",\"GAC\") == 2");
    check(lcs("ABCBDAB", "BDCAB") == 4, "lcs(\"ABCBDAB\",\"BDCAB\") == 4");

    cout << "T5 · lcs edge cases\n";
    check(lcs("", "ANYTHING") == 0, "lcs(\"\", \"ANYTHING\") == 0 (empty string)");
    check(lcs("", "") == 0, "lcs(\"\", \"\") == 0 (both empty)");
    check(lcs("IDENTICAL", "IDENTICAL") == 9, "lcs of identical strings == string length");

    cout << "T6 · rodCut edge cases\n";
    {
        vector<int> price = {0, 3, 5, 8, 9};
        check(rodCut(price, 1) == price[1], "rodCut(price, n=1) == price[1]");
        check(rodCut(price, 0) == 0, "rodCut(price, n=0) == 0");
    }

    cout << passCnt << " passed, " << failCnt << " failed"
         << (failCnt ? "" : "  —  now run it under valgrind (must be clean)") << '\n';
    return failCnt ? 1 : 0;
}
#endif
