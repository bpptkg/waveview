import { ScaleTick } from "../util/types";

export interface ScaleOptions {
  min?: number;
  max?: number;
}

export interface GetTicksOptions {
  maxTicks?: number;
  reverse?: boolean;
  includeBounds?: boolean;
  width?: number;
}

export abstract class Scale<T extends ScaleOptions = ScaleOptions> {
  private _options: T;
  protected _extent: [number, number];
  private _isBlank: boolean;
  private _normFactor: number;

  constructor(options?: T) {
    this._options = options || ({} as T);
    this._extent = [-Infinity, Infinity];
    this._isBlank = false;
    this._normFactor = 1;
  }

  getOptions(): T {
    return this._options;
  }

  mergeOptions(options: Partial<T>): void {
    this._options = { ...this._options, ...options };
  }

  unionExtent(other: [number, number]): void {
    const extent = this._extent;
    extent[0] = Math.min(extent[0], other[0]);
    extent[1] = Math.max(extent[1], other[1]);
  }

  getExtent(): [number, number] {
    return this._extent.slice() as [number, number];
  }

  setExtent(extent: [number, number]): void {
    const thisExtent = this._extent;
    if (!isNaN(extent[0])) {
      thisExtent[0] = extent[0];
    }
    if (!isNaN(extent[1])) {
      thisExtent[1] = extent[1];
    }
  }

  isInExtentRange(value: number): boolean {
    return value >= this._extent[0] && value <= this._extent[1];
  }

  isBlank(): boolean {
    return this._isBlank;
  }

  setBlank(blank: boolean): void {
    this._isBlank = blank;
  }

  valueToPercentage(value: number): number {
    const [min, max] = this._extent;
    return (value - min) / (max - min);
  }

  percentageToValue(percentage: number): number {
    const [min, max] = this._extent;
    return min + (max - min) * percentage;
  }

  contains(value: number): boolean {
    return value >= this._extent[0] && value <= this._extent[1];
  }

  setNormFactor(normFactor: number): void {
    this._normFactor = normFactor;
  }

  getNormFactor(): number {
    return this._normFactor;
  }

  abstract calcNiceExtent(): void;

  abstract getLabel(tick: ScaleTick): string;

  abstract getTicks(options?: GetTicksOptions): ScaleTick[];

  abstract getMinorTicks(
    splitNumber: number,
    options?: GetTicksOptions
  ): ScaleTick[];

  abstract toJSON(): ScaleOptions;
}
