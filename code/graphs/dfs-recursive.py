def dfs(g, u, seen):
    seen[u] = True                  # visit u
    for v in g.adj[u]:              # each neighbor
        if not seen[v]:
            dfs(g, v, seen)         # recurse; backtrack on return
