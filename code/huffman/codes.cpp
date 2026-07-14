// Walk the finished trie once, building each leaf's root-to-leaf path
// (left = '0', right = '1'). Fills code[sym] for every symbol. O(n).
void extractCodes(Node* node, string path,
                  unordered_map<char, string>& code) {
    if (!node) return;
    if (!node->left && !node->right) {         // a leaf: record its code
        code[node->sym] = path;
        return;
    }
    extractCodes(node->left,  path + "0", code);
    extractCodes(node->right, path + "1", code);
}
