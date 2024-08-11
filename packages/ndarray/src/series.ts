import { NDFrame, NDFrameArray } from "./generic";
import { Index, parseIndex } from "./indexing";

export interface SeriesOptions<I extends NDFrameArray> {
  name: string;
  index: I | Index<I>;
}

export class Series<
  D extends NDFrameArray = NDFrameArray,
  I extends NDFrameArray = NDFrameArray
> extends NDFrame<D, I> {
  private _name: string = "";

  constructor(data: D, options: Partial<SeriesOptions<I>> = {}) {
    super(data);

    this._name = options.name || "";
    const index = parseIndex(options.index, this._values) as Index<I>;
    this.setAxis(0, index);
  }

  /**
   * Create an empty Series.
   */
  static empty<D extends NDFrameArray, I extends NDFrameArray>(): Series<D, I> {
    return new Series(new Float32Array(), { index: Index.empty() }) as Series<
      D,
      I
    >;
  }

  /**
   * Create a Series from an array of values.
   */
  static from<D extends NDFrameArray, I extends NDFrameArray>(
    data: D,
    options: Partial<SeriesOptions<I>> = {}
  ): Series<D, I> {
    return new Series(data, options) as Series<D, I>;
  }

  /**
   * Create a Series with default values.
   */
  static defaults<D extends NDFrameArray, I extends NDFrameArray>(
    length: number,
    value: number
  ): Series<D, I> {
    const data = new Float32Array(length) as D;
    for (let i = 0; i < length; i++) {
      data[i] = value;
    }
    return new Series(data, { index: Index.defaults(length) }) as Series<D, I>;
  }

  /**
   * Create a Series with zeros as values.
   */
  static zeros<D extends NDFrameArray, I extends NDFrameArray>(
    length: number
  ): Series<D, I> {
    return Series.defaults(length, 0);
  }

  /**
   * Create a Series with ones as values.
   */
  static ones<D extends NDFrameArray, I extends NDFrameArray>(
    length: number
  ): Series<D, I> {
    return Series.defaults(length, 1);
  }

  /**
   * Get the values of the Series.
   */
  get values(): D {
    return this._values;
  }

  /**
   * Get the index of the Series.
   */
  get index(): Index<I> {
    return this.getAxis(0);
  }

  /**
   * Get the name of the Series
   */
  get name(): string {
    return this._name;
  }

  /**
   * Set the name of the Series.
   */
  set name(value: string) {
    this._name = value;
  }

  /**
   * Get the length of the Series.
   */
  get length(): number {
    return this.values.length;
  }

  /**
   * Get the data type of the Series.
   */
  get dtype(): string {
    return this.values.constructor.name;
  }

  /**
   * Get the number of bytes in the Series.
   */
  get nbytes(): number {
    return this.values.length * this.values.BYTES_PER_ELEMENT;
  }

  /**
   * Check if the Series is empty.
   */
  isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * Get the nearest value at the index.
   */
  getNearestValueAt(index: number): number {
    const idx = this.index.findNearestPosition(index);
    return Number(this.values[idx]);
  }

  /**
   * Get the value at the exact index.
   */
  getValueAt(index: number): number {
    return Number(this.values[index]);
  }

  /**
   * Iterate over the Series and return an iterator of [index, value] pairs.
   */
  *iterIndexValuePairs(): Iterable<[number, number]> {
    for (const [pos, value] of this.index.iterPositionValuePairs()) {
      const index = Number(value);
      yield [index, this.getValueAt(pos)];
    }
  }

  /**
   * Iterate over the Series and return an iterator of values in the Series in
   * order.
   */
  *iterValues(): Iterable<number> {
    for (let i = 0; i < this.length; i++) {
      yield this.getValueAt(i);
    }
  }

  /**
   * Get the first value in the Series.
   */
  first(): number {
    return this.getValueAt(0);
  }

  /**
   * Get the last value in the Series.
   */
  last(): number {
    return this.getValueAt(this.length - 1);
  }

  /**
   * Set the index of the Series.
   */
  setIndex(index: Index<I>): void {
    this.setAxis(0, index);
  }

  /**
   * Map a function to each value in the Series.
   */
  map<U extends NDFrameArray>(
    fn: (value: number, index: number) => number
  ): Series<U, I> {
    const data = this.values.map((value, index) =>
      fn(value, this.index.getValueAtPosition(index))
    ) as U;
    return new Series(data, { name: this.name, index: this.index });
  }

  /**
   * Slice the Series by given start and end index values and return a new
   * Series.
   */
  slice(start: number, end: number): Series<D, I> {
    const beginPos = this.index.findNearestPosition(start);
    const endPos = this.index.findNearestPosition(end);
    const data = this.values.slice(beginPos, endPos) as D;
    const index = this.index.slice(start, end);
    return new Series(data, { name: this.name, index: index });
  }

  /**
   * Filter the Series by a function and return a new Series.
   */
  filter(
    fn: (value: number, index: number, series: Series) => boolean
  ): Series<D, I> {
    const data = this.values.filter((value, index) =>
      fn(value, this.index.getValueAtPosition(index), this)
    ) as D;
    const index = this.index.filter((value, index) =>
      fn(this.getValueAt(index), value, this)
    );
    return new Series(data, { name: this.name, index });
  }

  /**
   * Iterate over the Series and apply a function to each value.
   */
  forEach(fn: (value: number, index: number, series: Series) => void): void {
    this.values.forEach((value, index) => {
      fn(value, this.index.getValueAtPosition(index), this);
    });
  }

  /**
   * Check if all values in the Series pass a given function.
   */
  every(
    fn: (value: number, index: number, series: Series) => boolean
  ): boolean {
    return this.values.every((value, index) =>
      fn(value, this.index.getValueAtPosition(index), this)
    );
  }

  /**
   * Check if any value in the Series passes a given function.
   */
  some(fn: (value: number, index: number, series: Series) => boolean): boolean {
    return this.values.some((value, index) =>
      fn(value, this.index.getValueAtPosition(index), this)
    );
  }

  /**
   * Get the minimum value in the Series.
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
   * Get the maximum value in the Series.
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
   * Get the mean value of the Series.
   */
  mean(): number {
    let sum = 0;
    for (let i = 0; i < this.length; i++) {
      const value = Number(this.values[i]);
      if (!isNaN(value)) {
        sum += value;
      }
    }
    return sum / this.length;
  }

  /**
   * Get the sum of the Series.
   */
  sum(): number {
    let sum = 0;
    for (let i = 0; i < this.length; i++) {
      const value = Number(this.values[i]);
      if (!isNaN(value)) {
        sum += value;
      }
    }
    return sum;
  }

  /**
   * Get the standard deviation of the Series.
   */
  std(): number {
    const mean = this.mean();
    let sum = 0;
    for (let i = 0; i < this.length; i++) {
      const value = Number(this.values[i]);
      if (!isNaN(value)) {
        sum += Math.pow(value - mean, 2);
      }
    }
    return Math.sqrt(sum / this.length);
  }

  /**
   * Get the cumulative sum of the Series.
   */
  cumsum(): Series<D, I> {
    let sum = 0;
    const data = this.values.map((value) => {
      sum += value;
      return sum;
    }) as D;
    return new Series(data, { name: this.name, index: this.index });
  }

  /**
   * Get the difference of the Series.
   */
  diff(): Series<D, I> {
    const data = this.values.map((value, index) => {
      const prevValue = this.getValueAt(index - 1);
      return value - prevValue;
    }) as D;
    return new Series(data, { name: this.name, index: this.index });
  }

  /**
   * Add two Series together and return a new Series.
   */
  add(other: Series<D, I>): Series<D, I> {
    const data = this.values.map(
      (value, index) => value + other.getValueAt(index)
    ) as D;
    return new Series(data, { name: this.name, index: this.index });
  }

  /**
   * Subtract two Series and return a new Series.
   */
  subtract(other: Series<D, I>): Series<D, I> {
    const data = this.values.map(
      (value, index) => value - other.getValueAt(index)
    ) as D;
    return new Series(data, { name: this.name, index: this.index });
  }

  /**
   * Multiply two Series and return a new Series.
   */
  multiply(other: Series<D, I>): Series<D, I> {
    const data = this.values.map(
      (value, index) => value * other.getValueAt(index)
    ) as D;
    return new Series(data, { name: this.name, index: this.index });
  }

  /**
   * Divide two Series and return a new Series.
   */
  divide(other: Series<D, I>): Series<D, I> {
    const data = this.values.map(
      (value, index) => value / other.getValueAt(index)
    ) as D;
    return new Series(data, { name: this.name, index: this.index });
  }

  /**
   * Add a scalar value to the Series and return a new Series.
   */
  scalarAdd(value: number): Series<D, I> {
    const data = (this.values as any).map(
      (v: number | bigint): number | bigint => {
        if (typeof v === "bigint") {
          return BigInt(v) + BigInt(value);
        } else {
          return v + value;
        }
      }
    ) as D;
    return new Series(data, { name: this.name, index: this.index });
  }

  /**
   * Subtract a scalar value from the Series and return a new Series.
   */
  scalarSubtract(value: number): Series<D, I> {
    const data = (this.values as any).map(
      (v: number | bigint): number | bigint => {
        if (typeof v === "bigint") {
          return BigInt(v) - BigInt(value);
        } else {
          return v - value;
        }
      }
    ) as D;
    return new Series(data, { name: this.name, index: this.index });
  }

  /**
   * Multiply the Series by a scalar value and return a new Series.
   */
  scalarMultiply(value: number): Series<D, I> {
    const data = (this.values as any).map(
      (v: number | bigint): number | bigint => {
        if (typeof v === "bigint") {
          return BigInt(v) * BigInt(value);
        } else {
          return v * value;
        }
      }
    ) as D;
    return new Series(data, { name: this.name, index: this.index });
  }

  /**
   * Divide the Series by a scalar value and return a new Series.
   */
  scalarDivide(value: number): Series<D, I> {
    const data = (this.values as any).map(
      (v: number | bigint): number | bigint => {
        if (typeof v === "bigint") {
          return BigInt(v) / BigInt(value);
        } else {
          return v / value;
        }
      }
    ) as D;
    return new Series(data, { name: this.name, index: this.index });
  }
}
