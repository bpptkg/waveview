import { NDFrameArray } from "./generic";

export class Index<T extends NDFrameArray> {
  readonly _values: T;

  constructor(data: T) {
    this._values = data;
  }

  static from<T extends NDFrameArray>(data: T): Index<T> {
    return new Index(data) as Index<T>;
  }

  static empty<T extends NDFrameArray>(): Index<T> {
    return new Index(new Uint32Array()) as Index<T>;
  }

  static defaults<T extends NDFrameArray>(length: number): Index<T> {
    const data = new Uint32Array(length) as T;
    for (let i = 0; i < length; i++) {
      data[i] = i;
    }
    return new Index(data) as Index<T>;
  }

  get length(): number {
    return this._values.length;
  }

  get values(): T {
    return this._values;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  at(value: number): number {
    return this._values.findIndex((v) => v === value);
  }

  iat(index: number): number {
    return Number(this._values[index]);
  }

  first(): number {
    return this.iat(0);
  }

  last(): number {
    return this.iat(this.length - 1);
  }

  map<U extends NDFrameArray>(
    fn: (value: number, index: number, array: T) => number
  ): Index<U> {
    const data = this.values.map((value, index) =>
      fn(value, index, this.values)
    ) as U;
    return new Index(data) as Index<U>;
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

  slice(start: number, end: number): Index<T> {
    const beginPos = this.at(start);
    const endPos = this.at(end);
    return new Index(this._values.slice(beginPos, endPos)) as Index<T>;
  }
}

export function parseIndex<D extends NDFrameArray, I extends NDFrameArray = D>(
  index: I | Index<I> | undefined,
  values: D
): Index<I> {
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
