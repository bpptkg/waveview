import { ONE_MINUTE } from './time';

export function getDefaultSeismogramExtent(): [number, number] {
  const end = Date.now();
  const start = end - 5 * ONE_MINUTE;
  return [start, end];
}

export function isNumberEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < Number.EPSILON;
}
