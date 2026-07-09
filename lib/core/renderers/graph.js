// CSS 343 unified library — core/renderers/graph.js
// ONE renderer for every graph-shaped structure (BFS/DFS, Dijkstra, Prim/Kruskal,
// topological sort). It draws a snapshot = {nodes:[{id,x,y,label?}], edges:[{u,v,w?,directed?}]}
// with x,y NORMALIZED to [0,1] — the algorithm/layout controls node placement,
// just like tree.js controls its own layout. Highlights are sets of node ids and
// edge pairs (matched unordered unless the edge/graph is directed), so any
// algorithm can drive it.

const COLORS = {
  accent: "#7c5cff", green: "#0a7d4d", red: "#b3261e", edge: "#e8590c",
  ink: "#1a1c22", dim: "#9aa3b5", line: "#b9c0d0", faint: "#8a93a6",
};

const asSet = (v) => {
  const s = new Set();
  if (v == null) return s;
  (Array.isArray(v) ? v : [v]).forEach((x) => s.add(x));
  return s;
};

const unorderedKey = (a, b) => (String(a) <= String(b) ? `${a}|${b}` : `${b}|${a}`);

const buildEdgeSets = (pairs) => {
  const ordered = new Set(), unordered = new Set();
  (pairs || []).forEach(([a, b]) => { ordered.add(`${a}>${b}`); unordered.add(unorderedKey(a, b)); });
  return { ordered, unordered };
};

const edgeMatches = (sets, u, v, directed) =>
  directed ? sets.ordered.has(`${u}>${v}`) : sets.unordered.has(unorderedKey(u, v));

export class GraphRenderer {
  /** @param {HTMLCanvasElement} canvas @param {{R?:number, directed?:boolean, pad?:number}} [opts] */
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.W = canvas.width; this.H = canvas.height;
    this.R = opts.R ?? 18;
    this.directed = opts.directed ?? false;
    this.pad = opts.pad ?? 30;
  }

  /** @param {{nodes:Array, edges:Array}} snapshot @param {Object} [hl] highlight sets: nodes{active,visited,done,danger}, edges{tree,active,faded}, dist{id:value} */
  draw(snapshot, hl = {}) {
    const ctx = this.ctx; ctx.clearRect(0, 0, this.W, this.H);
    const nodes = snapshot?.nodes ?? [];
    const edges = snapshot?.edges ?? [];
    if (!nodes.length) return;

    const pad = this.pad, R = this.R;
    const pos = {};
    nodes.forEach((n) => { pos[n.id] = { x: pad + n.x * (this.W - 2 * pad), y: pad + n.y * (this.H - 2 * pad) }; });

    const active = asSet(hl.nodes?.active), visited = asSet(hl.nodes?.visited),
      done = asSet(hl.nodes?.done), danger = asSet(hl.nodes?.danger);
    const treeE = buildEdgeSets(hl.edges?.tree), activeE = buildEdgeSets(hl.edges?.active),
      fadedE = buildEdgeSets(hl.edges?.faded);
    const dist = hl.dist || {};

    // edges (drawn first so nodes sit on top)
    edges.forEach((e) => {
      const p = pos[e.u], q = pos[e.v];
      if (!p || !q) return;
      const directed = e.directed ?? this.directed;
      let color = COLORS.line, width = 1.7;
      if (edgeMatches(fadedE, e.u, e.v, directed)) { color = "#d8dce3"; width = 1.7; }
      if (edgeMatches(treeE, e.u, e.v, directed)) { color = COLORS.accent; width = 4; }
      if (edgeMatches(activeE, e.u, e.v, directed)) { color = COLORS.edge; width = 4; }

      const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      // stop the line at the node radius (directed) so the arrowhead shows
      const endX = directed ? q.x - ux * R : q.x;
      const endY = directed ? q.y - uy * R : q.y;

      ctx.lineWidth = width; ctx.strokeStyle = color;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(endX, endY); ctx.stroke();

      if (directed) {
        const ah = 9, aw = 4.5; // arrowhead length / half-width
        const bx = endX - ux * ah, by = endY - uy * ah; // back of the arrowhead
        const px = -uy, py = ux; // perpendicular unit vector
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(bx + px * aw, by + py * aw);
        ctx.lineTo(bx - px * aw, by - py * aw);
        ctx.closePath();
        ctx.fillStyle = color; ctx.fill();
      }
    });

    // edge weight labels
    edges.forEach((e) => {
      if (e.w == null) return;
      const p = pos[e.u], q = pos[e.v];
      if (!p || !q) return;
      const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
      ctx.beginPath(); ctx.arc(mx, my, 9, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff"; ctx.fill();
      ctx.lineWidth = 1.2; ctx.strokeStyle = COLORS.line; ctx.stroke();
      ctx.fillStyle = COLORS.ink; ctx.font = "700 11px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(String(e.w), mx, my + 0.5);
    });

    // nodes
    nodes.forEach((n) => {
      const p = pos[n.id];
      let fill = "#fff", ring = COLORS.dim, text = COLORS.ink, rw = 2;
      if (visited.has(n.id)) { fill = "#eef0f3"; ring = COLORS.faint; text = COLORS.faint; }
      if (done.has(n.id)) { fill = "#e7f7ee"; ring = COLORS.green; text = "#0a5c39"; rw = 3; }
      if (active.has(n.id)) { fill = COLORS.accent; ring = COLORS.accent; text = "#fff"; rw = 3; }
      if (danger.has(n.id)) { fill = "#fdeaea"; ring = COLORS.red; text = COLORS.red; rw = 3; }
      ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, 2 * Math.PI); ctx.fillStyle = fill; ctx.fill();
      ctx.lineWidth = rw; ctx.strokeStyle = ring; ctx.stroke();
      ctx.fillStyle = text; ctx.font = "600 14px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(String(n.label ?? n.id), p.x, p.y);
    });

    // dist labels (small faint mono tag just above each listed node)
    Object.keys(dist).forEach((id) => {
      const p = pos[id];
      if (!p) return;
      const v = dist[id];
      const txt = v === Infinity ? "∞" : String(v);
      ctx.fillStyle = COLORS.faint; ctx.font = "600 10px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillText(txt, p.x, p.y - R - 3);
    });
  }
}
