// CSS 343 unified library — structures/nfa.js
// Regular expression → NFA (Sedgewick §5.4, Thompson-style construction) plus
// simulation by tracking the SET of reachable states (no backtracking).
//
// Supported RE subset: concatenation, | (or), * (closure), () (grouping), over
// a small letter alphabet — e.g. "(A*B|AC)D". Construction follows Sedgewick's
// array-of-states trick directly: a regex of length M gets M+1 states, 0..M.
// State i (i<M) corresponds to re[i]; state M is a virtual "accept" state with
// no character of its own. Two kinds of transition:
//   - a char-match edge i → i+1, taken only if the input character equals re[i]
//     (metacharacters '(',')','|','*' never match an input letter, so only
//     "real" character states produce a char-match edge);
//   - ε-transitions (a digraph, epsAdj), added for '*' (skip/repeat the
//     closure's operand), '|' (skip either branch), and '(' / ')' (structural,
//     so control always can flow past a paren without consuming input).
// Simulation (recognizes()) never backtracks: it maintains the SET of states
// reachable by ε-transitions from wherever it currently is (the "reachable
// state set"), advances every state whose character matches the next input
// character, then re-closes over ε-edges. Accept iff state M is in the final
// set. This is the general Thompson build, not a hardcoded example — it works
// for any RE in the supported subset, not just the default.
//
// Rendered with the shared GraphRenderer: snapshot() = {nodes:[{id,x,y,label,
// kind}], edges:[{u,v,w,directed:true}]} — edge label piggybacks on the `w`
// field GraphRenderer already draws (small label at the edge midpoint), with
// w:"ε" for ε-transitions and w:<char> for char-match transitions. States are
// laid out left→right by regex position with a two-row zigzag (even index
// states higher, odd lower) so short and long-range edges don't all collide
// on one horizontal line. When a closure like "A*" produces both a char-match
// edge and an ε-edge on the SAME pair of states, GraphRenderer bows the
// parallel edges apart (each with its own label bubble), so both are visible.

import { Tracer } from "../core/tracer.js";

const DEFAULT_RE = "(A*B|AC)D";
const isMeta = (c) => c === "(" || c === ")" || c === "|" || c === "*";

export class NFA {
  constructor() {
    this.re = "";
    this.m = 0;
    this.states = [];     // [{id,x,y,label,kind}]
    this.epsAdj = [];     // epsAdj[i] = [j, ...] — ε out-neighbors of state i
    this.epsEdges = [];   // [[u,v], ...] in construction order
    this.charEdges = [];  // [{u,v,ch}] — char-match transition u -> u+1 on ch
  }

  /** Lay out states 0..m left→right, zigzagged so ε-edges of different span don't all collide. */
  _layout(m) {
    const states = [];
    for (let i = 0; i <= m; i++) {
      const x = 0.05 + (i / m) * 0.9;
      const y = i % 2 === 0 ? 0.38 : 0.62;
      const label = i === m ? "M" : this.re[i];
      const kind = i === 0 ? "start" : i === m ? "accept" : isMeta(this.re[i]) ? "meta" : "char";
      states.push({ id: i, x, y, label, kind });
    }
    return states;
  }

  /** Build snapshot from a (possibly partial, mid-construction) edge set. */
  _snap(epsEdges, charEdges) {
    return {
      nodes: this.states.map((n) => ({ ...n })),
      edges: [
        ...epsEdges.map(([u, v]) => ({ u, v, w: "ε", directed: true })),
        ...charEdges.map((e) => ({ u: e.u, v: e.v, w: e.ch, directed: true })),
      ],
    };
  }

