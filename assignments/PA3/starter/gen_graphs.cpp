// CSS 343 · PA3 — Part 4 graph generator (GIVEN).
//   g++ -std=c++17 -O2 gen_graphs.cpp -o gen && ./gen
// Writes dense_V.txt and sparse_V.txt for V = 200, 400, 800, 1600 in the PA3
// file format (fixed seed — everyone measures the same graphs):
//   dense:  every ordered pair gets an edge with probability 1/2  (E ~ V^2/2)
//   sparse: 4 out-edges per vertex                                 (E ~ 4V)
// Race your two Dijkstras over these: GraphM's O(V^2) scan (all-pairs) vs
// your ICA 09 heap version looped over every source. Doubling table per
// family; the crossover is the report's centerpiece.
#include <fstream>
#include <string>
using namespace std;

int main() {
    unsigned s = 343;
    auto rnd = [&]() { s = s * 1103515245u + 12345u; return (s >> 16) % 32768u; };
    for (int V : {200, 400, 800, 1600}) {
        for (int dense = 0; dense < 2; dense++) {
            ofstream f((dense ? "dense_" : "sparse_") + to_string(V) + ".txt");
            f << V << '\n';
            for (int i = 1; i <= V; i++) f << "v" << i << '\n';
            if (dense) {
                for (int u = 1; u <= V; u++)
                    for (int v = 1; v <= V; v++)
                        if (u != v && rnd() % 2 == 0)
                            f << u << ' ' << v << ' ' << (1 + rnd() % 99) << '\n';
            } else {
                for (int u = 1; u <= V; u++)
                    for (int k = 0; k < 4; k++) {
                        int v = 1 + (int)(rnd() % V);
                        if (v != u) f << u << ' ' << v << ' ' << (1 + rnd() % 99) << '\n';
                    }
            }
            f << "0 0 0\n";
        }
    }
    return 0;
}
