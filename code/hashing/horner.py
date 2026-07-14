# Horner's method: fold a string into one index, base R = 31.
def hash_str(s, M):
    h = 0
    for c in s:
        h = (R * h + ord(c)) % M   # reduce each step
    return h
