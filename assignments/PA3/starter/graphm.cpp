// CSS 343 · PA3 — GraphM implementation SKELETON. Every method is a TODO.
#include "graphm.h"
#include <iomanip>

GraphM::GraphM() {}

int GraphM::buildGraph(ifstream& file) {
    // TODO: read n (fail -> -1); size the three tables (slot 0 unused, all
    //       adjM cells INF); getline n vertex names (they contain spaces);
    //       then read "from to cost" triples via insertEdge until a line
    //       starting with 0. LEAVE THE STREAM after that terminator line —
    //       the file may hold another graph.
    (void)file;
    return -1;
}

int GraphM::insertEdge(int from, int to, int cost) {
    // TODO: validate (1..size, no self-loop, cost >= 0) -> -1; set adjM
    (void)from; (void)to; (void)cost;
    return -1;
}

int GraphM::removeEdge(int from, int to) {
    // TODO: validate; reset the cell to INF
    (void)from; (void)to;
    return -1;
}

void GraphM::findShortestPath() {
    // TODO: for every source: reset pathM[src]; dist[src]=0; then size rounds
    //       of { linear-scan the nearest unsettled v; mark visited; relax
    //       every edge v->w, recording prev_node on improvement }.
    //       NOTE this is the O(V^2) variant — no priority queue anywhere.
}

int GraphM::getSize() const { return size; }

int GraphM::getDist(int from, int to) const {
    (void)from; (void)to;
    return INF;   // TODO (validate range; INF when unreachable)
}

string GraphM::getPath(int from, int to) const {
    (void)from; (void)to;
    return "";    // TODO: follow prev_node back from `to`, emit "1 3 2"
}

void GraphM::displayAllPaths() const {
    // TODO: match expected-output.txt exactly — header line, then per source:
    //       the vertex name, then one line per destination:
    //       "    " << setw(3) << s << setw(5) << t << setw(10) << dist << "  " << path
    //       (dist column shows --- when unreachable, and that line has no path)
}

void GraphM::displayPath(int src, int dest) const {
    // TODO: the same one-line format, then each path vertex's NAME on its own
    //       line, then a blank line (see expected-output.txt)
    (void)src; (void)dest;
}
