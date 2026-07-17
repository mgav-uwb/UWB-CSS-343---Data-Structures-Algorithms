// R-way trie: each node has one child slot per alphabet character plus an
// is-word flag. Operations walk ONE character per step: O(L) for a key of
// length L, independent of how many keys are stored.
const R: usize = 26;                       // alphabet: lowercase a..z

struct Node {
    next: Vec<Option<Box<Node>>>,          // one slot per possible character
    is_word: bool,
}

fn new_node() -> Box<Node> {
    Box::new(Node { next: (0..R).map(|_| None).collect(), is_word: false })
}

// search: follow next[c] for each character. Fall off -> absent; reach the
// end -> present iff the final node is word-marked (a path is NOT a key).
fn search(mut t: &Node, key: &str) -> bool {
    for ch in key.bytes() {
        match &t.next[(ch - b'a') as usize] {
            None => return false,          // fell off: no such path
            Some(kid) => t = kid,
        }
    }
    t.is_word                              // path exists — is it a word?
}

// insert: the same walk, creating only the MISSING nodes; mark the last one.
fn insert(mut t: &mut Node, key: &str) {
    for ch in key.bytes() {
        let c = (ch - b'a') as usize;
        t = t.next[c].get_or_insert_with(new_node);   // create missing suffix
    }
    t.is_word = true;                      // mark: a key ends here
}

// collect: emit every key stored in the subtree under t (DFS, in order).
fn collect(t: &Node, path: &mut String, out: &mut Vec<String>) {
    if t.is_word {                         // a stored key ends here
        out.push(path.clone());
    }
    for c in 0..R {
        if let Some(kid) = &t.next[c] {
            path.push((b'a' + c as u8) as char);   // extend by this character
            collect(kid, path, out);
            path.pop();
        }
    }
}

// keysWithPrefix (autocomplete): walk down the prefix, then collect the
// subtree below it. O(prefix length + output size).
fn keys_with_prefix(mut t: &Node, prefix: &str) -> Vec<String> {
    for ch in prefix.bytes() {             // 1. walk down the prefix path
        match &t.next[(ch - b'a') as usize] {
            None => return vec![],         // no key has this prefix
            Some(kid) => t = kid,
        }
    }
    let mut out = Vec::new();
    collect(t, &mut prefix.to_string(), &mut out); // 2. gather the subtree
    out
}
