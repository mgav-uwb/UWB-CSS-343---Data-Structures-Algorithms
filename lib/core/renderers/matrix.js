// CSS 343 unified library — core/renderers/matrix.js
// ONE renderer for every 2-D grid-shaped structure (dynamic-programming
// tables: LCS, 0/1 knapsack, edit distance). Draws a snapshot = { rows, cols,
// cells: value[rows][cols], rowLabels?: string[], colLabels?: string[] } —
// a cell value of "" or null/undefined renders blank (not-yet-computed).
// Highlight sets are CELL COORDINATES [r,c]: 'from' (cells the recurrence
// reads, orange), 'active' (cell being computed, purple), 'done' (already-
// filled cells, green), 'path' (traceback, red). Precedence done < from <
// active < path — mirrors ArrayRenderer's done/compare/active/danger order,
// so the most "interesting" state always wins the paint.

const COLORS = {
  accent: "#7c5cff", green: "#0a7d4d", red: "#b3261e", edge: "#e8590c",
  ink: "#1a1c22", dim: "#9aa3b5", line: "#b9c0d0", faint: "#8a93a6",
};

const asPairSet = (v) => {
  const s = new Set();
  if (v == null) return s;
  for (const p of v) s.add(`${p[0]},${p[1]}`);
  return s;
};

export class MatrixRenderer {
  /** @param {HTMLCanvasElement} canvas @param {{cell?:number}} [opts] */
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.W = canvas.width; this.H = canvas.height;
    this.cell = opts.cell ?? 42;
  }

  /** @param {{rows:number, cols:number, cells:Array<Array<*>>, rowLabels?:string[], colLabels?:string[]}} snapshot
   *  @param {{active?:number[][], from?:number[][], path?:number[][], done?:number[][]}} [hl] */
  draw(snapshot, hl = {}) {
    const ctx = this.ctx; ctx.clearRect(0, 0, this.W, this.H);
    const rows = snapshot?.rows ?? 0, cols = snapshot?.cols ?? 0;
    if (!rows || !cols) return;
    const cellsData = snapshot.cells || [];
    const rowLabels = snapshot.rowLabels, colLabels = snapshot.colLabels;
    const hasRowLabels = Array.isArray(rowLabels), hasColLabels = Array.isArray(colLabels);

    const fromSet = asPairSet(hl.from), activeSet = asPairSet(hl.active),
      doneSet = asPairSet(hl.done), pathSet = asPairSet(hl.path);

    const M = 10; // outer margin
    // the row-label gutter is sized to the LONGEST label (measured, not a
    // fixed sliver) so labels like "A w2/v3" neither clip nor leave a gulf
    // of dead space between themselves and the grid
    let headerW = 0;
    if (hasRowLabels) {
      ctx.font = "600 12px ui-monospace, Menlo, monospace";
      const maxLabelW = Math.max(0, ...rowLabels.map((l) => ctx.measureText(String(l ?? "")).width));
      headerW = Math.min(maxLabelW + 14, this.W * 0.35);
    }
    const headerH = hasColLabels ? Math.max(18, this.cell * 0.5) : 0;

    // scale the cell down if the grid is too big to fit at the requested size
    const availW = Math.max(4, this.W - 2 * M - headerW);
    const availH = Math.max(4, this.H - 2 * M - headerH);
    const cell = Math.max(8, Math.min(this.cell, availW / cols, availH / rows));
    const totalW = cell * cols, totalH = cell * rows;
    const gridX = M + headerW + Math.max(0, (availW - totalW) / 2);
    const gridY = M + headerH + Math.max(0, (availH - totalH) / 2);

    // font sizes shrink for larger grids so labels never overrun a cell
    const valueFont = Math.max(8, Math.min(15, cell * 0.42));
    const labelFont = Math.max(8, Math.min(12, cell * 0.34));

    if (hasColLabels) {
      ctx.fillStyle = COLORS.faint; ctx.font = `600 ${labelFont}px ui-monospace, Menlo, monospace`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (let c = 0; c < cols; c++) {
        ctx.fillText(String(colLabels[c] ?? ""), gridX + c * cell + cell / 2, M + headerH / 2);
      }
    }
    if (hasRowLabels) {
      // right-aligned against the grid's left edge, so label and row read as one
      ctx.fillStyle = COLORS.faint; ctx.font = `600 ${labelFont}px ui-monospace, Menlo, monospace`;
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      for (let r = 0; r < rows; r++) {
        ctx.fillText(String(rowLabels[r] ?? ""), gridX - 8, gridY + r * cell + cell / 2);
      }
    }

    const stateColors = (r, c) => {
      let fill = "#fff", ring = COLORS.dim, text = COLORS.ink, rw = 1.5;
      const key = `${r},${c}`;
      if (doneSet.has(key)) { fill = "#e7f7ee"; ring = COLORS.green; text = "#0a5c39"; rw = 2; }
      if (fromSet.has(key)) { fill = "#fff5e9"; ring = COLORS.edge; text = "#9a4200"; rw = 2; }
      if (activeSet.has(key)) { fill = COLORS.accent; ring = COLORS.accent; text = "#fff"; rw = 2.5; }
      if (pathSet.has(key)) { fill = "#fdeaea"; ring = COLORS.red; text = COLORS.red; rw = 2.5; }
      return { fill, ring, text, rw };
    };

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = gridX + c * cell, y = gridY + r * cell;
        const { fill, ring, text, rw } = stateColors(r, c);
        ctx.beginPath(); ctx.rect(x, y, cell, cell);
        ctx.fillStyle = fill; ctx.fill();
        ctx.lineWidth = rw; ctx.strokeStyle = ring; ctx.stroke();

        const v = cellsData[r] ? cellsData[r][c] : undefined;
        if (v !== "" && v != null) {
          ctx.fillStyle = text; ctx.font = `600 ${valueFont}px system-ui, sans-serif`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(String(v), x + cell / 2, y + cell / 2 + 0.5);
        }
      }
    }
  }
}
