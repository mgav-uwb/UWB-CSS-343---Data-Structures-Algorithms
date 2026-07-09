// CSS 343 · PA4 — implementation SKELETON. fileLines is given; the four
// graded functions are TODOs. Port your ICA 14 lcs and ICA 15 editDistance
// thinking — the DP is the same, the keys change (lines instead of chars).
#include "diff.h"
#include <algorithm>

// ---- GIVEN — read a stream into lines (do not change) ----------------------
vector<string> fileLines(istream& in) {
    vector<string> v;
    string s;
    while (getline(in, s)) v.push_back(s);
    return v;
}

long lcsLines(const vector<string>& a, const vector<string>& b) {
    // TODO: the LCS VALUE only, with TWO ROLLING ROWS — O(min(n,m)) memory.
    //       This must work on files whose full n×m table would not fit
    //       (the --stat mode and the grader both count on it).
    (void)a; (void)b;
    return 0;
}

vector<Edit> diffLines(const vector<string>& a, const vector<string>& b) {
    // TODO: 1) strip the common PREFIX and SUFFIX (they become ' ' edits —
    //          this is what keeps real inputs inside the n*m budget);
    //       2) full LCS table over what remains;
    //       3) TRACEBACK into an edit script. Convention: within a changed
    //          run, '-' lines come before '+' lines (mind that a backward
    //          walk reverses your tie-break!).
    (void)a; (void)b;
    return {};
}

string unifiedDiff(const vector<string>& a, const vector<string>& b, int context) {
    // TODO: group the edit script into hunks — runs of changes plus `context`
    //       common lines on each side — headed "@@ -start,count +start,count @@".
    //       Prefix each body line with ' ', '-' or '+'. "" if identical.
    //       Check yourself against expected-unified.txt.
    (void)a; (void)b; (void)context;
    return "";
}

string markLine(const string& a, const string& b) {
    // TODO: the SAME DP one level down — characters instead of lines. Render
    //       the traceback as wdiff markup: [-deleted-] and {+inserted+},
    //       merging consecutive same-op characters into one bracket pair.
    (void)a; (void)b;
    return "";
}
