// FNV-1a with wrapping arithmetic: wrapping_mul makes the 64-bit
// overflow explicit and panic-free (a plain * would panic in debug
// builds). XOR each byte in, then multiply by the FNV prime.
fn fnv1a(key: &str) -> u64 {
    let mut h: u64 = 0xcbf2_9ce4_8422_2325;          // offset basis
    for b in key.bytes() {
        h = (h ^ b as u64).wrapping_mul(0x100_0000_01b3);
    }
    h
}

// Fibonacci hashing into a table of size 2^p, using the high bits of
// k * (2^32 / golden ratio).
fn fib_hash(k: u32, p: u32) -> u32 {
    k.wrapping_mul(0x9E37_79B9) >> (32 - p)          // round(2^32 / phi)
}
