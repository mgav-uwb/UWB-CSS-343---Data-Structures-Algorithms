# A BST node: key, value, two links, and a subtree-size count. get returns the
# value or None; put inserts, or updates the value on an equal key.
class Node:
    def __init__(self, key, val):
        self.key, self.val = key, val
        self.left = self.right = None
        self.size = 1                       # nodes in this subtree

def size(t):
    return t.size if t else 0               # null-safe

def get(t, key):
    if t is None:    return None            # miss: fell off a null link
    if key == t.key: return t.val           # hit
    return get(t.left, key) if key < t.key else get(t.right, key)

def put(t, key, val):
    if t is None:    return Node(key, val)  # grow at the null link
    if   key < t.key: t.left  = put(t.left,  key, val)
    elif key > t.key: t.right = put(t.right, key, val)
    else:             t.val = val           # equal key: update
    t.size = 1 + size(t.left) + size(t.right)   # recount on the way up
    return t
