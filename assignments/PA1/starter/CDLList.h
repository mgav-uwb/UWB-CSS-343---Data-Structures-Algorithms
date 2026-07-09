// CDLList.h — circular DOUBLY linked list WITH a dummy header (template class).
// CSS 343 PA1 starter. header is a sentinel: header->next = first data node,
// header->prev = last data node, last->next = header (circular).
#ifndef CDLLIST_H
#define CDLLIST_H

template <class Object>
struct DLListNode {           // list node
    Object item;
    DLListNode* prev;
    DLListNode* next;
};

template <class Object>
class CDLList {
public:
    CDLList();                                     // create dummy header
    CDLList(const CDLList& rhs);                    // copy constructor (deep copy)
    ~CDLList();                                    // destructor (free all nodes + header)
    const CDLList& operator=(const CDLList& rhs);   // assignment (deep copy)

    bool   isEmpty() const;
    int    size() const;
    void   clear();
    void   insert(const Object& obj, int index);   // index 0 = first data node
    int    find(const Object& obj) const;          // index, or -1
    void   remove(const Object& obj);              // first occurrence
    Object retrieve(int index) const;              // data at index

private:
    DLListNode<Object>* header;                     // dummy header (sentinel)
};

#ifndef CDLLIST_CPP
#include "CDLList.cpp"   // template implementation lives in the .cpp; do NOT compile it separately
#endif
#endif
