// LCS table: L[i][j] = LCS length of A's first i chars and B's first j.
// Fill row by row -- up, left, and diagonal are ready when a cell needs them.
// Theta(mn) time and space.
fn lcs_length(a: &[u8], b: &[u8]) -> Vec<Vec<usize>> {
    let (m, n) = (a.len(), b.len());
    let mut l = vec![vec![0usize; n + 1]; m + 1]; // row 0 / col 0 = empty prefix
    for i in 1..=m {
        for j in 1..=n {
            l[i][j] = if a[i - 1] == b[j - 1] {
                l[i - 1][j - 1] + 1                    // match: diagonal + 1
            } else {
                l[i - 1][j].max(l[i][j - 1])           // drop one: up / left
            };
        }
    }
    l                                       // l[m][n] = the answer
}

// Traceback: walk from L[m][n] toward L[0][0]. The matched characters,
// reversed, spell one LCS. O(m + n) steps -- needs the whole table.
fn lcs_string(a: &[u8], b: &[u8], l: &[Vec<usize>]) -> String {
    let mut out = Vec::new();
    let (mut i, mut j) = (a.len(), b.len());
    while i > 0 && j > 0 {
        if a[i - 1] == b[j - 1] {           // match: it's in the LCS
            out.push(a[i - 1]); i -= 1; j -= 1;   // step diagonally
        } else if l[i - 1][j] >= l[i][j - 1] {
            i -= 1;                         // follow the larger of up / left
        } else {
            j -= 1;
        }
    }
    out.reverse();
    String::from_utf8(out).unwrap()         // AGCAT / GAC -> "AC"
}
