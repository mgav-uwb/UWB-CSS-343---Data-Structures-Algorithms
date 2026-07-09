// sample_driver.cpp — MINIMAL example. It does NOT test every method.
// Copy this to driver.cpp and extend it: cover every public method of BOTH
// classes, with at least two types (int and string), and edge cases — including
// a deep-copy test (copy a list, mutate the original, check the copy is unchanged).
//
// Build:  g++ -std=c++17 sample_driver.cpp -o driver && ./driver

#include <iostream>
#include <string>
#include "NDLList.h"
#include "CDLList.h"
using namespace std;

template <class ListType>
void printList(const ListType& list) {
    cout << "[ ";
    for (int i = 0; i < list.size(); ++i) cout << list.retrieve(i) << " ";
    cout << "]\n";
}

// One block of tests, run on whatever list type is given.
template <class ListType, class T>
void runTests(const string& name, T a, T b, T c) {
    cout << "\n===== " << name << " =====\n";

    ListType list;
    cout << "isEmpty: " << boolalpha << list.isEmpty() << "  size: " << list.size() << "\n";

    list.insert(a, 0);          // at head
    list.insert(b, 1);
    list.insert(c, 1);          // into the middle
    cout << "after inserts: ";  printList(list);
    cout << "find(b): " << list.find(b) << "  retrieve(0): " << list.retrieve(0) << "\n";

    // TODO: test remove(), clear(), retrieve at boundaries, find-of-missing, ...

    // Deep-copy check (extend this):
    ListType copy(list);
    list.remove(a);
    cout << "original after remove: "; printList(list);
    cout << "copy (should be unchanged): "; printList(copy);
}

int main() {
    runTests<NDLList<int>>("NDLList<int>", 10, 20, 30);
    runTests<CDLList<int>>("CDLList<int>", 10, 20, 30);
    runTests<NDLList<string>>("NDLList<string>", string("a"), string("b"), string("c"));
    runTests<CDLList<string>>("CDLList<string>", string("a"), string("b"), string("c"));
    cout << "\n(Extend this driver — it does not test everything.)\n";
    return 0;
}
