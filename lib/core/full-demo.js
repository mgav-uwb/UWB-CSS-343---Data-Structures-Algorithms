// CSS 343 unified library — core/full-demo.js
// The "full demo" tier: a complete sandbox for a data structure exposing ALL its
// operations, built from a small spec. (Lecture slides use the Player directly
// with simplified chrome to spotlight one learning outcome.) One harness serves
// every structure — each structure only supplies a spec (see demos/*.js).
// The strip itself is the shared two-row ControlBar (core/control-bar.js):
// row 1 builds the state, row 2 runs methods from an op dropdown.
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
//            // requiresFlag: the op-dropdown entry is disabled until
//            //   spec.flags[requiresFlag] is true (e.g. a "sort down" op that
//            //   only makes sense after heapify has run)
//            // setsFlag/clearsFlag: after a successful run, mark (or unmark) a named
//            //   flag — flags reset to {} on every Build/Reset
//   scripts?: [ { name, text } ],         // preset OP SCRIPTS for the Run row's dropdown:
//                                         // multi-line "op value" text ("insert 33\ndelete 12");
//                                         // picking one fills the (still editable) arg box,
//                                         // Run executes the lines in order as ONE trace
//   defaultOp?: "Delete",                 // preselect this op in the Run dropdown — demos built
//                                         // to illustrate one action open ready to do it
//   help?: { initial?, arg? },            // instructions at the bottom of each box's overlay
//                                         // editor; the library defaults (sequence
//                                         // mini-language / script grammar) fill omissions
//   info?: (snapshot, frame) => string,   // persistent STATE readout under the render
//                                         // (M · n · α · tombstones …). Derived from the
//                                         // CURRENT FRAME's snapshot, so scrubbing backward
//                                         // shows the state as it was (see core/info-bar.js)
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
//   opsUI?: "buttons" | "menu",           // LEGACY, accepted and ignored — ops always live in
//                                         // the Run row's dropdown now
//   chrome?: { mini?, showScrub?, showCosts?,      // default: full sandbox chrome
//              showBuild?, showClear?, showValue?, // showClear now controls the RESET button
//              showInput?,                         // the typed-entry area (initial/named boxes)
//              showOps?,                           // the Run row (dropdown + Run)
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
import { ControlBar } from "./control-bar.js";
import { attachInfoBar } from "./info-bar.js";

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
    // chrome.show* flags control every region; the defaults reproduce the
    // classic full-sandbox strip, so unconfigured demos are unchanged
    const chrome = this.chrome = Object.assign({
      mini: false, showScrub: true, showCosts: !!spec.costs,
      showBuild: true, showClear: true, showValue: true,
      showInput: true, showOps: true,
    }, spec.chrome || {});
    const hasBuild = !spec.noBuild && chrome.showBuild;

    this.bar = new ControlBar(root, {
      presets: chrome.showInput ? (spec.presets || []) : [],
      initial: spec.initial ?? "",
      initialPlaceholder: spec.initialPlaceholder,
      initialTitle: spec.initialTitle,
      inputs: chrome.showInput ? (spec.inputs || []) : [],
      ops: chrome.showOps ? (spec.ops || []) : [],
      scripts: spec.scripts || [],
      defaultOp: spec.defaultOp,
      help: spec.help,
      showInitial: !spec.noBuild && chrome.showInput,
      showBuild: hasBuild,
      showReset: chrome.showClear,
      showRun: chrome.showOps && (spec.ops || []).length > 0,
      argDisabled: chrome.showValue === false,
      valInitial: spec.valInitial,
      valPlaceholder: spec.valPlaceholder,
    }, {
      build: () => this._build(),
      reset: () => this._reset(),
      run: (op, text) => this._runText(op, text),
    });
    const pmount = document.createElement("div"); root.appendChild(pmount);
    mount.appendChild(root);

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
    attachInfoBar(this.player, spec.info);
    this._updateOpEnable();
    this._show(this._stateMsg());
  }

  _inorder() { const io = this.inst.inorder ? this.inst.inorder() : ""; return Array.isArray(io) ? io.join(" ") : io; }
  _stateMsg() { return this.spec.stateMsg ? this.spec.stateMsg(this.inst) : `built from ${this.bar.initialText() || this.spec.initial} — in-order ${this._inorder()}`; }
  _show(msg) { const t = new Tracer(); t.step(msg, { snapshot: this.inst.snapshot() }); this.player.load(t.trace()); }

  /** requiresFlag support: dim op-dropdown entries whose flag is unmet. */
  _updateOpEnable() {
    (this.spec.ops || []).forEach((op) => {
      if (op.requiresFlag) this.bar.setOpDisabled(op.name, !this.flags[op.requiresFlag]);
    });
  }

  _vals() { return this.bar.values(); }

  /** Engine rejection → the warning band. Structures report drops via
   *  rejectedCount / lastRejected and explain themselves via rejectedWhy
   *  (a full hash table, out-of-range edge pairs, …). No-op without the fields. */
  _warnIfRejected(dropped, total) {
    const why = this.inst.rejectedWhy ?? "the structure refused them";
    if (dropped) {
      this.bar.warn(`${dropped}${total ? ` of ${total}` : ""} input${dropped > 1 ? "s" : ""} NOT accepted — ${why}`);
    } else if (this.inst.lastRejected) {
      this.bar.warn(`input rejected — ${why}`);
    }
  }

  _build() {
    this.bar.clearWarn();
    this.inst = this.spec.remake ? this.spec.remake(this._vals()) : this.spec.make();
    this.flags = {};
    if (this.spec.buildRaw) {
      // the spec wants the RAW box text (word lists etc.), not parsed numbers
      const traces = [this.spec.buildRaw(this.inst, this.bar.initialText() || (this.spec.initial ?? ""))];
      if (this.spec.stateMsg) {   // close on a state frame (same as buildStep)
        const t = new Tracer(); t.step(this._stateMsg(), { snapshot: this.inst.snapshot() });
        traces.push(t.trace());
      }
      this._updateOpEnable();
      this.player.load(concatTraces(traces));
      this.player.play();
      return;
    }
    // with the box hidden by chrome.showInput, Build rebuilds spec.initial
    const keys = parseSequence(this.bar.initialText() || (this.spec.initial ?? ""));
    if (this.spec.loadRaw && keys.length) {
      if (this.inst.loadRaw) this.inst.loadRaw(keys);
      this._updateOpEnable();
      this._show(this._stateMsg());
      return;
    }
    if (this.spec.buildAll) {
      // no keys.length gate: a buildAll decides what an empty box means
      // (huffman/graph/trie replay their SAMPLE — Build always animates)
      const trace = this.spec.buildAll(this.inst, keys);
      this._updateOpEnable();
      this._warnIfRejected(this.inst.rejectedCount || 0);
      this.player.load(trace);
      this.player.play();
      return;
    }
    if (this.spec.buildStep && keys.length) {
      let dropped = 0;
      const traces = keys.map((k) => {
        const tr = this.spec.buildStep(this.inst, k);
        if (this.inst.lastRejected) dropped++;
        return tr;
      }).filter(Boolean);
      if (this.spec.stateMsg) {
        // close on a state frame so the settings line (e.g. the B-tree's
        // "order M = …") survives the build instead of the last insert message
        const t = new Tracer(); t.step(this._stateMsg(), { snapshot: this.inst.snapshot() });
        traces.push(t.trace());
      }
      this._updateOpEnable();
      this._warnIfRejected(dropped, keys.length);
      this.player.load(concatTraces(traces));
      this.player.play();
      return;
    }
    if (this.inst.build) this.inst.build(keys);
    this._updateOpEnable();
    this._warnIfRejected(this.inst.rejectedCount || 0, keys.length);
    this._show(this._stateMsg());
  }

  /** Reset = today's Clear plus box restoration: fresh structure, spec-default inputs. */
  _reset() {
    this.inst = this.spec.make();
    this.flags = {};
    this.bar.restoreDefaults();
    this.bar.clearWarn();
    this._updateOpEnable();
    this._show(`reset — empty ${this.spec.title || "structure"}, inputs restored`);
  }

  _parseArg(op, text) {
    let v;
    if (op.arg === "number") { v = parse(text)[0]; if (v == null) return undefined; }
    else if (op.arg === "pair") { const a = parse(text); if (a.length < 2) return undefined; v = a; }
    else if (op.arg === "string") { v = String(text).trim(); if (!v) return undefined; }
    return v;
  }

  /** Run the arg box: a script (see ControlBar.looksLikeScript) executes each
   *  line in order as ONE concatenated trace; otherwise the single selected op. */
  _runText(op, text) {
    this.bar.clearWarn();
    if (!this.bar.looksLikeScript(text)) return this._run(op, text);
    // ops resolve by full name OR first word ("dfs 0" reaches "DFS from")
    const byName = new Map();
    (this.spec.ops || []).forEach((o) => {
      byName.set(o.name.toLowerCase(), o);
      const tok = o.name.split(/\s+/)[0].toLowerCase();
      if (!byName.has(tok)) byName.set(tok, o);
    });
    const lines = String(text).split("\n").map((l) => l.trim()).filter(Boolean);
    const traces = [];
    for (const line of lines) {
      const m = line.match(/^(\S+)\s*(.*)$/);
      const o = m && byName.get(m[1].toLowerCase());
      if (!o) { this.bar.warn(`script: unknown operation "${m ? m[1] : line}" — ops here: ${[...byName.keys()].join(", ")}`); return; }
      if (o.requiresFlag && !this.flags[o.requiresFlag]) { this.bar.warn(`script: "${o.name}" is not available yet (${o.requiresFlag} required)`); return; }
      const v = this._parseArg(o, m[2]);
      if (o.arg && v === undefined) { this.bar.warn(`script: "${line}" needs a ${o.arg} value`); return; }
      traces.push(o.run(this.inst, v, this._vals()));
      if (o.setsFlag) this.flags[o.setsFlag] = true;
      if (o.clearsFlag) this.flags[o.clearsFlag] = false;
    }
    this._updateOpEnable();
    this.player.load(concatTraces(traces.filter(Boolean)));
    this.player.play();
    this._warnIfRejected();
  }

  _run(op, text) {
    if (!op) return;
    if (op.requiresFlag && !this.flags[op.requiresFlag]) return; // dropdown entry should already be disabled
    let v; // no `arg` → no-argument op (min, max, …)
    if (op.arg) {
      v = this._parseArg(op, text ?? this.bar.argText());
      if (v === undefined) { if (this.bar.$val) this.bar.$val.focus(); return; }
    }
    const trace = op.run(this.inst, v, this._vals());
    if (op.setsFlag) this.flags[op.setsFlag] = true;
    if (op.clearsFlag) this.flags[op.clearsFlag] = false;
    this._updateOpEnable();
    this._warnIfRejected();
    this.player.load(trace);
    if (op.autoplay !== false) this.player.play();
  }
}
