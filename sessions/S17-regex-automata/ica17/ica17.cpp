// CSS 343 · ICA 17 — NFA simulation.  Fill in the TODOs, then run the application.
//
//   build:        g++ -std=c++17 -g -o ica17 ica17.cpp
//   run:          ./ica17
//
// The NFA struct, buildExample()/buildExample2() (fixed, hand-built NFAs for
// known regexes), and main() (a unit-test battery) are GIVEN — do not edit
// them. You implement epsClosure and simulate. States are 0..n-1; state n-1
// is the accept state. eps[s] holds s's epsilon-transitions (a plain digraph
// — DFS/BFS it). match[s] is the char that state s consumes to advance
// (hardwired) to state s+1, or 0 if s has none (an operator/accept state —
// it only has eps-edges, if any).
// Run early and often: the tests report [PASS]/[FAIL] one by one.

#include <iostream>
#include <vector>
#include <set>
#include <string>
using namespace std;

static const int MAX = 32;             // plenty of states for our examples

struct NFA {
    int n;                              // states 0..n-1 (n-1 is the accept state)
    vector<vector<int>> eps;            // eps[s] = epsilon-transitions from s
    char match[MAX];                    // match[s] = char s consumes to reach s+1, or 0
};

// ---- TODO 1 — epsClosure --------------------------------------------------
// The set of all states reachable from `states` by following zero or more
// eps-edges. This is a DFS/BFS over the eps digraph — include the input
// states themselves (zero edges is allowed) as well as everything you can
// reach from them.
set<int> epsClosure(const NFA& nfa, const set<int>& states) {
    // TODO — a DFS/BFS over nfa.eps, exactly like L08's graph reachability
    //        (L17 traces it on the A*B machine). One classic bug to avoid:
    //        expanding a state you've already expanded.
    return {};
}

// ---- TODO 2 — simulate -----------------------------------------------------
// Simulate the NFA on `text`: start in the eps-closure of {0}; for each char
// c, every active state s with match[s]==c advances (hardwired) to s+1 —
// collect those, then eps-close the result before reading the next char.
// Accept iff the accept state (n-1) is active after the last char.
bool simulate(const NFA& nfa, const string& text) {
    // TODO: set active = epsClosure(nfa, {0}). For each char c in text:
    //       build the set of s+1 for every s in `active` with nfa.match[s]==c,
    //       then reassign active = epsClosure(nfa, that set). After all
    //       chars, return whether active contains the accept state (n-1).
    return false;
}

// ==========================================================================
// EXAMPLE NFAs (given — hand-built via Sedgewick's regex→NFA construction,
// so every eps-edge below can be hand-verified against the regex).
// ==========================================================================

// ---- GIVEN — buildExample(): regex  A*B  ---------------------------------
// Regex string "A*B" (positions 0='A', 1='*', 2='B') plus a virtual accept
// state 3. n = 4, accept = state 3.
//   state 0: match 'A'                 eps[0] = {1}      (skip A: try B directly)
//   state 1: '*' operator, no match    eps[1] = {0, 2}   (loop back / fall through)
//   state 2: match 'B'                 eps[2] = {}
//   state 3: accept, no match
// epsClosure({0}) = {0,1,2} — from the start we may match 'A' (loop) or 'B'
// (zero reps of A*) right away.
NFA buildExample() {
    NFA nfa;
    nfa.n = 4;
    nfa.eps.assign(nfa.n, {});
    for (int i = 0; i < MAX; i++) nfa.match[i] = 0;
    nfa.eps[0] = {1};
    nfa.eps[1] = {0, 2};
    nfa.match[0] = 'A';
    nfa.match[2] = 'B';
    return nfa;
}

