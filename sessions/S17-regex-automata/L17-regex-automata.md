<!--
  CSS 343 · Lecture 17 (Session 17) — Regular Expressions & Finite Automata.
  reveal.js: "---" = next part (→), "--" = next slide (↓). Notes follow "Note:".
  Concrete C++ (structs, a digraph of states) — no templates/inheritance.
  KaTeX: never two "_" on one line. Verify at 1280×620; code/ASCII ≤ ~56 chars.

  Reading (pre): Sedgewick & Wayne §5.4 (Regular Expressions).
  THROUGH-LINE: a REGEX is a pattern that describes a LANGUAGE (a set of strings)
  via concatenation, | (or), * (closure), and (). A finite automaton RECOGNIZES
  that language. Sedgewick: build an NFA (nondeterministic, with ε-transitions)
  from the regex, then SIMULATE it by tracking the SET of reachable states —
  O(mn). KLEENE'S THEOREM: regexes and finite automata describe exactly the same
  class, the REGULAR languages. This closes the course: pattern → machine.

  Covered in Spring-26 (Kim): Module 7 (Languages/Grammar) + Module 8 (FSM) — so
  languages, grammars, and finite-state machines ARE prior-offering material; the
  RE→NFA construction + simulation is the Sedgewick §5.4 addition. Demos: nfa-build
  + nfa-sim (GraphRenderer).

  Session plan (150 min). 0:00 intro 0:04 P1 regex+languages 22 0:26 P2 NFAs 26
  0:52 BREAK 10 1:02 P3 RE→NFA 26 1:28 P4 simulate+Kleene 26 1:54 P5 wrap 10
  2:04 ICA 2:30 end.
-->

## CSS 343

### Data Structures, Algorithms & Discrete Mathematics II

**Lecture 17 — Regular Expressions & Finite Automata**

<small>Summer 2026 · T/Th 6:00–8:30 · UW1 020 · Dr. Marcel Gavriliu</small>

---

## Reading

**Sedgewick & Wayne §5.4** — Regular Expressions

- **regexes** — concatenation, `|` (or), `*` (closure), `()`
- the **language** a regex describes
- **NFA** — build one from a regex, then **simulate** it
- **Kleene's theorem** — regexes ↔ finite automata

Reading quiz due before class.

---

### Part 1 · Regexes & the languages they describe

<small>(~22 min)</small>

--

## What is a regular expression?

A **pattern** that describes a **set of strings** (a *language*):

```text
   AB       matches exactly "AB"
   A|B      matches "A" or "B"
   A*       matches "", "A", "AA", "AAA", …
   (AB)*    matches "", "AB", "ABAB", …
```

You use them daily: **grep**, search-and-replace, input validation.

--

## Tonight's plan

1. **regexes** — patterns that describe **languages**
2. **NFAs** — finite-state machines that recognize them
3. **RE → NFA** — Thompson's construction
4. **simulate** the NFA — track a **set** of states

