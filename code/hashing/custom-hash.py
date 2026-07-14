# Define __hash__ and __eq__ together; hashing a tuple of the
# fields is the idiomatic combine. Equal keys must hash equally.
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __hash__(self):
        return hash((self.x, self.y))
    def __eq__(self, other):
        return (self.x, self.y) == (other.x, other.y)

m = {}          # a dict keyed by Point
