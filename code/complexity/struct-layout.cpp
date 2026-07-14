// Count the bytes: primitive sizes, and how field ORDER changes a struct's size.
// On a typical 64-bit machine. Compile: g++ -std=c++17 struct-layout.cpp
#include <cstddef>   // offsetof
#include <iostream>

struct Node { int data; Node* next; };      // 4 + 4 pad + 8  = 16
struct A    { char a; int b; char c; };      // 1 +3pad +4 +1 +3pad = 12
struct B    { int b; char a; char c; };      // 4 +1 +1 +2pad = 8  (large->small)

int main() {
    std::cout << "int="    << sizeof(int)    << " ptr=" << sizeof(void*)
              << " double="<< sizeof(double) << "\n";           // 4 8 8
    std::cout << "Node="   << sizeof(Node)                       // 16
              << " (next at offset " << offsetof(Node, next) << ")\n";  // 8
    std::cout << "A=" << sizeof(A) << "  B=" << sizeof(B) << "\n";      // 12  8
}
