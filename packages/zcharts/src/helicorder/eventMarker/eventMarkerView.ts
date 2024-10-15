import * as zrender from "zrender";
import { View } from "../../core/view";
import { ONE_MINUTE } from "../../util/time";
import { LayoutRect, ThemeStyle } from "../../util/types";
import { Helicorder } from "../helicorder";
import { EventMarkerModel, EventMarkerOptions } from "./eventMarkerModel";

interface MarkerWindowInfo {
  window: [number, number];
  range: [number, number];
}

export class EventMarkerView extends View<EventMarkerModel> {
  override readonly type: string = "eventMarker";
  private rect: LayoutRect;
  private chart: Helicorder;

  constructor(chart: Helicorder, options: EventMarkerOptions) {
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
      this.group.add(rect);
    }
  }
}