// ---- GIVEN — buildExample2(): regex  (A*B|AC)D  ---------------------------
// Regex string "(A*B|AC)D" (positions 0='(',1='A',2='*',3='B',4='|',5='A',
// 6='C',7=')',8='D') plus a virtual accept state 9. n = 10, accept = state 9.
//   state 0: '(' operator             eps[0] = {1, 5}   (into either branch)
//   state 1: match 'A'                eps[1] = {2}
//   state 2: '*' operator             eps[2] = {1, 3}   (loop back / fall through)
//   state 3: match 'B'                eps[3] = {}
//   state 4: '|' operator             eps[4] = {7}       (right branch → ')')
//   state 5: match 'A'                eps[5] = {}
//   state 6: match 'C'                eps[6] = {}
//   state 7: ')' operator             eps[7] = {8}
//   state 8: match 'D'                eps[8] = {}
//   state 9: accept, no match
// epsClosure({0}) = {0,1,2,3,5} — from the start we may begin the left
// branch (A*B, states 1..3) or the right branch (AC, state 5) right away.
NFA buildExample2() {
    NFA nfa;
    nfa.n = 10;
    nfa.eps.assign(nfa.n, {});
    for (int i = 0; i < MAX; i++) nfa.match[i] = 0;
    nfa.eps[0] = {1, 5};
    nfa.eps[1] = {2};
    nfa.eps[2] = {1, 3};
    nfa.eps[4] = {7};
    nfa.eps[7] = {8};
    nfa.match[1] = 'A';
    nfa.match[3] = 'B';
    nfa.match[5] = 'A';
    nfa.match[6] = 'C';
    nfa.match[8] = 'D';
    return nfa;
}

// ==========================================================================
// UNIT TESTS (given — do not edit).
// ==========================================================================
#ifndef ICA17_GRADER
static int passCnt = 0, failCnt = 0;
static void check(bool ok, const string& what) {
    (ok ? passCnt : failCnt)++;
    cout << (ok ? "  [PASS] " : "  [FAIL] ") << what << '\n';
}

int main() {
    cout << "T1 · epsClosure basics on A*B\n";
    NFA ab = buildExample();
    set<int> c0 = epsClosure(ab, {0});
    check(!c0.empty() && c0.size() == 3 && c0.count(0) && c0.count(1) && c0.count(2),
          "epsClosure({0}) on A*B is {0,1,2}");
    check(!c0.empty() && !c0.count(3), "closure does not (yet) include the accept state");
    set<int> c2 = epsClosure(ab, {2});
    check(!c2.empty() && c2.size() == 1 && c2.count(2),
          "epsClosure({2}) on A*B is just {2} (state 2 has no eps-edges)");

    cout << "T2 · simulate — A*B accepts B, AB, AAB, AAAB\n";
    check(simulate(ab, "B"), "\"B\" accepted (zero reps of A*)");
    check(simulate(ab, "AB"), "\"AB\" accepted");
    check(simulate(ab, "AAB"), "\"AAB\" accepted (the deck's worked trace)");
    check(simulate(ab, "AAAB"), "\"AAAB\" accepted");

    cout << "T3 · simulate — A*B rejects A, BA, AABB, AC\n";
    check(!simulate(ab, "A"), "\"A\" rejected (missing the B)");
    check(!simulate(ab, "BA"), "\"BA\" rejected (wrong order)");
    check(!simulate(ab, "AABB"), "\"AABB\" rejected (extra B)");
    check(!simulate(ab, "AC"), "\"AC\" rejected (dead set — C matches nothing)");

    cout << "T4 · simulate — A*B rejects the empty string\n";
    check(!simulate(ab, ""), "\"\" rejected (need at least a B)");

    cout << "T5 · simulate — a second NFA, (A*B|AC)D\n";
    NFA acd = buildExample2();
    check(simulate(acd, "BD"), "\"BD\" accepted (zero reps of A*, then D)");
    check(simulate(acd, "ABD"), "\"ABD\" accepted (left branch A*B, then D)");
    check(simulate(acd, "AAABD"), "\"AAABD\" accepted (left branch, 3 reps of A*)");
    check(simulate(acd, "ACD"), "\"ACD\" accepted (right branch AC, then D)");
    check(!simulate(acd, "AD"), "\"AD\" rejected (neither branch completes)");
    check(!simulate(acd, "AC"), "\"AC\" rejected (missing the final D)");
    check(!simulate(acd, "ABCD"), "\"ABCD\" rejected (not a valid branch)");
    check(!simulate(acd, ""), "\"\" rejected (need a full branch + D)");

    cout << passCnt << " passed, " << failCnt << " failed" << '\n';
    return failCnt ? 1 : 0;
}
#endif
