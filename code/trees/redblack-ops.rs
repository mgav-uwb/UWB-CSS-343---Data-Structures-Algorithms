// Left-leaning red-black BST moves. `red` = colour of the link to the PARENT;
// a None link counts as black. Children are Option<Box<Node>>, so we take/put
// the boxes to move subtrees around without aliasing.
type Link = Option<Box<Node>>;
struct Node { key: i32, left: Link, right: Link, red: bool }

fn is_red(h: &Link) -> bool { h.as_ref().map_or(false, |n| n.red) }

fn rotate_left(mut h: Box<Node>) -> Box<Node> {   // right link leans red
    let mut x = h.right.take().unwrap();
    h.right = x.left.take();
    x.red = h.red;                 // x inherits h's colour
    h.red = true;                  // h is now glued under x by a red link
    x.left = Some(h);
    x                              // x is the new subtree root
}

fn rotate_right(mut h: Box<Node>) -> Box<Node> {  // mirror image
    let mut x = h.left.take().unwrap();
    h.left = x.right.take();
    x.red = h.red;
    h.red = true;
    x.right = Some(h);
    x
}

fn flip_colors(h: &mut Box<Node>) {               // two red children = 4-node
    h.red = !h.red;                               // push the middle key up
    if let Some(l) = h.left.as_mut() { l.red = !l.red; }
    if let Some(r) = h.right.as_mut() { r.red = !r.red; }
}
