/**
 * Node module hook: resolve the bare specifier "three" to the copy the
 * experiment vendors, so the harness can import the page's own modules
 * (room.js, cat.js, fur.js, rig.js, lighting.js) with no install step.
 *
 * The target is read from TABBY_THREE (set by run.mjs) so a baseline checkout
 * can be rendered with its own vendored three.
 */
export async function resolve(specifier, context, next) {
  if (specifier === "three") {
    const target = process.env.TABBY_THREE || "../../experiments/tabby-slink/vendor/three.module.js";
    return { url: new URL(target, import.meta.url).href, shortCircuit: true };
  }
  return next(specifier, context);
}
