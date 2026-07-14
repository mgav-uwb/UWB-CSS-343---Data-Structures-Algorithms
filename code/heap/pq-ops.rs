// Priority-queue operations on a 1-based max-heap: a[0] unused, size n.
// insert appends then swims up; del_max swaps the root out then sinks. Each Theta(log n).
struct MaxHeap { a: Vec<i32>, n: usize }

impl MaxHeap {
    fn new() -> Self { MaxHeap { a: vec![0], n: 0 } }   // a[0] unused sentinel

    fn max(&self) -> i32 { self.a[1] }                  // the root -- Theta(1)

    fn insert(&mut self, x: i32) {
        self.a.push(x);                 // append at the end: tree stays complete
        self.n += 1;
        swim(&mut self.a, self.n);      // restore heap order up one path
    }
    fn del_max(&mut self) -> i32 {
        let top = self.a[1];            // the maximum, to be returned
        self.a.swap(1, self.n);         // move max to the end
        self.n -= 1;                    // shrink (old max parked past the end)
        sink(&mut self.a, 1, self.n);   // restore heap order down one path
        top
    }
}
