# ICA 02 — Measuring Time & Memory

**Assigned: Session 2 (Thu Jun 25) · due before Session 3 · ~10 pts**

You did a doubling experiment for _time_ in ICA 01. Now do it for **time _and_ memory**, on **two real algorithms** — and confirm their big-O from your own data.

We give you working **mergesort** and **grid BFS** (the lecture's maze traversal). You add the instruments, run the doubling experiment, plot the results, and report.

## What you turn in

1. **The quiz** (on Canvas) — enter your measured doubling ratios and pick the big-O complexities.
2. **A zip** (uploaded in the quiz) containing:
   - your **instrumented** `mergesort_lab.cpp` and `grid_bfs_lab.cpp`
   - your **run logs** `mergesort.csv` and `grid.csv`
   - your **graph image** `graphs.png`

## Part A — Mergesort (`mergesort_lab.cpp`)

Add two instruments (marked `TODO 1` / `TODO 2`):

- **TODO 1 (time):** `timeOps++;` once per element placed into `tmp` (3 spots).
- **TODO 2 (memory):** set `peakBufBytes` to the largest merge buffer in bytes.

```
g++ -std=c++17 -O2 mergesort_lab.cpp -o ms && ./ms > mergesort.csv
```

It doubles **N** (the array size) and prints `N, time_ops, mem_bytes`.

## Part B — Grid BFS (`grid_bfs_lab.cpp`)

Add two instruments:

- **TODO 1 (time):** `timeOps++;` once per neighbor checked.
- **TODO 2 (memory):** set `memBytes` = visited-array bytes + peak-queue bytes.

```
g++ -std=c++17 -O2 grid_bfs_lab.cpp -o bfs && ./bfs > grid.csv
```

It doubles **n** (the grid side; `cells = n×n`) and prints `n, cells, time_ops, mem_bytes`.

## Plot it

```
python3 plot.py        # needs matplotlib:  pip install matplotlib
```

`plot.py` reads `mergesort.csv` + `grid.csv`, writes **`graphs.png`** (four log-log panels), and prints the **doubling ratios** — the numbers you enter in the quiz. On a log-log plot a straight line means a power law and its **slope is the exponent** (slope 1 = linear, slope 2 = quadratic; N log N looks ≈ 1).

_(You may plot in any tool — Excel, Sheets — as long as you submit a `graphs.png`. `plot.py` is the easy path.)_

## Read your data — what to expect

| algorithm | size doubled  |                    time                     |                     memory                     |
| --------- | :-----------: | :-----------------------------------------: | :--------------------------------------------: |
| mergesort |   N (array)   | ratio **~2** (a bit above) → **Θ(N log N)** | ratio **2** → **Θ(N)** (the merge buffer = 4N) |
| grid BFS  | n (grid side) |           ratio **4** → **Θ(n²)**           |  ratio **~4** → **Θ(n²)** (the visited grid)   |

These are **Θ** (tight) bounds, not just O — the doubling experiment measures a _tight_ growth rate (the ratio settles on a constant). Two things to notice: the **time ratio is the order of growth in disguise** (×2 = linear-ish, ×4 = quadratic); and a **slow algorithm can be space-cheap or not** — mergesort is N log N time but only Θ(N) space, while grid BFS is quadratic in _both_.

**A subtlety (and a quiz question):** Θ(n²) is the space of _this_ BFS because it allocates a fixed n×n `visited` array up front. A _different_ implementation could use less — a dynamic visited set grows only with the cells actually reached (geometry-dependent, but a wide-open grid is still Θ(n²)), and a **frontier-search** BFS that stores only the wavefront is **Θ(n)** — at the cost of giving up the shortest path. So a space _complexity_ is a property of the **implementation**, not just the problem.

## Submit

Zip the six files and upload in the quiz; answer the quiz questions from your `plot.py` output. **Start in class, finish at home.**

## Rubric (10 pts)

| Criterion                                                                                  | Pts |
| ------------------------------------------------------------------------------------------ | :-: |
| Both programs instrumented correctly (compile; `time_ops`/`mem_bytes` non-zero & sensible) |  4  |
| `mergesort.csv` + `grid.csv` logs present                                                  |  2  |
| `graphs.png` present and correct                                                           |  2  |
| Quiz answers (ratios + big-O) match your data                                              |  2  |
