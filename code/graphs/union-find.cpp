// Weighted quick-union with path compression. Two arrays: parent[i] (who i
// points to) and size[i] (tree size, for union by size). Near-constant per op.
struct UF {
    vector<int> parent, size;
    UF(int n) : parent(n), size(n, 1) {
        for (int i = 0; i < n; i++) parent[i] = i;   // each element its own root
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
        if (size[ra] < size[rb]) swap(ra, rb);
        parent[rb] = ra;                      // rb (smaller) hangs under ra
        size[ra] += size[rb];
    }
    bool connected(int a, int b) { return find(a) == find(b); }
};
