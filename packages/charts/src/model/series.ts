import { Axis } from "./axis";
import * as PIXI from "pixi.js";

export interface DataPoint {
  x: number;
  y: number;
}

export interface SeriesRenderContext {
  group: PIXI.Container;
  xAxis: Axis;
  yAxis: Axis;
}

export interface SeriesOptions {
  show?: boolean;
}

export class Series {
  readonly group: PIXI.Container = new PIXI.Container();
  private _data: DataPoint[] = [];

  appendData(data: DataPoint | DataPoint[]): void {
    this._data.push(...(Array.isArray(data) ? data : [data]));
  }

  getData(): DataPoint[] {
    return this._data;
  }

  setData(data: DataPoint[]): void {
    this._data = data;
  }

  clearData(): void {
    this._data = [];
  }

  getXRange(): [number, number] {
    let min = Infinity;
    let max = -Infinity;
    for (const point of this._data) {
      min = Math.min(min, point.x);
      max = Math.max(max, point.x);
    }
    return [min, max];
  }

  getYRange(): [number, number] {
    let min = Infinity;
    let max = -Infinity;
    for (const point of this._data) {
      min = Math.min(min, point.y);
      max = Math.max(max, point.y);
    }
    return [min, max];
  }

  render(ctx: SeriesRenderContext): void {
    this.group.removeChildren();
    const { xAxis, yAxis } = ctx;
    const data = this.getData();
    const graphics = new PIXI.Graphics();
    data.forEach((point, index) => {
      const x = xAxis.getScale().getPixelForValue(point.x);
      const y = yAxis.getScale().getPixelForValue(point.y);
      if (index === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    });
    graphics.stroke({
      color: 0x000000,
      width: 1,
    });
    this.group.addChild(graphics);
    ctx.group.addChild(this.group);
  }
}
