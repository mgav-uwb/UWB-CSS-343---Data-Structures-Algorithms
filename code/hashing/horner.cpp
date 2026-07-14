// Horner's method: fold a string into one index, base R = 31.
int hash(const string& s, int M) {
    long h = 0;
    for (char c : s)
        h = (R * h + c) % M;     // reduce each step; no overflow
    return (int)h;
}
