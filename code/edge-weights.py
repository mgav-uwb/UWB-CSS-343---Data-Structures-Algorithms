#!/usr/bin/env python3
"""Place edge-weight labels ON their edges in handout ring-figure SVGs.

The graph figures in the handouts are inline SVGs whose <line> and <text>
elements are paired by trailing id comments:

    <line x1="230" y1="46" x2="269" y2="62"/>  <!-- 0->1 -->
    ...
    <text x="252" y="50">4</text>    <!-- 0->1 -->

Hand-placed weight labels drift to "beside the line". This script recomputes
every such label's position so it sits ON its own edge (matching the slide
demos, where GraphRenderer centers weight bubbles on the edge path), sliding
along the line away from the midpoint only as far as needed to dodge vertex
discs and other labels. The white halo the figures already use
(paint-order: stroke) keeps the digits legible over the line.

Idempotent: positions are derived from the line geometry, so re-running after
editing a figure's edges refreshes the labels. Texts whose id matches no line
(e.g. per-vertex distance labels) are left untouched.

Usage:
    python3 code/edge-weights.py handouts/ch09-dijkstra.html handouts/ch11-mst-union-find.html
"""
import math
import re
import sys

SVG_RE = re.compile(r"<svg\b.*?</svg>", re.S)
LINE_RE = re.compile(
    r'<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"\s*/>\s*<!-- (\S+) -->')
CIRCLE_RE = re.compile(r'<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"\s*/>')
TEXT_RE = re.compile(r'(<text x=")([\d.]+)(" y=")([\d.]+)(">([^<]+)</text>)(\s*)(<!-- (\S+) -->)')

# candidate positions along the edge, midpoint first — a label leaves the
# middle only when the middle is contested (mirrors GraphRenderer's slide)
T_CANDIDATES = [0.5, 0.44, 0.56, 0.38, 0.62, 0.32, 0.68, 0.26, 0.74]
BASELINE = 4.5  # 13px middle-anchored text: y offset that centers the glyphs


def label_radius(s):
    return 8 + (2 if len(s) > 1 else 0)


def place(svg):
    lines = {m.group(5): tuple(map(float, m.groups()[:4])) for m in LINE_RE.finditer(svg)}
    nodes = [tuple(map(float, m.groups())) for m in CIRCLE_RE.finditer(svg)]
    placed, moves = [], []

    def rewrite(m):
        pre_x, _, mid, _, tail, label, ws, comment, tid = m.groups()
        if tid not in lines:
            return m.group(0)  # not an edge label (e.g. a dist label) — keep
        x1, y1, x2, y2 = lines[tid]
        r = label_radius(label.strip())
        best, best_pen = None, None
        for t in T_CANDIDATES:
            cx, cy = x1 + t * (x2 - x1), y1 + t * (y2 - y1)
            pen = 0.0
            for nx, ny, nr in nodes:
                need = nr + r + 2
                d = math.hypot(cx - nx, cy - ny)
                if d < need:
                    pen += (need - d) * 3
            for px, py, pr in placed:
                need = pr + r + 3
                d = math.hypot(cx - px, cy - py)
                if d < need:
                    pen += (need - d) * 3
            for oid, (ox1, oy1, ox2, oy2) in lines.items():
                if oid == tid:
                    continue
                for s in (0.2, 0.35, 0.5, 0.65, 0.8):
                    qx, qy = ox1 + s * (ox2 - ox1), oy1 + s * (oy2 - oy1)
                    d = math.hypot(cx - qx, cy - qy)
                    if d < r - 1:  # light: the halo tolerates a crossing line
                        pen += (r - 1 - d) * 0.5
            if best_pen is None or pen < best_pen - 0.5:
                best, best_pen = (cx, cy), pen
            if best_pen == 0:
                break
        cx, cy = best
        placed.append((cx, cy, r))
        if best_pen > 0:
            print(f"  note: label {label.strip()!r} on {tid} keeps residual "
                  f"crowding {best_pen:.1f} (best of all candidates)")
        moves.append(tid)
        return (f'{pre_x}{cx:.0f}{mid}{cy + BASELINE:.0f}{tail}{ws}{comment}')

    out = TEXT_RE.sub(rewrite, svg)
    return out, moves


def run(path):
    with open(path) as f:
        html = f.read()
    total = []

    def per_svg(m):
        new, moves = place(m.group(0))
        total.extend(moves)
        return new

    html = SVG_RE.sub(per_svg, html)
    with open(path, "w") as f:
        f.write(html)
    print(f"{path}: repositioned {len(total)} edge label(s)")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    for p in sys.argv[1:]:
        run(p)
