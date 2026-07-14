// A record derives equals/hashCode from its fields; override
// hashCode to combine them. Equal keys must hash equally.
record Point(int x, int y) {
    @Override public int hashCode() {
        return Integer.hashCode(x) * 31 + Integer.hashCode(y);
    }
}
Map<Point, Integer> m = new HashMap<>();
