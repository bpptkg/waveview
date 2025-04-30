import * as zrender from "zrender";
import { View } from "../../core/view";
import { formatDate } from "../../util/time";
import { LayoutRect, ThemeStyle } from "../../util/types";
import { Seismogram } from "../seismogram";
import { EventMarkerModel, EventMarkerOptions } from "./eventMarkerModel";

class SeismogramEventTooltip {
  group: zrender.Group;
  private chart: Seismogram;

  constructor(chart: Seismogram) {
    this.group = new zrender.Group();
    this.chart = chart;
  }

  show(x: number, y: number, marker: EventMarkerOptions): void {
    const duration = (marker.end - marker.start) / 1000;
    const eventType = marker.eventType;
    const time = formatDate(
      marker.start,
      "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}.{SSS}",
      this.chart.getModel().getOptions().useUTC
    );
    const color = marker.color;

    const theme = this.chart.getThemeStyle();
    const { textColor, backgroundColor, fontFamily } = theme;

    this.group.removeAll();
    this.group.add(
      new zrender.Text({
        style: {
          text: `Time: ${time}\nType: ${eventType}\nDuration: ${duration}s`,
          fill: textColor,
          fontSize: 11,
          backgroundColor: backgroundColor,
          padding: [5, 5],
          borderRadius: 5,
          borderColor: color,
          borderWidth: 1,
          fontFamily,
        },
        z: 999,
      })
    );
    this.group.attr({
      x: x,
      y: y,
    });
  }

  hide(): void {
    this.group.removeAll();
  }
}

export class EventMarkerView extends View<EventMarkerModel> {
  override readonly type: string = "eventMarker";
  private rect: LayoutRect;
  private chart: Seismogram;
  private markerRect: zrender.Rect;
  private markerPillRect: zrender.Rect;
  private tooltip: SeismogramEventTooltip;

  constructor(chart: Seismogram, options: EventMarkerOptions) {
    const model = new EventMarkerModel(options);
    super(model);
    this.rect = new zrender.BoundingRect(0, 0, 0, 0);
    this.chart = chart;
    this.tooltip = new SeismogramEventTooltip(chart);
    this.markerRect = new zrender.Rect();
    this.markerPillRect = new zrender.Rect();
    this.group.add(this.markerRect);
    this.group.add(this.markerPillRect);
    this.group.add(this.tooltip.group);
    this.markerRect.on("contextmenu", (e) => {
      this.chart.emit("eventMarkerContextMenu", e, this.model.getOptions());
    });
    this.markerRect.on("click", () => {
      this.chart.emit("eventMarkerClicked", this.model.getOptions());
    });
    this.markerRect.on(
      "mouseover",
      () => {
        this.tooltip.show(5, 5, this.model.getOptions());
      },
      this
    );
    this.markerRect.on(
      "mouseout",
      () => {
        this.tooltip.hide();
      },
      this
    );
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
    if (!this.visible) {
      this.markerRect.hide();
      this.markerPillRect.hide();
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
    if (c2 - c1 <= 0) {
      this.markerRect.hide();
      this.markerPillRect.hide();
      return;
    }

    const pillHeight = 5;
    this.markerRect.attr({
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

    this.markerPillRect.attr({
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
      silent: true,
    });

    this.markerRect.show();
    this.markerPillRect.show();
  }
}
