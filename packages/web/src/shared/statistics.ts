export function max(array: number[]): number {
  if (array.length === 0) {
    return NaN;
  }
  let max = -Infinity;
  for (const value of array) {
    if (value > max) {
      max = value;
    }
  }
  return max;
}

export function min(array: number[]): number {
  if (array.length === 0) {
    return NaN;
  }
  let min = Infinity;
  for (const value of array) {
    if (value < min) {
      min = value;
    }
  }
  return min;
}

export function sum(array: number[]): number {
  if (array.length === 0) {
    return 0;
  }
  let sum = 0;
  for (const value of array) {
    sum += value;
  }
  return sum;
}

export function mean(array: number[]): number {
  if (array.length === 0) {
    return NaN;
  }
  return sum(array) / array.length;
}
