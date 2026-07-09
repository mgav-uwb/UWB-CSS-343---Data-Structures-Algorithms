// CSS 343 unified library — structures/weighted-graph.js
// A weighted directed graph (nonnegative weights) with traced Dijkstra shortest
// paths. Rendered with GraphRenderer: edge weights are drawn on the edges and the
// tentative/final distances appear as node labels (dist), so relaxation is visible.
// Uses the classic "settle the nearest unsettled vertex, then relax its edges" form.

import { Tracer } from "../core/tracer.js";

const NODES = [
  { id: 0, x: 0.08, y: 0.50 }, { id: 1, x: 0.30, y: 0.22 }, { id: 2, x: 0.30, y: 0.80 },
  { id: 3, x: 0.52, y: 0.50 }, { id: 4, x: 0.52, y: 0.95 }, { id: 5, x: 0.74, y: 0.50 },
  { id: 6, x: 0.95, y: 0.34 }, { id: 7, x: 0.74, y: 0.92 },
];
// weights chosen so several relaxations IMPROVE a tentative distance (2→1, 1→3, 3→4, 4→5)
const EDGES = [[0, 1, 4], [0, 2, 2], [2, 1, 1], [1, 3, 5], [2, 3, 8], [2, 4, 10], [3, 4, 2], [3, 5, 6], [4, 5, 3], [5, 6, 1], [4, 7, 7]];

const show = (d) => (d === Infinity ? "∞" : d);

export class WeightedGraph {
  constructor() { this.nodes = []; this.edges = []; this.adj = {}; }

  build() {
    this.nodes = NODES.map((n) => ({ ...n }));
    this.edges = EDGES.map(([u, v, w]) => ({ u, v, w, directed: true }));
    this.adj = {}; this.nodes.forEach((n) => (this.adj[n.id] = []));
    this.edges.forEach((e) => this.adj[e.u].push({ v: e.v, w: e.w }));
    Object.values(this.adj).forEach((a) => a.sort((x, y) => x.v - y.v));
    return this;
  }
  snapshot() { return { nodes: this.nodes.map((n) => ({ ...n })), edges: this.edges.map((e) => ({ ...e })) }; }
  inorder() { return `${this.nodes.length} vertices · ${this.edges.length} weighted edges`; }
  _out(u) { return this.adj[u] || []; }

  /** Dijkstra from `src`: settle the nearest unsettled vertex, relax its edges. */
  dijkstra(src = 0) {
    const t = new Tracer();
    const dist = {}, prev = {}, settled = new Set();
    let tree = [];
    this.nodes.forEach((n) => (dist[n.id] = Infinity));
    dist[src] = 0;
    const snap = () => this.snapshot();
    const HL = (active, edge) => ({ nodes: { active: active != null ? [active] : [], done: [...settled] }, edges: { tree: tree.slice(), active: edge ? [edge] : [] }, dist: { ...dist } });

    t.step(`init: dist[${src}] = 0, every other vertex = ∞`, { snapshot: snap(), highlight: { dist: { ...dist } } });
    while (settled.size < this.nodes.length) {
      let u = null, best = Infinity;
      for (const n of this.nodes) if (!settled.has(n.id) && dist[n.id] < best) { best = dist[n.id]; u = n.id; }
      if (u === null) break; // remaining vertices are unreachable
      settled.add(u); t.count("visit");
      t.step(`settle ${u}: smallest tentative distance (${dist[u]}) among unsettled — its label is now final`, { snapshot: snap(), highlight: HL(u) });
      for (const { v, w } of this._out(u)) {
        t.count("compare");
        if (settled.has(v)) { t.step(`edge ${u}→${v}: ${v} already settled — skip`, { snapshot: snap(), highlight: HL(u, [u, v]) }); continue; }
        const nd = dist[u] + w, old = dist[v];
        if (nd < old) {
          if (prev[v] != null) tree = tree.filter((e) => e[1] !== v); // replace v's tree edge
          dist[v] = nd; prev[v] = u; tree.push([u, v]);
          t.step(`relax ${u}→${v} (w ${w}): ${dist[u]}+${w}=${nd} < ${show(old)} → dist[${v}] = ${nd}`, { snapshot: snap(), highlight: HL(u, [u, v]) });
        } else {
          t.step(`relax ${u}→${v} (w ${w}): ${dist[u]}+${w}=${nd} ≥ ${show(old)} — no improvement`, { snapshot: snap(), highlight: HL(u, [u, v]) });
        }
      }
    }
    t.step(`Dijkstra done — labels are shortest-path distances from ${src}; the accent edges are the shortest-paths tree`, { snapshot: snap(), highlight: { nodes: { done: [...settled] }, edges: { tree: tree.slice() }, dist: { ...dist } } });
    return t.trace();
  }

