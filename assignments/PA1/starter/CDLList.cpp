// CDLList.cpp — template implementation for CDLList.
// #included at the bottom of CDLList.h. Do NOT compile it directly.
// Compilable skeleton: the constructor builds a valid empty circular list with a
// dummy header; the rest are stubs for you to implement.
#ifndef CDLLIST_CPP
#define CDLLIST_CPP
#include "CDLList.h"

template <class Object>
CDLList<Object>::CDLList() {
    header = new DLListNode<Object>;   // dummy header (its item is unused)
    header->next = header;             // empty list: header points to itself
    header->prev = header;
}

template <class Object>
CDLList<Object>::CDLList(const CDLList& rhs) {
    header = new DLListNode<Object>;
    header->next = header;
    header->prev = header;
    // TODO: deep-copy every DATA node of rhs (in order) into this list.
}

template <class Object>
CDLList<Object>::~CDLList() {
    clear();          // clear() must delete every DATA node (implement it).
    delete header;    // then free the dummy header.
}

template <class Object>
const CDLList<Object>& CDLList<Object>::operator=(const CDLList& rhs) {
    // TODO: guard self-assignment; clear current data nodes; deep-copy rhs.
    return *this;
}

template <class Object>
bool CDLList<Object>::isEmpty() const {
    return header->next == header;
}

template <class Object>
int CDLList<Object>::size() const {
    // TODO: count data nodes (walk header->next until back at header).
    return 0;
}

template <class Object>
void CDLList<Object>::clear() {
    // TODO: delete every data node; leave the header pointing to itself.
}

template <class Object>
void CDLList<Object>::insert(const Object& obj, int index) {
    // TODO: splice a new node into the doubly linked ring at the given index.
}

template <class Object>
int CDLList<Object>::find(const Object& obj) const {
    // TODO: return the 0-based index of the first match, or -1.
    return -1;
}

template <class Object>
void CDLList<Object>::remove(const Object& obj) {
    // TODO: unlink (fix prev/next) and delete the first matching data node.
}

template <class Object>
Object CDLList<Object>::retrieve(int index) const {
    // TODO: return the item at index.
    return Object{};
}

#endif
