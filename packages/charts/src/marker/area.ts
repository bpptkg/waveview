import * as PIXI from "pixi.js";
import { Axis } from "../axis/axis";
import { Model } from "../model/model";
import { LayoutRect, ModelOptions } from "../util/types";
import { View } from "../view/view";

export interface AreaMarkerOptions extends ModelOptions {
  /**
   * Whether to show the marker.
   */
  show: boolean;
  /**
   * The color of the marker.
   */
  color: string;
  /**
   * The opacity of the marker.
   */
  opacity: number;
  /**
   * The start value of the marker.
   */
  start: number;
  /**
   * The end value of the marker.
   */
  end: number;
  /**
   * Whether to show the marker as a pill. Pill markers have a head and a body.
   */
  pill: boolean;
  /**
   * The length of the pill.
   */
  length: number;
}

export class AreaMarkerModel extends Model<AreaMarkerOptions> {
  override readonly type = "areaMarker";

  static defaultOptions: AreaMarkerOptions = {
    show: true,
    color: "red",
    opacity: 0.1,
    start: 0,
    end: 0,
    pill: false,
    length: 10,
  };

  constructor(options?: Partial<AreaMarkerOptions>) {
    super({ ...AreaMarkerModel.defaultOptions, ...options });
  }
}

export class AreaMarker extends View<AreaMarkerModel> {
  override readonly type = "areaMarker";
  readonly axis: Axis;
  private _rect: LayoutRect;

  constructor(axis: Axis, options?: Partial<AreaMarkerOptions>) {
    const model = new AreaMarkerModel(options);
    super(model);

    this.axis = axis;
    this._rect = axis.getRect();
  }

  getStart(): number {
    return this.model.options.start;
  }

  setStart(start: number): void {
    this.model.mergeOptions({ start });
    this.render();
  }

  getEnd(): number {
    return this.model.options.end;
  }

  setEnd(end: number): void {
    this.model.mergeOptions({ end });
    this.render();
  }

  show(): void {
    this.model.mergeOptions({ show: true });
    this.render();
  }

  hide(): void {
    this.model.mergeOptions({ show: false });
    this.render();
  }

  override getRect(): LayoutRect {
    return this._rect;
  }

  override setRect(rect: LayoutRect): void {
    this._rect = rect;
  }

  override render(): void {
    this.clear();

    const { show, color, opacity, pill, length } = this.model.getOptions();

    if (!show) {
      return;
    }

    const { y, width, height } = this.getRect();
    const { start, end } = this.getModel().getOptions();
    const [min, max] = this.axis.getExtent();

    let startValue = Math.max(start, min);
    let endValue = Math.min(end, max);

    if (startValue >= max || endValue <= min) {
      return;
    }

    let c1 = this.axis.getPixelForValue(startValue);
    let c2 = this.axis.getPixelForValue(endValue);
    if (c1 > c2) {
      [c1, c2] = [c2, c1];
    }

    let cx, cy, w, h;
    if (this.axis.isVertical()) {
      cx = c2;
      cy = y;
      w = width;
      h = c1 - c2;
    } else {
      cx = c1;
      cy = y;
      w = c2 - c1;
      h = height;
    }

    const head = new PIXI.Graphics();
    head
      .rect(
        cx,
        cy,
        this.axis.isVertical() ? length : width,
        this.axis.isVertical() ? height : length
      )
      .fill({
        color,
      });

    const body = new PIXI.Graphics();
    body.rect(cx, cy, w, h).fill({
      color,
      alpha: opacity,
    });
    if (pill) {
      this.group.addChild(head);
    }
    this.group.addChild(body);
  }
}
