// CSS 343 unified library — demos/string-search.js
// Substring search as a SIDE-BY-SIDE race: brute force (worst case Θ(nm)) vs
// KMP (worst case Θ(n+m)) run the SAME text/pattern pair in lockstep, one
// trace frame per tick — KMP finishes and freezes while brute force keeps
// re-trying shifts. Compare counters live in each panel's title; ⏩ 1024×
// sweeps brute force to the end. The value box takes "TEXT PATTERN" (repeat
// shorthand works: A^11B A^3B is the adversarial pair).

import { StringSearch, ArrayRenderer, MatrixRenderer } from "../index.js";
import { expandRepeats } from "../core/sequence.js";

const DTEXT = "ABABABCABABABCAB", DPAT = "ABABC";

const pair = (v) => {
  const w = expandRepeats(String(v ?? "")).toUpperCase().replace(/[^A-Z ]/g, "")
    .trim().split(/\s+/).map((s) => s.slice(0, 24));
  return w.length >= 2 ? [w[0], w[1]] : [DTEXT, w[0] || DPAT];
};
const mkPanel = (title, algo) => ({
  title,
  make: () => { const s = new StringSearch(); s.build([DTEXT, DPAT]); return s; },
  renderer: (c) => new ArrayRenderer(c, { mode: "cells" }),
  op: (s, v) => { s.build(pair(v)); return s[algo](); },
  // KMP's Θ(m) aux — the failure table — rides along in its frames' snapshots
  stat: (snap, f) => `${f.counters["compare"] || 0} compares`
    + (snap && snap.lps ? ` · failure table [${snap.lps.join(",")}]` : ""),
  width: 900, height: 130,
});

export const stringSearchDemo = {
  id: "string-search",
  title: "Substring Search race (brute force vs. KMP)",
  blurb: "The SAME text/pattern pair, one comparison-frame per tick, in lockstep: brute force retries the whole pattern at every shift (sliding by one on a mismatch) while KMP's failure table means the text pointer never backs up — KMP finishes and freezes, brute force keeps paying. Type \"TEXT PATTERN\"; the adversarial pair is A^11B A^3B (36 vs 20 compares).",
  about: `
      <p class="lede">Both searchers on one text, stepped in lockstep, with a comparison counter
      under each. The counters are the argument: brute force is Θ(nm), KMP is Θ(n+m), and you can
      watch the difference accumulate.</p>
      <h3>The structural difference, in one line</h3>
      <p>On a mismatch, brute force slides the pattern by ONE and re-reads text it has already
      seen; KMP consults the failure function, slides the pattern by as much as the pattern's own
      self-overlap allows, and <b>never moves the text pointer backwards</b>. That is the whole of
      it — and it is why KMP can run on a stream you cannot rewind.</p>
      <h3>Two runs worth making</h3>
      <ul>
        <li><code>ABABABCABABABCAB</code> / <code>ABABC</code> (the default, the lecture's
        instance) — first hit at index <b>2</b>, and the counters read <b>11 against 8</b>. On
        ordinary text the two are close, which is the honest starting point.</li>
        <li><code>A^40B</code> / <code>A^6B</code> — the adversarial family, written with the
        repeat shorthand. Brute force takes <b>245</b> comparisons, KMP <b>75</b>: every alignment
        matches six A's and then fails on the B, and brute force starts over each time. Use ⏩.</li>
      </ul>
      <p>The gap grows with the <em>pattern</em> length (roughly m/2 for this family), so a
      six-character pattern can only show 3×. The lecture's n = 10⁶, m = 1000 figure — a billion
      comparisons against a million — is the same effect at a scale no animation can show.</p>`,
  links: [
    { href: "../handouts/ch16-strings-tries.html#kmp", label: "Chapter 16 §6: KMP →" },
    { href: "../sessions/S16-strings-tries/index.html", label: "Lecture 16 — Parts 3–4 →" },
  ],
  proto: "kmp",
  stacked: true,
  panels: [mkPanel("brute force", "bruteForce"), mkPanel("KMP", "kmp")],
  opArg: "string",
  opLabel: "Race both", valLabel: "text pattern", valWidth: 260,
  initialValue: `${DTEXT} ${DPAT}`, placeholder: "TEXT PATTERN or A^11B A^3B",
  speed: 300, speedControl: true, finishButton: true,
};

