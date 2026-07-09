// CSS 343 unified library — structures/graph.js
// A small directed graph (a fixed sample DAG with node positions) plus traced
// DFS, BFS, and topological sort. Rendered with the shared GraphRenderer:
// snapshot() = {nodes:[{id,x,y}], edges:[{u,v,directed}]}; traversal state is
// carried in each frame's highlight ({nodes:{active,visited,done}, edges:{tree,
// active,faded}, dist:{id:val}}). The graph is static, so only the highlight
// changes frame to frame.

import { Tracer } from "../core/tracer.js";

// a sample DAG: edges flow generally left→right, so a topological order exists
const NODES = [
  { id: 0, x: 0.08, y: 0.50 }, { id: 1, x: 0.30, y: 0.22 }, { id: 2, x: 0.30, y: 0.80 },
  { id: 3, x: 0.52, y: 0.50 }, { id: 4, x: 0.52, y: 0.95 }, { id: 5, x: 0.74, y: 0.50 },
  { id: 6, x: 0.95, y: 0.34 }, { id: 7, x: 0.74, y: 0.92 },
];
const EDGES = [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [1, 4], [3, 5], [4, 5], [5, 6], [4, 7]];

export class Graph {
  constructor() { this.nodes = []; this.edges = []; this.adj = {}; }

  build() { // input ignored — always the fixed sample DAG
    this.nodes = NODES.map((n) => ({ ...n }));
    this.edges = EDGES.map(([u, v]) => ({ u, v, directed: true }));
    this.adj = {}; this.nodes.forEach((n) => (this.adj[n.id] = []));
    this.edges.forEach((e) => this.adj[e.u].push(e.v));
    Object.values(this.adj).forEach((a) => a.sort((x, y) => x - y)); // deterministic order
    return this;
  }
  snapshot() { return { nodes: this.nodes.map((n) => ({ ...n })), edges: this.edges.map((e) => ({ ...e })) }; }
  inorder() { return `${this.nodes.length} vertices · ${this.edges.length} directed edges`; }
  _out(u) { return this.adj[u] || []; }

  /** Depth-first search from `start`: tree edges vs already-visited (faded); post-order finish. */
  dfs(start = 0) {
    const t = new Tracer();
    const visited = new Set(), finished = [], tree = [];
    const snap = () => this.snapshot();
    const HL = (active, faded) => ({
      nodes: { active: active != null ? [active] : [], visited: [...visited].filter((x) => !finished.includes(x)), done: [...finished] },
      edges: { tree: tree.slice(), faded: faded ? [faded] : [] },
    });
    const self = this;
    (function visit(u) {
      visited.add(u); t.count("visit");
      t.step(`visit ${u}`, { snapshot: snap(), highlight: HL(u) });
      for (const v of self._out(u)) {
        t.count("compare");
        if (!visited.has(v)) {
          tree.push([u, v]);
          t.step(`tree edge ${u} → ${v} — recurse into ${v}`, { snapshot: snap(), highlight: HL(v) });
          visit(v);
          t.step(`back at ${u}`, { snapshot: snap(), highlight: HL(u) });
        } else {
          t.step(`${u} → ${v}: ${v} already visited — skip`, { snapshot: snap(), highlight: HL(u, [u, v]) });
        }
      }
      finished.push(u);
      t.step(`${u} finished (post-order #${finished.length})`, { snapshot: snap(), highlight: HL(u) });
    })(start);
    t.step(`DFS done — visited ${finished.length} vertices; reverse post-order is a topological order`,
      { snapshot: snap(), highlight: { nodes: { done: [...finished] }, edges: { tree: tree.slice() } } });
    return t.trace();
  }

  /** Breadth-first search from `start`: dist = fewest edges (BFS layers, shown as node labels). */
  bfs(start = 0) {
    const t = new Tracer();
    const dist = {}, visited = new Set([start]), done = [], tree = [];
    dist[start] = 0; const q = [start];
    const snap = () => this.snapshot();
    t.step(`start BFS at ${start} (dist 0), enqueue it`, { snapshot: snap(), highlight: { nodes: { active: [start], visited: [start] }, dist: { ...dist } } });
    while (q.length) {
      const u = q.shift(); done.push(u); t.count("visit");
      t.step(`dequeue ${u} (dist ${dist[u]}) — scan its neighbors`, { snapshot: snap(), highlight: { nodes: { active: [u], visited: [...visited], done: [...done] }, edges: { tree: tree.slice() }, dist: { ...dist } } });
      for (const v of this._out(u)) {
        t.count("compare");
        if (!visited.has(v)) {
          visited.add(v); dist[v] = dist[u] + 1; tree.push([u, v]); q.push(v);
          t.step(`discover ${v} via ${u} → dist ${dist[v]}, enqueue`, { snapshot: snap(), highlight: { nodes: { active: [v], visited: [...visited], done: [...done] }, edges: { tree: tree.slice(), active: [[u, v]] }, dist: { ...dist } } });
        } else {
          t.step(`${u} → ${v}: already seen — skip`, { snapshot: snap(), highlight: { nodes: { active: [u], visited: [...visited], done: [...done] }, edges: { tree: tree.slice(), faded: [[u, v]] }, dist: { ...dist } } });
        }
      }
    }
    t.step(`BFS done — each label is the shortest number of edges from ${start}`, { snapshot: snap(), highlight: { nodes: { done: [...done] }, edges: { tree: tree.slice() }, dist: { ...dist } } });
    return t.trace();
  }

  /** Topological sort (Kahn's algorithm): repeatedly output an in-degree-0 vertex. */
  topo() {
    const t = new Tracer();
    const indeg = {}; this.nodes.forEach((n) => (indeg[n.id] = 0));
    this.edges.forEach((e) => indeg[e.v]++);
    const snap = () => this.snapshot();
    const order = [], removed = new Set();
    t.step(`compute in-degrees (shown on each vertex)`, { snapshot: snap(), highlight: { dist: { ...indeg } } });
    let ready = this.nodes.filter((n) => indeg[n.id] === 0).map((n) => n.id);
    while (ready.length) {
      ready.sort((a, b) => a - b);
      const u = ready.shift(); removed.add(u); order.push(u); t.count("visit");
      t.step(`${u} has in-degree 0 → output it (position ${order.length}). order: ${order.join(" ")}`, { snapshot: snap(), highlight: { nodes: { active: [u], done: [...order] }, dist: { ...indeg } } });
      for (const v of this._out(u)) {
        indeg[v]--; t.count("compare");
        t.step(`drop edge ${u} → ${v}: in-degree(${v}) = ${indeg[v]}`, { snapshot: snap(), highlight: { nodes: { active: [v], done: [...order] }, edges: { faded: [[u, v]] }, dist: { ...indeg } } });
        if (indeg[v] === 0 && !removed.has(v)) ready.push(v);
      }
    }
    const ok = order.length === this.nodes.length;
    t.step(ok ? `topological order: ${order.join(" → ")}` : `a cycle exists — no topological order (only ${order.length}/${this.nodes.length} output)`,
      { snapshot: snap(), highlight: { nodes: ok ? { done: [...order] } : { danger: this.nodes.map((n) => n.id).filter((x) => !removed.has(x)) } } });
    return t.trace();
  }
}
