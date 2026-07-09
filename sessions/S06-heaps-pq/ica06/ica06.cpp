// CSS 343 · ICA 06 — binary heaps.  Fill in the TODOs, then run the application.
//
//   build:        g++ -std=c++17 -g -o ica06 ica06.cpp
//   run:          ./ica06
//   leak-check:   valgrind --leak-check=full ./ica06     (ICA 06 IS LEAK-GRADED)
//
// The MaxHeap struct, insert and delMax (which USE swim and sink), and main()
// (a unit-test battery + heapsort application) are GIVEN — do not edit them.
// You implement the three primitives: swim, sink, and heapify. 1-indexed
// array: a[0] is an unused sentinel, so parent(k)=k/2, children 2k and 2k+1.
// Run early and often: the tests report [PASS]/[FAIL] one by one.

#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
#include <string>
using namespace std;

struct MaxHeap {
    vector<int> a;                          // 1-indexed: a[0] unused
    MaxHeap() { a.push_back(0); }           // sentinel at index 0
    int  size()  const { return (int)a.size() - 1; }
    bool empty() const { return size() == 0; }
    int  max()   const { return a[1]; }     // precondition: non-empty
};

// ---- TODO 1 — swim -------------------------------------------------------
// Restore the heap after appending: while node k is larger than its parent
// (index k/2), swap up. Stop at the root or when the parent dominates.
void swim(MaxHeap& h, int k) {
    // TODO: while k is not the root (k > 1) AND a[k] > its parent a[k/2],
    //       swap them and move k up to k/2.
}

// ---- TODO 2 — sink -------------------------------------------------------
// Restore the heap after replacing the root: while node k is smaller than a
// child, swap with the LARGER child. Stop at a leaf or when k dominates both.
void sink(MaxHeap& h, int k) {
    // TODO: let n = h.size(); while node k has a left child (2k <= n): pick
    //       the LARGER of its children; if a[k] >= that child, stop; else swap
    //       a[k] with it and move k down to that child.
}

// ---- TODO 3 — heapify ----------------------------------------------------
// Build a heap from a RAW array in Θ(n): load the data (a complete tree, not
// yet a heap), then sink every internal node from n/2 down to 1 (bottom-up).
void heapify(MaxHeap& h, const vector<int>& data) {
    // TODO: reset h.a to just the sentinel (h.a.resize(1)); push each value of
    //       `data`; then for k = size()/2 down to 1, sink(h, k).
}

// ---- GIVEN — insert and delMax use your primitives -----------------------
void insert(MaxHeap& h, int x) {
    h.a.push_back(x);                        // append (keeps the tree complete)
    swim(h, h.size());                       // restore heap order
}
int delMax(MaxHeap& h) {
    int mx = h.a[1];                         // the max is the root
    swap(h.a[1], h.a[h.size()]);             // move last element to the root
    h.a.pop_back();                          // remove the old max
    if (!h.empty()) sink(h, 1);              // restore heap order
    return mx;
}

// ==========================================================================
// UNIT TESTS + APPLICATION (given — do not edit).
// ==========================================================================
#ifndef ICA06_GRADER
static int passCnt = 0, failCnt = 0;
static void check(bool ok, const string& what) {
    (ok ? passCnt : failCnt)++;
    cout << (ok ? "  [PASS] " : "  [FAIL] ") << what << '\n';
}
static bool isHeap(const MaxHeap& h) {            // every parent ≥ its children
    for (int k = 2; k <= h.size(); k++)
        if (h.a[k / 2] < h.a[k]) return false;
    return true;
}
static bool descending(const vector<int>& v) { return is_sorted(v.rbegin(), v.rend()); }
static vector<int> drainMax(MaxHeap h) {          // delMax until empty (by value → copy)
    vector<int> out; while (!h.empty()) out.push_back(delMax(h)); return out;
}

int main() {
    cout << "T1 · insert (swim)\n";
    MaxHeap h;
    for (int x : {30, 90, 20, 70, 10, 95, 50}) insert(h, x);
    check(h.size() == 7, "7 inserts → size 7");
    check(h.max() == 95, "max() is 95 (the root)");
    check(isHeap(h), "heap property holds after inserts");

    cout << "T2 · delMax (sink) returns items largest-first\n";
    vector<int> out = drainMax(h);
    check((int)out.size() == 7 && out.front() == 95 && out.back() == 10, "7 removed, 95 first, 10 last");
    check(descending(out), "delMax yields strictly descending order");

    cout << "T3 · heapify a shuffled array (bottom-up, Θ(n))\n";
    MaxHeap g; heapify(g, {30, 60, 50, 90, 85, 40, 70, 45, 20, 95, 10, 15});
    check(g.size() == 12, "all 12 keys loaded");
    check(isHeap(g), "heapify produced a valid heap");
    check(!g.empty() && g.max() == 95, "max() is 95");
    vector<int> gs = drainMax(g);
    check((int)gs.size() == 12 && descending(gs), "the heapified heap drains descending");

    cout << "T4 · heapify vs. repeated insert — same heap contents\n";
    vector<int> data = {8, 3, 5, 1, 9, 2, 7, 4, 6, 0};
    MaxHeap byInsert; for (int x : data) insert(byInsert, x);
    MaxHeap byHeapify; heapify(byHeapify, data);
    check(isHeap(byInsert) && isHeap(byHeapify), "both are valid heaps");
    check(drainMax(byInsert) == drainMax(byHeapify), "both drain to the same sequence");

    cout << "T5 · heapify ascending input (worst case for a max-heap)\n";
    vector<int> asc(10); iota(asc.begin(), asc.end(), 1);   // 1..10 (looks like a min-heap)
    MaxHeap m; heapify(m, asc);
    check(isHeap(m) && !m.empty() && m.max() == 10, "ascending input heapifies correctly, max = 10");

    // -- T6: THE APPLICATION — heapsort a large batch ----------------------
    // draining a heap by delMax gives the data in order — that is heapsort.
    // build the heap in Θ(n) with heapify, then remove all N.
    cout << "T6 · heapsort 1..2047 (heapify + drain)\n";
    const int N = 2047;                       // 2^11 - 1
    vector<int> big(N); iota(big.begin(), big.end(), 1);
    for (int i = 0; i < N; i++) swap(big[i], big[(i * 7 + 3) % N]);   // deterministic shuffle
    MaxHeap hb; heapify(hb, big);
    check(hb.size() == N && isHeap(hb), "heapified all 2047 keys");
    vector<int> sorted = drainMax(hb);
    check((int)sorted.size() == N && descending(sorted), "drains to 2047..1 (heapsort)");
    check(!sorted.empty() && sorted.front() == N && sorted.back() == 1, "first is 2047, last is 1");

    cout << passCnt << " passed, " << failCnt << " failed"
         << (failCnt ? "" : "  —  now run it under valgrind (must be clean)") << '\n';
    return failCnt ? 1 : 0;
}
#endif
