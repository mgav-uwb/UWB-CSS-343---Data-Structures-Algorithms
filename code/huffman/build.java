// A Huffman tree node. Leaves carry a symbol; internal nodes have sym = 0.
class Node {
    long freq; char sym;
    Node left, right;
    Node(long f, char s, Node l, Node r) { freq = f; sym = s; left = l; right = r; }
}

// Build the Huffman tree: merge the two lowest-frequency nodes until one remains.
Node buildHuffman(Map<Character, Long> freqs) {
    PriorityQueue<Node> pq =
        new PriorityQueue<>((a, b) -> Long.compare(a.freq, b.freq));  // min-heap
    for (var e : freqs.entrySet())
        pq.add(new Node(e.getValue(), e.getKey(), null, null));
    while (pq.size() > 1) {
        Node x = pq.poll();                    // two smallest frequencies
        Node y = pq.poll();
        pq.add(new Node(x.freq + y.freq, '\0', x, y));   // merge under a parent
    }
    return pq.peek();                          // the single remaining root
}
