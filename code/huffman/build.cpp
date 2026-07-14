// A Huffman tree node. Leaves carry a symbol; internal nodes just a frequency.
struct Node {
    long freq; char sym;            // sym is '\0' for internal nodes
    Node *left, *right;
};

// Build the Huffman tree: repeatedly merge the two lowest-frequency nodes. A
// min-heap of Node* keyed by frequency answers "the two smallest" in O(log n).
Node* buildHuffman(const vector<pair<char,long>>& freqs) {
    auto cmp = [](Node* a, Node* b) { return a->freq > b->freq; };  // min-heap
    priority_queue<Node*, vector<Node*>, decltype(cmp)> pq(cmp);
    for (auto [sym, f] : freqs)
        pq.push(new Node{f, sym, nullptr, nullptr});
    while (pq.size() > 1) {
        Node* x = pq.top(); pq.pop();          // two smallest frequencies
        Node* y = pq.top(); pq.pop();
        pq.push(new Node{x->freq + y->freq, '\0', x, y});   // merge under a parent
    }
    return pq.top();                           // the single remaining root
}
