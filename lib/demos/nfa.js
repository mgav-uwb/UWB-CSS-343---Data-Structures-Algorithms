// CSS 343 unified library — demos/nfa.js
// Full-demo specs for a Thompson-style regex NFA (Sedgewick §5.4): nfa-build
// traces the ε-transition construction edge by edge; nfa-sim adds a Match op
// that traces the set-of-states simulation. Both use NAMED input boxes (a
// regex box, and a text box on the sim) so the current regex stays VISIBLE
// while you match strings against it. Both reuse the shared GraphRenderer —
// ε-edges and char-match edges are labeled via the edge `w` field (parallel
// edges bow apart).

import { NFA, DFA, MACHINES, GraphRenderer } from "../index.js";
import { expandRepeats } from "../core/sequence.js";

const RE = "(A*B|AC)D";

// sanitize a typed regex: letters + ( ) | * only, balanced parens, ≤ 12
// chars (the wrapped machine stays readable at ~15 states); else fall back
const cleanRe = (v, dflt) => {
  const s = expandRepeats(String(v ?? "")).toUpperCase().replace(/[^A-Z()|*]/g, "").slice(0, 12);
  let bal = 0;
  for (const c of s) { if (c === "(") bal++; if (c === ")") bal--; if (bal < 0) return dflt; }
  return s.length && bal === 0 ? s : dflt;
};
const cleanText = (v) => expandRepeats(String(v ?? "")).toUpperCase().replace(/[^A-Z]/g, "").slice(0, 14);

