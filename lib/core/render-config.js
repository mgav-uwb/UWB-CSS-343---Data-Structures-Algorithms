// CSS 343 unified library — core/render-config.js
// Settable limits for every shrink-to-fit renderer. When a structure outgrows
// its canvas, renderers zoom out — but only down to RENDER_LIMITS.minScale
// (a fraction of full size: 1 = the default 14px key font, 0.7 ≈ 10px).
// Below the floor the canvas GROWS instead and its wrapper scrolls, so big
// trees stay legible. Override globally, per page, or per renderer:
//   import { RENDER_LIMITS } from "../../lib/index.js";
//   RENDER_LIMITS.minScale = 0.6;                   // page-wide
//   new TreeRenderer(canvas, { minScale: 0.8 });    // one renderer
export const RENDER_LIMITS = {
  minScale: 0.7,
};

// Grow (or restore) a renderer's canvas so content at the clamped scale fits.
// While content fits, the canvas keeps its construction size and the usual
// "width:100%" stylesheet rule applies. When content needs more room, the
// bitmap AND the on-screen width grow proportionally (an inline % width), so
// the .u-canvas-wrap scrolls instead of the browser squashing it back down.
export function sizeCanvas(rend, needW, needH) {
  const cv = rend.canvas;
  rend.baseW ??= cv.width; rend.baseH ??= cv.height;
  const w = Math.max(rend.baseW, Math.ceil(needW));
  const h = Math.max(rend.baseH, Math.ceil(needH));
  if (cv.width !== w) {
    cv.width = w;
    cv.style.width = w > rend.baseW ? (100 * w / rend.baseW).toFixed(2) + "%" : "";
  }
  if (cv.height !== h) cv.height = h;
  rend.W = w; rend.H = h;
}
