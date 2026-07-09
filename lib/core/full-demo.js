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
//   ops: [ { name, arg?: "number"|"pair"|"string", run(inst, v) -> Trace, autoplay?, ghost? } ],
//   buildStep?: (inst, key) => Trace,     // if given, Build animates one call per key
//                                         // (spliced into one trace) instead of a silent bulk build
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
    if (spec.initial != null) this.inst.build(parseSequence(spec.initial));

    const root = document.createElement("div"); root.className = "u-fulldemo";
    // ── operation bar ────────────────────────────────────────────────
    const bar = document.createElement("div"); bar.className = "u-opbar";
    bar.innerHTML = `
      <label>initial</label>
      <input class="u-seq" value="${spec.initial ?? ""}" placeholder="10,20,30 or 1..80:ZIG" title="plain list, or START..STOP[:STEP][:ORDER] with ORDER in ASC/DESC/RAND/ZIG/ZAG">
      <span class="u-sep"></span>
      <button class="u-build ghost">Build</button>
      <span class="u-sep"></span>
      <label>value</label>
      <input class="u-val" value="" placeholder="key / lo hi">
      <span class="u-ops"></span>
      <span class="u-sep"></span>
      <button class="u-clear ghost">Clear</button>`;
    root.appendChild(bar);
    const pmount = document.createElement("div"); root.appendChild(pmount);
    mount.appendChild(root);

    this.$seq = bar.querySelector(".u-seq");
    this.$val = bar.querySelector(".u-val");
    const opsWrap = bar.querySelector(".u-ops");
    (spec.ops || []).forEach((op) => {
      const btn = document.createElement("button");
      btn.textContent = op.name; if (op.ghost) btn.className = "ghost";
      btn.onclick = () => this._run(op);
      opsWrap.appendChild(btn);
    });
    bar.querySelector(".u-build").onclick = () => this._build();
    bar.querySelector(".u-clear").onclick = () => this._clear();

    const chrome = Object.assign({ mini: false, showScrub: true, showCosts: !!spec.costs }, spec.chrome || {});
    this.player = new Player(pmount, spec.renderer, {
      width: spec.width, height: spec.height, costs: spec.costs,
      showScrub: chrome.showScrub, showCosts: chrome.showCosts, mini: chrome.mini,
    });
    this._show(this._stateMsg());
  }

  _inorder() { const io = this.inst.inorder ? this.inst.inorder() : ""; return Array.isArray(io) ? io.join(" ") : io; }
  _stateMsg() { return this.spec.stateMsg ? this.spec.stateMsg(this.inst) : `built from ${this.$seq ? this.$seq.value : this.spec.initial} — in-order ${this._inorder()}`; }
  _show(msg) { const t = new Tracer(); t.step(msg, { snapshot: this.inst.snapshot() }); this.player.load(t.trace()); }

  _build() {
    this.inst = this.spec.make();
    const keys = parseSequence(this.$seq.value);
    if (this.spec.buildStep && keys.length) {
      const traces = keys.map((k) => this.spec.buildStep(this.inst, k)).filter(Boolean);
      this.player.load(concatTraces(traces));
      this.player.play();
      return;
    }
    if (this.inst.build) this.inst.build(keys);
    this._show(this._stateMsg());
  }
  _clear() {
    this.inst = this.spec.make();
    this._show(`cleared — empty ${this.spec.title || "structure"}`);
  }
  _run(op) {
    let v; // no `arg` → no-argument op (min, max, …)
    if (op.arg === "number") { v = parse(this.$val.value)[0]; if (v == null) { this.$val.focus(); return; } }
    else if (op.arg === "pair") { const a = parse(this.$val.value); if (a.length < 2) { this.$val.focus(); return; } v = a; }
    else if (op.arg === "string") { v = this.$val.value.trim(); if (!v) { this.$val.focus(); return; } }
    const trace = op.run(this.inst, v);
    this.player.load(trace);
    if (op.autoplay !== false) this.player.play();
  }
}
