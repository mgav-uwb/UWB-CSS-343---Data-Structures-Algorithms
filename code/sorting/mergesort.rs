// Merge sorted runs a[lo..=mid] and a[mid+1..=hi] using aux as scratch. O(n).
fn merge(a: &mut [i32], lo: usize, mid: usize, hi: usize, aux: &mut [i32]) {
    aux[lo..=hi].copy_from_slice(&a[lo..=hi]);       // copy into scratch
    let (mut i, mut j) = (lo, mid + 1);
    for k in lo..=hi {
        if i > mid {                                 // left run exhausted
            a[k] = aux[j]; j += 1;
        } else if j > hi {                           // right run exhausted
            a[k] = aux[i]; i += 1;
        } else if aux[j] < aux[i] {                  // take the smaller front
            a[k] = aux[j]; j += 1;
        } else {                                     // ties take left: STABLE
            a[k] = aux[i]; i += 1;
        }
    }
}

// Top-down mergesort. T(n) = 2T(n/2) + O(n).
fn mergesort(a: &mut [i32], lo: usize, hi: usize, aux: &mut [i32]) {
    if hi <= lo { return; }               // base case: 0 or 1 element
    let mid = lo + (hi - lo) / 2;
    mergesort(a, lo, mid, aux);           // sort the left half
    mergesort(a, mid + 1, hi, aux);       // sort the right half
    merge(a, lo, mid, hi, aux);           // combine
}
