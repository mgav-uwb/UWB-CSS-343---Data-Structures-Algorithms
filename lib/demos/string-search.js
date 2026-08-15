// CSS 343 unified library — demos/string-search.js
// Substring search as a SIDE-BY-SIDE race: brute force (worst case Θ(nm)) vs
// KMP (worst case Θ(n+m)) run the SAME text/pattern pair in lockstep, one
// trace frame per tick — KMP finishes and freezes while brute force keeps
// re-trying shifts. Both find EVERY occurrence and count matches. The view is
// the codec-style SearchPanels: the TEXT lives in an editable box (top panel;
// long input welcome), the value box takes only the PATTERN, and the pattern —
// with its failure function, on the KMP panel — is drawn under the text.
// Repeat shorthand works in both (A^40B).

import { StringSearch, SearchPanels, MatrixRenderer } from "../index.js";
import { expandRepeats } from "../core/sequence.js";
import { TEXT_MAX, PATTERN_MAX } from "../structures/string-search.js";

const DTEXT = "ABABABCABABABCAB", DPAT = "ABABC";

// The editable text panel registers itself here so the ops can read it (one
// active mount per page — the same convention the adaptive-Huffman demo uses).
// Case is PRESERVED (the text shows as typed; comparisons are case-insensitive
// in the structure), and a pattern may contain spaces — only edges are trimmed
// and runs of whitespace collapse to one space, in text and pattern alike.
const view = {};
const cleanPattern = (v) =>
  expandRepeats(String(v ?? "")).replace(/\s+/g, " ").trim().slice(0, PATTERN_MAX);
const cleanText = (t) =>
  expandRepeats(String(t ?? "")).replace(/\s+/g, " ").trim().slice(0, TEXT_MAX);
const currentText = () => cleanText(view.top?.text()) || DTEXT;

const PROSE =
  "Beneath the bustling metropolitan streets lies a hidden, sprawling underground world " +
  "that few urban residents ever truly notice. Thousands of busy commuters rush through " +
  "the noisy underground subway tubes every single morning, completely unaware of the " +
  "fascinating historical underground tunnels stretching out right beside them. Many " +
  "underprepared city planners often underestimate this massive underground infrastructure " +
  "network, which effectively serves as the city's invisible foundation, safely sheltering " +
  "complex utility lines, forgotten transit tracks, and ancient brick pathways. While " +
  "modern life moves rapidly above, this quiet underground labyrinth remains completely " +
  "frozen in time, safely guarding the historic secrets that casual pedestrians walking " +
  "on the surface will never experience today.";

const MTDNA =  // Homo sapiens mitochondrion (rCRS, NC_012920.1), bases 1–1150
  "GATCACAGGTCTATCACCCTATTAACCACTCACGGGAGCTCTCCATGCATTTGGTATTTTCGTCTGGGGGGTATGC" +
  "ACGCGATAGCATTGCGAGACGCTGGAGCCGGAGCACCCTATGTCGCAGTATCTGTCTTTGATTCCTGCCTCATCCT" +
  "ATTATTTATCGCACCTACGTTCAATATTACAGGCGAACATACTTACTAAAGTGTGTTAATTAATTAATGCTTGTAG" +
  "GACATAATAATAACAATTGAATGTCTGCACAGCCACTTTCCACACAGACATCATAACAAAAAATTTCCACCAAACC" +
  "CCCCCTCCCCCGCTTCTGGCCACAGCACTTAAACACATCTCTGCCAAACCCCAAAAACAAAGAACCCTAACACCAG" +
  "CCTAACCAGATTTCAAATTTTATCTTTTGGCGGTATGCACTTTTAACAGTCACCCCCCAACTAACACATTATTTTC" +
  "CCCTCCCACTCCCATACTACTAATCTCATCAATACAACCCCCGCCCATCCTACCCAGCACACACACACCGCTGCTA" +
  "ACCCCATACCCCGAACCAACCAAACCCCAAAGACACCCCCCACAGTTTATGTAGCTTACCTCCTCAAAGCAATACA" +
  "CTGAAAATGTTTAGACGGGCTCACATCACCCCATAAACAAATAGGTTTGGTCCTAGCCTTTCTATTAGCTCTTAGT" +
  "AAGATTACACATGCAAGCATCCCCGTTCCAGTGAGTTCACCCTCTAAATCACCACGATCAAAAGGAACAAGCATCA" +
  "AGCACGCAGCAATGCAGCTCAAAACGCTTAGCCTAGCCACACCCCCACGGGAAACAGCAGTGATTAACCTTTAGCA" +
  "ATAAACGAAAGTTTAACTAAGCTATACTAACCCCAGGGTTGGTCAATTTCGTGCCAGCCACCGCGGTCACACGATT" +
  "AACCCAAGTCAATAGAAGCCGGCGTAAAGAGTGTTTTAGATCACCCCCTCCCCAATAAAGCTAAAACTCACCTGAG" +
  "TTGTAAAAAACTCCAGTTGACACAAAATAGACTACGAAAGTGGCTTTAACATATCTGAACACACAATAGCTAAGAC" +
  "CCAAACTGGGATTAGATACCCCACTATGCTTAGCCCTAAACCTCAACAGTTAAATCAACAAAACTGCTCGCCAGAA" +
  "CACTACGAGC";

