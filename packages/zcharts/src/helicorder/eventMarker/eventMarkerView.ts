import * as zrender from "zrender";
import { View } from "../../core/view";
import { formatDate, ONE_MINUTE } from "../../util/time";
import { LayoutRect, ThemeStyle } from "../../util/types";
import { Helicorder } from "../helicorder";
import { EventMarkerModel, EventMarkerOptions } from "./eventMarkerModel";

interface MarkerWindowInfo {
  window: [number, number];
  range: [number, number];
}

class HelicorderEventTooltip {
  group: zrender.Group;
  private chart: Helicorder;

  constructor(chart: Helicorder) {
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
    const { textColor, backgroundColor } = theme;

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
  private chart: Helicorder;
  private tooltip: HelicorderEventTooltip;

  constructor(chart: Helicorder, options: EventMarkerOptions) {
    const model = new EventMarkerModel(options);
    super(model);
    this.rect = new zrender.BoundingRect(0, 0, 0, 0);
    this.chart = chart;
    this.tooltip = new HelicorderEventTooltip(chart);
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

  /**
   * Normalize the window to be exactly one minute long.
   */
  private normalizeWindow(window: [number, number]): [number, number] {
    const [start] = window;
    return [start, start + ONE_MINUTE];
  }

  private getMarkerWindow(): MarkerWindowInfo[] {
    const window = this.model.getWindow();
    const [start, end] = this.normalizeWindow(window);

    const trackManager = this.chart.getTrackManager();
    const windows: MarkerWindowInfo[] = [];
    for (const segment of trackManager.segments()) {
      const [segmentStart, segmentEnd] = segment;

      if (this.model.contains(segmentStart)) {
        const w: [number, number] = [segmentStart, end];
        const r = trackManager.getDataRange(segmentStart, end);
        windows.push({
          window: w,
          range: r,
        });
      } else if (this.model.contains(segmentEnd)) {
        const w: [number, number] = [start, segmentEnd];
        const r = trackManager.getDataRange(start, segmentEnd);
        windows.push({
          window: w,
          range: r,
        });
      } else if (this.model.between(segmentStart, segmentEnd)) {
        const w: [number, number] = [start, end];
        const r = trackManager.getDataRange(start, end);
        windows.push({
          window: w,
          range: r,
        });
      }
    }
    return windows;
  }

  private getMarkerWindowRects(): zrender.BoundingRect[] {
    const rects: zrender.BoundingRect[] = [];
    const windows = this.getMarkerWindow();
    const trackManager = this.chart.getTrackManager();
    for (const window of windows) {
      const [start, end] = window.window;
      const trackIndex = trackManager.getTrackIndexByTime(
        start + (end - start) / 2
      );
      const segment = trackManager.getTrackExtentAt(trackIndex);
      const startX = trackManager.getPixelForTime(segment, start);
      const endX = trackManager.getPixelForTime(segment, end);

      const track = trackManager.get(segment);
      if (!track) {
        continue;
      }

      const { y, height } = track.getRect();
      const markerX = startX;
      const markerY = y;
      const markerWidth = endX - startX;
      const markerHeight = height;
      rects.push(
        new zrender.BoundingRect(markerX, markerY, markerWidth, markerHeight)
      );
    }
    return rects;
  }

  render(): void {
    this.clear();
    if (!this.visible) {
      return;
    }
    const { color, opacity } = this.getModel().getOptions();
    this.group.add(this.tooltip.group);

    for (const boundingRect of this.getMarkerWindowRects()) {
      const { x, y, width, height } = boundingRect;
      const rect = new zrender.Rect({
        shape: {
          x,
          y,
          width,
          height,
        },
        style: {
          fill: color,
          opacity,
        },
        z: 5,
      });
      rect.on("click", () => {
        const selectionWindow = this.chart.getSelectionWindow();
        selectionWindow.getModel().reset();
        this.chart.emit("eventMarkerClicked", this.model.getOptions());
      });
      rect.on("mouseover", () => {
        this.tooltip.show(5, 5, this.model.getOptions());
      });
      rect.on("mouseout", () => {
        this.tooltip.hide();
      });
      this.group.add(rect);
    }
  }
}
