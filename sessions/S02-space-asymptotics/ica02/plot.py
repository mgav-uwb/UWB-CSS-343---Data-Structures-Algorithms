#!/usr/bin/env python3
# CSS 343 — ICA 02: plot the doubling-experiment data.
#
# After you instrument the two programs and produce the logs:
#   ./ms  > mergesort.csv      (columns: N,time_ops,mem_bytes)
#   ./bfs > grid.csv           (columns: n,cells,time_ops,mem_bytes)
# run:
#   python3 plot.py            (needs matplotlib:  pip install matplotlib)
#
# It writes graphs.png (4 panels) and prints the doubling ratios you'll enter
# in the quiz. Log-log axes: a straight line means a power law, and its SLOPE
# is the exponent (slope 1 = linear, slope 2 = quadratic; N log N looks ~1).

import csv
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

def load(path, xcol):
    xs, t, m = [], [], []
    for r in csv.DictReader(open(path)):
        xs.append(float(r[xcol])); t.append(float(r["time_ops"])); m.append(float(r["mem_bytes"]))
    return xs, t, m

def ratios(name, xs, ys):
    print(f"\n{name}")
    prev = None
    for x, y in zip(xs, ys):
        print(f"  size={x:>8.0f}  value={y:>14.0f}  ratio={y/prev:6.2f}" if prev else
              f"  size={x:>8.0f}  value={y:>14.0f}  ratio=    -")
        prev = y

def panel(ax, xs, ys, title, xlabel, color):
    ax.loglog(xs, ys, "o-", color=color, lw=2, ms=5)
    ax.set_title(title, fontsize=11, weight="bold")
    ax.set_xlabel(xlabel); ax.set_ylabel("count")
    ax.grid(True, which="both", alpha=0.25)

N, msT, msM = load("mergesort.csv", "N")
n, bfT, bfM = load("grid.csv", "n")

ratios("MERGESORT time (operations) vs N  — expect N log N", N, msT)
ratios("MERGESORT memory (bytes)     vs N  — expect O(N)",     N, msM)
ratios("GRID BFS  time (operations)  vs n  — expect O(n^2)",   n, bfT)
ratios("GRID BFS  memory (bytes)     vs n  — expect O(n^2)",   n, bfM)

fig, ax = plt.subplots(2, 2, figsize=(10, 7))
panel(ax[0][0], N, msT, "Mergesort — time vs N",   "N (array size)",  "#7c5cff")
panel(ax[0][1], N, msM, "Mergesort — memory vs N", "N (array size)",  "#334155")
panel(ax[1][0], n, bfT, "Grid BFS — time vs n",    "n (grid side)",   "#d39a00")
panel(ax[1][1], n, bfM, "Grid BFS — memory vs n",  "n (grid side)",   "#16a34a")
fig.suptitle("ICA 02 — time & memory vs problem size (log-log)", fontsize=13, weight="bold")
fig.tight_layout()
fig.savefig("graphs.png", dpi=120)
print("\nWrote graphs.png")