  /** Shared core: Sedgewick's construction. `source` is wrapped in an implicit
   *  outer "( )" first — exactly as Sedgewick's book code does — so a top-level
   *  '|' or a '*' applied to the whole expression has a matching paren to
   *  anchor its ε-edges (without the wrap, "A|B" or "AB*" split across the
   *  whole string would have no enclosing '(' / ')' pair to hang the
   *  alternation/closure ε-edges on). If `t` is given, emits a step per
   *  ε-edge added and per char-match edge added, so the caller gets a trace
   *  of the NFA being built up edge by edge. */
  _construct(source, t) {
    this.source = source;
    const re = `(${source})`;
    const m = re.length;
    this.re = re; this.m = m;
    this.epsAdj = Array.from({ length: m + 1 }, () => []);
    this.epsEdges = [];
    this.charEdges = [];
    this.states = this._layout(m);

    const snap = () => this._snap(this.epsEdges, this.charEdges);
    if (t) t.step(`${m + 1} states laid out (0..${m}), one per character of "${re}" — state ${m} is the accept state`,
      { snapshot: snap(), highlight: {} });

    const addEps = (u, v, why) => {
      this.epsAdj[u].push(v);
      this.epsEdges.push([u, v]);
      if (t) {
        t.count("link");
        t.step(`ε-edge ${u} → ${v} — ${why}`,
          { snapshot: snap(), highlight: { nodes: { active: [u, v] }, edges: { active: [[u, v]] } } });
      }
    };

    const ops = []; // stack of positions of '(' and '|'
    for (let i = 0; i < m; i++) {
      let lp = i;
      const c = re[i];
      if (c === "(" || c === "|") {
        ops.push(i);
      } else if (c === ")") {
        const or = ops.pop();
        if (re[or] === "|") {
          lp = ops.pop();
          addEps(lp, or + 1, `'(' at ${lp} skips to the branch after '|' at ${or}`);
          addEps(or, i, `'|' at ${or} skips to ')' at ${i}`);
        } else {
          lp = or;
        }
      }
      if (i < m - 1 && re[i + 1] === "*") {
        addEps(lp, i + 1, `closure '*' at ${i + 1} — skip the operand starting at ${lp}`);
        addEps(i + 1, lp, `closure '*' at ${i + 1} — repeat the operand starting at ${lp}`);
      }
      if (c === "(" || c === "*" || c === ")") addEps(i, i + 1, `structural — fall through '${c}'`);
      if (!isMeta(c)) {
        this.charEdges.push({ u: i, v: i + 1, ch: c });
        if (t) {
          t.count("write");
          t.step(`char-match edge ${i} → ${i + 1} on '${c}'`,
            { snapshot: snap(), highlight: { nodes: { active: [i, i + 1] }, edges: { tree: [[i, i + 1]] } } });
        }
      }
    }
    if (t) t.step(`NFA complete for "${re}" — ${m + 1} states, ${this.epsEdges.length} ε-edges, ${this.charEdges.length} char-match edges`,
      { snapshot: snap(), highlight: { nodes: { done: [m] } } });
    return this;
  }

  /** build(re) — construct the NFA for regex `re` (default "(A*B|AC)D"). Guards
   *  against being called with a non-string (FullDemo's harness re-invokes
   *  build() with a parsed-number array on "Build"; that's ignored here, same
   *  trick Graph/WeightedGraph/DP use to keep a fixed sample instance). */
  build(re) {
    const pattern = typeof re === "string" && re.length ? re : DEFAULT_RE;
    this._construct(pattern, null);
    return this;
  }

  /** Traced construction of the current (or default) regex — one step per ε-edge
   *  and char-match edge added, ending with the complete NFA. */
  buildTraced(re = this.source || DEFAULT_RE) {
    const t = new Tracer();
    this._construct(re, t);
    return t.trace();
  }

  snapshot() { return this._snap(this.epsEdges, this.charEdges); }
  inorder() { return `regex "${this.source}" — ${this.m + 1} states, ${this.epsEdges.length} ε-edges, ${this.charEdges.length} char-match edges`; }

  /** ε-closure of a set of states (plain array/iterable of ids) — every state reachable via 0+ ε-edges. */
  _closure(seed) {
    const seen = new Set(seed);
    const stack = [...seen];
    while (stack.length) {
      const u = stack.pop();
      for (const v of this.epsAdj[u] || []) {
        if (!seen.has(v)) { seen.add(v); stack.push(v); }
      }
    }
    return seen;
  }

  /** Traced simulation: maintain the SET of reachable states (ε-closure), advance
   *  on each input character, report ACCEPT iff the accept state (m) is in the
   *  final set. No backtracking, no recursion — just set operations. */
  simulate(text) {
    const t = new Tracer();
    const snap = () => this.snapshot();
    const show = (s) => `{${[...s].sort((a, b) => a - b).join(",")}}`;

    let pc = this._closure([0]);
    t.count("visit", pc.size);
    t.step(`start: ε-closure of {0} = ${show(pc)}`, { snapshot: snap(), highlight: { nodes: { active: [...pc] } } });

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const match = new Set();
      for (const v of pc) {
        if (v === this.m) continue;
        t.count("compare");
        if (this.re[v] === c) match.add(v + 1);
      }
      pc = this._closure(match);
      t.count("visit", pc.size);
      t.step(`read '${c}' (${i + 1}/${text.length}) — states advancing on '${c}': ${show(match)}; ε-closure: ${show(pc)}`
        + (pc.size === 0 ? " — set is EMPTY: no state can ever advance, the string is dead" : ""),
        { snapshot: snap(), highlight: pc.size === 0 ? { nodes: { danger: [] } } : { nodes: { active: [...pc] } } });
    }

    const accept = pc.has(this.m);
    t.step(accept ? `ACCEPT "${text}" — accept state ${this.m} is in the final set ${show(pc)}` : `REJECT "${text}" — accept state ${this.m} not in the final set ${show(pc)}`,
      { snapshot: snap(), highlight: accept ? { nodes: { done: [this.m], active: [...pc] } } : { nodes: { danger: [...pc] } } });
    return t.trace();
  }

  /** matches(text) — plain boolean recognizer, same logic as simulate() without tracing. */
  matches(text) {
    let pc = this._closure([0]);
    for (const c of text) {
      const match = new Set();
      for (const v of pc) { if (v !== this.m && this.re[v] === c) match.add(v + 1); }
      pc = this._closure(match);
      if (pc.size === 0) return false;
    }
    return pc.has(this.m);
  }
}
