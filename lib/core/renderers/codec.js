// CSS 343 unified library — core/renderers/codec.js
// The three panels of a codec, side by side:
//
//     text                encoded bits            decoded text
//     ────────────        ────────────            ────────────
//     input for ENCODE    output for ENCODE       output for DECODE
//     (an editable box)   input  for DECODE
//
// so a round trip reads left → right and the middle column is literally the
// handoff: what Encode produced is what Decode consumes. The TREE is NOT drawn
// here — it has its own panel above (a plain TreeRenderer fed the same frame),
// which is why this view is DOM rather than canvas: the input column is a real
// contenteditable box, so the text being encoded is typed where it is read.
//
// Every item carries a symbol colour index `ci`. The source character, the bits
// its walk emitted, and the decoded character all get the same colour, so a run
// of one colour in the middle column IS one character's codeword.
//
// snapshot = {
//   cols: [{label, kind:'chars'|'bits', items:[{t, ci}], cur:int|null,
//           done:int, active:bool, role:'in'|'out'}, …],
//   …tree/stats, read by the OTHER panels
// }

import { symbolColor } from "../palette.js";

/** The size strip that goes UNDER the transport (spec.info with place:"below",
 *  html:true): what this text costs three ways. The ratio is withheld while the
 *  run is unfinished — a ratio off three of eleven bits is not a ratio. */
export function codecStatsHTML(st) {
  if (!st) return "";
  const cell = (k, v, cls = "v") => `<span><span class="k">${k}</span> <span class="${cls}">${v}</span></span>`;
  // "smaller" is not a given: a code built for one distribution, met by
  // another — or an adaptive code paying an escape per first appearance — can
  // cost MORE than the plain bytes it replaced. Say so when it does.
  const ratio = () => {
    if (st.partial || !st.huffman || !st.ascii) return null;
    const pct = Math.round((st.huffman / st.ascii) * 100);
    return st.huffman <= st.ascii
      ? cell("vs ASCII", `${pct}% (${(st.ascii / st.huffman).toFixed(2)}× smaller)`, "win")
      : cell("vs ASCII", `${pct}% (${(st.huffman / st.ascii).toFixed(2)}× BIGGER)`, "lose");
  };
  // a codec may name its own cells (adaptive Huffman counts escapes, not a
  // fixed-length code it never uses); the ratio is appended either way
  const parts = st.cells
    ? st.cells.map(([k, v]) => cell(k, v))
    : [cell("chars", st.chars),
       cell("ASCII", `${st.ascii} b`),
       cell(`fixed ${st.fixedLen}-bit`, `${st.fixed} b`),
       cell("Huffman", `${st.huffman} b`)];
  const r = ratio();
  if (r) parts.push(r);
  return parts.join("");
}

export class CodecPanels {
  /** @param {HTMLCanvasElement} canvas the slot Player made for this view
   *  @param {{initialText?:string, editableCol?:number, hint?:string}} [opts] */
  constructor(canvas, opts = {}) {
    this.opts = opts;
    this.editableCol = opts.editableCol ?? 0;
    // Player hands every view a canvas; this one is DOM, so the canvas stays
    // as the (hidden) aria anchor and the panels live beside it in the wrap.
    canvas.style.display = "none";
    this.canvas = canvas;
    const wrap = canvas.parentElement || canvas;
    // the actions row sits ABOVE the panels, each button centred on the gap
    // between the two panels its op moves text across: Encode straddles
    // text|bits, Decode straddles bits|decoded — so the button says WHERE the
    // text is going, not just what the op is called
    this.acts = document.createElement("div");
    this.acts.className = "u-cx-acts";
    wrap.appendChild(this.acts);
    this.el = document.createElement("div");
    this.el.className = "u-codec";
    this.el.setAttribute("role", "group");
    wrap.appendChild(this.el);
    this.cols = [];
    this._pendingText = opts.initialText ?? "";
    // built EAGERLY: the demo opens on a plain state frame (no codec columns
    // yet), and the input panel has to be there to type into before the first
    // Encode — an empty wrap would be a dead box until something ran
    this._build({ cols: (opts.labels ?? ["text", "encoded bits", "decoded text"])
      .map((label, i) => ({ label, kind: i === 1 ? "bits" : "chars", items: [] })) });
  }

  /** The editable column's text, as typed (the op reads this instead of a
   *  separate value box). */
  text() {
    const b = this.cols[this.editableCol]?.body;
    return (b ? b.textContent : this._pendingText).replace(/\s+$/, "");
  }
  setText(t) {
    this._pendingText = t;
    const b = this.cols[this.editableCol]?.body;
    if (b) b.textContent = t;
  }

