# FNV-1a over the raw bytes. Python ints are unbounded, so we AND
# with a 64-bit mask each step to emulate the hardware overflow the
# other languages get for free.
MASK64 = 0xFFFFFFFFFFFFFFFF
def fnv1a(key: str) -> int:
    h = 0xcbf29ce484222325                       # 64-bit offset basis
    for b in key.encode("utf-8"):
        h = ((h ^ b) * 0x100000001b3) & MASK64   # XOR, then * FNV prime
    return h

# Knuth multiplicative ("Fibonacci") hashing into a table of size 2**p,
# taking the high bits of k * (2**32 / golden ratio).
def fib_hash(k: int, p: int) -> int:
    return ((k * 0x9E3779B9) & 0xFFFFFFFF) >> (32 - p)