  /** Kruskal's MST: sort edges by weight, add each if its endpoints are in different
   * union-find components (skip — cycle — otherwise), stopping after V-1 tree edges.
   * The edge set is treated as UNDIRECTED regardless of each edge's `directed` flag. */
  kruskal() {
    const t = new Tracer();
    const parent = {};
    this.nodes.forEach((n) => (parent[n.id] = n.id));
    const find = (x) => { while (parent[x] !== x) x = parent[x]; return x; };
    const union = (a, b) => { parent[find(a)] = find(b); };

    const sorted = this.edges.map((e) => ({ ...e })).sort((a, b) => a.w - b.w);
    const need = this.nodes.length - 1;
    let tree = [], total = 0;
    const snap = () => this.snapshot();
    const HL = (edge, faded) => ({ edges: { tree: tree.map((e) => [e.u, e.v]), active: !faded && edge ? [[edge.u, edge.v]] : [], faded: faded && edge ? [[edge.u, edge.v]] : [] } });

    t.step(`sort ${sorted.length} edges by weight ascending — process them cheapest-first`, { snapshot: snap(), highlight: { edges: { tree: [] } } });
    for (const e of sorted) {
      if (tree.length === need) break; // MST complete — no need to examine the rest
      t.count("compare");
      const ru = find(e.u), rv = find(e.v);
      if (ru !== rv) {
        union(e.u, e.v);
        tree.push(e); total += e.w;
        t.step(`add edge ${e.u}–${e.v} (${e.w}) — total ${total}`, { snapshot: snap(), highlight: HL(e, false) });
      } else {
        t.step(`skip ${e.u}–${e.v} (${e.w}) — would form a cycle`, { snapshot: snap(), highlight: HL(e, true) });
      }
    }
    t.step(`done — MST weight ${total}`, { snapshot: snap(), highlight: { edges: { tree: tree.map((e) => [e.u, e.v]) } } });
    return t.trace();
  }

  /** Prim's MST from `src`: repeatedly scan every edge for the minimum-weight edge
   * crossing from inTree to a not-yet-in-tree vertex, add it, and repeat. The edge
   * set is treated as UNDIRECTED regardless of each edge's `directed` flag. */
  prim(src = 0) {
    const t = new Tracer();
    const inTree = new Set([src]);
    let tree = [], total = 0;
    const snap = () => this.snapshot();
    const HL = (justAdded) => ({ nodes: { done: [...inTree], active: justAdded != null ? [justAdded] : [] }, edges: { tree: tree.map((e) => [e.u, e.v]) } });

    t.step(`start Prim from vertex ${src}`, { snapshot: snap(), highlight: HL(src) });
    while (inTree.size < this.nodes.length) {
      let best = null;
      for (const e of this.edges) {
        t.count("compare");
        const uIn = inTree.has(e.u), vIn = inTree.has(e.v);
        if (uIn === vIn) continue; // both endpoints in, or both out — not a crossing edge
        const newVertex = uIn ? e.v : e.u, treeVertex = uIn ? e.u : e.v;
        if (!best || e.w < best.w) best = { u: treeVertex, v: newVertex, w: e.w };
      }
      if (!best) break; // remaining vertices are unreachable
      inTree.add(best.v); t.count("visit");
      tree.push(best); total += best.w;
      t.step(`add edge ${best.u}–${best.v} (${best.w}) — vertex ${best.v} joins, total ${total}`, { snapshot: snap(), highlight: HL(best.v) });
    }
    t.step(`done — MST weight ${total}`, { snapshot: snap(), highlight: { nodes: { done: [...inTree] }, edges: { tree: tree.map((e) => [e.u, e.v]) } } });
    return t.trace();
  }
}
