// CSS 343 · PA3 — GraphL implementation SKELETON. Every method is a TODO.
#include "graphl.h"
#include <stack>
#include <queue>

GraphL::GraphL() {}

GraphL::~GraphL() {
    // TODO: delete every EdgeNode in every list, then the node array.
    //       valgrind must report zero leaks after the driver runs.
}

int GraphL::buildGraph(ifstream& file) {
    // TODO: free any current graph first (buildGraph may be called again);
    //       read n, allocate nodeArray[n+1], getline the names; read edge
    //       triples until the 0 line, IGNORING the weight, inserting each
    //       EdgeNode AT THE HEAD of its list.
    (void)file;
    return -1;
}

int GraphL::getSize() const { return size; }

string GraphL::edgeList(int nodeId) const {
    (void)nodeId;
    return "";    // TODO: adjacent ids in list order, space-separated
}

int GraphL::displayGraph() const {
    // TODO: "Graph:" then per node: "Node i      name" and one
    //       "  edge i j" line per EdgeNode, in list order (see expected-output.txt)
    return -1;
}

string GraphL::DFSorder(int start) {
    // TODO: ITERATIVE with an explicit stack — push start; pop u (skip if
    //       visited), visit it, push u's neighbors in list order. Recursion
    //       is not accepted here.
    (void)start;
    return "";
}

string GraphL::BFSorder(int start) {
    // TODO: queue; mark visited when you ENQUEUE (not dequeue).
    (void)start;
    return "";
}
