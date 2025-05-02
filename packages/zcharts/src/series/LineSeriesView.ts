import { AxisView } from "../axis/axisView";
import { View } from "../core/view";
import { TrackView } from "../track/trackView";
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
  readonly track: TrackView;

  constructor(
    xAxis: AxisView,
    yAxis: AxisView,
    track: TrackView,
    options?: LineSeriesOptions
  ) {
    const model = new LineSeriesModel(options);
    super(model);
    this.rect = track.getRect();
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.track = track;
  }

  getXAxis(): AxisView {
    return this.xAxis;
  }

  getYAxis(): AxisView {
    return this.yAxis;
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
  }

  clear(): void {}

  render() {
    if (!this.visible || this.model.isEmpty()) {
      this.group.hide();
      return;
    }

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
  }
}
