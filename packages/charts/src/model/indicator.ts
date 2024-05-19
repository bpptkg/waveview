import * as PIXI from "pixi.js";
import { Axis } from "./axis";

export interface IndicatorOptions {
  start: number;
  end: number;
  color: string;
}

export class Indicator {
  readonly group: PIXI.Container = new PIXI.Container();
  readonly axis: Axis;
  private _options: IndicatorOptions;

  constructor(axis: Axis, options: IndicatorOptions) {
    this.axis = axis;
    this._options = options;
  }

  get options(): IndicatorOptions {
    return this._options;
  }

  setOptions(options: IndicatorOptions): void {
    this._options = options;
  }

  show(): void {
    this.group.visible = true;
  }

  hide(): void {
    this.group.visible = false;
  }

  clear(): void {
    this.group.removeChildren();
  }

  render(): void {
    this.clear();

    const box = this.axis.parentLayout.getContentArea();
    const { start, end, color } = this.options;
    let startValue = start;
    if (start < this.axis.scale.min) {
      startValue = this.axis.scale.min;
    }

    let endValue = end;
    if (end > this.axis.scale.max) {
      endValue = this.axis.scale.max;
    }
    if (startValue >= this.axis.scale.max || endValue <= this.axis.scale.min) {
      return;
    }

    const length = 10;
    const x1 = this.axis.scale.getPixelForValue(startValue);
    const x2 = this.axis.scale.getPixelForValue(endValue);
    const y1 = box.y1;
    const y2 = y1 + length;

    const header = new PIXI.Graphics();
    header.rect(x1, y1, x2 - x1, y2 - y1).fill({
      color: color,
    });

    const body = new PIXI.Graphics();
    body.rect(x1, y1, x2 - x1, box.height).fill({
      color: color,
      alpha: 0.2,
    });

    this.group.addChild(body);
    this.group.addChild(header);
    this.axis.group.addChild(this.group);
  }
}
