# Priority-queue operations on a 1-based max-heap: a[0] unused, size n.
# insert appends then swims up; del_max swaps the root out then sinks. Each Theta(log n).
class MaxHeap:
    def __init__(self):
        self.a = [0]        # index 0 is an unused sentinel so the root sits at 1
        self.n = 0

    def max(self):          # the root -- Theta(1)
        return self.a[1]

    def insert(self, x):
        self.a.append(x)                 # append at the end: tree stays complete
        self.n += 1
        swim(self.a, self.n)             # restore heap order up one path

    def del_max(self):
        top = self.a[1]                  # the maximum, to be returned
        self.a[1], self.a[self.n] = self.a[self.n], self.a[1]   # max to the end
        self.n -= 1                      # shrink (old max parked past the end)
        sink(self.a, 1, self.n)          # restore heap order down one path
        return top
