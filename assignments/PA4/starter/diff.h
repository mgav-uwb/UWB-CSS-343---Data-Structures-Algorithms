// CSS 343 · PA4 — mydiff SPECIFICATION.
// You are building the tool git runs: a line-oriented diff, on the course's
// DP toolkit. The four functions below are the graded surface (the given
// mydiff.cpp CLI and our grading driver compile against exactly this):
//   lcsLines  — LCS LENGTH only, rolling two-row table (huge files OK)
//   diffLines — full edit script via table + traceback (needs the full table)
//   unifiedDiff — hunk-formatted output ("@@ -l,c +l,c @@")
//   markLine  — within-line refinement: char-level DP, wdiff-style markers
#ifndef DIFF_H
#define DIFF_H
#include <iostream>
#include <string>
#include <vector>
using namespace std;

struct Edit {
    char   op;       // ' ' common to both · '-' only in A · '+' only in B
    string line;
};

vector<string> fileLines(istream& in);                 // GIVEN (in diff.cpp)

// LCS LENGTH of two line sequences using O(min-side) memory (two rolling rows).
// Must handle inputs where the full n×m table would not fit in memory.
long lcsLines(const vector<string>& a, const vector<string>& b);

// Full edit script: common prefix/suffix are TRIMMED before the table is
// built (they re-enter the script as ' ' edits), then LCS table + traceback.
// Tie-break: within a changed run, deletions ('-') come before insertions
// ('+') — the diff convention. May assume trimmed sizes satisfy
// n*m <= 25,000,000 (the CLI's trimming keeps real inputs inside that).
vector<Edit> diffLines(const vector<string>& a, const vector<string>& b);

// Unified format over the edit script: hunks of consecutive changes with
// `context` common lines around them, each headed "@@ -s,c +s,c @@".
// Line prefixes: ' ' / '-' / '+'. Empty string if the files are identical.
string unifiedDiff(const vector<string>& a, const vector<string>& b, int context = 3);

// Within-line refinement: character-level DP between one A-line and one
// B-line; returns wdiff-style markup — deletions wrapped [-…-], insertions
// wrapped {+…+}. Stripping every {+…+} and unwrapping [-…-] yields A's line;
// the opposite yields B's line.
string markLine(const string& a, const string& b);
#endif
