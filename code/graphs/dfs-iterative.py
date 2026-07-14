def dfs(g, s):
    st = [s]
    seen = [False] * g.V
    while st:
        u = st.pop()
        if seen[u]:
            continue
        seen[u] = True              # visit u
        for v in g.adj[u]:
            if not seen[v]:
                st.append(v)
