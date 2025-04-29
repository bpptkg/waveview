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
  readonly _mask: boolean[];

  constructor(data: T, mask: boolean[] = []) {
    this._values = data;
    this._mask = mask;
  }

  /**
   * Create an Index from an array of values.
   */
  static from<T extends NDFrameArray>(data: T, mask?: boolean[]): Index<T> {
    return new Index(data, mask) as Index<T>;
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
   * Get the mask of the index.
   */
  get mask(): boolean[] {
    return this._mask;
  }

  /**
   * Copy the index.
   */
  copy(): Index<T> {
    return new Index(this.values.slice() as T) as Index<T>;
  }

  /**
   * Check if the index is empty.
   */
  isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * Get the position of the value in the index.
   */
  getPositionByValue(value: number): number {
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
  getValueByPosition(pos: number): number {
    return Number(this.values[pos]);
  }

  /**
   * Get the mask value at the specified position.
   */
  getMaskByPosition(pos: number): boolean {
    const mask = this.mask[pos];
    return mask ?? false;
  }

  /**
   * Get the first value.
   */
  first(): number {
    return this.getValueByPosition(0);
  }

  /**
   * Get the last value.
   */
  last(): number {
    return this.getValueByPosition(this.length - 1);
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
   * Filter the index values.
   */
  filter(fn: (value: number, index: number, array: T) => boolean): Index<T> {
    const data = this.values.filter((value, index) =>
      fn(value, index, this.values)
    ) as T;
    return new Index(data) as Index<T>;
  }

  /**
   * Iterate over the index and apply a function to each value.
   */
  forEach(fn: (value: number, index: number, array: T) => void): void {
    this.values.forEach((value, index) => fn(value, index, this.values));
  }

  /**
   * Slice the index from start to end and return a new Index.
   */
  slice(start: number, end: number): Index<T> {
    const beginPos = this.getPositionByValue(start);
    const endPos = this.getPositionByValue(end);
    return new Index(this._values.slice(beginPos, endPos)) as Index<T>;
  }

  /**
   * Iterate over the index and return an iterator of [position, value] pairs
   * in the index.
   */
  *iterPositionValuePairs(): Iterable<[number, number]> {
    for (let i = 0; i < this.length; i++) {
      yield [i, this.getValueByPosition(i)];
    }
  }

  /**
   * Iterate over the index and return an iterator of values in the index in
   * order.
   */
  *iterValues(): Iterable<number> {
    for (let i = 0; i < this.length; i++) {
      yield this.getValueByPosition(i);
    }
  }

  /**
   * Iterate over the index and return an iterator of [position, value, mask]
   * pairs in the index.
   */
  *iterPositionValueMask(): Iterable<[number, number, boolean]> {
    for (let i = 0; i < this.length; i++) {
      yield [i, this.getValueByPosition(i), this.mask[i]];
    }
  }

  /**
   * Return a string representation of the index.
   */
  toString(): string {
    if (this.length > 10) {
      return `Index([${this.values.slice(0, 10).join(", ")}, ...])`;
    }
    return `Index([${this.values.join(", ")}])`;
  }

  /**
   * Return an array representation of the index.
   */
  toArray(): number[] {
    return Array.from(this.values);
  }
}

export function parseIndex<
  D extends NDFrameArray = NDFrameArray,
  I extends NDFrameArray = NDFrameArray
>(
  index: I | Index<I> | undefined,
  values: D,
  mask: boolean[] | undefined
): Index<I> {
  if (index === undefined) {
    return Index.defaults(values.length);
  }
  let instance: Index<I>;
  if (index instanceof Index) {
    instance = index;
  } else {
    instance = new Index(index, mask);
  }
  if (instance.length !== values.length) {
    throw new Error("Invalid index length");
  }
  return instance;
}
