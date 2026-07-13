// CSS 343 unified library — core/renderers/tree.js
// ONE renderer for every tree-shaped structure (BST, AVL, 2-3, red-black, trie,
// Huffman, expression, memoization trees). It draws a snapshot = a plain node
// object {key,left,right, height?, bf?, color?} and applies a highlight set by
// key. Layout: x = in-order rank (stable — rotations only move nodes vertically),
// y = depth. Highlights are just sets of keys, so any algorithm can drive it.

import { RENDER_LIMITS, sizeCanvas, centerScrollOn } from "../render-config.js";

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
    this.minScale = opts.minScale ?? null; // null = follow RENDER_LIMITS live
    this.baseW = this.W; this.baseH = this.H;
  }

  _ranks(root) {
    const rank = {}; let i = 0;
    (function walk(t) { if (!t) return; walk(t.left); rank[t.key] = i++; walk(t.right); })(root);
    return { rank, n: i };
  }
  _depth(root) { return root ? 1 + Math.max(this._depth(root.left), this._depth(root.right)) : -1; }

  /** Canvas-space hit test: the node key at (px,py), or null. Used by InteractiveDemo. */
  nodeAt(px, py) {
    const R = this._R ?? this.R;
    const rr = (R + 4) * (R + 4);
    for (const k in (this._pos || {})) { const p = this._pos[k]; if ((p.x - px) * (p.x - px) + (p.y - py) * (p.y - py) <= rr) return isNaN(+k) ? k : +k; }
    return null;
  }

  /** @param {Object} root snapshot  @param {Object} [hl] highlight sets */
  draw(root, hl = {}) {
    const ctx = this.ctx; ctx.clearRect(0, 0, this.W, this.H);
    if (!root) return;
    const { rank, n } = this._ranks(root);
    const dep = Math.max(1, this._depth(root));
    // node spacing that keeps R (and the font, which tracks R) at the
    // configured scale floor — if the base canvas can't provide it, grow the
    // canvas and let the wrapper scroll instead of shrinking below the floor
    const minSpan = 2 * ((this.minScale ?? RENDER_LIMITS.minScale) * this.R + 3);
    sizeCanvas(this, 2 * this.M + minSpan * Math.max(1, n - 1), this.TOP + 24 + minSpan * dep);
    ctx.clearRect(0, 0, this.W, this.H);
    const dx = (this.W - 2 * this.M) / Math.max(1, n - 1);
    const dy = Math.min(64, (this.H - this.TOP - 24) / dep);
    // shrink the node radius (and, below, the font) whenever spacing gets
    // tight — otherwise many nodes just overlap instead of staying legible
    const R = Math.max(6, Math.min(this.R, dx / 2 - 3, dy / 2 - 3));
    const pos = {};
    (function place(t, d) { if (!t) return; pos[t.key] = { x: this.M + rank[t.key] * dx, y: this.TOP + d * dy }; place.call(this, t.left, d + 1); place.call(this, t.right, d + 1); }).call(this, root, 0);
    this._pos = pos; this._R = R; // kept for hit-testing (InteractiveDemo: click a node)

    if (this._resizedW) { this._resizedW = false; centerScrollOn(this, pos[root.key].x); }

    const cur = asSet(hl.cur), path = asSet(hl.path), cmp = asSet(hl.compare),
      appear = asSet(hl.appear), danger = asSet(hl.danger), done = asSet(hl.done);
    const edgeHL = new Map(); // "a>b" -> label
    (hl.edges || []).forEach(([a, b, lab]) => edgeHL.set(a + ">" + b, lab ?? ""));

    // edges
    (function edges(t) {
      if (!t) return;
      [t.left, t.right].forEach((c) => {
        if (!c) return;
        const p = pos[t.key], q = pos[c.key];
        const on = edgeHL.has(t.key + ">" + c.key);
        // red-black links: a truthy `red` on the CHILD colors the edge from its parent.
        // Purely additive — nodes without `red` render exactly as before.
        if (c.red) { ctx.lineWidth = 4; ctx.strokeStyle = COLORS.red; }
        else { ctx.lineWidth = on ? 4 : 1.7; ctx.strokeStyle = on ? COLORS.edge : COLORS.line; }
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        edges(c);
      });
    })(root);

    // edge labels (L/R badges etc.)
    edgeHL.forEach((lab, key) => {
      if (!lab) return;
      const [a, b] = key.split(">").map(Number);
      if (!pos[a] || !pos[b]) return;
      const mx = (pos[a].x + pos[b].x) / 2, my = (pos[a].y + pos[b].y) / 2;
      ctx.beginPath(); ctx.arc(mx, my, 9, 0, 2 * Math.PI); ctx.fillStyle = COLORS.edge; ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "700 11px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(lab), mx, my + 0.5);
    });

    // nodes — font shrinks along with R so keys stay legible instead of
    // overflowing a circle that got smaller than the fixed default text
    const fontPx = Math.max(7, Math.round(14 * (R / this.R)));
    const subFontPx = Math.max(6, Math.round(10 * (R / this.R)));
    (function nodes(t) {
      if (!t) return;
      const p = pos[t.key];
      let fill = "#fff", ring = COLORS.dim, text = COLORS.ink, rw = 2;
      if (path.has(t.key)) { fill = "#f3f0ff"; ring = COLORS.accent; text = "#3a2f7a"; }
      if (cmp.has(t.key)) { fill = "#fff5e9"; ring = COLORS.edge; text = "#9a4200"; rw = 2.5; }
      if (appear.has(t.key)) { fill = "#e7f7ee"; ring = COLORS.green; text = "#0a5c39"; rw = 3; }
      if (done.has(t.key)) { fill = "#e7f7ee"; ring = COLORS.green; text = "#0a5c39"; rw = 3; }
      if (danger.has(t.key)) { fill = "#fdeaea"; ring = COLORS.red; text = COLORS.red; rw = 3; }
      if (cur.has(t.key)) { fill = COLORS.accent; ring = COLORS.accent; text = "#fff"; rw = 3; }
      ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, 2 * Math.PI); ctx.fillStyle = fill; ctx.fill();
      ctx.lineWidth = rw; ctx.strokeStyle = ring; ctx.stroke();
      ctx.fillStyle = text; ctx.font = `600 ${fontPx}px system-ui, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(t.key), p.x, p.y);
      // optional bf/height label under the node
      const self = this;
      if (self.labels !== "none") {
        const val = self.labels === "bf" ? (t.bf ?? (h(t.left) - h(t.right)))
          : self.labels === "size" ? (t.size ?? 1)
            : (t.height ?? h(t));
        const big = self.labels === "bf" && Math.abs(val) >= 2;
        const pre = self.labels === "bf" ? "bf " : self.labels === "size" ? "n " : "h ";
        ctx.fillStyle = big ? COLORS.red : COLORS.faint;
        ctx.font = (big ? "700 " : "600 ") + `${subFontPx}px ui-monospace, Menlo, monospace`;
        ctx.textBaseline = "top";
        ctx.fillText(pre + (val > 0 && self.labels === "bf" ? "+" + val : val), p.x, p.y + R + 2);
      }
      nodes.call(self, t.left); nodes.call(self, t.right);
    }).call(this, root);
  }
}

function h(t) { return t ? (t.height ?? 0) : -1; }
