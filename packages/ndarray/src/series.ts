import { Index, parseIndex } from ".";
import { NDFrame, NDFrameArray } from "./generic";

interface SeriesOptions<I extends NDFrameArray> {
  name: string;
  index: I | Index<I>;
}

export class Series<
  D extends NDFrameArray,
  I extends NDFrameArray
> extends NDFrame<D, I> {
  private _values: D;
  private _name: string = "";

  constructor(data: D, options: Partial<SeriesOptions<I>> = {}) {
    super(data);

    this._values = data;
    this._name = options.name || "";
    const index = parseIndex(options.index, this._values) as Index<I>;
    this.setAxis(0, index);
  }

  static empty<D extends NDFrameArray, I extends NDFrameArray = D>(): Series<
    D,
    I
  > {
    return new Series(new Float32Array(), { index: Index.empty() }) as Series<
      D,
      I
    >;
  }

  get index(): Index<I> {
    return this.getAxis(0);
  }

  get values(): D {
    return this._values;
  }

  get name(): string {
    return this._name;
  }

  get length(): number {
    return this._values.length;
  }

  get dtype(): string {
    return this._values.constructor.name;
  }

  get nbytes(): number {
    return this._values.length * this._values.BYTES_PER_ELEMENT;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  at(label: number): number {
    const index = this.index.at(label);
    return Number(this.values[index]);
  }

  iat(index: number): number {
    return Number(this.values[index]);
  }

  slice(start: number, end: number): Series<D, I> {
    const beginPos = this.index.at(start);
    const endPos = this.index.at(end);
    const data = this.values.slice(beginPos, endPos) as D;
    const index = this.index.slice(start, end);
    return new Series(data, { name: this.name, index: index });
  }

  *items(): Iterable<[number, number]> {
    for (const v of this.index.values) {
      const label = Number(v);
      yield [label, this.at(label)];
    }
  }

  first(): number {
    return this.iat(0);
  }

  last(): number {
    return this.iat(this.length - 1);
  }

  setIndex(index: Index<I>): void {
    this.setAxis(0, index);
  }

  map<U extends NDFrameArray>(
    fn: (value: number, index: number) => number
  ): Series<U, I> {
    const data = this.values.map((value, index) =>
      fn(value, this.index.iat(index))
    ) as U;
    return new Series(data, { name: this.name, index: this.index });
  }

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
