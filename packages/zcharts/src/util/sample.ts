import { Series } from "@waveview/ndarray";

/**
 * Generate sample data from start to end with specified number of points.
 */
export function generateSampleData(
  start: number,
  end: number,
  npoints: number
): Series {
  const index: number[] = [];
  const data: number[] = [];
  const step = Math.floor((end - start) / npoints);
  for (let i = 0; i < npoints; i++) {
    index.push(start + i * step);
    const amplitude = Math.random(); // Random amplitude factor between 0 and 1
    const randomValue = (Math.random() * 2 - 1) * amplitude; // Random value between -1 and 1, scaled by amplitude
    data.push(randomValue);
  }
  return new Series(new Float64Array(data), {
    index: new Float64Array(index),
  });
}
