# AVL rotations. Each re-hangs one parent/child pair, updates the two heights,
# and returns the new subtree root. O(1); the in-order sequence is unchanged.
def height(t):                 # null (None) has height -1
    return t.height if t else -1

def fix(t):                    # recompute this node's height from its children
    t.height = 1 + max(height(t.left), height(t.right))

def rotate_right(y):           # LL fix: left child x rises, y sinks
    x = y.left
    y.left = x.right           # B (keys between x and y) re-hangs under y
    x.right = y
    fix(y); fix(x)             # y is now lower, so fix its height first
    return x                   # x is the new subtree root

def rotate_left(x):            # RR fix: the mirror of rotate_right
    y = x.right
    x.right = y.left           # B re-hangs under x
    y.left = x
    fix(x); fix(y)
    return y
