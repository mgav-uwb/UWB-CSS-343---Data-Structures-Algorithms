// FNV-1a folds a byte stream into a 64-bit hash: XOR each byte in,
// THEN multiply by the FNV prime. Doing the XOR first (the "1a"
// order) mixes every byte before the next one arrives.
uint64_t fnv1a(const string& key) {
    uint64_t h = 0xcbf29ce484222325ULL;      // 64-bit offset basis
    for (unsigned char b : key)
        h = (h ^ b) * 0x100000001b3ULL;      // XOR, then * FNV prime
    return h;                                // unsigned overflow is defined
}

// Knuth multiplicative ("Fibonacci") hashing: map an integer key into
// a table of size 2^p using the HIGH bits of k * (2^32 / golden ratio).
uint32_t fib_hash(uint32_t k, int p) {
    return (k * 0x9E3779B9u) >> (32 - p);    // 0x9E3779B9 = round(2^32/phi)
}
