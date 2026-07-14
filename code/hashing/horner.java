// Horner's method: fold a string into one index, base R = 31.
static int hash(String s, int M) {
    long h = 0;
    for (char c : s.toCharArray())
        h = (R * h + c) % M;     // reduce each step; no overflow
    return (int) h;
}
