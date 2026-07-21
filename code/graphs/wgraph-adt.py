class WGraph:
    def __init__(self, n):
        self.V = n                          # number of vertices
        self.adj = [[] for _ in range(n)]   # adj[u] = list of (v, w) pairs

    def add_edge(self, u, v, w):
        self.adj[u].append((v, w))
        # self.adj[v].append((u, w))        # add this line for an UNDIRECTED edge