const EXAMPLES = [
  { name: "lecture default — 2 matches", text: DTEXT, pattern: DPAT },
  { name: "prose: “underground”, 5 matches", text: PROSE, pattern: "underground" },
  { name: "DNA: GATC in human mtDNA (rCRS 1–1150)", text: MTDNA, pattern: "GATC" },
  { name: "adversarial: A^40B / A^6B", text: "A^40B", pattern: "A^6B" },
  { name: "skipped alignments: AABAAC (handout)", text: "AABAABAAC", pattern: "AABAAC" },
  { name: "shorter border rescues: AABAAB (handout)", text: "AABAAABAAB", pattern: "AABAAB" },
  { name: "overlapping matches: AA in A^6", text: "A^6", pattern: "AA" },
];

const mkPanel = (title, algo, opts) => ({
  title,
  make: () => { const s = new StringSearch(); s.build([DTEXT, DPAT]); return s; },
  renderer: (c) => {
    const p = new SearchPanels(c, opts);
    if (opts.editable) view.top = p;
    return p;
  },
  op: (s, v) => { s.build([currentText(), cleanPattern(v) || DPAT]); return s[algo](); },
  stat: (snap, f) => {
    const c = (snap && snap.found ? snap.found : []).length;
    return `${f.counters["compare"] || 0} compares · ${c} match${c === 1 ? "" : "es"}`;
  },
  width: 900, height: 32,
});

