import * as PIXI from "pixi.js";
import { Axis } from "../axis/axis";
import { Model } from "../model/model";
import {
  LayoutRect,
  ModelOptions,
  ResizeOptions,
  ThemeStyle,
} from "../util/types";
import { View } from "../view/view";

export interface LineMarkerOptions extends ModelOptions {
  show: boolean;
  color: string;
  width: number;
  value: number;
}

export class LineMarkerModel extends Model<LineMarkerOptions> {
  override readonly type = "lineMarker";

  static defaultOptions: LineMarkerOptions = {
    show: true,
    color: "red",
    width: 1,
    value: 0,
  };

  constructor(options?: Partial<LineMarkerOptions>) {
    super({ ...LineMarkerModel.defaultOptions, ...options });
  }
}

export class LineMarker extends View<LineMarkerModel> {
  override readonly type = "lineMarker";
  readonly axis: Axis;
  private _rect: LayoutRect;
  private readonly _line: PIXI.Graphics;

  constructor(axis: Axis, options?: Partial<LineMarkerOptions>) {
    const model = new LineMarkerModel(options);
    super(model);

    this.axis = axis;
    this._rect = axis.getRect();
    this._line = new PIXI.Graphics();
    this.group.addChild(this._line);
    this.axis.group.addChild(this.group);
  }

  getValue(): number {
    return this.model.options.value;
  }

  setValue(value: number): void {
    this.model.mergeOptions({ value });
  }

  show(): void {
    this.model.mergeOptions({ show: true });
  }

  hide(): void {
    this.model.mergeOptions({ show: false });
  }

  focus(): void {}

  blur(): void {}

  applyThemeStyle(_: ThemeStyle): void {}

  getRect(): LayoutRect {
    return this._rect;
  }

  setRect(rect: LayoutRect): void {
    this._rect = rect;
  }

  resize(options: ResizeOptions): void {
    const { width, height } = options;
    const { x, y } = this.getRect();
    this.setRect(new PIXI.Rectangle(x, y, width, height));
  }

  render() {
    this._line.clear();

    const {
      show,
      color: borderColor,
      width: borderWidth,
      value,
    } = this.model.getOptions();
    if (!show) {
      return;
    }

    if (!this.axis.contains(value)) {
      return;
    }

    const pos = this.axis.getPixelForValue(value);
    const { x, y, width, height } = this.getRect();
    if (this.axis.isVertical()) {
      this._renderHorizontalLine(x, pos, width, borderColor, borderWidth);
    } else {
      this._renderVerticalLine(pos, y, height, borderColor, borderWidth);
    }
  }

  override dispose(): void {
    this._line.destroy();
    this.group.destroy();
  }

  private _renderVerticalLine(
    x: number,
    y: number,
    height: number,
    color: string,
    width: number
  ) {
    this._line
      .moveTo(x, y)
      .lineTo(x, y + height)
      .stroke({
        color: color,
        width,
      });
  }

  private _renderHorizontalLine(
    x: number,
    y: number,
    width: number,
    color: string,
    borderWidth: number
  ) {
    this._line
      .moveTo(x, y)
      .lineTo(x + width, y)
      .stroke({
        color: color,
        width: borderWidth,
      });
  }
}
