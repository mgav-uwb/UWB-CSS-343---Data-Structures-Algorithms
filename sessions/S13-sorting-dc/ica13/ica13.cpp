// CSS 343 · ICA 13 — sorting & selection.  Fill in the TODOs, then run the application.
//
//   build:        g++ -std=c++17 -g -o ica13 ica13.cpp
//   run:          ./ica13
//   leak-check:   valgrind --leak-check=full ./ica13     (STL only — leak-clean automatic)
//
// You implement five divide-and-conquer primitives on vector<int>: merge and
// mergesort (top-down merge sort), partition and quicksort (Lomuto scheme),
// and quickselect (partition-based selection). The unit-test battery and
// main() are GIVEN — do not edit them. Run early and often: the tests report
// [PASS]/[FAIL] one by one.

#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
#include <string>
#include <random>
using namespace std;

// ---- TODO 1 — merge -------------------------------------------------------
// Merge two adjacent sorted runs a[lo..mid] and a[mid+1..hi] into one sorted
// run a[lo..hi], using a temp buffer.
void merge(vector<int>& a, int lo, int mid, int hi) {
    // TODO — L13's "merge" slide is this function; a temp buffer and two
    //        walking pointers. Which run wins a tie matters for stability.
}

// ---- TODO 2 — mergesort ---------------------------------------------------
// Top-down merge sort: split a[lo..hi] at the midpoint, recursively sort each
// half, then merge them.
void mergesort(vector<int>& a, int lo, int hi) {
    // TODO — three lines: base case, split at the midpoint, recurse + merge.
}

// ---- TODO 3 — partition (Lomuto) ------------------------------------------
// Partition a[lo..hi] around pivot = a[hi]. Return the pivot's final index i
// such that everything in a[lo..i-1] <= a[i] and everything in a[i+1..hi] >= a[i].
int partition(vector<int>& a, int lo, int hi) {
    // TODO — Lomuto, exactly as traced on the L13 partition slides (pivot =
    //        a[hi], one scanning index). Trace your code on [3 7 1 8 2 5]
    //        and compare with the deck before trusting it.
    return 0;
}

// ---- TODO 4 — quicksort ----------------------------------------------------
// Partition a[lo..hi], then recursively sort the two sides (excluding the
// pivot, which is already in its final position).
void quicksort(vector<int>& a, int lo, int hi) {
    // TODO — base case, partition, recurse on the two sides (the pivot is
    //        already home).
}

// ---- TODO 5 — quickselect --------------------------------------------------
// Return the k-th smallest element (0-indexed, ABSOLUTE index) of a[lo..hi]
// by recursing into ONLY the side of the partition that contains rank k —
// partition-based selection, reusing your Lomuto partition.
int quickselect(vector<int>& a, int lo, int hi, int k) {
    // TODO — one partition tells you the pivot's exact rank; compare it to k.
    //        (L13 "quickselect" slides.)
    return 0;
}

// ==========================================================================
// UNIT TESTS + APPLICATION (given — do not edit).
// ==========================================================================
#ifndef ICA13_GRADER
static int passCnt = 0, failCnt = 0;
static void check(bool ok, const string& what) {
    (ok ? passCnt : failCnt)++;
    cout << (ok ? "  [PASS] " : "  [FAIL] ") << what << '\n';
}

// reference sort, for comparison against std::sort
static vector<int> reference(vector<int> v) { sort(v.begin(), v.end()); return v; }

static vector<vector<int>> randomBatches(int count, int n, unsigned seed) {
    mt19937 rng(seed);
    uniform_int_distribution<int> dist(-1000, 1000);
    vector<vector<int>> out;
    for (int b = 0; b < count; b++) {
        vector<int> v(n);
        for (int& x : v) x = dist(rng);
        out.push_back(v);
    }
    return out;
}

