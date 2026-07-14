import heapq
from dataclasses import dataclass, field
from typing import Optional

# A Huffman tree node. Ordering compares frequency only (the other fields are
# excluded), so a min-heap of Nodes pops the two lowest-frequency nodes.
@dataclass(order=True)
class Node:
    freq: int
    sym: Optional[str] = field(compare=False, default=None)   # None = internal
    left: "Node" = field(compare=False, default=None)
    right: "Node" = field(compare=False, default=None)

def build_huffman(freqs):                     # freqs: list of (sym, freq)
    heap = [Node(f, sym) for sym, f in freqs]
    heapq.heapify(heap)
    while len(heap) > 1:
        x = heapq.heappop(heap)               # two smallest frequencies
        y = heapq.heappop(heap)
        heapq.heappush(heap, Node(x.freq + y.freq, None, x, y))  # merge
    return heap[0]                            # the single remaining root
