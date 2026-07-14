// A BST node with a subtree-size count. Links are Option<Box<Node>>, so the
// tree owns its children and drops them automatically (no manual free).
struct Node {
    key: i64, val: String,
    left: Option<Box<Node>>, right: Option<Box<Node>>,
    size: usize,
}
fn size(t: &Option<Box<Node>>) -> usize { t.as_ref().map_or(0, |n| n.size) }

fn get<'a>(t: &'a Option<Box<Node>>, key: i64) -> Option<&'a str> {
    match t {
        None => None,                               // miss: null link
        Some(n) if key == n.key => Some(&n.val),    // hit
        Some(n) if key <  n.key => get(&n.left, key),
        Some(n) => get(&n.right, key),
    }
}
fn put(t: Option<Box<Node>>, key: i64, val: String) -> Option<Box<Node>> {
    let mut n = match t {
        None => return Some(Box::new(               // grow at the null link
            Node { key, val, left: None, right: None, size: 1 })),
        Some(n) => n,
    };
    if      key < n.key { n.left  = put(n.left.take(),  key, val); }
    else if key > n.key { n.right = put(n.right.take(), key, val); }
    else { n.val = val; }                           // equal key: update
    n.size = 1 + size(&n.left) + size(&n.right);
    Some(n)
}
