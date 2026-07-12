// CSS 343 unified library — core/full-demo.js
// The "full demo" tier: a complete sandbox for a data structure exposing ALL its
// operations, built from a small spec. (Lecture slides use the Player directly
// with simplified chrome to spotlight one learning outcome.) One harness serves
// every structure — each structure only supplies a spec (see demos/*.js).
//
// spec = {
//   id, title,
//   make: () => instance,                 // fresh structure (has build/snapshot)
//   initial: "50,30,70,…",                // default build input — a plain number list, OR
//                                         // a range spec START..STOP[:STEP][:ORDER] (see sequence.js);
//                                         // ORDER in {ASC,DESC,RAND,ZIG,ZAG}, e.g. "1..80:ZIG"
//   renderer: (canvas) => Renderer,       // shared shape renderer
//   costs: ["compare", …],                // which counters to show
//   remake?: (vals) => instance,          // like make, but sees the named inputs'
//                                         // current values — lets a Build pick up a
//                                         // structure PARAMETER (e.g. the B-tree's
//                                         // order M) from an input box
//   inputs?: [ { key, label, value?, placeholder?, width? } ],
//                                         // NAMED, always-visible input boxes (e.g. a regex box
//                                         // and a text box on the NFA demo); every op's
//                                         // run(inst, v, vals) receives their current values as
//                                         // `vals` keyed by `key` — what was typed stays visible,
//                                         // unlike the shared value box
//   ops: [ { name, arg?: "number"|"pair"|"string", run(inst, v, vals) -> Trace, autoplay?, ghost?,
//            requiresFlag?, setsFlag?, clearsFlag? } ],
//            // requiresFlag: button is disabled until spec.flags[requiresFlag] is true
//            //   (e.g. a "sort down" op that only makes sense after heapify has run)
//            // setsFlag/clearsFlag: after a successful run, mark (or unmark) a named
//            //   flag — flags reset to {} on every Build/Clear
//   buildStep?: (inst, key) => Trace,     // if given, Build animates one call per key
//                                         // (spliced into one trace) instead of a silent bulk build
//   buildAll?: (inst, keys) => Trace,     // if given, Build (and the initial
//                                         // display) run ONE animated trace over
//                                         // the whole array via inst.loadRaw()
//                                         // instead of inst.build() — for
//                                         // structures with a real Θ(n)-style
//                                         // one-shot build (e.g. heapify)
//   loadRaw?: true,                       // if given, Build (and the initial display) just
//                                         // load the array AS-IS via inst.loadRaw() — no
//                                         // animation, no algorithm run. Use with ops that
//                                         // drive the actual algorithm steps (e.g. a
//                                         // "Heapify" op) so Build always means "show the
//                                         // starting condition", never "run something"
//   chrome?: {mini?:boolean,showScrub?:boolean,showCosts?:boolean},  // default: full sandbox chrome
//   width?, height?
// }

import { Player } from "./player.js";
import { Tracer, concatTraces } from "./tracer.js";
import { parseSequence } from "./sequence.js";

const parse = (s) => (String(s).match(/-?\d+/g) || []).map(Number);

