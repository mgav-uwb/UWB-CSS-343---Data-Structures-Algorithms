// Edit (Levenshtein) distance. d[i][j] = fewest edits turning the first i
// characters of a into the first j characters of b. Theta(mn) time and space.
fn edit_distance(a: &[u8], b: &[u8]) -> Vec<Vec<usize>> {
    let (m, n) = (a.len(), b.len());
    let mut d = vec![vec![0usize; n + 1]; m + 1];
    for i in 0..=m { d[i][0] = i; }                   // base: delete all of a
    for j in 0..=n { d[0][j] = j; }                   // base: insert all of b
    for i in 1..=m {
        for j in 1..=n {
            d[i][j] = if a[i - 1] == b[j - 1] {
                d[i - 1][j - 1]                       // match: free diagonal
            } else {
                1 + d[i - 1][j]                       // delete a[i-1]
                    .min(d[i][j - 1])                 // insert b[j-1]
                    .min(d[i - 1][j - 1])             // replace a[i-1]->b[j-1]
            };
        }
    }
    d                                                 // d[m][n] is the distance
}

// Traceback: read the edit script off the table, bottom-right to origin.
// Each step asks which neighbor produced this cell's value. O(m + n).
fn edit_script(a: &[u8], b: &[u8], d: &[Vec<usize>]) -> Vec<String> {
    let mut ops = Vec::new();
    let (mut i, mut j) = (a.len(), b.len());
    while i > 0 || j > 0 {
        if i > 0 && j > 0 && a[i - 1] == b[j - 1] && d[i][j] == d[i - 1][j - 1] {
            ops.push(format!("match {}", a[i - 1] as char));     // free
            i -= 1; j -= 1;
        } else if i > 0 && j > 0 && d[i][j] == d[i - 1][j - 1] + 1 {
            ops.push(format!("replace {}->{}", a[i - 1] as char, b[j - 1] as char));
            i -= 1; j -= 1;
        } else if i > 0 && d[i][j] == d[i - 1][j] + 1 {
            ops.push(format!("delete {}", a[i - 1] as char));
            i -= 1;
        } else {
            ops.push(format!("insert {}", b[j - 1] as char));
            j -= 1;
        }
    }
    ops.reverse();                                    // forward order
    ops
}
