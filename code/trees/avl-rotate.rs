// AVL rotations over an owned-subtree link. Each re-hangs one parent/child pair,
// updates the two heights, and returns the new subtree root. O(1); the in-order
// sequence is unchanged. (Node has left, right: Link and height: i32.)
type Link = Option<Box<Node>>;

fn height(t: &Link) -> i32 { t.as_ref().map_or(-1, |n| n.height) }   // null: -1
fn fix(n: &mut Node) {                             // recompute from children
    n.height = 1 + height(&n.left).max(height(&n.right));
}
fn rotate_right(mut y: Box<Node>) -> Box<Node> {   // LL fix: left child x rises
    let mut x = y.left.take().unwrap();
    y.left = x.right.take();                        // B re-hangs under y
    fix(&mut y);                                    // y is now lower: fix first
    x.right = Some(y);
    fix(&mut x);
    x                                               // x is the new subtree root
}
fn rotate_left(mut x: Box<Node>) -> Box<Node> {    // RR fix: mirror of the above
    let mut y = x.right.take().unwrap();
    x.right = y.left.take();                        // B re-hangs under x
    fix(&mut x);
    y.left = Some(x);
    fix(&mut y);
    y
}
