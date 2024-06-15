import * as PIXI from "pixi.js";
import { Axis } from "../axis/axis";
import { Model } from "../model/model";
import { LayoutRect, ModelOptions } from "../util/types";
import { View } from "../view/view";
import { Helicorder } from "./helicorder";

export interface SelectionOptions extends ModelOptions {
  value: number;
  color: string;
  opacity: number;
  borderWidth: number;
}

export class SelectionModel extends Model<SelectionOptions> {
  override readonly type = "selection";

  static defaultOptions: SelectionOptions = {
    value: 0,
    color: "#9747FF",
    opacity: 0.25,
    borderWidth: 1,
  };

  constructor(options?: Partial<SelectionOptions>) {
    super({ ...SelectionModel.defaultOptions, ...options });
  }
}

export class Selection extends View<SelectionModel> {
  readonly axis: Axis;
  readonly chart: Helicorder;
  private _rect: LayoutRect;
  private readonly _graphics: PIXI.Graphics;

  constructor(
    axis: Axis,
    chart: Helicorder,
    options?: Partial<SelectionOptions>
  ) {
    const model = new SelectionModel(options);
    super(model);

    this.axis = axis;
    this._rect = axis.getRect().clone();
    this.chart = chart;
    this._graphics = new PIXI.Graphics();
    this.group.addChild(this._graphics);
  }

  getValue(): number {
    return this.model.options.value;
  }

  setValue(value: number): void {
    this.model.mergeOptions({ value });
  }

  getTrackIndex(): number {
    return this.chart.getTrackIndexAtTime(this.model.options.value);
  }

  show(): void {
    this.model.mergeOptions({ show: true });
  }

  hide(): void {
    this.model.mergeOptions({ show: false });
  }

  moveUp(): void {
    const { interval } = this.chart.getOptions();
    const value = this.model.options.value - interval * 60000;
    this.model.mergeOptions({ value });
  }

  moveDown(): void {
    const { interval } = this.chart.getOptions();
    const value = this.model.options.value + interval * 60000;
    this.model.mergeOptions({ value });
  }

  reset(): void {
    this.model.mergeOptions({ value: 0 });
  }

  override getRect(): LayoutRect {
    return this._rect;
  }

  override setRect(rect: LayoutRect): void {
    this._rect = rect;
  }

  override render() {
    this._graphics.clear();

    const { value, color, opacity, borderWidth } = this.model.getOptions();

    const trackIndex = this.chart.getTrackIndexAtTime(value);
    const track = this.chart.getTrackAt(trackIndex);
    if (!track) {
      return;
    }

    const { x, y, width, height } = track.getRect();

    this._graphics
      .rect(x, y, width, height)
      .stroke({
        color: color,
        width: borderWidth,
      })
      .fill({
        color: color,
        alpha: opacity,
      });
  }
}
