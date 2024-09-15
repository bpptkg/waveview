import * as zrender from "zrender";
import { View } from "../../core/view";
import { LayoutRect, ThemeStyle } from "../../util/types";
import { Seismogram } from "../seismogram";
import { EventMarkerModel, EventMarkerOptions } from "./eventMarkerModel";

export class EventMarkerView extends View<EventMarkerModel> {
  override readonly type: string = "eventMarker";
  private rect: LayoutRect;
  private chart: Seismogram;

  constructor(chart: Seismogram, options: EventMarkerOptions) {
    const model = new EventMarkerModel(options);
    super(model);
    this.rect = new zrender.BoundingRect(0, 0, 0, 0);
    this.chart = chart;
  }

  getRect(): LayoutRect {
    return this.rect;
  }

  setRect(rect: LayoutRect): void {
    this.rect = rect;
  }

  resize(): void {}

  applyThemeStyle(_: ThemeStyle): void {}

  clear(): void {
    this.group.removeAll();
  }

  dispose(): void {
    this.clear();
  }

  render(): void {
    this.clear();
    if (!this.visible) {
      return;
    }

    const { start, end, color, opacity } = this.getModel().getOptions();
    const xAxis = this.chart.getXAxis();
    const [left, right] = xAxis.getExtent();
    const p1 = xAxis.getPixelForValue(left);
    const p2 = xAxis.getPixelForValue(right);

    let m1 = xAxis.getPixelForValue(start);
    let m2 = xAxis.getPixelForValue(end);

    // Clamp the marker within the chart extent.
    m1 = Math.max(p1, Math.min(p2, m1));
    m2 = Math.max(p1, Math.min(p2, m2));

    const c1 = Math.min(m1, m2);
    const c2 = Math.max(m1, m2);

    const { y, height } = xAxis.getRect();

    const pillHeight = 5;
    const rect = new zrender.Rect({
      shape: {
        x: c1,
        y: y,
        width: c2 - c1,
        height: height - pillHeight,
      },
      style: {
        fill: color,
        opacity,
      },
      z: 5,
    });
    rect.silent = true;

    const pillRect = new zrender.Rect({
      shape: {
        x: c1,
        y: y + height - pillHeight,
        width: c2 - c1,
        height: pillHeight,
      },
      style: {
        fill: color,
      },
      z: 5,
    });
    pillRect.silent = true;

    this.group.add(pillRect);
    this.group.add(rect);
  }
}
