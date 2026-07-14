// Walk the finished trie once, building each leaf's root-to-leaf path
// (left = '0', right = '1'). Fills code[sym] for every symbol. O(n).
void extractCodes(Node node, String path, Map<Character, String> code) {
    if (node == null) return;
    if (node.left == null && node.right == null) {   // a leaf: record its code
        code.put(node.sym, path);
        return;
    }
    extractCodes(node.left,  path + "0", code);
    extractCodes(node.right, path + "1", code);
}
