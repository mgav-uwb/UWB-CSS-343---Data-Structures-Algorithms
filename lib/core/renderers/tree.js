// CSS 343 unified library — core/renderers/tree.js
// ONE renderer for every tree-shaped structure (BST, AVL, 2-3, red-black, trie,
// Huffman, expression, memoization trees). It draws a snapshot = a plain node
// object {key,left,right, height?, bf?, color?} and applies a highlight set by
// key. Layout: x = in-order rank (stable — rotations only move nodes vertically),
// y = depth. Highlights are just sets of keys, so any algorithm can drive it.

import { sizeCanvas } from "../render-config.js";

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

export class TreeRenderer {
  /** @param {HTMLCanvasElement} canvas @param {{labels?:('bf'|'height'|'none'), R?:number}} [opts] */
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.W = canvas.width; this.H = canvas.height;
    this.M = opts.M ?? 44; this.R = opts.R ?? 16; this.TOP = opts.TOP ?? 30;
    this.labels = opts.labels ?? "bf";
    this.zoom = 1; // 1 = autofit; viewport.js drives this (opts in via attachPanZoom)
    this.baseW = this.W; this.baseH = this.H;
  }

  /** In-order rank per NODE. Keyed by node identity, not by `key`: a Huffman
   *  tree labels internal nodes with their FREQUENCY, and two different
   *  subtrees can weigh the same — keying by value collapsed them onto one
   *  point and their edges fanned out of a single circle. */
  _ranks(roots) {
    const rank = new Map(); let i = 0;
    // ranks run CONSECUTIVELY across the roots, so a forest lays its trees out
    // left to right without overlap (a single root is just the n = 1 case)
    for (const r of roots)
      (function walk(t) { if (!t) return; walk(t.left); rank.set(t, i++); walk(t.right); })(r);
    return { rank, n: i };
  }
  _depth1(root) { return root ? 1 + Math.max(this._depth1(root.left), this._depth1(root.right)) : -1; }
  _depth(roots) { return roots.reduce((m, r) => Math.max(m, this._depth1(r)), -1); }

  /** Canvas-space hit test: the node key at (px,py), or null. Used by InteractiveDemo. */
  nodeAt(px, py) {
    const R = this._R ?? this.R;
    const rr = (R + 4) * (R + 4);
    for (const k in (this._pos || {})) { const p = this._pos[k]; if ((p.x - px) * (p.x - px) + (p.y - py) * (p.y - py) <= rr) return isNaN(+k) ? k : +k; }
    return null;
  }

  /** @param {Object} root snapshot  @param {Object} [hl] highlight sets */
  draw(snapshot, hl = {}) {
    // a snapshot may wrap the root: {tree, …} lets a structure ship side data
    // (Huffman's forest list) in the same frame without a per-spec adapter
    const raw = snapshot && snapshot.tree !== undefined ? snapshot.tree : snapshot;
    // ONE root, or a FOREST of them: Huffman is a forest until its final merge,
    // and drawing only the newest subtree would misstate where the build is
    const roots = (Array.isArray(raw) ? raw : [raw]).filter(Boolean);
    this._last = [snapshot, hl]; // viewport.js redraws the current frame on zoom
    const ctx = this.ctx; ctx.clearRect(0, 0, this.W, this.H);
    if (!roots.length) return;
    const { rank, n } = this._ranks(roots);
    const dep = Math.max(1, this._depth(roots));
    // autofit spacing on the BASE canvas (whole tree always visible),
    // magnified by the user's zoom — capped at the spacing that reaches
    // full-size nodes (more spread past that adds nothing). Zoomed in, the
    // canvas grows and the panel pans.
    const dx0 = (this.baseW - 2 * this.M) / Math.max(1, n - 1);
    const dy0 = Math.min(64, (this.baseH - this.TOP - 24) / dep);
    const fullSpan = 2 * (this.R + 3);
    const dx = Math.min(dx0 * this.zoom, Math.max(dx0, fullSpan));
    const dy = Math.min(dy0 * this.zoom, Math.max(dy0, 64));
    sizeCanvas(this, 2 * this.M + dx * Math.max(1, n - 1), this.TOP + 24 + dy * dep);
    ctx.clearRect(0, 0, this.W, this.H);
    // shrink the node radius (and, below, the font) whenever spacing gets
    // tight — otherwise many nodes just overlap instead of staying legible
    const R = Math.max(2, Math.min(this.R, dx / 2 - 3, dy / 2 - 3));
    const pos = new Map();      // node  -> {x,y}   (drawing: identity)
    const posByKey = {};        // key   -> {x,y}   (hit-testing + edge labels)
    const place = function (t, d) {
      if (!t) return;
      const at = { x: this.M + rank.get(t) * dx, y: this.TOP + d * dy };
      pos.set(t, at);
      if (!(t.key in posByKey)) posByKey[t.key] = at;   // first wins on duplicate keys
      place.call(this, t.left, d + 1); place.call(this, t.right, d + 1);
    };
    roots.forEach((r) => place.call(this, r, 0));
    this._pos = posByKey; this._R = R; // kept for hit-testing (InteractiveDemo: click a node)

    const cur = asSet(hl.cur), path = asSet(hl.path), cmp = asSet(hl.compare),
      appear = asSet(hl.appear), danger = asSet(hl.danger), done = asSet(hl.done);
    const edgeHL = new Map(); // "a>b" -> label
    (hl.edges || []).forEach(([a, b, lab]) => edgeHL.set(a + ">" + b, lab ?? ""));

    // edges
    const edges = function (t) {
      if (!t) return;
      [t.left, t.right].forEach((c) => {
        if (!c) return;
        const p = pos.get(t), q = pos.get(c);
        const on = edgeHL.has(t.key + ">" + c.key);
        // red-black links: a truthy `red` on the CHILD colors the edge from its parent.
        // Purely additive — nodes without `red` render exactly as before.
        if (c.red) { ctx.lineWidth = 4; ctx.strokeStyle = COLORS.red; }
        else { ctx.lineWidth = on ? 4 : 1.7; ctx.strokeStyle = on ? COLORS.edge : COLORS.line; }
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        edges(c);
      });
    };
    roots.forEach(edges);

    // edge labels (L/R badges etc.)
    edgeHL.forEach((lab, key) => {
      if (!lab) return;
      const [a, b] = key.split(">").map(Number);
      if (!posByKey[a] || !posByKey[b]) return;
      const mx = (posByKey[a].x + posByKey[b].x) / 2, my = (posByKey[a].y + posByKey[b].y) / 2;
      ctx.beginPath(); ctx.arc(mx, my, 9, 0, 2 * Math.PI); ctx.fillStyle = COLORS.edge; ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "700 11px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(lab), mx, my + 0.5);
    });

    // nodes — font shrinks along with R so keys stay inside their circle;
    // below legibility the text is dropped entirely (the tree SHAPE is the
    // lesson at that scale — zoom in to read values)
    const showText = R >= 5;
    const showSub = R >= 8;
    const fontPx = Math.round(14 * (R / this.R));
    const subFontPx = Math.round(10 * (R / this.R));
    // a "sym" sub-label is the leaf's IDENTITY, not positional bookkeeping like
    // bf/height — so it gets near-node size and full-ink contrast
    const symFontPx = Math.max(9, Math.round(13 * (R / this.R)));
    const nodes = function (t) {
      if (!t) return;
      const p = pos.get(t);
      let fill = "#fff", ring = COLORS.dim, text = COLORS.ink, rw = 2;
      // a node may carry its OWN colour (`tint`) — the Huffman codec gives each
      // symbol one and reuses it for that symbol's bits, so the leaf and the
      // bits it emits match. Highlights below still override it.
      if (t.tint) { ring = t.tint; text = t.tint; }
      if (path.has(t.key)) { fill = "#f3f0ff"; ring = COLORS.accent; text = "#3a2f7a"; }
      if (cmp.has(t.key)) { fill = "#fff5e9"; ring = COLORS.edge; text = "#9a4200"; rw = 2.5; }
      if (appear.has(t.key)) { fill = "#e7f7ee"; ring = COLORS.green; text = "#0a5c39"; rw = 3; }
      if (done.has(t.key)) { fill = "#e7f7ee"; ring = COLORS.green; text = "#0a5c39"; rw = 3; }
      if (danger.has(t.key)) { fill = "#fdeaea"; ring = COLORS.red; text = COLORS.red; rw = 3; }
      if (cur.has(t.key)) { fill = COLORS.accent; ring = COLORS.accent; text = "#fff"; rw = 3; }
      ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, 2 * Math.PI); ctx.fillStyle = fill; ctx.fill();
      ctx.lineWidth = rw; ctx.strokeStyle = ring; ctx.stroke();
      if (showText) {
        ctx.fillStyle = text; ctx.font = `600 ${fontPx}px system-ui, sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(t.label ?? t.key), p.x, p.y);
      }
      // optional bf/height label under the node
      const self = this;
      if (showSub && self.labels !== "none") {
        const val = self.labels === "bf" ? (t.bf ?? (h(t.left) - h(t.right)))
          : self.labels === "sym" ? (t.sub ?? "")
          : self.labels === "freq" ? (t.freq ?? t.size ?? 1)
          : self.labels === "size" ? (t.size ?? 1)
            : (t.height ?? h(t));
        const big = self.labels === "bf" && Math.abs(val) >= 2;
        const pre = self.labels === "bf" ? "bf " : self.labels === "freq" ? "f " : self.labels === "size" ? "n " : self.labels === "sym" ? "" : "h ";
        if (self.labels === "sym" && !val) { nodes.call(self, t.left); nodes.call(self, t.right); return; }
        const isSym = self.labels === "sym";
        ctx.fillStyle = big ? COLORS.red : isSym ? (t.tint || COLORS.ink) : COLORS.faint;
        ctx.font = (big || isSym ? "700 " : "600 ")
          + `${isSym ? symFontPx : subFontPx}px ui-monospace, Menlo, monospace`;
        ctx.textBaseline = "top";
        ctx.fillText(pre + (val > 0 && self.labels === "bf" ? "+" + val : val), p.x, p.y + R + (isSym ? 3 : 2));
      }
      nodes.call(self, t.left); nodes.call(self, t.right);
    };
    roots.forEach((r) => nodes.call(this, r));
  }

  /** Text alternative for a snapshot — names every node's children (and red
   *  links, when present) so a screen-reader user can reconstruct the tree.
   *  Player.js puts this on the canvas's aria-label. */
  describe(snapshot) {
    const raw = snapshot && snapshot.tree !== undefined ? snapshot.tree : snapshot;
    const rs = (Array.isArray(raw) ? raw : [raw]).filter(Boolean);
    if (!rs.length) return "An empty binary tree.";
    if (rs.length > 1)
      return `A forest of ${rs.length} trees, with root weights `
        + rs.map((r) => String(r.label ?? r.key)).join(", ") + ".";
    const root = rs[0];
    const nm = (t) => `${t.key}${t.red ? " (linked by a red link)" : ""}`;
    const parts = [];
    (function walk(t) {
      if (!t || (!t.left && !t.right)) return;
      const lt = t.left ? `left child ${nm(t.left)}` : "no left child";
      const rt = t.right ? `right child ${nm(t.right)}` : "no right child";
      parts.push(`${t.key} has ${lt} and ${rt}`);
      walk(t.left); walk(t.right);
    })(root);
    return `A binary tree with root ${root.key}. ` +
      (parts.length ? `${parts.join("; ")}. All other nodes are leaves.` : "It is the only node.");
  }
}

function h(t) { return t ? (t.height ?? 0) : -1; }
