import * as zrender from "zrender";
import { AxisView } from "../axis/axisView";
import { View } from "../core/view";
import { LayoutRect, ThemeStyle } from "../util/types";
import {
  LineSeriesData,
  LineSeriesModel,
  LineSeriesOptions,
} from "./LineSeriesModel";

export class LineSeriesView extends View<LineSeriesModel> {
  private rect: LayoutRect;
  readonly xAxis: AxisView;
  readonly yAxis: AxisView;
  private line: zrender.Polyline;

  constructor(
    xAxis: AxisView,
    yAxis: AxisView,
    track: View,
    options?: LineSeriesOptions
  ) {
    const model = new LineSeriesModel(options);
    super(model);
    this.rect = track.getRect();
    this.xAxis = xAxis;
    this.yAxis = yAxis;

    const { color, width } = this.model.getOptions();
    this.line = new zrender.Polyline({
      z: 1,
      silent: true,
      style: {
        stroke: color,
        lineWidth: width,
      },
    });
    const clipRect = this.xAxis.getRect();
    this.line.setClipPath(new zrender.Rect({ shape: clipRect }));
    this.group.add(this.line);
  }

  setYExtent(extent: [number, number]): void {
    this.yAxis.setExtent(extent);
  }

  setXExtent(extent: [number, number]): void {
    this.xAxis.setExtent(extent);
  }

  setData(data: LineSeriesData): void {
    this.model.setData(data);
  }

  getData(): LineSeriesData {
    return this.model.getData();
  }

  isEmpty(): boolean {
    return this.model.isEmpty();
  }

  getRect(): LayoutRect {
    return this.rect;
  }

  setRect(rect: LayoutRect): void {
    this.rect = rect;
  }

  resize(): void {
    this.setRect(this.rect);
    const clipRect = this.xAxis.getRect();
    this.line.setClipPath(new zrender.Rect({ shape: clipRect }));
  }

  clear(): void {}

  render() {
    if (!this.visible || this.model.isEmpty()) {
      this.group.hide();
      return;
    }

    const points: [number, number][] = [];
    const data = this.model.getData();
    for (const [x, y] of data.iterIndexValuePairs()) {
      if (!this.xAxis.contains(x)) {
        continue;
      }
      const cx = this.xAxis.getPixelForValue(x);
      const cy = this.yAxis.getPixelForValue(y);
      points.push([cx, cy]);
    }

    this.line.attr({
      shape: {
        points,
      },
    });

    this.group.show();
  }

  dispose(): void {
    this.group.removeAll();
  }

  applyThemeStyle(theme: ThemeStyle): void {
    const { seriesStyle } = theme;
    this.model.mergeOptions({
      color: seriesStyle.lineColor,
      width: seriesStyle.lineWidth,
    });
    this.line.setStyle({
      stroke: seriesStyle.lineColor,
      lineWidth: seriesStyle.lineWidth,
    });
  }
}
