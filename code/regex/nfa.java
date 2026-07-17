// Regex -> NFA (Sedgewick's one-state-per-character encoding) + set-of-states
// simulation. Syntax: letters, concatenation, | (one per group), *, ( ).
class NFA {
    final String re;              // wrapped regex: "(" + pattern + ")"
    final int m;                  // re.length(); state m is the accept state
    final List<List<Integer>> eps = new ArrayList<>();

    NFA(String pattern) {
        re = "(" + pattern + ")"; // implicit wrap anchors a top-level | or *
        m = re.length();
        for (int i = 0; i <= m; i++) eps.add(new ArrayList<>());
        Deque<Integer> ops = new ArrayDeque<>();  // '(' and '|' positions
        for (int i = 0; i < m; i++) {
            int lp = i;           // left end of the atom/group ending at i
            char c = re.charAt(i);
            if (c == '(' || c == '|') ops.push(i);
            else if (c == ')') {
                int orPos = ops.pop();
                if (re.charAt(orPos) == '|') {    // wire the alternation
                    lp = ops.pop();
                    eps.get(lp).add(orPos + 1);   // '(' skips into branch 2
                    eps.get(orPos).add(i);        // '|' skips to the ')'
                } else lp = orPos;                // plain group: lp = the '('
            }
            if (i < m - 1 && re.charAt(i + 1) == '*') {  // closure lp..i
                eps.get(lp).add(i + 1);           //   skip the operand
                eps.get(i + 1).add(lp);           //   repeat the operand
            }
            if (c == '(' || c == '*' || c == ')')
                eps.get(i).add(i + 1);            // fall through the meta char
        }
    }

    // e-closure(S): DFS over the e-digraph -- all states reachable for free
    Set<Integer> closure(Set<Integer> s) {
        Set<Integer> seen = new TreeSet<>(s);
        Deque<Integer> stack = new ArrayDeque<>(s);
        while (!stack.isEmpty()) {
            int u = stack.pop();
            for (int v : eps.get(u))
                if (seen.add(v)) stack.push(v);
        }
        return seen;
    }

    // does the NFA accept text? -- track the reachable-state set: O(mn)
    boolean matches(String text) {
        Set<Integer> pc = closure(new TreeSet<>(Set.of(0)));
        for (char c : text.toCharArray()) {
            Set<Integer> next = new TreeSet<>();
            for (int u : pc)                      // advance every letter state
                if (u < m && re.charAt(u) == c) next.add(u + 1);
            pc = closure(next);                   // then close over e-edges
            if (pc.isEmpty()) return false;       // dead: nothing can revive
        }
        return pc.contains(m);                    // accept state in final set?
    }
}
