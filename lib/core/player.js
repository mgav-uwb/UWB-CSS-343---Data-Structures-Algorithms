// CSS 343 unified library — core/player.js
// The shared transport. Given a Trace it renders any frame and lets you move
// forward, BACKWARD, jump, scrub, and play at a chosen speed. Because the whole
// run is recorded up front, stepping back is O(1) (just render an earlier frame)
// — no algorithm needs to implement an "undo". A cost panel shows the primitive-
// operation counters at the current step (the S01/S02 cost model, live).
//
// makeRenderer may be a single factory, or an ARRAY of factories for a
// multi-view Player (e.g. array + mirror tree) — one canvas per factory,
// stacked vertically, all fed the SAME frame from the one shared Trace.

import { costLabel } from "./tracer.js";

const SPEEDS = [0.5, 1, 2, 4, 8, 16, 32];

export class Player {
  /**
   * @param {HTMLElement} mount
   * @param {((canvas:HTMLCanvasElement)=>{draw:(snap:any,hl:any)=>void}) |
   *          Array<(canvas:HTMLCanvasElement)=>{draw:(snap:any,hl:any)=>void}>} makeRenderer
   * @param {{width?:number,height?:number|number[],labels?:string[],costs?:string[],
   *          showScrub?:boolean,showCosts?:boolean,mini?:boolean}} [opts]
   *   showScrub/showCosts (default true) and mini (default false) select the
   *   FULL sandbox chrome vs. a SIMPLIFIED per-slide lecture view. height may be
   *   a single number (applied to every canvas) or an array parallel to
   *   makeRenderer (e.g. a short array strip + a taller tree below).
   */
  constructor(mount, makeRenderer, opts = {}) {
    const factories = Array.isArray(makeRenderer) ? makeRenderer : [makeRenderer];
    this.W = opts.width ?? 880;
    const heights = Array.isArray(opts.height) ? opts.height : factories.map(() => opts.height ?? 320);
    this.costs = opts.costs ?? null; // which counters to show; null = all present
    this.trace = null; this.i = 0; this.timer = null; this.speed = 1;

    const labels = opts.labels || [];
    const canvasHTML = factories.map((_, idx) => `
      <div class="u-canvas-wrap">
        ${labels[idx] ? `<div class="u-canvas-label">${labels[idx]}</div>` : ""}
        <canvas width="${this.W}" height="${heights[idx]}"></canvas>
      </div>`).join("");

    const root = document.createElement("div"); root.className = "u-player";
    root.innerHTML = `
      ${canvasHTML}
      <div class="u-status"></div>
      <div class="u-transport">
        <button data-a="first" title="to start">⏮</button>
        <button data-a="back" title="step back">◀ step</button>
        <button data-a="play" class="u-play" title="play / pause">▶</button>
        <button data-a="fwd" title="step forward">step ▶</button>
        <button data-a="last" title="to end">⏭</button>
        <label class="u-speed">speed
          <select>${SPEEDS.map((s) => `<option value="${s}"${s === 1 ? " selected" : ""}>${s}×</option>`).join("")}</select>
        </label>
        <span class="u-frame"></span>
      </div>
      <input class="u-scrub" type="range" min="0" max="0" value="0" step="1">
      <div class="u-costs"></div>`;
    mount.appendChild(root);
    this.el = root;
    this.canvases = Array.from(root.querySelectorAll("canvas"));
    this.renderers = factories.map((make, idx) => make(this.canvases[idx]));
    this.canvas = this.canvases[0]; this.renderer = this.renderers[0]; // back-compat single-view alias
    this.$status = root.querySelector(".u-status");
    this.$frame = root.querySelector(".u-frame");
    this.$scrub = root.querySelector(".u-scrub");
    this.$costs = root.querySelector(".u-costs");
    this.$play = root.querySelector(".u-play");

    root.querySelector('[data-a="first"]').onclick = () => this.seek(0);
    root.querySelector('[data-a="back"]').onclick = () => { this.pause(); this.step(-1); };
    root.querySelector('[data-a="fwd"]').onclick = () => { this.pause(); this.step(1); };
    root.querySelector('[data-a="last"]').onclick = () => this.seek(Infinity);
    this.$play.onclick = () => this.toggle();
    root.querySelector(".u-speed select").onchange = (e) => { this.speed = +e.target.value; if (this.timer) { this.pause(); this.play(); } };
    this.$scrub.oninput = (e) => { this.pause(); this.seek(+e.target.value); };

    // two-tier chrome: hide pieces for a simplified per-slide lecture view
    if (opts.showScrub === false) this.$scrub.style.display = "none";
    if (opts.showCosts === false) this.$costs.style.display = "none";
    if (opts.mini) { root.querySelector('[data-a="first"]').style.display = "none"; root.querySelector('[data-a="last"]').style.display = "none"; }
  }

  /** Load a Trace and reset to frame 0. */
  load(trace) {
    this.pause(); this.trace = trace; this.i = 0;
    this.$scrub.max = String(Math.max(0, trace.length - 1));
    this._render();
    return this;
  }

  _render() {
    if (!this.trace || !this.trace.length) return;
    const f = this.trace.at(this.i);
    this.renderers.forEach((r) => r.draw(f.snapshot, f.highlight));
    this.$status.textContent = f.msg || "";
    this.$frame.textContent = `${this.i + 1} / ${this.trace.length}`;
    this.$scrub.value = String(this.i);
    const ks = this.costs || Object.keys(f.counters);
    this.$costs.innerHTML = ks.length
      ? ks.map((k) => `<span class="u-chip"><b>${f.counters[k] || 0}</b> ${costLabel(k)}</span>`).join("")
      : '<span class="u-chip u-chip-dim">no operations counted yet</span>';
  }

  seek(i) { if (!this.trace) return; this.i = Math.max(0, Math.min(this.trace.length - 1, i)); this._render(); }
  step(d) { this.seek(this.i + d); }

  play() {
    if (!this.trace) return;
    if (this.i >= this.trace.length - 1) this.seek(0); // at the end → restart
    this.$play.textContent = "⏸"; this.$play.classList.add("on");
    this.timer = setInterval(() => {
      if (this.i >= this.trace.length - 1) { this.pause(); return; }
      this.step(1);
      if (this.trace.at(this.i).pause) this.pause(); // predict-and-continue: halt on a pause frame
    }, 900 / this.speed);
  }
  pause() { if (this.timer) { clearInterval(this.timer); this.timer = null; } this.$play.textContent = "▶"; this.$play.classList.remove("on"); }
  toggle() { this.timer ? this.pause() : this.play(); }
}
