// CSS 343 unified library — core/render-config.js
// Settable render/zoom limits shared by every scalable renderer. The DEFAULT
// view always autofits — the whole structure stays on-canvas however big it
// grows, so students watch the global shape change during a run (even when
// individual values become too small to read). To read values, the user zooms
// in (see core/viewport.js): + / − buttons, wheel (anchored at the pointer),
// and drag / scrollbars to pan. Tweak per page/demo before building:
//   import { RENDER_LIMITS } from "../../lib/index.js";
//   RENDER_LIMITS.zoomMax = 20;
export const RENDER_LIMITS = {
  zoomMax: 10,        // deepest zoom-in the controls allow (1 = autofit)
  zoomWheelStep: 1.15, // per wheel tick
  zoomButtonStep: 1.5, // per +/− click
};

// Grow (or restore) a renderer's canvas so content at the current zoom fits.
// At zoom 1 the canvas keeps its construction size (pure autofit, no
// scrollbars). Zoomed in, the bitmap AND the on-screen width grow
// proportionally (an inline % width), so the scroller shows scrollbars
// instead of the browser squashing it back down. When a mid-animation redraw
// changes the canvas size, the scroll position is adjusted to keep the
// viewport centered on the same content fraction — no jumping.
export function sizeCanvas(rend, needW, needH) {
  const cv = rend.canvas;
  rend.baseW ??= cv.width; rend.baseH ??= cv.height;
  const w = Math.max(rend.baseW, Math.ceil(needW));
  const h = Math.max(rend.baseH, Math.ceil(needH));
  if (cv.width === w && cv.height === h) { rend.W = w; rend.H = h; return; }

  const wrap = cv.parentElement;
  let fx = null, fy = null;
  if (wrap && wrap.scrollWidth > wrap.clientWidth + 1)
    fx = (wrap.scrollLeft + wrap.clientWidth / 2) / wrap.scrollWidth;
  if (wrap && wrap.scrollHeight > wrap.clientHeight + 1)
    fy = (wrap.scrollTop + wrap.clientHeight / 2) / wrap.scrollHeight;

  if (cv.width !== w) {
    cv.width = w;
    cv.style.width = w > rend.baseW ? (100 * w / rend.baseW).toFixed(2) + "%" : "";
  }
  if (cv.height !== h) cv.height = h;
  rend.W = w; rend.H = h;

  if (fx != null) wrap.scrollLeft = fx * wrap.scrollWidth - wrap.clientWidth / 2;
  if (fy != null) wrap.scrollTop = fy * wrap.scrollHeight - wrap.clientHeight / 2;
}
