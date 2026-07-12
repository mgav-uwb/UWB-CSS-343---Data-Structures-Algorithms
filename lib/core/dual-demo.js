// CSS 343 unified library — core/dual-demo.js
// The MULTI-PANEL contrast pattern: two or more structures (side by side,
// stacked, or a mixed grid), one operation applied to all, stepped in
// LOCKSTEP — playback runs to the longest trace, so faster versions visibly
// FINISH and freeze while the slowest keeps churning. Each panel's title
// shows a live stat (default: tree height; a custom stat also sees the
// panel's current frame, so it can read the cost counters). Uses: "plain BST
// vs AVL" (same keys, heights diverge) and "naive vs memo vs 2-var fib"
// (same n, call counts diverge — with a ⏩ 1024× button to sweep the
// exponential tail).
//
// spec = {
//   panels: [ { title, make, renderer, op?:(structure,v)=>Trace,
//               stat?:(snapshot, frame)=>string,
//               width?, height?,      // per-panel canvas size
//               fullRow? }, … ],      // span the whole grid row
//   op?:(structure, v)=>Trace,        // default op; a panel's own op wins
//   opArg?: "number"|"numbers"|"string",  // what the value box passes to op:
//                                     //   the first number (default), the whole
//                                     //   parsed sequence (range syntax works),
//                                     //   or the raw string
//   opLabel?, valLabel?, placeholder?, initialValue?,   // op-bar chrome
//   stacked?: true,                   // panels one above the other
//   columns?: "3fr 1fr",              // grid-template-columns override
//   speed?: msPerFrame (default 900),
//   speedControl?: true,              // ½×…32× select scaling the lockstep tick
//   finishButton?: true,              // ⏩ 1024× — sweep the remaining frames
//   initial?, sequence?:[keys], width?, height?
// }

import { parseSequence } from "./sequence.js";

const parseNums = (s) => parseSequence(s); // ranges/generators work here too
const treeHeight = (t) => (t ? 1 + Math.max(treeHeight(t.left), treeHeight(t.right)) : -1);
const SPEEDS = [0.5, 1, 2, 4, 8, 16, 32]; // same ladder as the Player's speed select

export class DualDemo {
  constructor(mount, spec) {
    this.spec = spec;
    this.structs = spec.panels.map((pn) => pn.make());
    const keys = parseNums(spec.initial);
    if (keys.length) this.structs.forEach((s) => { if (s.build) s.build(keys); });
    const W = spec.width ?? 420, H = spec.height ?? 280;

    const root = document.createElement("div"); root.className = "u-dual";
    const bar = document.createElement("div"); bar.className = "u-opbar";
    bar.innerHTML = `<label>${spec.valLabel ?? "value"}</label><input class="u-val"${spec.valWidth ? ` style="width:${spec.valWidth}px"` : ""} placeholder="${spec.placeholder ?? "key"}">`;
    const ins = document.createElement("button"); ins.textContent = spec.opLabel ?? "Insert into both"; ins.onclick = () => this._op(); bar.appendChild(ins);
    if (spec.sequence) { const sq = document.createElement("button"); sq.className = "ghost"; sq.textContent = "Insert whole sequence"; sq.onclick = () => this._seq(); bar.appendChild(sq); }
    const rst = document.createElement("button"); rst.className = "ghost"; rst.textContent = "Reset"; rst.onclick = () => this._reset(); bar.appendChild(rst);
    root.appendChild(bar);

    const grid = document.createElement("div"); grid.className = "u-dual-grid" + (spec.stacked ? " stacked" : "");
    if (spec.columns) grid.style.gridTemplateColumns = spec.columns;
    this.titles = []; this.renderers = [];
    spec.panels.forEach((pn) => {
      const col = document.createElement("div"); col.className = "u-dual-col";
      if (pn.fullRow) col.style.gridColumn = "1 / -1";
      const title = document.createElement("div"); title.className = "u-dual-title"; col.appendChild(title);
      const cv = document.createElement("canvas"); cv.width = pn.width ?? W; cv.height = pn.height ?? H; cv.style.width = "100%"; cv.style.height = "auto"; col.appendChild(cv);
      grid.appendChild(col);
      this.titles.push(title); this.renderers.push(pn.renderer(cv));
    });
    root.appendChild(grid);

    const tr = document.createElement("div"); tr.className = "u-transport";
    tr.innerHTML = `<button data-a="back">◀ step</button><button class="u-play" data-a="play">▶</button><button data-a="fwd">step ▶</button>`
      + (spec.finishButton ? `<button data-a="finish">⏩ 1024×</button>` : "")
      + (spec.speedControl ? `<label class="u-speed">speed
          <select>${SPEEDS.map((s) => `<option value="${s}"${s === 1 ? " selected" : ""}>${s}×</option>`).join("")}</select>
        </label>` : "")
      + `<span class="u-frame"></span>`;
    root.appendChild(tr);
    this.$scrub = document.createElement("input"); this.$scrub.type = "range"; this.$scrub.className = "u-scrub"; this.$scrub.min = 0; this.$scrub.max = 0; root.appendChild(this.$scrub);
    this.$status = document.createElement("div"); this.$status.className = "u-status"; root.appendChild(this.$status);
    mount.appendChild(root);

    this.$val = bar.querySelector(".u-val"); this.$frame = tr.querySelector(".u-frame"); this.$play = tr.querySelector(".u-play");
    if (spec.initialValue != null) this.$val.value = spec.initialValue;
    tr.querySelector('[data-a="back"]').onclick = () => { this._pause(); this._seek(this.i - 1); };
    tr.querySelector('[data-a="fwd"]').onclick = () => { this._pause(); this._seek(this.i + 1); };
    const fin = tr.querySelector('[data-a="finish"]'); if (fin) fin.onclick = () => this._finish();
    this.$play.onclick = () => (this.timer ? this._pause() : this._play());
    this.$scrub.oninput = (e) => { this._pause(); this._seek(+e.target.value); };
    this.speedMult = 1;
    const sel = tr.querySelector(".u-speed select");
    if (sel) sel.onchange = () => { this.speedMult = +sel.value; if (this.timer) this._startTimer(); };

    this.traces = spec.panels.map(() => null); this.i = 0; this.len = 1; this.timer = null; this.sweep = 0;
    this._state();
  }

