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

  WORKED MACHINES (all hand-verified, and identical to the ICA's buildExample/
  buildExample2, which drop the implicit outer wrap):
    A*B (unwrapped):  states 0'A' 1'*' 2'B' 3=accept
                      ε: 0→1 (skip A), 1→0 (repeat A), 1→2 (fall through '*')
                      match: 0─A→1, 2─B→3
                      ε-closure({0}) = {0,1,2}
                      "AAB": {0,1,2} →A {0,1,2} →A {0,1,2} →B {3} ACCEPT
                      "B" ACCEPT (zero A's) · "BA","AC" REJECT (empty set)
    the demo wraps: (A*B) has 6 states (letters shift +1, ε (0,1) and (4,5) added)
    ((A*B|AC)D) wrapped: 12 states, 9 ε-edges, 5 char edges;
                      "AAABD" ✓ (left branch) · "ACD" ✓ (right) · "AAD" ✗

  Covered in Spring-26 (Kim): Module 7 (Languages/Grammar) + Module 8 (FSM) — so
  languages, grammars, and finite-state machines ARE prior-offering material; the
  RE→NFA construction + simulation is the Sedgewick §5.4 addition. Demos: nfa-build
  + nfa-sim (GraphRenderer, editable regex/text).

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

## The four operations

| operation | regex | meaning |
|---|---|---|
| **concatenation** | `AB` | A then B |
| **or (union)** | `A\|B` | A or B |
| **closure (star)** | `A*` | zero or more A |
| **grouping** | `(…)` | precedence |

Everything else is **sugar**: `A+ = AA*` · `A? = (A|ε)` · `[abc] = (a|b|c)` · `.` = any char.

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

## Your turn — write the regex

Over the alphabet {A, B}: all strings that **end in B**.

<small>**`(A|B)*B`** — anything, then one final B. Check: "B" ✓ (star = zero), "AB" ✓, "AABB" ✓; "BA" ✗ (ends in A), "" ✗ (needs at least the B). A common wrong answer is `A*B` — it rejects "BAB", which does end in B.</small>

--

## Precedence

Binding tightest to loosest: **`*`** > **concatenation** > **`|`**

```text
   AB|C  = (AB)|C          A|BC = A|(BC)
   AB*   = A(B*)           (AB)* ≠ AB*
```

Use `()` to override — the #1 source of regex bugs.

--

## Regexes in code & in practice

```text
   std::regex re("(a|b)*c");                // C++ <regex>
   if (std::regex_match(s, re)) …           // whole-string match
```

- **search** — grep, editor find, log analysis
- **validation** — emails, phone numbers, dates
- **lexing** — the first phase of every compiler

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

## Your turn — run the DFA

Same machine. Which of these does it accept?

```text
   "0110"        "111"        ""
```

<small>**"0110"**: A →0 B →1 A →1 A →0 **B → ACCEPT** (ends in 0). **"111"**: A →1 A →1 A →1 **A → reject**. **""**: never leaves A — **reject** (the empty string doesn't end in 0). The state always equals "did the string so far end in 0?" — that's the machine's whole memory.</small>

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

## Sedgewick's encoding — one state per char

The invariant that makes it implementable in a page:

```text
   regex re of length m  →  states 0..m  (state m = accept)
   state i "is" re[i]:
     a LETTER state consumes its char:  i ──re[i]──► i+1
     a META state ( ) | * has only ε-edges
```

**The only way to consume input is i → i+1.** Everything else is ε.

--

## Build `A*B` — worked

```text
   re:  A   *   B         states 0 1 2 3   (3 = accept)

   i=0 'A', next is '*' →  ε 0→1 (skip the A)
                           ε 1→0 (repeat the A)
                           match edge 0 ──A──► 1
   i=1 '*'              →  ε 1→2 (fall through)
   i=2 'B'              →  match edge 2 ──B──► 3

   ε: 0→1, 1→0, 1→2      match: 0─A→1, 2─B→3
```

--

## Parsing with a stack (+ the outer wrap)

Scan left-to-right; a **stack** matches `(`…`)` and wires `|`:

```text
   '('  → push its index          ')' → pop; wire the '|' ε-edges
   '*'  → ε-skip + ε-loop around the previous atom/group
   first: wrap the regex in implicit parens — "A|B" → "(A|B)"
   (a top-level | or * needs a '(' to anchor its ε-edges)
```

Same stack-based operator parsing as **expression trees** (L03).

--

## 🎬 Demo — build the NFA

<div class="algo-viz" data-algo="nfa-build">
<pre class="viz-fallback">
   Sedgewick's construction of A*B, edge by edge: one state
   per char of "(A*B)" (the implicit wrap), ε-edges for skip/
   repeat/fall-through, match edges on the letters.
   then try (A*B|AC)D: 12 states, 9 ε-edges, 5 match edges.
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>**Build** replays the construction edge by edge — the worked `A*B` plus the **outer wrap** (letters shift +1, ε at each end). Type your own: `(A*B|AC)D`, `(A|B)*B`, … (letters and `( ) | *`).</small>

--

## The construction is linear

Count the edges per character of the (wrapped) regex:

```text
   each LETTER:   exactly 1 match edge
   each ( ) * :   1 fall-through ε          each '*': +2 (skip, repeat)
   each '|' :     +2 (branch-in, skip-out)
   → ≤ 3 ε-edges per char:  O(m) states, O(m) edges, built in Θ(m)
   check — ((A*B|AC)D): 12 states, 9 ε (5 fall + 2 star + 2 or), 5 match ✓
```

---

### Part 4 · Simulating the NFA

<small>(~26 min)</small>

--

## Simulating: track a set of states

Run the NFA deterministically by keeping the **set** of all states it could be in:

```text
   states = ε-closure({ start })
   for each char c in the text:
       next = { i+1 : i ∈ states and re[i] == c }
       states = ε-closure(next)
   accept iff accept-state ∈ states
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

On the `A*B` machine (ε: 0→1, 1→0, 1→2):

```text
   ε-closure({0}):
     expand 0:  0→1     add 1
     expand 1:  1→0 (seen),  1→2     add 2
     expand 2:  no ε-edges
   → {0, 1, 2}    (ready to match A at 0 — or B at 2 already!)
```

A **DFS over ε-edges** — the L08 graph search, reused on the automaton.

--

## Simulation — worked

`A*B` on `"AAB"` (match edges 0─A→1, 2─B→3; accept = 3):

```text
   start:    ε-closure({0})            = {0,1,2}
   read A:   0 matches A → {1};  close = {0,1,2}
   read A:   0 matches A → {1};  close = {0,1,2}
   read B:   2 matches B → {3};  close = {3}
   3 = accept  →  ACCEPT ✓
```

`"AC"`: after A, `{0,1,2}`; read C → **{ } — dead, REJECT** ✗

--

## Your turn — simulate

Same `A*B` machine. Trace `"B"` and `"BA"`:

<small>**"B"**: start {0,1,2}; read B: 2 matches → {3} = accept → **ACCEPT** (zero A's — the ε-skip at work). **"BA"**: after B, {3}; read A: state 3 is the accept state, it matches nothing → **{ } → REJECT**. The accept state has no outgoing edges — reaching it early only helps if the input *ends* there.</small>

--

## 🎬 Demo — simulate (match)

<div class="algo-viz" data-algo="nfa-sim">
<pre class="viz-fallback">
   simulate (A*B|AC)D on typed strings — the set of ACTIVE
   states (highlighted) advances one char at a time: match
   edges, then ε-closure.  "AAABD" ✓ (left branch A*B),
   "ACD" ✓ (right branch AC), "AAD" ✗ (set goes empty).
[ interactive demo — open this deck on the course site ]
</pre>
</div>

<small>**Match** drives the **set of active states** one char at a time — match edges, then **ε-closure**. Try `AAABD` ✓, `ACD` ✓ (the other branch), `AAD` ✗ (watch the set die). **Build** swaps in your own regex first.</small>

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
   |text| = n,  |regex| = m  →  NFA has O(m) states, O(m) ε-edges
   each char: advance ≤ m states + ε-closure (DFS, O(m) edges) → O(m)
   total: O(m · n)
```

Linear in the text, linear in the regex — no catastrophic blow-up.

--

## Why the simulation is correct

**Invariant:** after reading `text[0..i)`, the set = **exactly** the states reachable from start by consuming `text[0..i)`.

```text
   base:  ε-closure({start}) = reachable on ""            ✓
   step:  reachable on t[0..i+1) = ε-closure( advance of
          reachable on t[0..i) by t[i] )                  ✓
   end:   accept ∈ set  ⟺  some path consumes the whole
          string and ends at accept  ⟺  the NFA accepts
```

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

## Recap — pattern → machine

- a **regex** describes a **language** via concat, `|`, `*`, `()`
- an **NFA** decides membership: one state per char, ε-digraph, match = i→i+1
- **build** in Θ(m) (stack + gadgets) · **simulate** in O(mn) (set + ε-closure = DFS)
- **Kleene:** regexes ↔ automata — the **regular** languages; beyond them → grammars

> Nondeterminism = explore **all paths at once** — a set, not a guess.

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

## Automata in practice

- **grep / RE2** — NFA set-simulation (immune to ReDoS)
- **lexers** — every compiler tokenizes with a DFA (`flex`)
- **protocol & input validation** — automata over streams
- **KMP (L16)** — its failure-function machine **is a DFA** for one pattern

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

In `ica17/ica17.cpp`, given the two NFAs from tonight's slides (`A*B` and `(A*B|AC)D`, hand-built, unwrapped) as ε-adjacency lists:

- implement **ε-closure** (graph reachability)
- implement **NFA simulation** — advance the state set per character
- report accept / reject
- self-tests check known match/reject strings

Build `-g`, run the self-tests, Valgrind-clean.

