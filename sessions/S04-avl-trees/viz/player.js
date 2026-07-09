/* CSS 343 · L03 — shared timeline PLAYER + transport (viz/player.js).

   A reusable pattern for step-animated demos: every executed step records a
   FRAME (a JSON-safe state snapshot + highlight + message), so the animation
   can be scrubbed both ways:

       ⏮ rev · ◁ back 1 · ▶/⏸ play-pause · ▷ forward 1 · ⏭ fast-forward

   plus a step-by-step ⇄ instant mode. Forward past the recorded end pulls new
   steps from the demo's queue (or its `feed`, a fn returning the next op's
   steps — used for multi-op programs like "insert each key of the sequence");
   backward just restores earlier frames. A new user op truncates any cached
   future (like undo-redo branching).

   Usage (see bst.js):
     VizPlayer.attach(v, {
       snapshot: (v) => JSON-safe state,
       restore:  (v, state) => {…},                 // gets a deep COPY
       hiKeyOf:  (node) => id,  nodeByKey: (v,id) => node|null,
     });
     ctrls.innerHTML = VizPlayer.transportHTML() + …;
     VizPlayer.wireTransport(v, ctrlsEl);
     v.program(feedFn)   — start a multi-op program (resets the timeline)
     v.pushOps(steps)    — run one user op from the current point
   The demo supplies v.render(v) and v.setStatus(m). No dependencies. */
(function () {
  "use strict";
  var SPEED = 650, MAXSTEPS = 10000;

  function clone(s) { return JSON.parse(JSON.stringify(s)); }

  function capture(v) {
    return { snap: v._opts.snapshot(v), hiKey: v.hi != null ? v._opts.hiKeyOf(v.hi) : null,
             hiColor: v.hiColor || null, msg: v._lastMsg || "" };
  }
  function restoreFrame(v, f) {
    v._opts.restore(v, clone(f.snap));
    v.hi = f.hiKey != null ? v._opts.nodeByKey(v, f.hiKey) : null;
    v.hiColor = f.hiColor; v._lastMsg = f.msg;
    v.setStatus(f.msg); v.render(v);
  }

  function stepFwd(v) {
    if (v.tpos < v.timeline.length - 1) { v.tpos++; restoreFrame(v, v.timeline[v.tpos]); return true; }
    if (!v.queue.length && v.feed) { var s = v.feed(); if (s && s.length) v.queue = v.queue.concat(s); else v.feed = null; }
    if (!v.queue.length) { v.render(v); return false; }   // drained → one idle render (re-shows the ⊕ affordances)
    var st = v.queue.shift();
    v.hi = st.hi || null; v.hiColor = st.color || null; v._lastMsg = st.msg || "";
    if (st.apply) { var r = st.apply(); if (r != null) v.hi = r; }
    v.setStatus(v._lastMsg); v.render(v);
    v.timeline.push(capture(v)); v.tpos++;
    return true;
  }
  function stepBack(v) {
    if (v.tpos <= 0) { v.setStatus("at the start"); return false; }
    v.tpos--; restoreFrame(v, v.timeline[v.tpos]); return true;
  }
  function atEnd(v) { return v.tpos >= v.timeline.length - 1 && !v.queue.length && !v.feed; }

  function pause(v) { clearTimeout(v.timer); v.timer = null; v.playing = false; syncPlayBtn(v); }
  function playLoop(v) {
    v.playing = true; syncPlayBtn(v);
    (function go() {
      if (!v.playing) return;
      if (!stepFwd(v)) { pause(v); return; }
      v.timer = setTimeout(go, v.speed);
    })();
  }
  function ff(v) { pause(v); var g = 0; while (stepFwd(v) && g++ < MAXSTEPS); }
  function rev(v) { pause(v); if (v.timeline.length) { v.tpos = 0; restoreFrame(v, v.timeline[0]); } }
  function go(v) { if (v.mode === "instant") ff(v); else playLoop(v); }
  function syncPlayBtn(v) {
    if (!v._playBtn) return;
    v._playBtn.textContent = v.playing ? "⏸" : "▶";
    v._playBtn.title = v.playing ? "pause" : "play";
  }
  function truncateFuture(v) { if (v.tpos < v.timeline.length - 1) v.timeline.length = v.tpos + 1; v.queue = []; v.feed = null; }
  function isBusy(v) { return v.playing || v.queue.length > 0 || !!v.feed; }

  function attach(v, opts) {
    v._opts = opts; v.queue = []; v.feed = null; v.timeline = []; v.tpos = -1;
    v.playing = false; v.timer = null; v.speed = opts.speed || SPEED; v.mode = "steps"; v._lastMsg = "";
    v.baseline = function () {           // record the CURRENT state as frame 0
      v.timeline = [capture(v)]; v.tpos = 0;
    };
    v.pushOps = function (steps) {       // one user op from the current point
      pause(v); truncateFuture(v);
      if (steps && steps.length) { v.queue = steps.slice(); go(v); }
    };
    v.program = function (feedFn) {      // a multi-op program; timeline restarts at the current state
      pause(v); v.queue = []; v.feed = feedFn; v.baseline(); v.render(v); go(v);
    };
    v.stepFwd = function () { pause(v); stepFwd(v); };
    v.stepBack = function () { pause(v); stepBack(v); };
    v.ff = function () { ff(v); };
    v.rev = function () { rev(v); };
    v.playPause = function () { if (v.playing) pause(v); else if (!atEnd(v)) playLoop(v); };
    v.isBusy = function () { return isBusy(v); };
    v.pause = function () { pause(v); };
  }

  function transportHTML() {
    return '<button class="alt tp" data-act="rev" title="rewind to start">⏮</button>' +
           '<button class="alt tp" data-act="bk1" title="back 1 step">◁</button>' +
           '<button class="alt tp" data-act="play" title="play">▶</button>' +
           '<button class="alt tp" data-act="fw1" title="forward 1 step">▷</button>' +
           '<button class="alt tp" data-act="ff" title="fast-forward to end">⏭</button>' +
           '<select data-act="mode" title="animation mode" ' +
           'style="font:600 13px system-ui,sans-serif;color:#555;padding:3px 2px;border:1px solid #cbd2e0;border-radius:6px">' +
           '<option value="steps">▶ step</option><option value="instant">⚡ instant</option></select>';
  }
  function wireTransport(v, ctrlsEl) {
    v._playBtn = ctrlsEl.querySelector('[data-act="play"]');
    ctrlsEl.addEventListener("click", function (e) {
      var a = e.target.getAttribute && e.target.getAttribute("data-act");
      if (a === "rev") v.rev();
      else if (a === "bk1") v.stepBack();
      else if (a === "play") v.playPause();
      else if (a === "fw1") v.stepFwd();
      else if (a === "ff") v.ff();
    });
    ctrlsEl.addEventListener("change", function (e) {
      var a = e.target.getAttribute && e.target.getAttribute("data-act");
      if (a === "mode") { v.mode = e.target.value; if (v.mode === "instant") v.ff(); }
    });
  }

  window.VizPlayer = { attach: attach, transportHTML: transportHTML, wireTransport: wireTransport };
})();