  /** Buttons for the ops, placed on the panel BOUNDARIES.
   *  @param {Array<{label:string, gap:number, run:Function, title?:string}>} actions
   *  `gap` 0 = between panels 0 and 1, 1 = between 1 and 2. */
  setActions(actions = []) {
    this.acts.replaceChildren();
    this._acts = actions;
    actions.forEach((a) => {
      const btn = document.createElement("button");
      btn.className = "u-cx-act";
      btn.textContent = a.label;
      if (a.title) btn.title = a.title;
      // both buttons live on ONE row; their spans overlap in the middle column
      // (1–3 and 2–4), and without the explicit row the grid would push the
      // second one down to avoid the overlap
      btn.style.gridColumn = `${a.gap + 1} / ${a.gap + 3}`;
      btn.style.gridRow = "1";
      btn.onclick = () => a.run();
      this.acts.appendChild(btn);
    });
    this.acts.classList.toggle("is-on", actions.length > 0);
  }

  _build(snapshot) {
    this.el.innerHTML = "";
    this.cols = snapshot.cols.map((col, i) => {
      const box = document.createElement("div");
      box.className = "u-cx-col";
      const head = document.createElement("div");
      head.className = "u-cx-head";
      const body = document.createElement("div");
      body.className = "u-cx-body" + (col.kind === "bits" ? " is-bits" : "");
      if (i === this.editableCol) {
        body.contentEditable = "plaintext-only";
        if (!body.isContentEditable) body.contentEditable = "true"; // older engines
        body.spellcheck = false;
        body.classList.add("is-edit");
        body.setAttribute("aria-label", `${col.label} — type the text to encode`);
        body.addEventListener("input", () => { this._pendingText = body.textContent; });
        if (this._pendingText) body.textContent = this._pendingText;
      }
      // the panel's height is the height the SPEC asked for this view — the
      // canvas Player sized for it, which this DOM view otherwise ignores
      const h = this.opts.height ?? this.canvas.height ?? 150;
      body.style.minHeight = Math.max(44, h - 26) + "px";
      body.style.maxHeight = Math.max(44, h - 26) + "px";
      box.appendChild(head); box.appendChild(body);
      this.el.appendChild(box);
      return { box, head, body };
    });
  }

  draw(snapshot) {
    this._last = [snapshot];
    const cols = snapshot?.cols;
    if (!cols || !cols.length) {
      // a frame with no columns at all is Reset: the code is gone, so the
      // OUTPUT panels must empty too — but the text the user typed is theirs
      this.cols.forEach(({ box, head, body }, i) => {
        box.classList.remove("is-active");
        head.querySelector(".u-cx-hint.is-on")?.remove();
        if (i !== this.editableCol) body.replaceChildren();
      });
      return;
    }
    if (this.cols.length !== cols.length) this._build(snapshot);

    cols.forEach((col, i) => {
      const { box, head, body } = this.cols[i];
      box.classList.toggle("is-active", !!col.active);
      head.innerHTML = `<span class="u-cx-name">${col.label}</span>`
        + (i === this.editableCol ? `<span class="u-cx-hint">editable</span>`
          : col.active ? `<span class="u-cx-hint is-on">${col.role === "in" ? "reading" : "writing"}</span>` : "");

      // The editable column is the user's to type in: never overwrite it while
      // it has focus, and never blank it just because a frame carries no items
      // (Build and Reset produce such frames — the typed text must survive).
      const editing = i === this.editableCol;
      if (editing && (document.activeElement === body || !col.items.length)) return;
      this._items(body, col);
    });
    this.canvas.setAttribute("aria-label", this.describe(snapshot));
  }

  _items(body, col) {
    const done = col.done ?? col.items.length;
    const frag = document.createDocumentFragment();
    col.items.forEach((it, k) => {
      const t = typeof it === "object" ? it.t : it;
      const ci = typeof it === "object" ? it.ci : -1;
      const sp = document.createElement("span");
      sp.className = "u-cx-it";
      sp.textContent = t;
      if (k === col.cur) {
        sp.classList.add("is-cur");
        sp.style.background = symbolColor(ci);
      } else if (k < done) {
        sp.style.color = symbolColor(ci);
      } else {
        sp.classList.add("is-todo");     // read but not yet consumed — plain ink
      }
      frag.appendChild(sp);
    });
    body.replaceChildren(frag);
  }

  /** Text alternative — the three columns as they stand. */
  describe(snap) {
    if (!snap?.cols) return "Encode/decode panels.";
    const say = (c) => {
      const s = (c.items ?? []).map((it) => (typeof it === "object" ? it.t : it)).join("");
      return `${c.label}: ${s || "empty"}`;
    };
    return snap.cols.map(say).join(". ") + ".";
  }
}
