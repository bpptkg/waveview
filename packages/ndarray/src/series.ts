import { NDFrame, NDFrameArray } from "./generic";
import { Index, parseIndex } from "./indexing";

export interface SeriesOptions<I extends NDFrameArray> {
  name: string;
  index: I | Index<I>;
  mask: boolean[];
}

export interface SeriesJSON {
  name: string;
  index: number[];
  values: number[];
  mask: boolean[];
}

export class Series<
  D extends NDFrameArray = NDFrameArray,
  I extends NDFrameArray = NDFrameArray
> extends NDFrame<D, I> {
  private _name: string = "";

  constructor(data: D, options: Partial<SeriesOptions<I>> = {}) {
    super(data);

    this._name = options.name || "";
    const index = parseIndex(
      options.index,
      this._values,
      options.mask
    ) as Index<I>;
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
   * Copy the Series.
   */
  copy(): Series<D, I> {
    return new Series(this.values.slice() as D, {
      name: this.name,
      index: this.index,
      mask: this.index.mask,
    });
  }

  /**
   * Check if the Series is empty.
   */
  isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * Check if the Series is masked.
   */
  isMasked(): boolean {
    return this.index.mask.length > 0 && this.index.mask.includes(true);
  }

  /**
   * Get Series value at the given index.
   */
  getValueByIndex(index: number): number {
    const idx = this.index.getPositionByValue(index);
    return Number(this.values[idx]);
  }

  /**
   * Get Series value at the given position.
   */
  getValueByPosition(index: number): number {
    return Number(this.values[index]);
  }

  /**
   * Set Series value at the given index.
   */
  setValueByIndex(index: number, value: number): void {
    const idx = this.index.getPositionByValue(index);
    this.values[idx] = value;
  }

  /**
   * Set Series value at the given position.
   */
  setValueByPosition(index: number, value: number): void {
    this.values[index] = value;
  }

  /**
   * Get Series value at the given index. Alias for `getValueByIndex`.
   */
  get(index: number): number {
    return this.getValueByIndex(index);
  }

  /**
   * Set Series value at the given index. Alias for `setValueByIndex`.
   */
  set(index: number, value: number): void {
    this.setValueByIndex(index, value);
  }

  /**
   * Iterate over the Series and return an iterator of [index, value] pairs.
   */
  *iterIndexValuePairs(): Iterable<[number, number]> {
    for (const [pos, value] of this.index.iterPositionValuePairs()) {
      const index = Number(value);
      yield [index, this.getValueByPosition(pos)];
    }
  }

  /**
   * Iterate over the Series and return an iterator of values in the Series in
   * order.
   */
  *iterValues(): Iterable<number> {
    for (let i = 0; i < this.length; i++) {
      yield this.getValueByPosition(i);
    }
  }

  /**
   * Iterate over the Series and return an iterator of [index, value, mask]
   * pairs.
   */
  *iterIndexValueMask(): Iterable<[number, number, boolean]> {
    for (const [pos, value, mask] of this.index.iterPositionValueMask()) {
      const index = Number(value);
      yield [index, this.getValueByPosition(pos), mask];
    }
  }

  /**
   * Get the first value in the Series.
   */
  first(): number {
    return this.getValueByPosition(0);
  }

  /**
   * Get the last value in the Series.
   */
  last(): number {
    return this.getValueByPosition(this.length - 1);
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
      fn(value, this.index.getValueByPosition(index))
    ) as U;
    return new Series(data, { name: this.name, index: this.index });
  }

  /**
   * Slice the Series by given start and end index values and return a new
   * Series.
   */
  slice(start: number, end: number): Series<D, I> {
    const beginPos = this.index.getPositionByValue(start);
    const endPos = this.index.getPositionByValue(end);
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
      fn(value, this.index.getValueByPosition(index), this)
    ) as D;
    const index = this.index.filter((value, index) =>
      fn(this.getValueByPosition(index), value, this)
    );
    return new Series(data, { name: this.name, index });
  }

  /**
   * Iterate over the Series and apply a function to each value.
   */
  forEach(fn: (value: number, index: number, series: Series) => void): void {
    this.values.forEach((value, index) => {
      fn(value, this.index.getValueByPosition(index), this);
    });
  }

  /**
   * Check if all values in the Series pass a given function.
   */
  every(
    fn: (value: number, index: number, series: Series) => boolean
  ): boolean {
    return this.values.every((value, index) =>
      fn(value, this.index.getValueByPosition(index), this)
    );
  }

  /**
   * Check if any value in the Series passes a given function.
   */
  some(fn: (value: number, index: number, series: Series) => boolean): boolean {
    return this.values.some((value, index) =>
      fn(value, this.index.getValueByPosition(index), this)
    );
  }

  /**
   * Get the minimum value in the Series.
   */
  min(): number {
    let min = Infinity;
    for (let i = 0; i < this.length; i++) {
      if (this.index.mask[i]) {
        continue;
      }
      const value = Number(this.values[i]);
      if (!isNaN(value)) {
        min = Math.min(min, value);
      }
    }
    return min === Infinity ? NaN : min;
  }

  /**
   * Get the maximum value in the Series.
   */
  max(): number {
    let max = -Infinity;
    for (let i = 0; i < this.length; i++) {
      if (this.index.mask[i]) {
        continue;
      }
      const value = Number(this.values[i]);
      if (!isNaN(value)) {
        max = Math.max(max, value);
      }
    }
    return max === -Infinity ? NaN : max;
  }

  /**
   * Get the mean value of the Series.
   */
  mean(): number {
    let sum = 0;
    let count = 0;
    for (let i = 0; i < this.length; i++) {
      if (this.index.mask[i]) {
        continue;
      }
      const value = Number(this.values[i]);
      if (!isNaN(value)) {
        sum += value;
        count++;
      }
    }
    return count === 0 ? NaN : sum / count;
  }

  /**
   * Get the sum of the Series.
   */
  sum(): number {
    let sum = 0;
    for (let i = 0; i < this.length; i++) {
      if (this.index.mask[i]) {
        continue;
      }
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
    let count = 0;
    for (let i = 0; i < this.length; i++) {
      if (this.index.mask[i]) {
        continue;
      }
      const value = Number(this.values[i]);
      if (!isNaN(value)) {
        sum += Math.pow(value - mean, 2);
        count++;
      }
    }
    return count === 0 ? NaN : Math.sqrt(sum / count);
  }

  /**
   * Get the cumulative sum of the Series.
   */
  cumsum(): Series<D, I> {
    let sum = 0;
    const data = this.values.map((v, i) => {
      if (this.index.mask[i]) {
        return v;
      }
      sum += v;
      return sum;
    }) as D;
    return new Series(data, {
      name: this.name,
      index: this.index,
      mask: this.index.mask,
    });
  }

  /**
   * Get the difference of the Series.
   */
  diff(): Series<D, I> {
    const data = this.values.map((v, i) => {
      if (this.index.mask[i]) {
        return v;
      }
      const prevValue = this.getValueByPosition(i - 1);
      return v - prevValue;
    }) as D;
    return new Series(data, {
      name: this.name,
      index: this.index,
      mask: this.index.mask,
    });
  }

  /**
   * Add two Series together and return a new Series.
   */
  add(other: Series<D, I>): Series<D, I> {
    const data = this.values.map((v, i) => {
      if (this.index.mask[i] || other.index.mask[i]) {
        return v;
      }
      return v + other.getValueByPosition(i);
    }) as D;
    return new Series(data, {
      name: this.name,
      index: this.index,
      mask: this.index.mask.map((m, i) => m || other.index.mask[i]),
    });
  }

  /**
   * Subtract two Series and return a new Series.
   */
  subtract(other: Series<D, I>): Series<D, I> {
    const data = this.values.map((v, i) => {
      if (this.index.mask[i] || other.index.mask[i]) {
        return v;
      }

      return v - other.getValueByPosition(i);
    }) as D;
    return new Series(data, {
      name: this.name,
      index: this.index,
      mask: this.index.mask.map((m, i) => m || other.index.mask[i]),
    });
  }

  /**
   * Multiply two Series and return a new Series.
   */
  multiply(other: Series<D, I>): Series<D, I> {
    const data = this.values.map((v, i) => {
      if (this.index.mask[i] || other.index.mask[i]) {
        return v;
      }
      return v * other.getValueByPosition(i);
    }) as D;
    return new Series(data, {
      name: this.name,
      index: this.index,
      mask: this.index.mask.map((m, i) => m || other.index.mask[i]),
    });
  }

  /**
   * Divide two Series and return a new Series.
   */
  divide(other: Series<D, I>): Series<D, I> {
    const data = this.values.map((v, i) => {
      if (this.index.mask[i] || other.index.mask[i]) {
        return v;
      }
      return v / other.getValueByPosition(i);
    }) as D;
    return new Series(data, {
      name: this.name,
      index: this.index,
      mask: this.index.mask.map((m, i) => m || other.index.mask[i]),
    });
  }

  /**
   * Add a scalar value to the Series and return a new Series.
   */
  scalarAdd(value: number): Series<D, I> {
    const data = (this.values as any).map(
      (v: number | bigint, i: number): number | bigint => {
        if (this.index.mask[i]) {
          return v;
        }
        if (typeof v === "bigint") {
          return BigInt(v) + BigInt(value);
        } else {
          return v + value;
        }
      }
    ) as D;
    return new Series(data, {
      name: this.name,
      index: this.index,
      mask: this.index.mask,
    });
  }

  /**
   * Subtract a scalar value from the Series and return a new Series.
   */
  scalarSubtract(value: number): Series<D, I> {
    const data = (this.values as any).map(
      (v: number | bigint, i: number): number | bigint => {
        if (this.index.mask[i]) {
          return v;
        }
        if (typeof v === "bigint") {
          return BigInt(v) - BigInt(value);
        } else {
          return v - value;
        }
      }
    ) as D;
    return new Series(data, {
      name: this.name,
      index: this.index,
      mask: this.index.mask,
    });
  }

  /**
   * Multiply the Series by a scalar value and return a new Series.
   */
  scalarMultiply(value: number): Series<D, I> {
    const data = (this.values as any).map(
      (v: number | bigint, i: number): number | bigint => {
        if (this.index.mask[i]) {
          return v;
        }
        if (typeof v === "bigint") {
          return BigInt(v) * BigInt(value);
        } else {
          return v * value;
        }
      }
    ) as D;
    return new Series(data, {
      name: this.name,
      index: this.index,
      mask: this.index.mask,
    });
  }

  /**
   * Divide the Series by a scalar value and return a new Series.
   */
  scalarDivide(value: number): Series<D, I> {
    const data = (this.values as any).map(
      (v: number | bigint, i: number): number | bigint => {
        if (this.index.mask[i]) {
          return v;
        }
        if (typeof v === "bigint") {
          return BigInt(v) / BigInt(value);
        } else {
          return v / value;
        }
      }
    ) as D;
    return new Series(data, {
      name: this.name,
      index: this.index,
      mask: this.index.mask,
    });
  }

  /**
   * Get a string representation of the Series.
   */
  toString(): string {
    if (this.length > 10) {
      return `Series([${this.values
        .slice(0, 10)
        .join(", ")}, ...], masked=${this.isMasked()})`;
    }
    return `Series([${this.values.join(", ")}], masked=${this.isMasked()})`;
  }

  /**
   * Return an array representation of the Series.
   */
  toArray(): number[] {
    return Array.from(this.values);
  }

  /**
   * Return a JSON representation of the Series.
   */
  toJSON(): SeriesJSON {
    return {
      name: this.name,
      index: this.index.toArray(),
      values: this.toArray(),
      mask: this.index.mask,
    };
  }
}
