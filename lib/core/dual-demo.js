// CSS 343 unified library — core/dual-demo.js
// The SIDE-BY-SIDE interaction pattern: two structures in two panels, the SAME
// operation applied to both, stepped in lockstep, each panel's title showing a
// live stat (default: tree height). For "plain BST vs AVL" — same keys, watch the
// heights diverge.
//
// spec = {
//   panels: [ { title, make, renderer, stat?:(snapshot)=>string }, {…} ],
//   initial?, op:(structure, v)=>Trace, sequence?:[keys], width?, height?
// }

const parseNums = (s) => (String(s ?? "").match(/-?\d+/g) || []).map(Number);
const treeHeight = (t) => (t ? 1 + Math.max(treeHeight(t.left), treeHeight(t.right)) : -1);

export class DualDemo {
  constructor(mount, spec) {
    this.spec = spec;
    this.A = spec.panels[0].make();
    this.B = spec.panels[1].make();
    const keys = parseNums(spec.initial);
    if (keys.length) { if (this.A.build) this.A.build(keys); if (this.B.build) this.B.build(keys); }
    const W = spec.width ?? 420, H = spec.height ?? 280;

    const root = document.createElement("div"); root.className = "u-dual";
    const bar = document.createElement("div"); bar.className = "u-opbar";
    bar.innerHTML = `<label>value</label><input class="u-val" placeholder="key">`;
    const ins = document.createElement("button"); ins.textContent = "Insert into both"; ins.onclick = () => this._op(); bar.appendChild(ins);
    if (spec.sequence) { const sq = document.createElement("button"); sq.className = "ghost"; sq.textContent = "Insert whole sequence"; sq.onclick = () => this._seq(); bar.appendChild(sq); }
    const rst = document.createElement("button"); rst.className = "ghost"; rst.textContent = "Reset"; rst.onclick = () => this._reset(); bar.appendChild(rst);
    root.appendChild(bar);

    const grid = document.createElement("div"); grid.className = "u-dual-grid";
    this.titles = []; this.renderers = [];
    spec.panels.forEach((pn) => {
      const col = document.createElement("div"); col.className = "u-dual-col";
      const title = document.createElement("div"); title.className = "u-dual-title"; col.appendChild(title);
      const cv = document.createElement("canvas"); cv.width = W; cv.height = H; cv.style.width = "100%"; cv.style.height = "auto"; col.appendChild(cv);
      grid.appendChild(col);
      this.titles.push(title); this.renderers.push(pn.renderer(cv));
    });
    root.appendChild(grid);

    const tr = document.createElement("div"); tr.className = "u-transport";
    tr.innerHTML = `<button data-a="back">◀ step</button><button class="u-play" data-a="play">▶</button><button data-a="fwd">step ▶</button><span class="u-frame"></span>`;
    root.appendChild(tr);
    this.$scrub = document.createElement("input"); this.$scrub.type = "range"; this.$scrub.className = "u-scrub"; this.$scrub.min = 0; this.$scrub.max = 0; root.appendChild(this.$scrub);
    this.$status = document.createElement("div"); this.$status.className = "u-status"; root.appendChild(this.$status);
    mount.appendChild(root);

    this.$val = bar.querySelector(".u-val"); this.$frame = tr.querySelector(".u-frame"); this.$play = tr.querySelector(".u-play");
    tr.querySelector('[data-a="back"]').onclick = () => { this._pause(); this._seek(this.i - 1); };
    tr.querySelector('[data-a="fwd"]').onclick = () => { this._pause(); this._seek(this.i + 1); };
    this.$play.onclick = () => (this.timer ? this._pause() : this._play());
    this.$scrub.oninput = (e) => { this._pause(); this._seek(+e.target.value); };

    this.tA = null; this.tB = null; this.i = 0; this.len = 1; this.timer = null;
    this._state();
  }

  _stat(idx, snap) { const pn = this.spec.panels[idx]; return pn.stat ? pn.stat(snap) : `height ${treeHeight(snap)}`; }
  _draw(i) {
    const fa = this.tA ? this.tA.at(i) : { snapshot: this.A.snapshot(), highlight: {}, msg: "" };
    const fb = this.tB ? this.tB.at(i) : { snapshot: this.B.snapshot(), highlight: {}, msg: "" };
    this.renderers[0].draw(fa.snapshot, fa.highlight);
    this.renderers[1].draw(fb.snapshot, fb.highlight);
    this.titles[0].innerHTML = `<b>${this.spec.panels[0].title}</b> — ${this._stat(0, fa.snapshot)}`;
    this.titles[1].innerHTML = `<b>${this.spec.panels[1].title}</b> — ${this._stat(1, fb.snapshot)}`;
    this.$frame.textContent = `${i + 1} / ${this.len}`;
    this.$scrub.value = i;
    this.$status.textContent = fa.msg || fb.msg || "";
  }
  _state() { this.tA = null; this.tB = null; this.i = 0; this.len = 1; this.$scrub.max = 0; this._draw(0); }
  _op() {
    const v = parseNums(this.$val.value)[0]; if (v == null) { this.$val.focus(); return; }
    this.tA = this.spec.op(this.A, v); this.tB = this.spec.op(this.B, v);
    this.len = Math.max(this.tA.length, this.tB.length); this.i = 0; this.$scrub.max = this.len - 1;
    this._draw(0); this._play();
  }
  _seq() { (this.spec.sequence || []).forEach((k) => { this.spec.op(this.A, k); this.spec.op(this.B, k); }); this._state(); }
  _seek(i) { this.i = Math.max(0, Math.min(this.len - 1, i)); this._draw(this.i); }
  _play() { if (this.i >= this.len - 1) this.i = 0; this.$play.textContent = "⏸"; this.$play.classList.add("on"); this.timer = setInterval(() => { if (this.i >= this.len - 1) { this._pause(); return; } this._seek(this.i + 1); }, 900); }
  _pause() { if (this.timer) { clearInterval(this.timer); this.timer = null; } this.$play.textContent = "▶"; this.$play.classList.remove("on"); }
  _reset() { this.A = this.spec.panels[0].make(); this.B = this.spec.panels[1].make(); const k = parseNums(this.spec.initial); if (k.length) { if (this.A.build) this.A.build(k); if (this.B.build) this.B.build(k); } this._pause(); this._state(); }
}
