class Graph:
    def __init__(self, n):
        self.V = n
        self.adj = [[] for _ in range(n)]   # adj[u] = u's neighbors

    def add_edge(self, u, v):
        self.adj[u].append(v)
        self.adj[v].append(u)               # omit this line for a digraph