int main() {
    cout << "T1 · mergesort a known array matches std::sort\n";
    vector<int> a1 = {38, 27, 43, 3, 9, 82, 10};
    vector<int> expected1 = reference(a1);
    if (!a1.empty()) mergesort(a1, 0, (int)a1.size() - 1);
    check(a1 == expected1, "mergesort({38,27,43,3,9,82,10}) == std::sort result");

    cout << "T2 · mergesort several random arrays\n";
    auto batches2 = randomBatches(5, 40, 42);
    bool allSorted2 = true, allMatch2 = true;
    for (auto v : batches2) {
        vector<int> exp = reference(v);
        if (!v.empty()) mergesort(v, 0, (int)v.size() - 1);
        if (!is_sorted(v.begin(), v.end())) allSorted2 = false;
        if (v != exp) allMatch2 = false;
    }
    check(allSorted2, "mergesort output is_sorted on 5 random arrays of size 40");
    check(allMatch2, "mergesort output matches std::sort on the same arrays");

    cout << "T3 · quicksort — random, duplicates, already-sorted\n";
    auto batches3 = randomBatches(5, 40, 99);
    bool allSorted3 = true, allMatch3 = true;
    for (auto v : batches3) {
        vector<int> exp = reference(v);
        if (!v.empty()) quicksort(v, 0, (int)v.size() - 1);
        if (!is_sorted(v.begin(), v.end())) allSorted3 = false;
        if (v != exp) allMatch3 = false;
    }
    check(allSorted3 && allMatch3, "quicksort sorts 5 random arrays correctly");

    vector<int> dup = {5, 3, 5, 5, 1, 3, 5, 2, 1, 5};
    vector<int> dupExp = reference(dup);
    if (!dup.empty()) quicksort(dup, 0, (int)dup.size() - 1);
    check(dup == dupExp, "quicksort handles many duplicate keys");

    vector<int> alreadySorted(30); iota(alreadySorted.begin(), alreadySorted.end(), 1);
    vector<int> asExp = alreadySorted;
    if (!alreadySorted.empty()) quicksort(alreadySorted, 0, (int)alreadySorted.size() - 1);
    check(alreadySorted == asExp, "quicksort handles already-sorted input");

    cout << "T4 · partition invariant — left <= pivot <= right\n";
    vector<int> a4 = {8, 4, 7, 3, 9, 1, 6, 2, 5};
    int hi4 = (int)a4.size() - 1;
    int p4 = partition(a4, 0, hi4);
    bool invariant4 = (p4 >= 0 && p4 <= hi4);
    for (int i = 0; invariant4 && i < p4; i++) if (a4[i] > a4[p4]) invariant4 = false;
    for (int i = p4 + 1; invariant4 && i <= hi4; i++) if (a4[i] < a4[p4]) invariant4 = false;
    check(invariant4, "after partition, a[lo..p-1] <= a[p] <= a[p+1..hi]");

    cout << "T5 · quickselect(k) matches sorted[k] for several k\n";
    bool allQS = true;
    for (int trial = 0; trial < 4; trial++) {
        vector<int> base = randomBatches(1, 25, 100 + trial)[0];
        vector<int> sortedBase = reference(base);
        for (int k : {0, 1, (int)base.size() / 2, (int)base.size() - 1}) {
            vector<int> v = base;
            int result = v.empty() ? -1 : quickselect(v, 0, (int)v.size() - 1, k);
            if (result != sortedBase[k]) allQS = false;
        }
    }
    check(allQS, "quickselect(k) == sorted[k] across several k and arrays");

    cout << "T6 · edge cases — single element, all-equal\n";
    vector<int> single = {42};
    vector<int> singleExp = single;
    mergesort(single, 0, 0);
    check(single == singleExp, "mergesort on a single-element array is a no-op");

    vector<int> singleQ = {42};
    quicksort(singleQ, 0, 0);
    check(singleQ == singleExp, "quicksort on a single-element array is a no-op");

    vector<int> allEqual(15, 7);
    vector<int> allEqualExp = allEqual;
    quicksort(allEqual, 0, (int)allEqual.size() - 1);
    check(allEqual == allEqualExp, "quicksort handles an all-equal array");

    vector<int> allEqualM(15, 7);
    mergesort(allEqualM, 0, (int)allEqualM.size() - 1);
    check(allEqualM == allEqualExp, "mergesort handles an all-equal array");

    cout << passCnt << " passed, " << failCnt << " failed" << '\n';
    return failCnt ? 1 : 0;
}
#endif
