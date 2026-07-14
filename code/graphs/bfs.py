from collections import deque

def bfs(g, s):
    q = deque([s])
    seen = [False] * g.V
    seen[s] = True
    while q:
        u = q.popleft()                 # visit u
        for v in g.adj[u]:
            if not seen[v]:
                seen[v] = True          # mark on ENQUEUE
                q.append(v)
