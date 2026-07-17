// Regex -> NFA (Sedgewick's one-state-per-character encoding) + set-of-states
// simulation. Syntax: letters, concatenation, | (one per group), *, ( ).
struct Nfa {
    re: Vec<char>,           // wrapped regex: "(" + pattern + ")"
    m: usize,                // re.len(); state m is the accept state
    eps: Vec<Vec<usize>>,    // eps[u] = the e-edge out-neighbors of u
}

impl Nfa {
    fn new(pattern: &str) -> Nfa {
        let re: Vec<char> = format!("({})", pattern).chars().collect();
        let m = re.len();
        let mut eps = vec![Vec::new(); m + 1];
        let mut ops: Vec<usize> = Vec::new();   // '(' and '|' positions
        for i in 0..m {
            let mut lp = i;  // left end of the atom/group ending at i
            match re[i] {
                '(' | '|' => ops.push(i),
                ')' => {
                    let or = ops.pop().unwrap();
                    if re[or] == '|' {           // wire the alternation
                        lp = ops.pop().unwrap();
                        eps[lp].push(or + 1);    // '(' skips into branch 2
                        eps[or].push(i);         // '|' skips to the ')'
                    } else { lp = or; }          // plain group: lp = the '('
                }
                _ => {}
            }
            if i + 1 < m && re[i + 1] == '*' {   // closure around lp..i
                eps[lp].push(i + 1);             //   skip the operand
                eps[i + 1].push(lp);             //   repeat the operand
            }
            if matches!(re[i], '(' | '*' | ')') {
                eps[i].push(i + 1);              // fall through the meta char
            }
        }
        Nfa { re, m, eps }
    }

    // e-closure(S): DFS over the e-digraph -- all states reachable for free
    fn closure(&self, s: &BTreeSet<usize>) -> BTreeSet<usize> {
        let mut seen = s.clone();
        let mut stack: Vec<usize> = s.iter().copied().collect();
        while let Some(u) = stack.pop() {
            for &v in &self.eps[u] {
                if seen.insert(v) { stack.push(v); }
            }
        }
        seen
    }

    // does the NFA accept text? -- track the reachable-state set: O(mn)
    fn matches(&self, text: &str) -> bool {
        let mut pc = self.closure(&BTreeSet::from([0]));
        for c in text.chars() {
            let next: BTreeSet<usize> = pc.iter()
                .filter(|&&u| u < self.m && self.re[u] == c)  // letter states
                .map(|&u| u + 1)                             // ... advance
                .collect();
            pc = self.closure(&next);            // then close over e-edges
            if pc.is_empty() { return false; }   // dead: nothing can revive
        }
        pc.contains(&self.m)                     // accept state in final set?
    }
}
