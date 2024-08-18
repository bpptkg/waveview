export interface GridOptions {
  margin?: number;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export const makeIndex = (n: number) => Array.from({ length: n }, (_, i) => i);

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
