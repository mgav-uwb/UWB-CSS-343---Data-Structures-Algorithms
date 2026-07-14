// Hibbard deletion. 0/1-child: splice the lone child. 2-child: copy the
// in-order successor (min of the right subtree) up, then delete_min it out.
fn delete_min(mut t: Box<Node>) -> Option<Box<Node>> {
    match t.left.take() {
        None => t.right.take(),                        // the min; dropped here
        Some(l) => {
            t.left = delete_min(l);
            t.size = 1 + size(&t.left) + size(&t.right);
            Some(t)
        }
    }
}
fn min_kv(t: &Box<Node>) -> (i64, String) {            // successor key + value
    let mut n = t;
    while let Some(l) = &n.left { n = l; }
    (n.key, n.val.clone())
}
fn erase(t: Option<Box<Node>>, key: i64) -> Option<Box<Node>> {
    let mut n = t?;                                     // None stays None
    if      key < n.key { n.left  = erase(n.left.take(),  key); }
    else if key > n.key { n.right = erase(n.right.take(), key); }
    else {                                             // found it
        if n.left.is_none()  { return n.right.take(); }    // 0 or 1 child
        if n.right.is_none() { return n.left.take(); }
        let (sk, sv) = min_kv(n.right.as_ref().unwrap());
        n.key = sk; n.val = sv;                        // copy successor up
        n.right = delete_min(n.right.take().unwrap()); // remove the duplicate
    }
    n.size = 1 + size(&n.left) + size(&n.right);
    Some(n)
}
