import { uid } from "../util/common";

export interface Area {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
}

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface LayoutOptions {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  padding?: Padding;
}

export class Layout {
  readonly id: number;
  private _x1: number;
  private _y1: number;
  private _x2: number;
  private _y2: number;
  private _padding: Padding;

  private _top: number;
  private _right: number;
  private _bottom: number;
  private _left: number;

  constructor(options: LayoutOptions) {
    this.id = uid();

    this._x1 = options.x1;
    this._y1 = options.y1;
    this._x2 = options.x2;
    this._y2 = options.y2;

    this._padding = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...options.padding,
    };

    this._top = this._padding.top;
    this._right = this._padding.right;
    this._bottom = this._padding.bottom;
    this._left = this._padding.left;
  }

  getContentArea(): Area {
    return {
      x1: this._x1 + this._left,
      y1: this._y1 + this._top,
      x2: this._x2 - this._right,
      y2: this._y2 - this._bottom,
      width: this._x2 - this._x1 - this._left - this._right,
      height: this._y2 - this._y1 - this._top - this._bottom,
    };
  }

  get x1(): number {
    return this._x1;
  }

  get y1(): number {
    return this._y1;
  }

  get x2(): number {
    return this._x2;
  }

  get y2(): number {
    return this._y2;
  }

  get width(): number {
    return this._x2 - this._x1;
  }

  get height(): number {
    return this._y2 - this._y1;
  }

  get padding(): Padding {
    return this._padding;
  }
}