export const stringSearchDemo = {
  id: "string-search",
  title: "Substring Search race (brute force vs. KMP)",
  blurb: "The SAME text scanned side by side, one comparison-frame per tick, in lockstep — both searchers find EVERY occurrence, with a live match count. Type the text into the left panel (editable; long prose is fine — repeat shorthand like A^40B expands); the value box takes only the pattern (spaces allowed, case ignored). Bold colored chips mark the two indices, the tinted run is the current partial match in both the text and the pattern, green runs are completed matches, the KMP panel draws the failure function under the pattern — and playback adapts, hurrying over first-letter misses and slowing where a partial match is in progress.",
  about: `
      <p class="lede">Both searchers on one text, stepped in lockstep, with a comparison counter
      and a match count per panel. The counters are the argument: brute force is Θ(nm), KMP is
      Θ(n+m), and you can watch the difference accumulate.</p>
      <h3>How to drive it</h3>
      <p>The <b>left text box is editable</b> — click in, type or paste anything up to ${TEXT_MAX}
      characters (repeat shorthand expands: <code>A^40B</code>). The value box takes only the
      <b>pattern</b>; a pattern may contain <b>spaces</b> ("underground world"), and matching
      <b>ignores case</b> while the text stays exactly as you typed it. Run <b>Race both</b>, or
      pick a pair from the <b>examples…</b> menu in the text panel's header. Both algorithms
      search the WHOLE text and report every occurrence. <b>Playback paces itself</b>: frames
      where the very first pattern letter misses are routine, so they play at a fraction of the
      tick, and playback slows down wherever a partial match is being extended or torn down —
      on prose, the scan sprints between the interesting neighbourhoods.</p>
      <h3>How to read the picture</h3>
      <p>A thin <b>frame</b> outlines the m text cells the pattern currently covers — the
      alignment itself, sliding right as the search advances. The filled bold chip is the
      character being compared — purple on a match, red on a mismatch — and it sits at text[i]
      and P[j] simultaneously, so the two indices are always visible. The lighter tinted run is the <b>current partial match</b>: the same j characters
      highlighted in the text and in the pattern, which is exactly the "matched prefix survives"
      claim drawn live. Completed occurrences turn green and stay. On the KMP panel the failure
      function rides under the pattern, and the amber cell is the entry a fall-back just
      consulted — the matched prefix's next border, i.e. the next viable alignment.</p>
      <h3>Runs worth making</h3>
      <ul>
        <li><b>lecture default</b> — <code>ABABABCABABABCAB</code> / <code>ABABC</code>: both find
        2 matches; brute force pays 32 comparisons, KMP 18.</li>
        <li><b>prose</b> — <code>underground</code> in a paragraph of real English (the examples…
        menu): 5 occurrences, and the adaptive pacing earns its keep — the scan sprints through
        hundreds of first-letter misses and slows at every <code>under…</code>, including the
        near-misses <code>underprepared</code> and <code>underestimate</code>, which build a
        partial match and then tear it down.</li>
        <li><b>DNA</b> — <code>GATC</code> in the first 1150 bases of the human mitochondrial
        genome (the rCRS reference sequence, NC_012920 — real data, and the genome literally
        opens with a GATC). This is what restriction enzymes do for a living: Sau3AI cuts at
        every <code>GATC</code>, and the 3 green runs are its cut sites. Two lessons ride along:
        with a 4-letter alphabet a quarter of all positions start a partial match, so playback
        slows far more often than on English — and since <code>GATC</code> has no self-overlap
        (<code>fail = [0,0,0,0]</code>) the counters come out nearly even, 1364 against 1315.
        KMP's edge is self-overlap, not magic; on patterns like <code>A^6B</code> it is 3×.</li>
        <li><b>adversarial</b> — <code>A^40B</code> / <code>A^6B</code>: one match at the very
        end; brute force 245, KMP 75. Every brute-force shift re-matches six A's; KMP never
        re-reads a text character. Use ⏩.</li>
        <li><b>the handout's two diagrams, live</b> — <code>AABAABAAC</code> / <code>AABAAC</code>
        (the fall-back's first stop works) and <code>AABAAABAAB</code> / <code>AABAAB</code> (the
        first stop fails and the SHORTER border rescues the search — watch j fall twice while i
        stands still).</li>
        <li><b>overlapping matches</b> — <code>AA</code> in <code>A^6</code>: five occurrences,
        because after a full match KMP continues with j = fail[m−1] instead of 0. Brute force
        finds the same five by just trying every shift.</li>
      </ul>
      <p>The gap grows with the <em>pattern</em> length, so a six-character pattern can only show
      a few ×. The lecture's n = 10⁶, m = 1000 figure — a billion comparisons against a million —
      is the same effect at a scale no animation can show.</p>`,
  links: [
    { href: "../handouts/ch16-strings-tries.html#kmp", label: "Chapter 16 §6: KMP →" },
    { href: "../sessions/S16-strings-tries/index.html", label: "Lecture 16 — Parts 3–4 →" },
  ],
  proto: "kmp",
  panels: [   // side by side — the two texts scan in lockstep next to each other
    mkPanel("brute force", "bruteForce", { label: "text", editable: true, initialText: DTEXT, showFail: false, height: 84 }),
    mkPanel("KMP", "kmp", { label: "text (same input)", showFail: true, height: 84 }),
  ],
  opArg: "string",
  opLabel: "Race both", valLabel: "pattern", valWidth: 170,
  initialValue: DPAT, placeholder: "pattern (A^6B expands)",
  speed: 300, speedControl: true, finishButton: true,
  onMount: (demo) => view.top?.setExamples(EXAMPLES, (ex) => {
    view.top.setText(cleanText(ex.text));
    demo.bar.setVal(ex.pattern);
  }),
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
      <h3>How to read the picture</h3>
      <p>Three rows: the pattern, <code>fail[]</code> filling in, and the two pointers the whole
      build consists of. <b>j</b> marks the cell being filled; <b>k</b> is the current overlap
      length, and it doubles as an index because <code>P[k]</code> is exactly the character
      <code>P[j]</code> is compared against. Watch which one moves: a <em>match</em> advances
      both, a <em>fall back</em> moves <b>k</b> alone and leaves <b>j</b> standing still. That
      asymmetry is the algorithm — j only ever goes forward, m times, which is why the build is
      \\(\\Theta(m)\\) despite the inner loop.</p>
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
    { name: "AABAAABAAAABAAAB (two partial fall-backs — the handout's diagram)", values: { p: "AABAAABAAAABAAAB" } },
    { name: "AAAB (the adversarial pattern)", values: { p: "AAAB" } },
    { name: "ABCDE (no self-overlap at all)", values: { p: "ABCDE" } },
  ],
  height: 210,   // three rows now: P, fail[], and the j / k pointers
  ops: [
    { name: "Build fail[]", run: (s, _v, vals) => {
      const pat = expandRepeats(String(vals.p ?? "")).toUpperCase().replace(/[^A-Z]/g, "").slice(0, 20) || "ABABAC";
      s.build(["", pat]);
      return s.failTable();
    } },
  ],
};
