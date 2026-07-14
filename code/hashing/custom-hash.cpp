// A custom hash for your own key type combines the fields
// so that (1,2) and (2,1) differ. Equal keys must hash equally.
struct PointHash {
    size_t operator()(const Point& p) const {
        return hash<int>()(p.x) * 31 + hash<int>()(p.y);
    }
};
unordered_map<Point, int, PointHash> m;
