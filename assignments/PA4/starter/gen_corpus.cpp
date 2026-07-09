// CSS 343 · PA4 — benchmark corpus generator (GIVEN).
//   g++ -std=c++17 -O2 gen_corpus.cpp -o gen && ./gen
// Writes pairs bench_A_N.txt / bench_B_N.txt for N = 1000, 2000, 4000, 8000
// lines (fixed seed): B is A with ~5% of lines edited, ~2% deleted, ~2%
// inserted — realistic diff inputs for your doubling table. Also writes the
// big_A/big_B pair (30,000 lines) that ONLY --stat can survive: the full
// table would be ~3.6 GB — the rolling rows use ~240 KB. That is the mode's point.
#include <fstream>
#include <string>
#include <vector>
using namespace std;

static unsigned s = 4343;
static unsigned rnd() { s = s * 1103515245u + 12345u; return s >> 16; }
static string word() {
    static const char* W[] = {"alpha","bravo","china","delta","echo","fox",
        "golf","hotel","india","jazz","kilo","lima","mike","nova","oscar","papa"};
    return W[rnd() % 16];
}
static string line() {
    string t;
    int n = 4 + rnd() % 8;
    for (int i = 0; i < n; i++) t += (i ? " " : "") + word();
    return t;
}
static void writePair(const string& tag, int n) {
    vector<string> A;
    for (int i = 0; i < n; i++) A.push_back(line());
    ofstream fa(tag + "_A_" + to_string(n) + ".txt");
    for (auto& l : A) fa << l << '\n';
    ofstream fb(tag + "_B_" + to_string(n) + ".txt");
    for (auto& l : A) {
        unsigned r = rnd() % 100;
        if (r < 2) continue;                       // delete
        if (r < 4) fb << line() << '\n';           // insert before
        if (r < 9 && r >= 4) fb << l << " " << word() << '\n';   // edit
        else fb << l << '\n';
    }
}
int main() {
    for (int n : {1000, 2000, 4000, 8000}) writePair("bench", n);
    writePair("big", 30000);
    return 0;
}
