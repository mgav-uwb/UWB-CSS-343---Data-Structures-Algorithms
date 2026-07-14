# Hibbard deletion. 0/1-child: splice the lone child. 2-child: copy the
# in-order successor (min of the right subtree) up, then delete_min it out.
def delete_min(t):
    if t.left is None:
        return t.right                       # the min; spliced out here
    t.left = delete_min(t.left)
    t.size = 1 + size(t.left) + size(t.right)
    return t

def erase(t, key):
    if t is None:
        return None
    if   key < t.key: t.left  = erase(t.left,  key)
    elif key > t.key: t.right = erase(t.right, key)
    else:                                    # found the node to remove
        if t.left  is None: return t.right   # 0 or 1 child
        if t.right is None: return t.left
        s = t.right                          # in-order successor:
        while s.left: s = s.left             #   min of the right subtree
        t.key, t.val = s.key, s.val          # copy it up
        t.right = delete_min(t.right)        # remove the duplicate
    t.size = 1 + size(t.left) + size(t.right)
    return t
