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
//   buildRaw?: (inst, text) => Trace,     // if given, Build hands the initial box's RAW
//                                         // string to the spec (for word/text inputs the
//                                         // numeric parser can't express — e.g. the trie's
//                                         // comma-separated word list)
//   loadRaw?: true,                       // if given, Build (and the initial display) just
//                                         // load the array AS-IS via inst.loadRaw() — no
//                                         // animation, no algorithm run. Use with ops that
//                                         // drive the actual algorithm steps (e.g. a
//                                         // "Heapify" op) so Build always means "show the
//                                         // starting condition", never "run something"
//   presets?: [ { name, initial?, values?, val? } ],
//                                         // named input SCENARIOS, shown as a dropdown before
//                                         // the initial box: picking one fills the (still
//                                         // editable) initial box, named boxes (`values` keyed
//                                         // like inputs), and value box (`val`). Editing any
//                                         // box by hand flips the dropdown to "custom".
//                                         // Selecting never auto-builds — Build/Run stays the
//                                         // trigger. NOTE: presets that set a structure
//                                         // PARAMETER (e.g. the B-tree's M) take effect on the
//                                         // next Build, like typing it would.
//   opsUI?: "buttons" | "menu",           // "menu" = compact bar: ONE mode dropdown (Build ·
//                                         // …ops… · Clear) + a single Run button; the value box
//                                         // shows only while the selected mode takes an arg
//   chrome?: { mini?, showScrub?, showCosts?,      // default: full sandbox chrome
//              showBuild?, showClear?, showValue?, // individual controls
//              showInput?,                         // the typed-entry area (initial/value/named boxes)
//              showOps?,                           // the actions area (buttons or mode menu)
//              showTransport?, showPlay?, showSpeed? }, // play row (see player.js)
//   rendererOpts?: {…},                   // merged into the renderer factory call — factories
//                                         // written as (c, o) => new X(c, {...BASE, ...o}) let a
//                                         // mount site tweak renderer knobs without replacing them
//   width?, height?
// }
//
// Specs are usually resolved through core/spec-config.js resolveSpec() —
// ops/inputs/presets entries support `enabled: false` there; by the time a
// spec reaches this harness, disabled entries are already gone.

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
    // chrome.show* flags control every region; the defaults reproduce the
    // classic full-sandbox bar exactly, so unconfigured demos are unchanged
    const chrome = this.chrome = Object.assign({
      mini: false, showScrub: true, showCosts: !!spec.costs,
      showBuild: true, showClear: true, showValue: true,
      showInput: true, showOps: true,
    }, spec.chrome || {});
    const menuUI = spec.opsUI === "menu" && chrome.showOps;
    // noBuild: for structures with no meaningful build input (e.g. DP tables,
    // where the ops' value box drives everything) — omit the initial box and
    // the Build button/mode entirely instead of showing one that does nothing
    const hasBuild = !spec.noBuild && chrome.showBuild;
    // the value input only earns its keep when some op actually takes an
    // argument — omitting it for arg-less op sets (e.g. Heapify/Sort Down/
    // Heapsort) saves real width, which matters once there are several ops
    // (otherwise the bar wraps to a second line and the widget grows taller);
    // in menu mode it additionally hides while the selected mode is arg-less
    const needsValue = chrome.showInput && chrome.showValue && (spec.ops || []).some((op) => op.arg);
    const namedInputs = !chrome.showInput ? "" : (spec.inputs || []).map((inp) =>
      `<label>${inp.label}</label><input class="u-named" data-key="${inp.key}" value="${inp.value ?? ""}"` +
      ` placeholder="${inp.placeholder ?? ""}"${inp.width ? ` style="width:${inp.width}px"` : ""}>`).join("\n      ");
    // presets: named input scenarios in a dropdown; the boxes stay editable
    const presets = spec.presets || [];
    const presetsHTML = chrome.showInput && presets.length
      ? `<select class="u-preset" title="preset input sets — pick one, then Build">${presets.map((p, i) =>
        `<option value="${i}"${p.initial != null && p.initial === spec.initial ? " selected" : ""}>${p.name}</option>`).join("")}
        <option value="__custom">custom…</option></select>`
      : "";
    const bar = document.createElement("div"); bar.className = "u-opbar";
    bar.innerHTML = `
      ${presetsHTML}
      ${spec.noBuild || !chrome.showInput ? "" : `<label>initial</label>
      <input class="u-seq" value="${spec.initial ?? ""}"${spec.initialWidth ? ` style="width:${spec.initialWidth}px"` : ""} placeholder="${spec.initialPlaceholder ?? "10,20,30 or 1..80:ZIG"}" title="${spec.initialTitle ?? "plain list, or START..STOP[:STEP][:ORDER] with ORDER in ASC/DESC/RAND/ZIG/ZAG"}">`}
      ${hasBuild && !menuUI ? `<span class="u-sep"></span>
      <button class="u-build ghost">Build</button>
      <span class="u-sep"></span>` : ""}
      ${needsValue ? `<label class="u-val-label">value</label><input class="u-val" value="${spec.valInitial ?? ""}"${spec.valWidth ? ` style="width:${spec.valWidth}px"` : ""} placeholder="${spec.valPlaceholder ?? "key / lo hi"}">` : ""}
      ${namedInputs}
      ${chrome.showOps ? (menuUI
        ? `<span class="u-sep"></span><select class="u-mode" title="operation"></select><button class="u-run">Run</button>`
        : `<span class="u-ops"></span>`) : ""}
      ${chrome.showClear && !menuUI ? `<span class="u-sep"></span>
      <button class="u-clear ghost">Clear</button>` : ""}`;
    root.appendChild(bar);
    const pmount = document.createElement("div"); root.appendChild(pmount);
    mount.appendChild(root);

    this.$seq = bar.querySelector(".u-seq"); // null when spec.noBuild or showInput:false
    this.$val = bar.querySelector(".u-val");
    this.$valLabel = bar.querySelector(".u-val-label");
    this.$named = Array.from(bar.querySelectorAll(".u-named"));
    this.$preset = bar.querySelector(".u-preset");
    this.$mode = bar.querySelector(".u-mode");
    const opsWrap = bar.querySelector(".u-ops");
    this._opButtons = !opsWrap ? [] : (spec.ops || []).map((op) => {
      const btn = document.createElement("button");
      btn.textContent = op.name; if (op.ghost) btn.className = "ghost";
      btn.onclick = () => this._run(op);
      opsWrap.appendChild(btn);
      return { op, btn };
    });
    // menu mode: Build · …ops… · Clear in one dropdown, one Run button
    this._modes = [];
    if (this.$mode) {
      if (hasBuild) this._modes.push({ kind: "build", label: "Build" });
      (spec.ops || []).forEach((op) => this._modes.push({ kind: "op", label: op.name, op }));
      if (chrome.showClear) this._modes.push({ kind: "clear", label: "Clear" });
      this.$mode.innerHTML = this._modes.map((m, i) => `<option value="${i}">${m.label}</option>`).join("");
      this.$mode.onchange = () => this._syncModeUI();
      bar.querySelector(".u-run").onclick = () => this._runMode();
    }
    const buildBtn = bar.querySelector(".u-build");
    if (buildBtn) buildBtn.onclick = () => this._build();
    const clearBtn = bar.querySelector(".u-clear");
    if (clearBtn) clearBtn.onclick = () => this._clear();
    // preset dropdown fills the boxes (no auto-build); hand-editing any box
    // flips the dropdown back to "custom…"
    if (this.$preset) {
      this.$preset.onchange = () => this._applyPreset();
      [this.$seq, this.$val, ...this.$named].forEach((el) => {
        if (el) el.addEventListener("input", () => { this.$preset.value = "__custom"; });
      });
    }

    // rendererOpts ride along into every factory call — factories written as
    // (c, o) => new X(c, {...BASE, ...o}) pick them up; older single-arg
    // factories just ignore the extra argument
    let makeRenderer = spec.renderer;
    if (spec.rendererOpts) {
      const facts = Array.isArray(spec.renderer) ? spec.renderer : [spec.renderer];
      const wrapped = facts.map((f) => (c) => f(c, spec.rendererOpts));
      makeRenderer = Array.isArray(spec.renderer) ? wrapped : wrapped[0];
    }
    this.player = new Player(pmount, makeRenderer, {
      width: spec.width, height: spec.height, costs: spec.costs, labels: spec.labels,
      showScrub: chrome.showScrub, showCosts: chrome.showCosts, mini: chrome.mini,
      showTransport: chrome.showTransport, showPlay: chrome.showPlay, showSpeed: chrome.showSpeed,
    });
    this._updateOpButtons();
    this._show(this._stateMsg());
  }

  _applyPreset() {
    const p = (this.spec.presets || [])[+this.$preset.value];
    if (!p) return; // "custom…" selected — leave the boxes as typed
    if (p.initial != null && this.$seq) this.$seq.value = p.initial;
    if (p.values) this.$named.forEach((el) => { if (p.values[el.dataset.key] != null) el.value = p.values[el.dataset.key]; });
    if (p.val != null && this.$val) this.$val.value = p.val;
  }

  _runMode() {
    const m = this._modes[+this.$mode.value];
    if (!m) return;
    if (m.kind === "build") this._build();
    else if (m.kind === "clear") this._clear();
    else this._run(m.op);
  }

  /** menu mode: the value box only shows while the selected mode takes an argument */
  _syncModeUI() {
    if (!this.$mode || !this.$val) return;
    const m = this._modes[+this.$mode.value];
    const show = !!(m && m.op && m.op.arg);
    this.$val.style.display = show ? "" : "none";
    if (this.$valLabel) this.$valLabel.style.display = show ? "" : "none";
  }

  _inorder() { const io = this.inst.inorder ? this.inst.inorder() : ""; return Array.isArray(io) ? io.join(" ") : io; }
  _stateMsg() { return this.spec.stateMsg ? this.spec.stateMsg(this.inst) : `built from ${this.$seq ? this.$seq.value : this.spec.initial} — in-order ${this._inorder()}`; }
  _show(msg) { const t = new Tracer(); t.step(msg, { snapshot: this.inst.snapshot() }); this.player.load(t.trace()); }
  _updateOpButtons() {
    this._opButtons.forEach(({ op, btn }) => { btn.disabled = !!op.requiresFlag && !this.flags[op.requiresFlag]; });
    if (this.$mode) {
      // menu mode: requiresFlag disables the option (same rule as buttons);
      // if the current selection just became disabled, hop to a runnable one
      this._modes.forEach((m, i) => {
        this.$mode.options[i].disabled = !!(m.op && m.op.requiresFlag && !this.flags[m.op.requiresFlag]);
      });
      const sel = this.$mode.selectedOptions[0];
      if (sel && sel.disabled) {
        const ok = Array.from(this.$mode.options).findIndex((o) => !o.disabled);
        if (ok >= 0) this.$mode.value = String(ok);
      }
      this._syncModeUI();
    }
  }

  _vals() {
    const vals = {};
    (this.$named || []).forEach((el) => { vals[el.dataset.key] = el.value.trim(); });
    return vals;
  }
  _build() {
    this.inst = this.spec.remake ? this.spec.remake(this._vals()) : this.spec.make();
    this.flags = {};
    if (this.spec.buildRaw) {
      // the spec wants the RAW box text (word lists etc.), not parsed numbers
      const traces = [this.spec.buildRaw(this.inst, this.$seq ? this.$seq.value : (this.spec.initial ?? ""))];
      if (this.spec.stateMsg) {   // close on a state frame (same as buildStep)
        const t = new Tracer(); t.step(this._stateMsg(), { snapshot: this.inst.snapshot() });
        traces.push(t.trace());
      }
      this._updateOpButtons();
      this.player.load(concatTraces(traces));
      this.player.play();
      return;
    }
    // with the box hidden by chrome.showInput, Build rebuilds spec.initial
    const keys = parseSequence(this.$seq ? this.$seq.value : (this.spec.initial ?? ""));
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
      if (this.spec.stateMsg) {
        // close on a state frame so the settings line (e.g. the B-tree's
        // "order M = …") survives the build instead of the last insert message
        const t = new Tracer(); t.step(this._stateMsg(), { snapshot: this.inst.snapshot() });
        traces.push(t.trace());
      }
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
    if (op.arg && !this.$val) return; // value box hidden by chrome config — nothing to read
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
