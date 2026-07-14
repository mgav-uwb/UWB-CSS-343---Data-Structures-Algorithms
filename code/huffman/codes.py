# Walk the finished trie once, building each leaf's root-to-leaf path
# (left = "0", right = "1"). Returns {sym: code}. O(n).
def extract_codes(node, path="", code=None):
    if code is None:
        code = {}
    if node.left is None and node.right is None:     # a leaf: record its code
        code[node.sym] = path
        return code
    extract_codes(node.left,  path + "0", code)
    extract_codes(node.right, path + "1", code)
    return code
