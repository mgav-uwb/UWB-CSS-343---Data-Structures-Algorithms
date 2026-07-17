# Regex -> NFA (Sedgewick's one-state-per-character encoding) + set-of-states
# simulation. Syntax: letters, concatenation, | (one per group), *, ( ).
class NFA:
    def __init__(self, pattern):
        self.re = "(" + pattern + ")"   # implicit wrap anchors top-level | or *
        self.m = len(self.re)           # state m is the accept state
        self.eps = [[] for _ in range(self.m + 1)]
        ops = []                        # stack of '(' and '|' positions
        for i, c in enumerate(self.re):
            lp = i                      # left end of the atom/group ending at i
            if c in "(|":
                ops.append(i)
            elif c == ")":
                orpos = ops.pop()
                if self.re[orpos] == "|":          # wire the alternation
                    lp = ops.pop()
                    self.eps[lp].append(orpos + 1) # '(' skips into branch 2
                    self.eps[orpos].append(i)      # '|' skips to the ')'
                else:
                    lp = orpos                     # plain group: lp = the '('
            if i < self.m - 1 and self.re[i + 1] == "*":   # closure lp..i
                self.eps[lp].append(i + 1)         # skip the operand
                self.eps[i + 1].append(lp)         # repeat the operand
            if c in "(*)":
                self.eps[i].append(i + 1)          # fall through the meta char

    def closure(self, s):
        """e-closure(S): DFS over the e-digraph -- all states reachable free."""
        seen, stack = set(s), list(s)
        while stack:
            u = stack.pop()
            for v in self.eps[u]:
                if v not in seen:
                    seen.add(v)
                    stack.append(v)
        return seen

    def matches(self, text):
        """Does the NFA accept text? Track the reachable-state set: O(mn)."""
        pc = self.closure({0})                     # states reachable on ""
        for c in text:
            nxt = {u + 1 for u in pc               # advance every letter state
                   if u < self.m and self.re[u] == c}
            pc = self.closure(nxt)                 # then close over e-edges
            if not pc:
                return False                       # dead: nothing can revive
        return self.m in pc                        # accept state in final set?
