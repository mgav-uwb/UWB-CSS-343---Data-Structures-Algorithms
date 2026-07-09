// CSS 343 — ICA 02 · Part A: mergesort — time & memory vs N
//
// We give you a working mergesort. YOU add two instruments, then run the
// doubling experiment and plot the results.
//
//   TODO 1 (TIME):   increment  timeOps  once for every element placed into tmp
//                    (the 3 lines marked below). Total ≈ the running-time work.
//   TODO 2 (MEMORY): set  peakBufBytes  to the largest merge buffer ever live
//                    (in bytes) — the auxiliary space.
//
// Build & run (save the log):
//   g++ -std=c++17 -O2 mergesort_lab.cpp -o ms && ./ms > mergesort.csv
//
// Output columns: N , time_ops , mem_bytes

#include <cstdio>
#include <vector>
#include <random>
#include <algorithm>
using namespace std;

long long timeOps      = 0;   // operations counter  (TODO 1)
long long peakBufBytes = 0;   // peak auxiliary bytes (TODO 2)

void merge(vector<int>& a, int lo, int mid, int hi) {
    vector<int> tmp(hi - lo + 1);                         // the O(N) scratch buffer
    // TODO 2: peakBufBytes = max(peakBufBytes, (long long)(tmp.size() * sizeof(int)));

    int i = lo, j = mid + 1, k = 0;
    while (i <= mid && j <= hi) {
        // TODO 1: timeOps++;
        tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
    }
    while (i <= mid) {
        // TODO 1: timeOps++;
        tmp[k++] = a[i++];
    }
    while (j <= hi) {
        // TODO 1: timeOps++;
        tmp[k++] = a[j++];
    }

    for (k = 0; k < (int)tmp.size(); k++) a[lo + k] = tmp[k];
}

void mergesort(vector<int>& a, int lo, int hi) {
    if (lo >= hi) return;
    int mid = (lo + hi) / 2;
    mergesort(a, lo, mid);
    mergesort(a, mid + 1, hi);
    merge(a, lo, mid, hi);
}

int main() {
    mt19937 rng(12345);                                  // fixed seed → reproducible
    printf("N,time_ops,mem_bytes\n");
    for (int N = 1000; N <= 256000; N *= 2) {            // DOUBLE N each row
        vector<int> a(N);
        for (int i = 0; i < N; i++) a[i] = (int)(rng() % 1000000);
        timeOps = 0; peakBufBytes = 0;
        mergesort(a, 0, N - 1);
        printf("%d,%lld,%lld\n", N, timeOps, peakBufBytes);
    }
    return 0;
}
