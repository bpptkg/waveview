import { Range } from "../types/range";
import { Axis } from "./axis";

export interface Tick {
  value: number;
  major: boolean;
}

export interface TickOptions {
  precision?: number;
  step?: number;
  count?: number;
  maxTicksLimit?: number;
  minRotation?: number;
  includeBounds?: boolean;
  format?: Intl.NumberFormatOptions;
}

export interface MinorTickOptions {
  count?: number;
}

export interface ScaleOptions {
  orientation?: "horizontal" | "vertical";
  dataMin?: number;
  dataMax?: number;
  userMin?: number;
  userMax?: number;
  bounds?: "ticks" | "data";
  ticks?: TickOptions;
  minorTicks?: MinorTickOptions;
  beginAtZero?: boolean;
  formatter?: (value: number) => string;
  reverse?: boolean;
}

export class Scale {
  readonly options: ScaleOptions;
  readonly axis: Axis;
  private _min: number;
  private _max: number;

  constructor(axis: Axis, options: Partial<ScaleOptions>) {
    this.options = options;
    this.axis = axis;

    const { min, max } = this.determineDataLimits(options);
    this._min = min;
    this._max = max;
  }

  /**
   * The minimum value of the scale
   */
  get min(): number {
    return this._min;
  }

  /**
   * The maximum value of the scale
   */
  get max(): number {
    return this._max;
  }

  determineDataLimits(_options: ScaleOptions): Range {
    throw new Error("Method not implemented.");
  }

  isHorizontal(): boolean {
    return this.options.orientation === "horizontal";
  }

  getRange(): number {
    return this._max - this._min;
  }

  getExtent(): [number, number] {
    return [this._min, this._max];
  }

  setExtent(min: number, max: number) {
    this._min = min;
    this._max = max;
  }

  reset(): void {
    this._min = Infinity;
    this._max = -Infinity;
  }

  protected maxDigits(): number {
    const height = this.axis.getHeight();
    const width = this.axis.getWidth();

    return (this.isHorizontal() ? width : height) / this.axis.getWidth();
  }

  buildTicks(): Tick[] {
    return [];
  }

  // buildMinorTicks(): Tick[] {
  //   return [];
  // }

  getLabelForValue(tick: Tick): string {
    return tick.value.toString();
  }

  getPixelForDecimal(decimal: number): number {
    const width = this.axis.getWidth();
    const height = this.axis.getHeight();
    const box = this.axis.layout.getContentArea();
    return this.isHorizontal()
      ? box.x1 + width * decimal
      : box.y2 - height * decimal;
  }

  getDecimalForPixel(pixel: number): number {
    const width = this.axis.getWidth();
    const height = this.axis.getHeight();
    const box = this.axis.layout.getContentArea();
    return this.isHorizontal()
      ? (pixel - box.x1) / width
      : (box.y2 - pixel) / height;
  }

  getPixelForValue(_value: number): number {
    return 0;
  }

  getValueForPixel(_pixel: number): number {
    return 0;
  }

  drawMinorTickLabels(_tick: Tick, _numTicks: number): boolean {
    return false;
  }
}
