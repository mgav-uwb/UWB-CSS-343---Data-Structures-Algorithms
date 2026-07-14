# Weighted quick-union with path compression. parent[i] = i's parent,
# size[i] = tree size (for union by size). Near-constant amortized per op.
class UF:
    def __init__(self, n):
        self.parent = list(range(n))         # each element its own root
        self.size = [1] * n

    def find(self, x):                       # walk to the root, compressing
        while x != self.parent[x]:
            self.parent[x] = self.parent[self.parent[x]]  # path halving
            x = self.parent[x]
        return x

    def unite(self, a, b):                   # union by size: smaller under larger
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]

    def connected(self, a, b):
        return self.find(a) == self.find(b)
