// CSS 343 unified library — demos/nfa.js
// Full-demo specs for a Thompson-style regex NFA (Sedgewick §5.4): nfa-build
// traces the ε-transition construction edge by edge; nfa-sim traces
// simulation (tracking the SET of ε-closure-reachable states) on a sample
// string. Both reuse the shared GraphRenderer — ε-edges and char-match edges
// are labeled via the edge `w` field GraphRenderer already renders.

import { NFA, GraphRenderer } from "../index.js";

const RE = "(A*B|AC)D";

export const nfaBuildDemo = {
  id: "nfa-build",
  title: "RE → NFA (Thompson construction)",
  blurb: `Build the ε-transition NFA for the regular expression "${RE}": one state per RE character (plus a virtual accept state), with ε-edges added for '*' (closure), '|' (alternation), and '(' / ')' (grouping).`,
  make: () => new NFA().build(RE),
  initial: "",
  stateMsg: (n) => n.inorder(),
  renderer: (c) => new GraphRenderer(c, { directed: true }),
  costs: ["link", "write"],
  ops: [{ name: `Build NFA for "${RE}"`, run: (s) => s.buildTraced() }],
  width: 900, height: 340,
};

export const nfaSimDemo = {
  id: "nfa-sim",
  title: "NFA simulation (reachable-state set)",
  blurb: `Simulate the "${RE}" NFA on "AAABD": maintain the SET of states reachable by ε-transitions, advance every state whose character matches the next input, re-close over ε-edges, and accept iff the accept state is in the final set.`,
  make: () => new NFA().build(RE),
  initial: "",
  stateMsg: (n) => n.inorder(),
  renderer: (c) => new GraphRenderer(c, { directed: true }),
  costs: ["visit", "compare"],
  ops: [{ name: 'Simulate "AAABD"', run: (s) => s.simulate("AAABD") }],
  width: 900, height: 340,
};
