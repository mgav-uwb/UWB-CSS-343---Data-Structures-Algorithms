// doubling_compare.cpp — the DOUBLING EXPERIMENT (Part 4).
// For each list, run an operation for N = 1000, 2000, ... and print the time and
// the RATIO to the previous N. Read the order of growth off the ratio:
//   ratio -> 2  : linear (Θ(n))      ratio -> 4 : quadratic (Θ(n²))
// Both lists are Θ(n) for most ops — look for the CONSTANT-FACTOR difference, and
// for operations where they differ (e.g. inserting at the TAIL).
//
// Build:  g++ -std=c++17 -O2 doubling_compare.cpp -o compare && ./compare

#include <iostream>
#include <iomanip>
#include <string>
#include <chrono>
#include "NDLList.h"
#include "CDLList.h"
using namespace std;
using namespace std::chrono;

template <typename Func>
double timeIt(Func op) {
    auto t0 = steady_clock::now();
    op();
    auto t1 = steady_clock::now();
    return duration<double, milli>(t1 - t0).count();   // milliseconds
}

template <class ListType>
void doublingTest(const string& name) {
    cout << "\n=== " << name << " — insert at HEAD ===\n";
    cout << setw(8) << "N" << setw(12) << "time(ms)" << setw(9) << "ratio" << "\n";
    double prev = 0;
    for (int N = 1000; N <= 16000; N += N) {
        double ms = timeIt([&]() {
            ListType list;
            for (int i = 0; i < N; ++i) list.insert(0, 0);   // TODO: try index N (tail) too
        });
        cout << setw(8) << N << setw(12) << fixed << setprecision(2) << ms
             << setw(9) << (prev ? ms / prev : 0.0) << "\n";
        prev = ms;
    }
    // TODO: add a second experiment (e.g. tail insert, or retrieve(N/2) in a loop)
    // where NDLList and CDLList differ — and explain why in your report.
}

int main() {
    cout << "Doubling experiment — note the ratio, not the raw time.\n";
    doublingTest<NDLList<int>>("NDLList<int>");
    doublingTest<CDLList<int>>("CDLList<int>");
    return 0;
}
