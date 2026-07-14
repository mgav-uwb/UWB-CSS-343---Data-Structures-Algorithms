// AVL insert over an owned link: descend like a plain BST, then rebalance on the
// way back up. The balance factor bf = height(left) - height(right); positive
// means left-heavy. take() moves a child out so it can be rotated and put back.
fn bf(n: &Node) -> i32 { height(&n.left) - height(&n.right) }

fn rebalance(mut t: Box<Node>) -> Box<Node> {
    fix(&mut t);
    if bf(&t) > 1 {                                    // left-heavy: LL or LR
        if bf(t.left.as_ref().unwrap()) < 0 {         // LR: straighten first
            t.left = Some(rotate_left(t.left.take().unwrap()));
        }
        return rotate_right(t);                        // now a plain LL
    }
    if bf(&t) < -1 {                                   // right-heavy: RR or RL
        if bf(t.right.as_ref().unwrap()) > 0 {        // RL: straighten first
            t.right = Some(rotate_right(t.right.take().unwrap()));
        }
        return rotate_left(t);                         // now a plain RR
    }
    t                                                  // |bf| <= 1: balanced
}
fn insert(t: Link, key: i32) -> Link {
    match t {
        None => Some(Box::new(Node::new(key))),        // new leaf, height 0
        Some(mut n) => {
            if key < n.key { n.left = insert(n.left.take(), key); }
            else if key > n.key { n.right = insert(n.right.take(), key); }
            else { return Some(n); }                   // duplicate key
            Some(rebalance(n))                          // rotate on the way up
        }
    }
}
