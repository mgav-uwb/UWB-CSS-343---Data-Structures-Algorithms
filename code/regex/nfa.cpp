// Regex -> NFA (Sedgewick's one-state-per-character encoding) + set-of-states
// simulation. Syntax: letters, concatenation, | (one per group), *, ( ).
struct NFA {
    string re;                    // wrapped regex: "(" + pattern + ")"
    int m;                        // re.length(); state m is the accept state
    vector<vector<int>> eps;      // eps[u] = the e-edge out-neighbors of u

    NFA(const string& pattern) {
        re = "(" + pattern + ")"; // implicit wrap anchors a top-level | or *
        m = re.size();
        eps.assign(m + 1, {});
        vector<int> ops;          // stack of '(' and '|' positions
        for (int i = 0; i < m; i++) {
            int lp = i;           // left end of the atom/group ending at i
            if (re[i] == '(' || re[i] == '|') ops.push_back(i);
            else if (re[i] == ')') {
                int orPos = ops.back(); ops.pop_back();
                if (re[orPos] == '|') {           // wire the alternation
                    lp = ops.back(); ops.pop_back();
                    eps[lp].push_back(orPos + 1); // '(' skips into branch 2
                    eps[orPos].push_back(i);      // '|' skips to the ')'
                } else lp = orPos;                // plain group: lp = the '('
            }
            if (i < m - 1 && re[i + 1] == '*') {  // closure around lp..i
                eps[lp].push_back(i + 1);         //   skip the operand
                eps[i + 1].push_back(lp);         //   repeat the operand
            }
            if (re[i] == '(' || re[i] == '*' || re[i] == ')')
                eps[i].push_back(i + 1);          // fall through the meta char
        }
    }

    // e-closure(S): DFS over the e-digraph -- all states reachable for free
    set<int> closure(const set<int>& s) const {
        set<int> seen = s;
        vector<int> stack(s.begin(), s.end());
        while (!stack.empty()) {
            int u = stack.back(); stack.pop_back();
            for (int v : eps[u])
                if (seen.insert(v).second) stack.push_back(v);
        }
        return seen;
    }

    // does the NFA accept text? -- track the reachable-state set: O(mn)
    bool matches(const string& text) const {
        set<int> pc = closure({0});               // states reachable on ""
        for (char c : text) {
            set<int> next;
            for (int u : pc)                      // advance every letter state
                if (u < m && re[u] == c) next.insert(u + 1);
            pc = closure(next);                   // then close over e-edges
            if (pc.empty()) return false;         // dead: nothing can revive
        }
        return pc.count(m) > 0;                   // accept state in final set?
    }
};
