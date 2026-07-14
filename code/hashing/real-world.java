// FNV-1a over the UTF-8 bytes. Java has no unsigned long, but the
// wrap-around arithmetic is identical in two's complement, so the
// bit pattern matches the C++ and Rust versions exactly.
static long fnv1a(String key) {
    long h = 0xcbf29ce484222325L;                    // offset basis (as bits)
    for (byte b : key.getBytes(StandardCharsets.UTF_8))
        h = (h ^ (b & 0xff)) * 0x100000001b3L;       // & 0xff: byte as unsigned
    return h;
}

// Fibonacci hashing into a table of size 2^p. >>> is the UNSIGNED
// shift, so the top p bits fall cleanly into [0, 2^p).
static int fibHash(int k, int p) {
    return (k * 0x9E3779B9) >>> (32 - p);            // round(2^32 / phi)
}
