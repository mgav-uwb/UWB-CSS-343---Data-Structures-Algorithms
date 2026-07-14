use std::collections::BinaryHeap;
use std::cmp::Ordering;

// A Huffman tree node. Leaves carry a symbol; internal nodes have sym = None.
struct Node {
    freq: u64,
    sym: Option<char>,
    left: Option<Box<Node>>,
    right: Option<Box<Node>>,
}
// Order by frequency, REVERSED so BinaryHeap (a max-heap) yields the smallest.
impl Ord for Node {
    fn cmp(&self, other: &Self) -> Ordering { other.freq.cmp(&self.freq) }
}
impl PartialOrd for Node {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> { Some(self.cmp(other)) }
}
impl PartialEq for Node { fn eq(&self, o: &Self) -> bool { self.freq == o.freq } }
impl Eq for Node {}

fn build_huffman(freqs: &[(char, u64)]) -> Node {
    let mut pq: BinaryHeap<Node> = freqs.iter()
        .map(|&(sym, freq)| Node { freq, sym: Some(sym), left: None, right: None })
        .collect();
    while pq.len() > 1 {
        let x = pq.pop().unwrap();            // two smallest frequencies
        let y = pq.pop().unwrap();
        pq.push(Node {                        // merge under a new parent
            freq: x.freq + y.freq, sym: None,
            left: Some(Box::new(x)), right: Some(Box::new(y)),
        });
    }
    pq.pop().unwrap()                         // the single remaining root
}
