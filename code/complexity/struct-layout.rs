// Rust exposes layout like C++: size_of and align_of are compile-time facts.
// #[repr(C)] forces C's field order/padding; the default repr may reorder
// fields to shrink padding automatically (a nicety C++ does NOT have).
use std::mem::{size_of, align_of};

#[repr(C)]
struct Node { data: i32, next: *const Node }   // 4 + 4 pad + 8 = 16

#[repr(C)] struct A { a: u8, b: i32, c: u8 }    // 12  (like C++ struct A)
#[repr(C)] struct B { b: i32, a: u8, c: u8 }    // 8   (large -> small)

fn main() {
    println!("i32={} ptr={}", size_of::<i32>(), size_of::<*const Node>()); // 4 8
    println!("Node={} align={}", size_of::<Node>(), align_of::<Node>());   // 16 8
    println!("A={}  B={}", size_of::<A>(), size_of::<B>());                 // 12 8
}
