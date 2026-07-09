// CSS 343 · PA3 — GraphM SPECIFICATION.
// Adjacency-MATRIX graph with ALL-PAIRS Dijkstra — the O(V^2) LINEAR-SCAN
// variant (no priority queue; that's the point — you built the heap version
// in ICA 09, and Part 4 races the two). Path reconstruction via prev_node.
// Vertices are 1-indexed; row/column 0 is unused to match the file format.
// The public surface is FIXED (the given driver and our grading driver
// compile against it); add private helpers as needed.
#ifndef GRAPHM_H
#define GRAPHM_H
#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

const int INF = 1000000000;          // "no edge / unknown distance" sentinel

struct TableType {
    bool visited = false;            // settled by Dijkstra?
    int  dist    = INF;              // best distance from the row's source so far
    int  prev_node = 0;              // predecessor on that best path (0 = none)
};

class GraphM {
public:
    GraphM();
    int  buildGraph(ifstream& file);            // 1 on success, -1 on failure
    int  insertEdge(int from, int to, int cost);// 1 / -1 (validates range, cost, self-loop)
    int  removeEdge(int from, int to);          // 1 / -1
    void findShortestPath();                    // all-pairs: Dijkstra from every source
    void displayAllPaths() const;
    void displayPath(int src, int dest) const;
    int  getSize() const;
    int  getDist(int from, int to) const;       // INF if unreachable (grader/driver friendly)
    string getPath(int from, int to) const;     // "1 3 2" (space-separated), "" if none

private:
    vector<string> vertices;                    // [1..size]
    vector<vector<int>> adjM;                   // [1..size][1..size], INF = no edge
    vector<vector<TableType>> pathM;            // pathM[src][v]
    int size = 0;
    // TODO: declare your helpers (path reconstruction wants a recursive one)
};
#endif
