// derive(Hash) combines the fields automatically; Eq is required
// alongside it. Equal keys hash equally by construction.
use std::collections::HashMap;

#[derive(PartialEq, Eq, Hash)]
struct Point { x: i32, y: i32 }

let mut m: HashMap<Point, i32> = HashMap::new();
