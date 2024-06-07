import * as PIXI from "pixi.js";
import { Axis } from "../axis/axis";
import { Model } from "../model/model";
import { LayoutRect, ModelOptions } from "../util/types";
import { View } from "../view/view";
import { Helicorder } from "./helicorder";

export interface EventMarkerOptions extends ModelOptions {
  show: boolean;
  color: string;
  width: number;
  value: number;
}

export class LineMarkerModel extends Model<EventMarkerOptions> {
  override readonly type = "lineMarker";

  static defaultOptions: EventMarkerOptions = {
    show: true,
    color: "red",
    width: 2,
    value: 0,
  };

  constructor(options?: Partial<EventMarkerOptions>) {
    super({ ...LineMarkerModel.defaultOptions, ...options });
  }
}

export class EventMarker extends View<LineMarkerModel> {
  readonly axis: Axis;
  readonly chart: Helicorder;
  private _rect: LayoutRect;

  constructor(
    axis: Axis,
    chart: Helicorder,
    options?: Partial<EventMarkerOptions>
  ) {
    const model = new LineMarkerModel(options);
    super(model);

    this.axis = axis;
    this._rect = axis.getRect();
    this.chart = chart;
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

  override getRect(): LayoutRect {
    return this._rect;
  }

  override setRect(rect: LayoutRect): void {
    this._rect = rect;
  }

  override render() {
    const {
      show,
      color: borderColor,
      width: borderWidth,
      value,
    } = this.model.getOptions();
    if (!show) {
      this.group.removeChildren();
      return;
    }
    const trackIndex = this.chart.getTrackIndexAtTime(value);
    const offset = this.chart.timeToOffset(trackIndex, value);
    const track = this.chart.getTrackAt(trackIndex);
    if (!track) {
      return;
    }
    const pos = this.axis.getPixelForValue(offset);
    const { x, y, width, height } = track.getRect();
    if (this.axis.isVertical()) {
      this._renderHorizontalLine(x, pos, width, borderColor, borderWidth);
    } else {
      this._renderVerticalLine(pos, y, height, borderColor, borderWidth);
    }
    this.axis.group.addChild(this.group);
  }

  private _renderVerticalLine(
    x: number,
    y: number,
    height: number,
    color: string,
    width: number
  ) {
    const graphics = new PIXI.Graphics();
    graphics.rect(x, y, width, height).fill({ color });
    this.group.removeChildren();
    this.group.addChild(graphics);
  }

  private _renderHorizontalLine(
    x: number,
    y: number,
    width: number,
    color: string,
    borderWidth: number
  ) {
    const graphics = new PIXI.Graphics();
    graphics.rect(x, y, width, borderWidth).fill({ color });
    this.group.removeChildren();
    this.group.addChild(graphics);
  }
}
