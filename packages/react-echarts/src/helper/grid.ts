export interface GridOptions {
  margin?: number;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

/**
 * Create an array of indices from 0 to n - 1.
 */
export const makeIndex = (n: number) => Array.from({ length: n }, (_, i) => i);

/**
 * Create a grid layout for n rows.
 *
 * @param nrows The number of rows.
 * @param options The grid options.
 */
export const createGrid = (nrows: number, options: GridOptions = {}) => {
  const { margin = 2, top = 5, right = 10, bottom = 5, left = 10 } = options;
  const availableSpace = 100 - (top + bottom);
  const containerSize = (availableSpace - (nrows - 1) * margin) / nrows;
  const indices = makeIndex(nrows);

  return indices.map((index) => {
    const topOffset = index * (containerSize + margin) + top;
    const height = containerSize - margin;

    return {
      top: `${topOffset}%`,
      height: `${height}%`,
      left: `${left}%`,
      right: `${right}%`,
    };
  });
};
