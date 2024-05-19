import { DataPoint } from "../model/series";

export function generateSinusoidalSignal(
  min: number,
  max: number,
  num_points: number
): DataPoint[] {
  const data = [];
  const step = (max - min) / num_points;
  for (let i = 0; i < num_points; i++) {
    data.push({
      x: min + i * step,
      y: Math.sin(i) + Math.random() - 0.5,
    });
  }
  return data;
}
