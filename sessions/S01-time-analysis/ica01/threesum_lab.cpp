// CSS 343 — ICA 01: the doubling experiment
//
// TASK: instrument the 3-sum algorithm so we can SEE its order of growth.
//   1. In count3(), increment `ops` once each time the inner loop body runs.
//   2. Build & run; the doubling test prints N, operations, and the ratio.
//   3. Confirm the ratio approaches 8. Predict operations at N = 16000.
//
// Build & run:
//   g++ -std=c++17 -O2 threesum_lab.cpp -o threesum_lab && ./threesum_lab
//
// Submit: this file (counting correct) + one sentence: what order of growth,
// and how the ratio shows it.

#include <cstdio>
#include <vector>
#include <random>
using namespace std;

// Count triples (i<j<k) with a[i]+a[j]+a[k] == 0.
// TODO: increment `ops` once per inner-loop iteration (the if-test).
long count3(const vector<int>& a, long long& ops) {
    int N = (int)a.size();
    long cnt = 0;
    for (int i = 0; i < N; i++)
        for (int j = i + 1; j < N; j++)
            for (int k = j + 1; k < N; k++) {
                // ops++;                          // <-- your one line here
                if (a[i] + a[j] + a[k] == 0)
                    cnt++;
            }
    return cnt;
}

// ===== doubling-test harness — do not edit below this line =====
int main() {
    mt19937 rng(343);
    uniform_int_distribution<int> dist(-1000000, 1000000);
    printf("%6s %14s %7s\n", "N", "operations", "ratio");
    long long prev = 0;
    for (int N = 250; N <= 2000; N += N) {
        vector<int> a(N);
        for (int& x : a) x = dist(rng);
        long long ops = 0;
        count3(a, ops);
        double ratio = prev ? (double)ops / prev : 0.0;
        printf("%6d %14lld %7.2f\n", N, ops, ratio);
        prev = ops;
    }
    // QUESTION (answer in one sentence in your submission):
    //   What order of growth do these numbers show, and which column proves it?
    return 0;
}
