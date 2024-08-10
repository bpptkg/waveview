/**
 * Returns a unique id, sequentially generated from a global variable.
 */
export const uid = (() => {
  let id = 0;
  return () => id++;
})();
