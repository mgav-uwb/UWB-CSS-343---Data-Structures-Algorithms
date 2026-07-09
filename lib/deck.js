// CSS 343 unified library — deck.js
// The DECK-INTEGRATION BRIDGE. Lecture slides use the SAME structures as the
// full demos, shown through the shared Player with SIMPLIFIED chrome (one
// learning outcome per slide). A deck registers a map of data-algo → spec and
// this wires each `.algo-viz[data-algo]` slot: builds the structure, runs one
// scripted operation, and auto-plays when the slide scrolls into view.
//
// Coexists with the legacy viz-core.js demos: initDeckDemos only touches slots
// whose data-algo is in ITS map, so decks can migrate one demo at a time.
//
// Deck usage (index.html, ES module):
//   import { initDeckDemos, AVL, BST, TreeRenderer } from "../../lib/deck.js";
//   Reveal.initialize({...});
//   initDeckDemos({
//     "avl-insert": { make:()=>new AVL(), renderer:(c)=>new TreeRenderer(c,{labels:"bf"}),
//                     run:(s)=>s.insert(16) },                          // reads data-example for the build
//   });

import { Player } from "./core/player.js";
import { Tracer } from "./core/tracer.js";
import { CaseDemo } from "./core/case-demo.js";
import { InteractiveDemo } from "./core/interactive-demo.js";
import { DualDemo } from "./core/dual-demo.js";
import { FullDemo } from "./core/full-demo.js";
export * from "./index.js"; // re-export structures/renderers so decks need one import
export { CaseDemo, InteractiveDemo, DualDemo, FullDemo };

const parse = (s) => (String(s ?? "").match(/-?\d+/g) || []).map(Number);

/** A one-frame trace that just shows the current state (for "here is the tree" slides). */
function stateTrace(structure, msg) {
  const t = new Tracer();
  t.step(msg || "", { snapshot: structure.snapshot ? structure.snapshot() : null });
  return t.trace();
}

/**
 * Mount one lecture-view demo into a `.algo-viz` element.
 * @param {HTMLElement} el
 * @param {{make:()=>any, build?:string, renderer:(c:HTMLCanvasElement)=>any,
 *          run?:(s:any)=>any, label?:string, costs?:string[],
 *          chrome?:{mini?:boolean,showScrub?:boolean,showCosts?:boolean},
 *          autoplay?:boolean, width?:number, height?:number}} spec
 */
export function mountLecture(el, spec) {
  el.querySelectorAll(".viz-fallback").forEach((n) => n.remove()); // drop the no-JS fallback
  const structure = spec.make();
  const keys = parse(el.dataset.example ?? spec.build ?? "");
  if (keys.length && structure.build) structure.build(keys);

  // simplified chrome by default; a slide can opt back into scrub/costs
  const chrome = Object.assign({ mini: true, showScrub: false, showCosts: false }, spec.chrome || {});
  const player = new Player(el, spec.renderer, {
    width: spec.width, height: spec.height, costs: spec.costs,
    showScrub: chrome.showScrub, showCosts: chrome.showCosts, mini: chrome.mini,
  });

  player.load(spec.run ? spec.run(structure) : stateTrace(structure, spec.label));

  if (spec.autoplay !== false && typeof IntersectionObserver === "function") {
    let played = false;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!played && e.isIntersecting && e.intersectionRatio > 0.4) {
          played = true; io.disconnect();
          player.seek(0); setTimeout(() => player.play(), 250);
        }
      }
    }, { threshold: [0, 0.4, 0.75] });
    io.observe(el);
  }
  return player;
}

/**
 * Dispatch a deck spec to the right harness by its shape:
 *   spec.cases → CaseDemo (case-selector)  ·  spec.panels → DualDemo (side-by-side)
 *   spec.ops, each with an `arg` → FullDemo (editable build sequence + typed value,
 *     e.g. "edit the sequence, then insert your own key" — mini chrome by default)
 *   spec.ops, no `arg` → InteractiveDemo (click a node, then press an operation)
 *   else → mountLecture (one scripted op, non-editable)
 */
export function mountDemo(el, spec) {
  el.querySelectorAll(".viz-fallback").forEach((n) => n.remove());
  if (spec.cases) return new CaseDemo(el, spec);
  if (spec.panels) return new DualDemo(el, spec);
  if (spec.ops) {
    if (spec.ops.some((op) => op.arg)) {
      const chrome = Object.assign({ mini: true, showScrub: false }, spec.chrome || {});
      return new FullDemo(el, Object.assign({}, spec, { chrome }));
    }
    return new InteractiveDemo(el, spec);
  }
  return mountLecture(el, spec);
}

/**
 * Wire every registered `.algo-viz[data-algo]` slot in the deck. Runs once Reveal
 * is ready (or immediately if there is no Reveal). A map value may be a spec
 * object or a function (el) => spec (to read per-slide data-* attributes).
 */
export function initDeckDemos(map, root = document) {
  const build = () => {
    root.querySelectorAll(".algo-viz[data-algo]").forEach((el) => {
      if (el.__libMounted) return;
      let spec = map[el.dataset.algo];
      if (typeof spec === "function") spec = spec(el);
      if (!spec) return; // not a lib demo (legacy viz-core slot or a TODO placeholder)
      el.__libMounted = true;
      try { mountDemo(el, spec); } catch (err) { console.error("deck demo", el.dataset.algo, err); }
    });
  };
  const R = window.Reveal;
  if (R && R.isReady && R.isReady()) build();
  else if (R && typeof R.on === "function") R.on("ready", build);
  else if (document.readyState !== "loading") build();
  else document.addEventListener("DOMContentLoaded", build);
}