export const kmpFailDemo = {
  id: "kmp-fail",
  proto: "string-search",
  title: "KMP — building the failure function",
  blurb: "The table the search demo takes for granted, built step by step: the pattern matched against ITSELF. fail[j] is the longest proper prefix of P[0..j] that is also a suffix of it, and a mismatch falls back through the part of the table already built — the same never-back-up trick the search uses, applied to the pattern.",
  about: `
      <p class="lede">The search demo starts with <code>fail[]</code> already built. This is where
      it comes from — and it is the piece the exam asks for, because it is the only part of KMP
      that is not a straight loop.</p>
      <h3>What fail[j] means</h3>
      <p>The longest <b>proper prefix</b> of <code>P[0..j]</code> that is also a <b>suffix</b> of
      it. Read operationally: <em>"if I have matched j+1 characters and the next one fails, how
      much of that match survives?"</em> — because those surviving characters are already aligned,
      the text pointer need not move.</p>
      <h3>The build, in three moves</h3>
      <ul>
        <li><b>match</b> — <code>P[j] == P[k]</code>: the overlap grows, write <code>k+1</code>.</li>
        <li><b>fall back</b> — mismatch with <code>k &gt; 0</code>: set <code>k = fail[k-1]</code>
        and try again. This reads the part of the table <em>already built</em>, which is the
        self-reference that keeps the whole build Θ(m).</li>
        <li><b>give up</b> — mismatch with <code>k == 0</code>: write 0 and move on.</li>
      </ul>
      <h3>The two patterns from the slides</h3>
      <ul>
        <li><code>AABAA</code> → <b>[0, 1, 0, 1, 2]</b>. The B breaks the run to 0, then AA
        re-grows it.</li>
        <li><code>ABABAC</code> → <b>[0, 0, 1, 2, 3, 0]</b> — the your-turn pattern. Watch the C
        at the end fall 3 → fail[2] = 1 → fail[0] = 0 → 0: <em>three</em> fallbacks in one step,
        each one consulting a cell the build already wrote.</li>
      </ul>
      <p>Then look at the <a href="demo.html?ds=string-search">search demo</a> again: on a
      mismatch after j matched characters it sets <code>j = fail[j-1]</code> and leaves the text
      pointer alone. Same table, same move.</p>`,
  links: [
    { href: "../handouts/ch16-strings-tries.html#kmp", label: "Chapter 16 §6: KMP →" },
    { href: "../sessions/S16-strings-tries/index.html", label: "Lecture 16 — Part 4 →" },
  ],
  make: () => new StringSearch(),
  initial: "",
  noBuild: true,
  chrome: { showValue: false },
  stateMsg: () => 'ready: fail("ABABAC") — the your-turn pattern',
  renderer: (c) => new MatrixRenderer(c),
  costs: ["compare", "read", "write"],
  inputs: [{ key: "p", label: "pattern", value: "ABABAC", width: 130 }],
  presets: [
    { name: "ABABAC (the your-turn)", values: { p: "ABABAC" } },
    { name: "AABAA (the worked slide)", values: { p: "AABAA" } },
    { name: "AABAAC (the search trace)", values: { p: "AABAAC" } },
    { name: "AAAB (the adversarial pattern)", values: { p: "AAAB" } },
    { name: "ABCDE (no self-overlap at all)", values: { p: "ABCDE" } },
  ],
  height: 170,
  ops: [
    { name: "Build fail[]", run: (s, _v, vals) => {
      const pat = expandRepeats(String(vals.p ?? "")).toUpperCase().replace(/[^A-Z]/g, "").slice(0, 14) || "ABABAC";
      s.build(["", pat]);
      return s.failTable();
    } },
  ],
};
