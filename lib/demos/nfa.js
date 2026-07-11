// CSS 343 unified library — demos/nfa.js
// Full-demo specs for a Thompson-style regex NFA (Sedgewick §5.4): nfa-build
// traces the ε-transition construction edge by edge; nfa-sim adds a Match op
// that traces the set-of-states simulation. Both use NAMED input boxes (a
// regex box, and a text box on the sim) so the current regex stays VISIBLE
// while you match strings against it. Both reuse the shared GraphRenderer —
// ε-edges and char-match edges are labeled via the edge `w` field (parallel
// edges bow apart).

import { NFA, GraphRenderer } from "../index.js";

const RE = "(A*B|AC)D";

// sanitize a typed regex: letters + ( ) | * only, balanced parens, ≤ 12
// chars (the wrapped machine stays readable at ~15 states); else fall back
const cleanRe = (v, dflt) => {
  const s = String(v ?? "").toUpperCase().replace(/[^A-Z()|*]/g, "").slice(0, 12);
  let bal = 0;
  for (const c of s) { if (c === "(") bal++; if (c === ")") bal--; if (bal < 0) return dflt; }
  return s.length && bal === 0 ? s : dflt;
};
const cleanText = (v) => String(v ?? "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 14);

export const nfaBuildDemo = {
  id: "nfa-build",
  title: "RE → NFA (Thompson construction)",
  blurb: "Build the ε-transition NFA for a regular expression: one state per RE character (plus a virtual accept state), with ε-edges added for '*' (closure), '|' (alternation), and '(' / ')' (grouping). Type any regex over letters and ( ) | * — the builder wraps it in implicit outer parens.",
  make: () => new NFA().build(RE),
  initial: "",
  noBuild: true,
  stateMsg: (n) => `${n.inorder()} — type a regex and press Build`,
  renderer: (c) => new GraphRenderer(c, { directed: true }),
  costs: ["link", "write"],
  inputs: [{ key: "re", label: "regex", value: RE, placeholder: "(A*B|AC)D", width: 130 }],
  ops: [{ name: "Build", run: (s, _v, vals) => s.buildTraced(cleanRe(vals.re, RE)) }],
  width: 900, height: 340,
};

export const nfaSimDemo = {
  id: "nfa-sim",
  title: "NFA simulation (reachable-state set)",
  blurb: "Simulate the NFA on a string: maintain the SET of states reachable by ε-transitions, advance every state whose character matches the next input, re-close over ε-edges, and accept iff the accept state is in the final set. The regex box always shows which machine you're matching against — Build swaps in a new one.",
  make: () => new NFA().build(RE),
  initial: "",
  noBuild: true,
  stateMsg: (n) => `${n.inorder()} — Match a string (try AAABD, ACD, AAD), or Build a new regex`,
  renderer: (c) => new GraphRenderer(c, { directed: true }),
  costs: ["visit", "compare", "link"],
  inputs: [
    { key: "re", label: "regex", value: RE, placeholder: "(A*B|AC)D", width: 130 },
    { key: "text", label: "text", value: "AAABD", placeholder: "AAABD", width: 110 },
  ],
  ops: [
    { name: "Build", ghost: true, run: (s, _v, vals) => s.buildTraced(cleanRe(vals.re, RE)) },
    { name: "Match", run: (s, _v, vals) => {
        const re = cleanRe(vals.re, RE);
        if (s.source !== re) s.build(re);      // regex box changed → rebuild first
        return s.simulate(cleanText(vals.text));
      } },
  ],
  width: 900, height: 340,
};
