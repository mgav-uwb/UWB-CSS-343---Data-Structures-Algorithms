// NDLList.h — singly linked list, NO dummy header (template class).
// CSS 343 PA1 starter. head points at the first real node.
#ifndef NDLLIST_H
#define NDLLIST_H

template <class Object>
struct LListNode {            // list node
    Object item;
    LListNode* next;
};

template <class Object>
class NDLList {
public:
    NDLList();                                     // head = nullptr
    NDLList(const NDLList& rhs);                    // copy constructor (deep copy)
    ~NDLList();                                    // destructor (free all nodes)
    const NDLList& operator=(const NDLList& rhs);   // assignment (deep copy)

    bool   isEmpty() const;
    int    size() const;
    void   clear();
    void   insert(const Object& obj, int index);   // index 0 = at head
    int    find(const Object& obj) const;          // index, or -1
    void   remove(const Object& obj);              // first occurrence
    Object retrieve(int index) const;              // data at index

private:
    LListNode<Object>* head;                        // first real node (no dummy)
};

#ifndef NDLLIST_CPP
#include "NDLList.cpp"   // template implementation lives in the .cpp; do NOT compile it separately
#endif
#endif
