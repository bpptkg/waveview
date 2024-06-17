import { Index } from "./indexing";

export type TypedArray =
  | Float32Array
  | Float64Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint8Array
  | Uint8ClampedArray
  | Uint16Array
  | Uint32Array;

export type TypedArrayConstructor<T> = {
  new (length: number): T;
  new (values: ArrayLike<number>): T;
};

export type NDFrameArray = TypedArray;

export class NDFrame<
  D extends NDFrameArray = NDFrameArray,
  I extends NDFrameArray = NDFrameArray
> {
  readonly _values: D;
  private _axes: Map<number, Index<I>> = new Map();

  constructor(data: D) {
    this._values = data;
  }

  get shape(): number[] {
    const shape: number[] = [];
    for (const [key, value] of this._axes) {
      shape[key] = value.length;
    }
    return shape;
  }

  protected getAxis(axis: number): Index<I> {
    return this._axes.get(axis) || Index.empty<I>();
  }

  protected setAxis(axis: number, labels: Index<I>): void {
    this._axes.set(axis, labels);
  }
}
