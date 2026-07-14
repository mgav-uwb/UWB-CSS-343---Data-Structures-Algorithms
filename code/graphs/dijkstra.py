import heapq

# Lazy Dijkstra: a min-heap of (dist, vertex). Settle a vertex the moment it
# POPS as the minimum; skip stale pops; relax and push improved neighbors.
def dijkstra(g, s):
    dist = [float("inf")] * g.V
    settled = [False] * g.V
    dist[s] = 0
    pq = [(0, s)]                            # min-heap of (dist, vertex)
    while pq:
        d, u = heapq.heappop(pq)             # nearest unsettled
        if settled[u]:                       # stale entry — skip
            continue
        settled[u] = True                    # dist[u] is now FINAL
        for v, w in g.adj[u]:
            if not settled[v] and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w        # relax: a cheaper route to v
                heapq.heappush(pq, (dist[v], v))
    return dist
