// CSS 343 — ICA 02 · Part B: grid BFS (the maze traversal) — time & memory vs n
//
// We give you a working BFS that floods an n x n grid (the lecture's maze
// traversal, with no walls = every cell reachable). YOU add two instruments,
// then run the doubling experiment and plot the results.
//
//   TODO 1 (TIME):   increment  timeOps  once per neighbor you check
//                    (the line marked below). Total ≈ the running-time work.
//   TODO 2 (MEMORY): set  memBytes  = the visited array bytes + the peak
//                    queue bytes — the auxiliary space.
//
// Build & run (save the log):
//   g++ -std=c++17 -O2 grid_bfs_lab.cpp -o bfs && ./bfs > grid.csv
//
// Output columns: n , cells , time_ops , mem_bytes      (n = grid side; cells = n*n)

#include <cstdio>
#include <vector>
#include <queue>
#include <utility>
#include <algorithm>
using namespace std;

long long timeOps = 0;        // operations counter (TODO 1)

long long bfsGrid(int n) {
    vector<vector<char>> visited(n, vector<char>(n, 0));   // n*n bytes — the big one
    queue<pair<int,int>> frontier;
    frontier.push({0, 0}); visited[0][0] = 1;
    int peakQueue = 0;
    int dr[4] = {-1, 1, 0, 0}, dc[4] = {0, 0, -1, 1};

    while (!frontier.empty()) {
        peakQueue = max(peakQueue, (int)frontier.size());
        auto [r, c] = frontier.front(); frontier.pop();
        for (int d = 0; d < 4; d++) {
            // TODO 1: timeOps++;            // checked one neighbor
            int nr = r + dr[d], nc = c + dc[d];
            if (nr >= 0 && nr < n && nc >= 0 && nc < n && !visited[nr][nc]) {
                visited[nr][nc] = 1; frontier.push({nr, nc});
            }
        }
    }

    long long memBytes = 0;
    // TODO 2: memBytes = (long long)n * n * sizeof(char)                 // visited grid
    //                  + (long long)peakQueue * sizeof(pair<int,int>);   // peak queue
    return memBytes;
}

int main() {
    printf("n,cells,time_ops,mem_bytes\n");
    for (int n = 64; n <= 2048; n *= 2) {                  // DOUBLE the grid side each row
        timeOps = 0;
        long long mem = bfsGrid(n);
        printf("%d,%d,%lld,%lld\n", n, n * n, timeOps, mem);
    }
    return 0;
}
