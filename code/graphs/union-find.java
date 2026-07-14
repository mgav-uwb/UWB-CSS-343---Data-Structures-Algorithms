// Weighted quick-union with path compression. parent[i] = i's parent,
// size[i] = tree size (for union by size). Near-constant amortized per op.
class UF {
    int[] parent, size;
    UF(int n) {
        parent = new int[n];
        size = new int[n];
        for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
    }
    int find(int x) {                        // walk to the root, compressing
        while (x != parent[x]) {
            parent[x] = parent[parent[x]];    // path halving: point at grandparent
            x = parent[x];
        }
        return x;
    }
    void unite(int a, int b) {               // union by size: smaller under larger
        int ra = find(a), rb = find(b);
        if (ra == rb) return;
        if (size[ra] < size[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra;
        size[ra] += size[rb];
    }
    boolean connected(int a, int b) { return find(a) == find(b); }
}
