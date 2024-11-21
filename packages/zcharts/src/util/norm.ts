/**
 * Get global normalization factor of the series data.
 */
export function getGlobalNormFactor(
  minmax: [number, number][],
  mode: "min" | "max" = "max"
): number {
  let normFactor = mode === "max" ? -Infinity : Infinity;
  minmax.forEach(([min, max]) => {
    const factor = Math.abs(max - min);
    if (factor === 0) {
      return;
    }
    normFactor =
      mode === "max"
        ? Math.max(normFactor, factor)
        : Math.min(normFactor, factor);
  });
  return isFinite(normFactor) ? normFactor : 1;
}

/**
 * Get local normalization factor of the series data.
 */
export function getLocalNormFactor(min: number, max: number): number {
  if (min === max) {
    return 1;
  }
  const normFactor = Math.max(Math.abs(min), Math.abs(max));
  return isFinite(normFactor) ? normFactor : 1;
}
