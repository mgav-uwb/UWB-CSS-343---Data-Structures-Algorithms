import heapq

# Lazy Prim: grow one tree from s. Min-heap of (weight, vertex); skip stale pops.
# adj[u] is a list of (v, w) pairs, as in the weighted graph type. Returns the
# MST total weight.
def prim(V, adj, s):
    in_tree = [False] * V
    total, picked = 0, 0
    in_tree[s] = True
    pq = [(w, v) for v, w in adj[s]]          # edges leaving the start
    heapq.heapify(pq)
    while picked < V - 1 and pq:
        w, u = heapq.heappop(pq)
        if in_tree[u]:                        # stale — both ends already in
            continue
        in_tree[u] = True                     # take the crossing edge
        total += w
        picked += 1
        for v, wt in adj[u]:
            if not in_tree[v]:
                heapq.heappush(pq, (wt, v))
    return total
