# R-way trie: each node has one child slot per alphabet character plus an
# is-word flag. Operations walk ONE character per step: Theta(L) for a key of
# length L, independent of how many keys are stored.
R = 26                                     # alphabet: lowercase a..z

class Node:
    def __init__(self):
        self.next = [None] * R             # one slot per possible character
        self.is_word = False

# search: follow next[c] for each character. Fall off -> absent; reach the
# end -> present iff the final node is word-marked (a path is NOT a key).
def search(t, key):
    for ch in key:
        c = ord(ch) - ord('a')
        if t.next[c] is None:              # fell off: no such path
            return False
        t = t.next[c]
    return t.is_word                       # path exists — is it a word?

# insert: the same walk, creating only the MISSING nodes; mark the last one.
def insert(t, key):
    for ch in key:
        c = ord(ch) - ord('a')
        if t.next[c] is None:              # create the missing suffix
            t.next[c] = Node()
        t = t.next[c]
    t.is_word = True                       # mark: a key ends here

# collect: emit every key stored in the subtree under t (DFS, in order).
def collect(t, path, out):
    if t.is_word:                          # a stored key ends here
        out.append(path)
    for c in range(R):
        if t.next[c] is not None:          # extend the path by this character
            collect(t.next[c], path + chr(ord('a') + c), out)

# keysWithPrefix (autocomplete): walk down the prefix, then collect the
# subtree below it. Theta(prefix length + output size).
def keys_with_prefix(t, prefix):
    for ch in prefix:                      # 1. walk down the prefix path
        c = ord(ch) - ord('a')
        if t.next[c] is None:              # no key has this prefix
            return []
        t = t.next[c]
    out = []
    collect(t, prefix, out)                # 2. gather the whole subtree below
    return out