The finale: **pattern → machine** (Kleene's theorem).

--

## The shorthands

Everything else is **sugar** over the four operations:

```text
   A+     = A A*          (one or more)
   A?     = (A|ε)         (optional)
   [abc]  = (a|b|c)       (character class)
   .      = any character
```

The engine only really knows **concat, `|`, `*`, `()`**.

--

## The four operations

| operation | regex | meaning |
|---|---|---|
| **concatenation** | `AB` | A then B |
| **or (union)** | `A\|B` | A or B |
| **closure (star)** | `A*` | zero or more A |
| **grouping** | `(…)` | precedence |

Everything else (`+`, `?`, `[…]`, `.`) is shorthand built from these.

--

## The operations as gadgets — preview

Each operation will become a small **NFA gadget** in Part 3:

```text
   char  → one transition        A|B   → ε-branch
   AB    → ε-concatenation        A*    → ε-loop
```

Four operations, four gadgets — the regex's structure *is* the automaton's structure.

--

## The language of a regex

A regex denotes a **language** L — the set of all strings it matches:

```text
   L(A*B) = { B, AB, AAB, AAAB, … }   (any run of A's, then a B)
   L((A|B)C) = { AC, BC }
```

A string **matches** the regex iff it's **in** the language.

--

## Regex — worked examples

```text
   (0|1)*       every binary string (any length, incl. "")
   A(B|C)*D     A, then any mix of B/C, then D
   (AB)*        "", AB, ABAB, ABABAB, …
```

Read a regex by breaking it at the **top-level** `|` and `*`.

--

## Practice — what matches?

```text
   (AB)*   — which of  "ABAB",  "ABA",  ""  does it match?
```

<small>`(AB)*` = zero or more copies of "AB": **"ABAB" ✓** (two copies), **"ABA" ✗** (dangling A), **"" ✓** (zero copies). Read `*` as "any number, including none."</small>

--

## Precedence

Binding tightest to loosest: **`*`** > **concatenation** > **`|`**

```text
   AB|C  = (AB)|C          A|BC = A|(BC)
   AB*   = A(B*)           (AB)* ≠ AB*
```

Use `()` to override — the #1 source of regex bugs.

--

## Regexes in practice

- **search** — grep, editor find, log analysis
- **validation** — emails, phone numbers, dates
- **lexing** — the first phase of every compiler
- **find & replace** with capture groups

--

## Regex in code

```text
   std::regex re("(a|b)*c");                // C++ <regex>
   if (std::regex_match(s, re)) …           // whole-string match
   std::regex_search / regex_replace        // find / substitute
```

Under the hood: **parse → NFA/DFA → run**. Beware — some engines **backtrack** (can be slow).

--

## A validation example

Match a US phone number, three formats:

```text
   (206) 555-1234    206-555-1234    2065551234
   pattern: \(?\d{3}\)?[- ]?\d{3}-?\d{4}
```

`\d` = digit, `{3}` = repeat, `?` = optional, `[- ]` = space-or-dash — all sugar over the four operations.

--

## Regular languages

The languages describable by a regex are the **regular languages** — a fundamental class in the theory of computation.

```text
   regular:      A*B,  (AB)*,  even # of A's
   NOT regular:  balanced parentheses,  AⁿBⁿ
```

Some patterns are **beyond** regex — you need more (a stack, a grammar).

--

## Why AⁿBⁿ isn't regular

To match "n A's then n B's," you must **count** n — but a finite automaton has **finite** memory:

```text
   no fixed number of states can count to arbitrary n
   (the pumping lemma proves it)
```

Counting / nesting → **context-free** (needs a stack). *Don't parse HTML with regex.*

---

### Part 2 · Finite automata (NFAs)

<small>(~26 min)</small>

--

## Finite automata

A **finite automaton** is a machine that reads a string and **accepts or rejects** it:

```text
   states · transitions (per input char) · a start state · accept state(s)
   read the string char by char, following transitions;
   end in an accept state → ACCEPT
```

It recognizes a language — exactly a regex's job, as a *machine*.

--

## DFA vs NFA

- **DFA** (deterministic) — exactly **one** transition per (state, char). Easy to run, can be big.
- **NFA** (nondeterministic) — **several** (or zero) transitions, plus **ε-transitions** (free moves). Easy to build from a regex.

Sedgewick builds an **NFA** from the regex, then simulates it.

--

## A DFA example

`(0|1)*0` — binary strings ending in **0**:

```text
   → A ──1──► A            A = start
     A ──0──► B((accept))  B = ends in 0
     B ──1──► A
     B ──0──► B((accept))
   run "110":  A →1 A →1 A →0 B  → ACCEPT
```

Exactly one arrow per (state, char) — just follow it, O(n).

--

## Nondeterminism

An NFA may face **several** choices — imagine it explores **all** of them at once:

```text
   in state s reading 'A': could go to state 3 OR state 7
   → the NFA is in a SET of states simultaneously
```

Accept if **any** path ends in an accept state.

--

## NFA vs DFA — the tradeoff

| | NFA | DFA |
|---|---|---|
| build from regex | **easy**, O(m) states | can be **2ᵐ** states |
| run | O(mn) (track a set) | **O(n)** (follow one arrow) |
| ε-transitions | yes | no |

Sedgewick: **build the NFA** (small), then **simulate** it. Build small *or* run fast.

--

## ε-transitions

An **ε-transition** moves between states **without consuming input** — a "free" move:

```text
   state 2  --ε-->  state 5    (jump for free, read nothing)
```

They glue the little machines together when building from a regex.

--

## The NFA in code

It's just a **digraph of states** plus a match rule per state:

```text
   struct NFA {
       int start, accept;
       vector<vector<int>> eps;   // ε-edges (a digraph)
       vector<char> match;        // char to match at each state (Sedgewick)
   };
```

Simulation = **graph reachability** (ε-closure) + one match step per input char.

--

## When does an NFA accept?

```text
   start in the ε-closure of the start state
   for each input char c:
       from the current SET of states, take every c-transition,
       then their ε-closure → the new set of states
   accept iff the accept state is in the final set
```

--

## Acceptance = membership

```text
   the NFA ACCEPTS a string   ⟺   the string is IN the regex's language
```

The automaton is a **membership tester** for a set of strings:

> "does it match?"  =  "does the NFA accept?"

---

### Part 3 · Building an NFA from a regex

<small>(~26 min)</small>

--

## Thompson's construction

Build the NFA **recursively** from the regex's structure — one small gadget per operator:

```text
   a single char, |, concatenation, * — each is a tiny NFA
   combine them with ε-transitions, following the regex's parse
```

Each gadget has one start and one accept — they plug together.

--

## Gadget: a single character

```text
   ──'A'──►     one transition on 'A' from start to accept
```

Matches exactly the one-character string "A". The atom everything is built from.

--

## Gadget: concatenation `AB`

```text
   [ NFA for A ] --ε--> [ NFA for B ]
```

Wire A's accept to B's start with an ε-transition — match A, then B.

--

## Gadget: or `A|B`

```text
        ε──► [ NFA A ] ──ε┐
   start                   ├──► accept
        ε──► [ NFA B ] ──ε┘
```

A new start ε-branches into **both**; both ε-merge to a new accept.

--

## Gadget: closure `A*`

```text
        ┌───────ε────────┐
   start ──ε──► [ NFA A ] ──ε──► accept
                    └──ε (loop back)
```

ε skips A entirely (match ""), and ε loops A's accept back to its start (repeat).

--

## The four gadgets

| regex | gadget |
|---|---|
| `a` | one char-transition |
| `AB` | A `──ε──►` B |
| `A\|B` | ε-branch to both, ε-merge |
| `A*` | ε-skip + ε-loop |

One gadget per operator, each with **one start / one accept** → they compose freely.

--

## One detail: the outer wrap

Sedgewick wraps the whole regex in **implicit parentheses**:

```text
   "A|B"   →   "(A|B)"   internally
```

This gives a top-level `|` or `*` an anchor to attach to — otherwise the outermost operator has no enclosing group to bind.

--

## Build `(A|B)*` — worked

```text
   1. atoms:   ──A──►     ──B──►
   2. A|B:     new start ε-branches to both,
               both ε-merge to a new accept
   3. (A|B)*:  ε skip start→accept (match ""),
               ε loop accept→start (repeat)
```

Result: a small NFA accepting **any** string of A's and B's (including `""`).

--

## 🎬 Demo — build the NFA

<div class="algo-viz" data-algo="nfa-build">
<pre class="viz-fallback">
   build the NFA for (A*B|AC)D by Thompson's construction:
   char gadgets, then closure (A*), or (|), concatenation,
   wired with ε-transitions. states along a row; ε-arcs
   overhead; char-transitions labeled. one start, one accept.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Thompson's construction assembles the NFA for `(A*B|AC)D` — character gadgets joined by **ε-transitions** for closure, or, and concatenation. One **start**, one **accept**. Full sandbox: the **Explore** page.</small>

--

## The construction is linear

```text
   regex of length m  →  NFA with O(m) states and O(m) ε-transitions
```

Built in **Θ(m)**, in one pass over the (parsed) regex.

--

## Parsing the regex (a stack)

Scan the regex left-to-right, using a **stack** to match `(` … `)` and wire `|`:

```text
   '('  → push this index
   ')'  → pop; wire the alternation ε-edges for any '|'
   '*'  → add closure ε-edges around the previous atom/group
```

Same operator-precedence, stack-based parsing as **expression trees** (L03).

---

### Part 4 · Simulating the NFA

<small>(~26 min)</small>

--

## Simulating: track a set of states

Run the NFA deterministically by keeping the **set** of all states it could be in:

```text
   states = ε-closure({ start })
   for each char c in the text:
       next = { states reachable from `states` on c }
       states = ε-closure(next)
   accept iff accept-state ∈ states
```

--

## Simulation — worked

NFA for `A*B` on input `"AAB"`:

```text
   start:  ε-closure → {A-loop entry, and via ε the B-transition's tail}
   read A: advance on A → back in the A-loop
   read A: same
   read B: advance on B → the ACCEPT state
   → ACCEPT "AAB" ✓
   "AC": read A (A-loop), read C → no C-transition → set empties → REJECT ✗
```

--

## ε-closure

The **ε-closure** of a set of states = all states reachable via ε-transitions (a **graph reachability** problem):

```text
   ε-closure(S) = S + everything reachable from S by ε-edges
                = a DFS / BFS on the ε-transition digraph
```

--

## ε-closure — worked

ε-edges `2→3, 3→7, 5→6`; start set `{2, 5}`:

```text
   ε-closure({2,5}):
     from 2: 2 → 3 → 7      add 3, 7
     from 5: 5 → 6          add 6
   → {2, 3, 5, 6, 7}
```

It's a **DFS/BFS over ε-edges only** — the L08 graph search, reused on the automaton.

--

## 🎬 Demo — simulate (match)

<div class="algo-viz" data-algo="nfa-sim">
<pre class="viz-fallback">
   simulate (A*B|AC)D on a string, e.g. "AAABD":
   the set of ACTIVE states (highlighted) advances one input
   char at a time, taking char-transitions then ε-closure.
   accept iff the accept state is active at the end.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>Watch the **set of active states** move through the NFA one character at a time — char-transitions then **ε-closure**. **Accept** iff the accept state is active at the end. Full sandbox: the **Explore** page.</small>

--

## Simulation — in code

```text
   set<int> states = epsClosure({start});
   for (char c : text) {
       set<int> next;
       for (int s : states)
           if (match[s] == c) next.insert(s + 1);   // advance
       states = epsClosure(next);                    // ε-close
   }
   return states.count(accept) > 0;
```

Two phases per character: **advance** on the char, then **ε-close**.

--

## Simulation — the cost

```text
   |text| = n,  |regex| = m  →  NFA has O(m) states
   each char: advance + ε-closure over O(m) states/edges → O(m)
   total: O(m · n)
```

Linear in the text, linear in the regex — no catastrophic blow-up.

--

## Why set-simulation is safe

Many engines (Perl, Java, Python, JS) **backtrack** — try a path, undo, try another:

```text
   pattern (a*)*  on  "aaaa…aaaX"  → EXPONENTIAL time  (ReDoS)
```

The NFA set-simulation **never backtracks** → guaranteed **O(mn)**. `grep`, RE2 use it.

--

## Kleene's theorem

The deep result tying it all together:

> **Regular expressions and finite automata describe exactly the same languages** — the regular languages.

```text
   regex  ──build──►  NFA        (this lecture)
   NFA    ──convert──►  DFA  ──convert──►  regex   (both directions)
```

--

## The other direction: NFA → regex

Every automaton also has an equivalent **regex** (state elimination):

```text
   remove states one at a time, relabeling the affected edges
   with regexes, until one edge start → accept remains
   → that edge's label IS the regex
```

This makes the correspondence **two-way** — the essence of Kleene's theorem.

--

## NFA → DFA (determinize)

You can convert an NFA to a DFA by the **subset construction** — each DFA state = a *set* of NFA states:

```text
   the "set of active states" we track IS a DFA state
   → precompute them → O(n) matching (but up to 2^m states)
```

--

## Minimizing the DFA

A DFA can carry **redundant** states; **minimization** merges equivalent ones:

```text
   merge states that accept the same set of continuations
   → the UNIQUE smallest DFA for the language
```

The minimal DFA is a **canonical form** — two regexes are equivalent iff their minimal DFAs match.

--

## Which to use?

| you match… | use |
|---|---|
| a pattern **once** | simulate the NFA (O(mn), no build cost) |
| **one pattern, many times** (a lexer) | compile to a **DFA** (O(n) each) |
| **untrusted** patterns | NFA simulation (no ReDoS) |

Build cost vs run cost — the same trade as always.

---

### Part 5 · Wrap & ICA 17

<small>(~10 min)</small>

--

## Recap — regexes & automata

- a **regex** describes a **language** via concat, `|`, `*`, `()`
- a **finite automaton** recognizes that language
- **Thompson's construction**: regex → NFA (ε-transitions), O(m) states
- **simulate** by tracking the **set** of reachable states (ε-closure) — O(mn)

--

## Recap — the big idea

- **Kleene's theorem:** regexes ↔ finite automata — the **regular languages**
- some languages are **beyond** regular (balanced parens → grammars)
- nondeterminism = explore **all paths at once** (track a set)

> A regex is a pattern; an automaton is the machine that runs it — same power.

--

## The Chomsky hierarchy

Regular languages are the **bottom** rung of a tower of language classes:

| class | recognizer | memory |
|---|---|---|
| **regular** | finite automaton | none |
| **context-free** | pushdown automaton | a **stack** |
| **recursively enum.** | Turing machine | unbounded |

Each rung adds power by adding **memory**.

--

## Automata & regex in practice

- **grep / RE2** — NFA simulation (no catastrophic backtracking)
- **lexers** — every compiler tokenizes with automata (`flex`)
- **protocol / input validation**, log parsing
- **string algorithms** — KMP's DFA (L16) is a finite automaton!

--

## The course, end to end

Seventeen sessions, one lesson: **match the structure to the problem.**

```text
   trees → order        heaps → priority      hashing → lookup
   graphs → relations   DP → overlapping      automata → patterns
```

And **reuse**: KMP's DFA, ε-closure = DFS, Dijkstra/Prim/Huffman = the heap.

--

## ICA 17 — your turn

In `ica17/ica17.cpp`, given a small NFA (states, ε- and char-transitions) as an adjacency list:

- implement **ε-closure** (graph reachability)
- implement **NFA simulation** — advance the state set per character
- report accept / reject
- self-tests check known match/reject strings

Build `-g`, run the self-tests, Valgrind-clean.