  _stat(idx, snap, frame) { const pn = this.spec.panels[idx]; return pn.stat ? pn.stat(snap, frame) : `height ${treeHeight(snap)}`; }
  _draw(i) {
    const frames = this.traces.map((t, k) =>
      t ? t.at(i) : { snapshot: this.structs[k].snapshot(), highlight: {}, msg: "", counters: {} });
    frames.forEach((f, k) => {
      this.renderers[k].draw(f.snapshot, f.highlight);
      this.titles[k].innerHTML = `<b>${this.spec.panels[k].title}</b> — ${this._stat(k, f.snapshot, f)}`;
    });
    this.$frame.textContent = `${i + 1} / ${this.len}`;
    this.$scrub.value = i;
    // narrate the first panel whose trace is still advancing — a finished
    // panel's frozen last message must not mask an ongoing story
    const live = this.traces.findIndex((t, k) => t && i < t.length && frames[k].msg);
    this.$status.textContent = live >= 0 ? frames[live].msg : (frames.find((f) => f.msg)?.msg || "");
  }
  _state() { this.traces = this.spec.panels.map(() => null); this.i = 0; this.len = 1; this.$scrub.max = 0; this._draw(0); }
  _op() {
    const mode = this.spec.opArg ?? "number";
    let v;
    if (mode === "string") { v = this.$val.value.trim(); if (!v) { this.$val.focus(); return; } }
    else if (mode === "numbers") { v = parseNums(this.$val.value); if (!v.length) { this.$val.focus(); return; } }
    else { v = parseNums(this.$val.value)[0]; if (v == null) { this.$val.focus(); return; } }
    this.traces = this.spec.panels.map((pn, k) => (pn.op ?? this.spec.op)(this.structs[k], v));
    this.len = Math.max(...this.traces.map((t) => t.length)); this.i = 0; this.$scrub.max = this.len - 1;
    this._draw(0); this._play();
  }
  _seq() { const op = this.spec.op; (this.spec.sequence || []).forEach((k) => this.structs.forEach((s) => op(s, k))); this._state(); }
  _seek(i) { this.i = Math.max(0, Math.min(this.len - 1, i)); this._draw(this.i); }
  _interval() { return (this.spec.speed ?? 900) / (this.speedMult || 1); }
  _startTimer() { if (this.timer) clearInterval(this.timer); this.timer = setInterval(() => { if (this.i >= this.len - 1) { this._pause(); return; } this._seek(this.i + 1); }, this._interval()); }
  _play() { this.sweep++; if (this.i >= this.len - 1) this.i = 0; this.$play.textContent = "⏸"; this.$play.classList.add("on"); this._startTimer(); }
  _pause() { if (this.timer) { clearInterval(this.timer); this.timer = null; } this.$play.textContent = "▶"; this.$play.classList.remove("on"); }
  /** ⏩ 1024× — fast-forward the rest of the trace at 1024× the current
      lockstep tick (floored at ~1.5 s so the counters visibly spin) — the
      "put the naive recursion out of its misery" button. */
  _finish() {
    this._pause();
    if (this.i >= this.len - 1) return;
    const id = ++this.sweep; // any later play/finish/reset invalidates this sweep
    const start = this.i, span = this.len - 1 - start;
    const DUR = Math.max(1500, span * this._interval() / 1024);
    let t0 = null;
    const tick = (ts) => {
      if (id !== this.sweep) return;
      if (t0 == null) t0 = ts;
      const p = Math.min(1, (ts - t0) / DUR);
      this._seek(start + Math.round(span * p));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  _reset() { this.sweep++; this.structs = this.spec.panels.map((pn) => pn.make()); const k = parseNums(this.spec.initial); if (k.length) this.structs.forEach((s) => { if (s.build) s.build(k); }); this._pause(); this._state(); }
}
