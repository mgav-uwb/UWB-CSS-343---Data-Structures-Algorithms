use std::collections::HashMap;

// Walk the finished trie once, building each leaf's root-to-leaf path
// (left = '0', right = '1'). Fills `code` for every leaf. O(n).
fn extract_codes(node: &Node, path: String, code: &mut HashMap<char, String>) {
    match (&node.left, &node.right) {
        (None, None) => { code.insert(node.sym.unwrap(), path); }   // a leaf
        _ => {
            if let Some(l) = &node.left  { extract_codes(l, format!("{path}0"), code); }
            if let Some(r) = &node.right { extract_codes(r, format!("{path}1"), code); }
        }
    }
}