export class FullDemo {
  /** @param {HTMLElement} mount @param {Object} spec */
  constructor(mount, spec) {
    this.spec = spec;
    this.inst = spec.make();
    this.flags = {};
    if (spec.initial != null) {
      const keys = parseSequence(spec.initial);
      if ((spec.loadRaw || spec.buildAll) && this.inst.loadRaw) this.inst.loadRaw(keys);
      else if (this.inst.build) this.inst.build(keys);
    }

    const root = document.createElement("div"); root.className = "u-fulldemo";
    // ── operation bar ────────────────────────────────────────────────
    // the value input only earns its keep when some op actually takes an
    // argument — omitting it for arg-less op sets (e.g. Heapify/Sort Down/
    // Heapsort) saves real width, which matters once there are several ops
    // (otherwise the bar wraps to a second line and the widget grows taller)
    const needsValue = (spec.ops || []).some((op) => op.arg);
    const namedInputs = (spec.inputs || []).map((inp) =>
      `<label>${inp.label}</label><input class="u-named" data-key="${inp.key}" value="${inp.value ?? ""}"` +
      ` placeholder="${inp.placeholder ?? ""}"${inp.width ? ` style="width:${inp.width}px"` : ""}>`).join("\n      ");
    // noBuild: for structures with no meaningful build input (e.g. DP tables,
    // where the ops' value box drives everything) — omit the initial box and
    // the Build button entirely instead of showing a button that does nothing
    const bar = document.createElement("div"); bar.className = "u-opbar";
    bar.innerHTML = `
      ${spec.noBuild ? "" : `<label>initial</label>
      <input class="u-seq" value="${spec.initial ?? ""}" placeholder="${spec.initialPlaceholder ?? "10,20,30 or 1..80:ZIG"}" title="${spec.initialTitle ?? "plain list, or START..STOP[:STEP][:ORDER] with ORDER in ASC/DESC/RAND/ZIG/ZAG"}">
      <span class="u-sep"></span>
      <button class="u-build ghost">Build</button>
      <span class="u-sep"></span>`}
      ${needsValue ? `<label>value</label><input class="u-val" value="" placeholder="key / lo hi">` : ""}
      ${namedInputs}
      <span class="u-ops"></span>
      <span class="u-sep"></span>
      <button class="u-clear ghost">Clear</button>`;
    root.appendChild(bar);
    const pmount = document.createElement("div"); root.appendChild(pmount);
    mount.appendChild(root);

    this.$seq = bar.querySelector(".u-seq"); // null when spec.noBuild
    this.$val = bar.querySelector(".u-val");
    this.$named = Array.from(bar.querySelectorAll(".u-named"));
    const opsWrap = bar.querySelector(".u-ops");
    this._opButtons = (spec.ops || []).map((op) => {
      const btn = document.createElement("button");
      btn.textContent = op.name; if (op.ghost) btn.className = "ghost";
      btn.onclick = () => this._run(op);
      opsWrap.appendChild(btn);
      return { op, btn };
    });
    const buildBtn = bar.querySelector(".u-build");
    if (buildBtn) buildBtn.onclick = () => this._build();
    bar.querySelector(".u-clear").onclick = () => this._clear();

    const chrome = Object.assign({ mini: false, showScrub: true, showCosts: !!spec.costs }, spec.chrome || {});
    this.player = new Player(pmount, spec.renderer, {
      width: spec.width, height: spec.height, costs: spec.costs,
      showScrub: chrome.showScrub, showCosts: chrome.showCosts, mini: chrome.mini,
    });
    this._updateOpButtons();
    this._show(this._stateMsg());
  }

  _inorder() { const io = this.inst.inorder ? this.inst.inorder() : ""; return Array.isArray(io) ? io.join(" ") : io; }
  _stateMsg() { return this.spec.stateMsg ? this.spec.stateMsg(this.inst) : `built from ${this.$seq ? this.$seq.value : this.spec.initial} — in-order ${this._inorder()}`; }
  _show(msg) { const t = new Tracer(); t.step(msg, { snapshot: this.inst.snapshot() }); this.player.load(t.trace()); }
  _updateOpButtons() {
    this._opButtons.forEach(({ op, btn }) => { btn.disabled = !!op.requiresFlag && !this.flags[op.requiresFlag]; });
  }

  _vals() {
    const vals = {};
    (this.$named || []).forEach((el) => { vals[el.dataset.key] = el.value.trim(); });
    return vals;
  }
  _build() {
    this.inst = this.spec.remake ? this.spec.remake(this._vals()) : this.spec.make();
    this.flags = {};
    const keys = parseSequence(this.$seq.value);
    if (this.spec.loadRaw && keys.length) {
      if (this.inst.loadRaw) this.inst.loadRaw(keys);
      this._updateOpButtons();
      this._show(this._stateMsg());
      return;
    }
    if (this.spec.buildAll) {
      // no keys.length gate: a buildAll decides what an empty box means
      // (huffman/graph/trie replay their SAMPLE — Build always animates)
      const trace = this.spec.buildAll(this.inst, keys);
      this._updateOpButtons();
      this.player.load(trace);
      this.player.play();
      return;
    }
    if (this.spec.buildStep && keys.length) {
      const traces = keys.map((k) => this.spec.buildStep(this.inst, k)).filter(Boolean);
      this._updateOpButtons();
      this.player.load(concatTraces(traces));
      this.player.play();
      return;
    }
    if (this.inst.build) this.inst.build(keys);
    this._updateOpButtons();
    this._show(this._stateMsg());
  }
  _clear() {
    this.inst = this.spec.make();
    this.flags = {};
    this._updateOpButtons();
    this._show(`cleared — empty ${this.spec.title || "structure"}`);
  }
  _run(op) {
    if (op.requiresFlag && !this.flags[op.requiresFlag]) return; // guard: button should already be disabled
    let v; // no `arg` → no-argument op (min, max, …)
    if (op.arg === "number") { v = parse(this.$val.value)[0]; if (v == null) { this.$val.focus(); return; } }
    else if (op.arg === "pair") { const a = parse(this.$val.value); if (a.length < 2) { this.$val.focus(); return; } v = a; }
    else if (op.arg === "string") { v = this.$val.value.trim(); if (!v) { this.$val.focus(); return; } }
    const trace = op.run(this.inst, v, this._vals());
    if (op.setsFlag) this.flags[op.setsFlag] = true;
    if (op.clearsFlag) this.flags[op.clearsFlag] = false;
    this._updateOpButtons();
    this.player.load(trace);
    if (op.autoplay !== false) this.player.play();
  }
}
