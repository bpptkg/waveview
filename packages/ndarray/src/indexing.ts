import { NDFrameArray } from "./generic";

/**
 * Index class for NDFrame.
 *
 * The Index class is used to store the index values of an NDFrame. Values
 * represent the index of the data in the NDFrame. The position of the value in
 * the index is used to locate the data in the NDFrame.
 */
export class Index<T extends NDFrameArray = NDFrameArray> {
  readonly _values: T;

  constructor(data: T) {
    this._values = data;
  }

  /**
   * Create an Index from an array of values.
   */
  static from<T extends NDFrameArray>(data: T): Index<T> {
    return new Index(data) as Index<T>;
  }

  /**
   * Create an empty Index.
   */
  static empty<T extends NDFrameArray>(): Index<T> {
    return new Index(new Uint32Array()) as Index<T>;
  }

  /**
   * Create an Index with default values.
   */
  static defaults<T extends NDFrameArray>(length: number): Index<T> {
    const data = new Uint32Array(length) as T;
    for (let i = 0; i < length; i++) {
      data[i] = i;
    }
    return new Index(data) as Index<T>;
  }

  /**
   * Get the length of the index.
   */
  get length(): number {
    return this._values.length;
  }

  /**
   * Get the values of the index.
   */
  get values(): T {
    return this._values;
  }

  /**
   * Check if the index is empty.
   */
  isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * Fint the nearest position of the index value.
   */
  findNearestPosition(value: number): number {
    // Binary search
    let left = 0;
    let right = this.values.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (this.values[mid] === value) {
        return mid;
      } else if (this.values[mid] < value) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    // If exact match is not found, find the nearest index
    if (left >= this.values.length) {
      return right;
    } else if (right < 0) {
      return left;
    } else {
      // Return the index of the nearest value
      return this.values[left] - value < value - this.values[right]
        ? left
        : right;
    }
  }

  /**
   * Get the value at the specified position.
   */
  getValueAtPosition(pos: number): number {
    return Number(this.values[pos]);
  }

  /**
   * Get the first value.
   */
  first(): number {
    return this.getValueAtPosition(0);
  }

  /**
   * Get the last value.
   */
  last(): number {
    return this.getValueAtPosition(this.length - 1);
  }

  /**
   * Map a function to each value in the index.
   */
  map<U extends NDFrameArray>(
    fn: (value: number, index: number, array: T) => number
  ): Index<U> {
    const data = this.values.map((value, index) =>
      fn(value, index, this.values)
    ) as U;
    return new Index(data) as Index<U>;
  }

  /**
   * Get the minimum value in the index.
   */
  min(): number {
    let min = Infinity;
    for (let i = 0; i < this.length; i++) {
      const value = Number(this.values[i]);
      if (!isNaN(value)) {
        min = Math.min(min, value);
      }
    }
    return min;
  }

  /**
   * Get the maximum value in the index.
   */
  max(): number {
    let max = -Infinity;
    for (let i = 0; i < this.length; i++) {
      const value = Number(this.values[i]);
      if (!isNaN(value)) {
        max = Math.max(max, value);
      }
    }
    return max;
  }

  /**
   * Slice the index from start to end and return a new Index.
   */
  slice(start: number, end: number): Index<T> {
    const beginPos = this.findNearestPosition(start);
    const endPos = this.findNearestPosition(end);
    return new Index(this._values.slice(beginPos, endPos)) as Index<T>;
  }

  /**
   * Iterate over the index and return an iterator of [position, value] pairs
   * in the index.
   */
  *iterPositionValuePairs(): Iterable<[number, number]> {
    for (let i = 0; i < this.length; i++) {
      yield [i, this.getValueAtPosition(i)];
    }
  }

  /**
   * Iterate over the index and return an iterator of values in the index in
   * order.
   */
  *iterValues(): Iterable<number> {
    for (let i = 0; i < this.length; i++) {
      yield this.getValueAtPosition(i);
    }
  }
}

export function parseIndex<
  D extends NDFrameArray = NDFrameArray,
  I extends NDFrameArray = NDFrameArray
>(index: I | Index<I> | undefined, values: D): Index<I> {
  if (index === undefined) {
    return Index.defaults(values.length);
  }
  let instance: Index<I>;
  if (index instanceof Index) {
    instance = index;
  } else {
    instance = new Index(index);
  }
  if (instance.length !== values.length) {
    throw new Error("Invalid index length");
  }
  return instance;
}
