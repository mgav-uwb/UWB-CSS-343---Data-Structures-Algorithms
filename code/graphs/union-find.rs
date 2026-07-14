// Weighted quick-union with path compression. parent[i] = i's parent,
// size[i] = tree size (for union by size). Near-constant amortized per op.
struct UF {
    parent: Vec<usize>,
    size: Vec<usize>,
}
impl UF {
    fn new(n: usize) -> Self {
        UF { parent: (0..n).collect(), size: vec![1; n] }
    }
    fn find(&mut self, mut x: usize) -> usize {   // walk up, compressing
        while x != self.parent[x] {
            self.parent[x] = self.parent[self.parent[x]];  // path halving
            x = self.parent[x];
        }
        x
    }
    fn unite(&mut self, a: usize, b: usize) {     // union by size
        let (mut ra, mut rb) = (self.find(a), self.find(b));
        if ra == rb { return; }
        if self.size[ra] < self.size[rb] {
            std::mem::swap(&mut ra, &mut rb);          // smaller under larger
        }
        self.parent[rb] = ra;
        self.size[ra] += self.size[rb];
    }
    fn connected(&mut self, a: usize, b: usize) -> bool {
        self.find(a) == self.find(b)
    }
}
