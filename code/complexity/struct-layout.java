// Java hides layout: there is no sizeof. Every object carries a HEADER
// (~12-16 bytes) before its fields, and a reference is 4 bytes (compressed
// oops) or 8. So a Node's real footprint is larger than "4 + 8".
class Node {
    int data;        // 4 bytes of field
    Node next;       // a REFERENCE (4 or 8), not an inlined struct
}
// Approximate footprint of one Node on a 64-bit JVM with compressed oops:
//   12 (header) + 4 (int data) + 4 (ref next) = 20, padded up to 24.
// The point: managed runtimes add per-object overhead that C++/Rust do not,
// so an object-per-element list is even costlier than the raw 16 bytes.
// (Measure precisely with the JOL tool: ClassLayout.parseClass(Node.class).)
