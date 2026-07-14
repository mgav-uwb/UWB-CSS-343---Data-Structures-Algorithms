# Python has no structs and no fixed sizes: everything is a heap object with a
# header. sys.getsizeof reports one object's bytes (not what it references).
import sys

print(sys.getsizeof(0))          # a small int: ~28 bytes, not 4
print(sys.getsizeof(3.14))       # a float:     ~24 bytes, not 8

# A "node" is a class instance; each attribute is a REFERENCE to another object.
class Node:
    __slots__ = ("data", "next")   # without __slots__, add a per-instance __dict__
    def __init__(self, data):
        self.data = data
        self.next = None

# One Node object plus the int it points at costs far more than 16 bytes.
# Lesson: in a managed language you cannot "count bytes" the way sizeof does in
# C++/Rust; the runtime charges a header per object and boxes every primitive.
