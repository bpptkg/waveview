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

export function minNonZero(array: number[]): number {
  if (array.length === 0) {
    return NaN;
  }
  let min = Infinity;
  for (const value of array) {
    if (value < min && value !== 0) {
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

export function median(array: number[]): number {
  if (array.length === 0) {
    return NaN;
  }
  const sorted = array.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

export function variance(array: number[]): number {
  if (array.length === 0) {
    return NaN;
  }
  const meanValue = mean(array);
  return mean(array.map((value) => Math.pow(value - meanValue, 2)));
}

export function standardDeviation(array: number[]): number {
  return Math.sqrt(variance(array));
}