export const nfaBuildDemo = {
  id: "nfa-build",
  proto: "nfa",
  title: "RE → NFA (Thompson construction)",
  blurb: "Build the ε-transition NFA for a regular expression: one state per RE character (plus a virtual accept state), with ε-edges added for '*' (closure), '|' (alternation), and '(' / ')' (grouping). Type any regex over letters and ( ) | * — the builder wraps it in implicit outer parens.",
  about: `
      <p class="lede">Thompson's construction, edge by edge — and the encoding that makes a regex
      engine fit on one page: <b>don't allocate states, reuse the regex string</b>. State i
      <em>is</em> character i of the pattern.</p>
      <h3>The invariant to hold onto</h3>
      <ul>
        <li>A <b>letter</b> state has exactly one way to consume input: <code>i ──re[i]──► i+1</code>.
        Advancing is always +1, never anything else.</li>
        <li>A <b>metacharacter</b> <code>( ) | *</code> consumes nothing — it only routes, via
        ε-edges.</li>
        <li>So the whole machine is the regex string plus an ε-digraph. Nothing else exists.</li>
      </ul>
      <h3>Machines worth building</h3>
      <ul>
        <li><code>A*B</code> — the worked slide. The star wires two ε-edges around its operand
        (skip the A, loop back for more) and the '*' falls through to the B. Wrapped in the
        implicit outer parens the demo shows <b>6 states, 5 ε-edges, 2 match edges</b>; the
        lecture's unwrapped version is the same machine with the letters shifted by one.</li>
        <li><code>(A*B|AC)D</code> — <b>12 states, 9 ε-edges, 5 match edges</b>. Watch the
        alternation get wired at the closing paren: the '(' branches into both alternatives and the
        '|' skips out to the close.</li>
        <li><code>(A|B)*B</code> — all strings ending in B, the your-turn regex.</li>
      </ul>
      <p>Count the ε-edges as they appear: at most three per character (a fall-through, plus the
      star's pair or the bar's pair), so a length-m regex gives an O(m)-state, O(m)-edge machine
      built in one linear scan. Determinizing that same machine to a DFA can cost 2<sup>m</sup>
      states — which is why the simulator, not the DFA, is what gets built here.</p>`,
  links: [
    { href: "../handouts/ch17-regex-automata.html#build", label: "Chapter 17 §3: Thompson's construction →" },
    { href: "../sessions/S17-regex-automata/index.html", label: "Lecture 17 — Part 3 →" },
  ],
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
  proto: "nfa",
  title: "NFA simulation (reachable-state set)",
  blurb: "Simulate the NFA on a string: maintain the SET of states reachable by ε-transitions, advance every state whose character matches the next input, re-close over ε-edges, and accept iff the accept state is in the final set. The regex box always shows which machine you're matching against — Build swaps in a new one.",
  about: `
      <p class="lede">Nondeterminism resolved by bookkeeping: instead of guessing which branch to
      take, the machine occupies a <b>set</b> of states and follows every branch at once. The
      highlighted set is the whole algorithm.</p>
      <h3>Two phases per character</h3>
      <ol>
        <li><b>advance</b> — every active letter state whose character matches steps to i+1.
        States that don't match simply die.</li>
        <li><b>ε-close</b> — add everything reachable for free. This is a DFS on the ε-digraph:
        the same graph search from week eight, run on an automaton.</li>
      </ol>
      <p>Accept if the accept state is in the set when the input runs out — <em>after</em> the last
      character, which is why reaching the accept state early means nothing if input remains.</p>
      <h3>Three strings on <code>(A*B|AC)D</code></h3>
      <ul>
        <li><code>AAABD</code> ✓ — threads the left branch; the A-loop fires twice, then B, then D.</li>
        <li><code>ACD</code> ✓ — threads the right branch. The <em>same</em> start set covered both
        branches; nothing chose between them.</li>
        <li><code>AAD</code> ✗ — watch the set go empty mid-string and stay empty. An empty set has
        no edges, so it can never recover — the rejection is detected early and honestly.</li>
      </ul>
      <p>The set can never exceed the number of states, so each character costs O(m) and the whole
      match is O(mn) — <em>guaranteed</em>, on every input. Backtracking engines (Perl, Java,
      Python, JS) have no such guarantee: <code>(a*)*</code> against a long run of a's takes
      exponential time, which is a real denial-of-service vector. grep and RE2 use this simulation
      precisely to avoid it.</p>`,
  links: [
    { href: "../handouts/ch17-regex-automata.html#simulate", label: "Chapter 17 §4: simulating the NFA →" },
    { href: "../sessions/S17-regex-automata/index.html", label: "Lecture 17 — Part 4 →" },
  ],
  make: () => new NFA().build(RE),
  initial: "",
  noBuild: true,
  stateMsg: (n) => `${n.inorder()} — Match a string (try AAABD, ACD, AAD — or A^9BD), or Build a new regex`,
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

export const dfaDemo = {
  id: "dfa",
  proto: "nfa",
  title: "DFA — one arrow per character",
  blurb: "The deterministic machine, the rung below the NFA: exactly one transition per (state, character), so running it is a pointer walk — no set of states, no ε-closure, no choices. The highlighted node is the ENTIRE machine state, which is the contrast the NFA slides rest on.",
  about: `
      <p class="lede">A DFA's states <em>are</em> its memory, and these machines have one or two
      bits of it. Watch a single highlighted node move; then open
      <a href="demo.html?ds=nfa-sim">the NFA simulator</a> and watch a whole <em>set</em> light
      up. That difference is the entire DFA-vs-NFA trade.</p>
      <h3>Read the state as a sentence</h3>
      <p>In <code>(0|1)*0</code> the machine has two states and they mean exactly "the string so
      far ends in 0" and "it doesn't". Nothing else is remembered — not the length, not what came
      before. That is what <em>finite</em> memory buys and costs, and it is the AⁿBⁿ slide from the
      other side: two states can remember one bit, but no fixed number of states can remember an
      unbounded count.</p>
      <h3>The lecture's traces</h3>
      <ul>
        <li><code>110</code> → A→A→A→B, <b>ACCEPT</b></li>
        <li><code>0110</code> → A→B→A→A→B, <b>ACCEPT</b> (the your-turn)</li>
        <li><code>111</code> → never leaves A, <b>reject</b></li>
        <li><code>""</code> → still in A, <b>reject</b> — the empty string does not end in 0</li>
      </ul>
      <p>Acceptance is decided <em>after</em> the last character: passing through the accepting
      state mid-string means nothing, which is the same subtlety as "BA" on the A*B NFA.</p>
      <h3>The other machines</h3>
      <p><b>(A|B)*B</b> is the regex from the Part-1 your-turn, as a machine — the same language as
      <code>(0|1)*0</code> with the alphabet renamed, which is worth pointing out. <b>Even number
      of A's</b> is pure parity: the state is one bit. <b>Contains AB</b> has a trap state that,
      once entered, never leaves — the machine has decided and nothing can change its mind.</p>`,
  links: [
    { href: "../handouts/ch17-regex-automata.html#automata", label: "Chapter 17 §2: finite automata →" },
    { href: "../sessions/S17-regex-automata/index.html", label: "Lecture 17 — Part 2 →" },
  ],
  make: () => new DFA(),
  initial: "ends-in-0",
  buildLabel: "machine",
  noBuild: true,
  chrome: { showValue: false },
  stateMsg: () => "ready: (0|1)*0 — type a string and Run",
  renderer: (c) => new GraphRenderer(c),
  costs: ["compare", "read"],
  inputs: [
    { key: "m", label: "machine", value: "ends-in-0", width: 120 },
    { key: "s", label: "string", value: "110", width: 110 },
  ],
  presets: [
    { name: "(0|1)*0 on 110 (the slide)", values: { m: "ends-in-0", s: "110" } },
    { name: "(0|1)*0 on 0110 (the your-turn)", values: { m: "ends-in-0", s: "0110" } },
    { name: "(0|1)*0 on 111 (reject)", values: { m: "ends-in-0", s: "111" } },
    { name: "(A|B)*B on BAB — Part 1's regex", values: { m: "ends-in-B", s: "BAB" } },
    { name: "even # of A's on ABABA", values: { m: "even-As", s: "ABABA" } },
    { name: "contains AB on BBAAB (trap state)", values: { m: "contains-AB", s: "BBAAB" } },
  ],
  height: 250,
  ops: [
    { name: "Run", run: (s, _v, vals) => { s.build(String(vals.m ?? "ends-in-0").trim()); return s.run(vals.s ?? ""); } },
  ],
};
