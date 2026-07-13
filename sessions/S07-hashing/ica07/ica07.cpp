// CSS 343 · ICA 07 — a linear-probing hash table.  Fill in the TODOs, then run the application.
//
//   build:        g++ -std=c++17 -g -o ica07 ica07.cpp
//   run:          ./ica07
//   leak-check:   valgrind --leak-check=full ./ica07     (ICA 07 IS LEAK-GRADED)
//
// The HashTable struct, hashCode, and main() (a unit-test battery) are GIVEN —
// do not edit them. You implement three operations: resize, insert, and
// search. Keys are assumed >= 0;
// EMPTY marks an unused slot. Run early and often: the tests report
// [PASS]/[FAIL] one by one.

#include <iostream>
#include <vector>
#include <string>
using namespace std;

const int EMPTY = -1;                     // keys are assumed >= 0

struct HashTable {
    vector<int> slots;  int M;  int n;    // M = capacity, n = #keys
    HashTable(int cap) : slots(cap, EMPTY), M(cap), n(0) {}
};

// ---- GIVEN — the home-slot function --------------------------------------
int hashCode(int key, int M) { return key % M; }

// ---- TODO 1 — resize ------------------------------------------------------
// Double the capacity and REHASH every key into the bigger table, with its own
// probe loop — do NOT call insert (insert calls resize, so you'd recurse).
// Every rehashed key must land on a valid probe chain from its NEW home slot.
void resize(HashTable& h) {
    // TODO — L07's "resize + rehash" demo shows exactly this move.
}

// ---- TODO 2 — insert ------------------------------------------------------
// Linear probing from the home slot (hashCode); no duplicates; after a
// successful insert, resize when the load factor reaches 1/2 (2*h.n >= h.M).
void insert(HashTable& h, int key) {
    // TODO — the L07 "linear probing" demo is this loop; mind the wraparound.
}

// ---- TODO 3 — search -------------------------------------------------------
// The same walk as insert. What certifies a MISS, and why is stopping there
// safe? (L07 "search hit vs miss".)
bool search(const HashTable& h, int key) {
    // TODO
    return false;
}

// ==========================================================================
// UNIT TESTS (given — do not edit).
// ==========================================================================
#ifndef ICA07_GRADER
static int passCnt = 0, failCnt = 0;
static void check(bool ok, const string& what) {
    (ok ? passCnt : failCnt)++;
    cout << (ok ? "  [PASS] " : "  [FAIL] ") << what << '\n';
}

int main() {
    cout << "T1 · basics — insert then search\n";
    HashTable h1(11);
    insert(h1, 5); insert(h1, 16); insert(h1, 27);
    check(!h1.slots.empty() && search(h1, 5),  "search finds 5");
    check(!h1.slots.empty() && search(h1, 16), "search finds 16");
    check(!h1.slots.empty() && search(h1, 27), "search finds 27");
    check(!search(h1, 99), "search misses an absent key (99)");

    cout << "T2 · collisions — keys sharing a home slot all land distinctly\n";
    HashTable h2(11);
    insert(h2, 3); insert(h2, 14); insert(h2, 25);   // all ≡ 3 (mod 11), before any resize
    check(h2.n == 3, "n == 3 after 3 distinct-key inserts");
    check(!h2.slots.empty() && search(h2, 3)  &&
          !h2.slots.empty() && search(h2, 14) &&
          !h2.slots.empty() && search(h2, 25), "all 3 colliding keys are found");

    cout << "T3 · duplicates — inserting the same key repeatedly doesn't grow n\n";
    HashTable h3(11);
    insert(h3, 42); insert(h3, 42); insert(h3, 42); insert(h3, 42);
    check(h3.n == 1, "n == 1 after inserting the same key 4 times");
    check(!h3.slots.empty() && search(h3, 42), "the key is still found");

    cout << "T4 · resize — crossing load factor 0.5 doubles M and preserves keys\n";
    HashTable h4(8);
    vector<int> keys4 = {1, 2, 3, 4};                // 4th insert makes 2*n(=8) >= M(=8)
    for (int k : keys4) insert(h4, k);
    check(h4.M == 16, "M doubled from 8 to 16");
    bool allFound4 = true;
    for (int k : keys4) if (!search(h4, k)) allFound4 = false;
    check(allFound4, "every key inserted before the resize is still found");

    cout << "T5 · search after resize — an early key survives a later resize\n";
    HashTable h5(8);
    insert(h5, 100);                                  // inserted well before the resize
    for (int k : {1, 2, 3, 4, 5}) insert(h5, k);       // pushes load factor over 0.5
    check(h5.M > 8, "table resized (M grew beyond initial 8)");
    check(!h5.slots.empty() && search(h5, 100), "the early key (100) is still found after resize");

    cout << "T6 · stress — insert 0..999, verify membership, confirm growth\n";
    HashTable h6(17);
    for (int k = 0; k < 1000; k++) insert(h6, k);
    check(h6.n == 1000, "n == 1000 after inserting 1000 distinct keys");
    bool allFound6 = true;
    for (int k = 0; k < 1000; k++) if (!search(h6, k)) { allFound6 = false; break; }
    check(allFound6, "all 1000 inserted keys are found");
    check(!search(h6, 1000) && !search(h6, 2000) && !search(h6, 5000),
          "absent keys (1000, 2000, 5000) are not found");
    check(h6.M > 17, "table grew beyond the initial capacity of 17");

    cout << passCnt << " passed, " << failCnt << " failed"
         << (failCnt ? "" : "  —  now run it under valgrind (must be clean)") << '\n';
    return failCnt ? 1 : 0;
}
#endif
