# Left-leaning red-black BST: the three constant-time moves. A node's `red`
# flag = the colour of the link to its PARENT; a missing link counts as black.
class Node:
    def __init__(self, key):
        self.key = key
        self.left = self.right = None
        self.red = True

def is_red(h):                       # None links are black
    return h is not None and h.red

def rotate_left(h):                  # right link leans red -> lean it left
    x = h.right
    h.right = x.left
    x.left = h
    x.red, h.red = h.red, True       # x inherits h's colour; h turns red
    return x                         # x is the new subtree root

def rotate_right(h):                 # mirror image of rotate_left
    x = h.left
    h.left = x.right
    x.right = h
    x.red, h.red = h.red, True
    return x

def flip_colors(h):                  # two red children = a temporary 4-node
    h.red = not h.red                # push the middle key UP (h "promotes")
    h.left.red = not h.left.red      # children become black 2-nodes
    h.right.red = not h.right.red
