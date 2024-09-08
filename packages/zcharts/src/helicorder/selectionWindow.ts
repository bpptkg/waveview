import * as zrender from "zrender";
import { Model } from "../core/model";
import { View } from "../core/view";
import { ONE_MINUTE } from "../util/time";
import { LayoutRect, ThemeStyle } from "../util/types";
import { Helicorder } from "./helicorder";

export interface SelectionWindowOptions {
  /**
   * Window size in minutes.
   */
  size: number;
  /**
   * Window start time in epoch milliseconds.
   */
  startTime: number;
  /**
   * Window color.
   */
  color: string;
  /**
   * Window opacity.
   */
  opacity: number;
  /**
   * Window border width.
   */
  borderWidth: number;
  /**
   * Window enable flag.
   */
  enabled: boolean;
}

export class SelectionWindowModel extends Model<SelectionWindowOptions> {
  static readonly defaultOptions: SelectionWindowOptions = {
    size: 4,
    startTime: 0,
    color: "#9747FF",
    opacity: 0.7,
    borderWidth: 1,
    enabled: true,
  };

  constructor(options?: Partial<SelectionWindowOptions>) {
    const opts = {
      ...SelectionWindowModel.defaultOptions,
      ...options,
    } as SelectionWindowOptions;
    super(opts);
  }

  getSize(): number {
    return this.options.size;
  }

  getStartTime(): number {
    return this.options.startTime;
  }

  setStartTime(startTime: number): void {
    this.options.startTime = startTime;
  }

  setCenterTime(centerTime: number): void {
    const { size } = this.options;
    this.setStartTime(centerTime - (size * ONE_MINUTE) / 2);
  }

  getCenterTime(): number {
    const { size } = this.options;
    return this.getStartTime() + size * ONE_MINUTE;
  }

  getEndTime(): number {
    const { size, startTime } = this.options;
    return startTime + size * ONE_MINUTE;
  }

  getWindow(): [number, number] {
    return [this.getStartTime(), this.getEndTime()];
  }

  contains(time: number): boolean {
    const [start, end] = this.getWindow();
    return time >= start && time <= end;
  }

  between(start: number, end: number): boolean {
    const [windowStart, windowEnd] = this.getWindow();
    return start <= windowStart && end >= windowEnd;
  }

  add(size: number): void {
    const startTime = this.getStartTime();
    +size * ONE_MINUTE;
    this.setStartTime(startTime);
  }

  subtract(size: number): void {
    const startTime = this.getStartTime();
    -size * ONE_MINUTE;
    this.setStartTime(startTime);
  }
}

export class SelectionWindowView extends View<SelectionWindowModel> {
  private readonly chart: Helicorder;
  private rect: LayoutRect;

  constructor(chart: Helicorder, options?: Partial<SelectionWindowOptions>) {
    const model = new SelectionWindowModel(options);
    super(model);
    this.chart = chart;
    this.rect = new zrender.BoundingRect(0, 0, 0, 0);
    this.chart.zr.on("mousedown", this.onClick, this);
  }

  private onClick(event: zrender.ElementEvent): void {
    const dpr = window.devicePixelRatio || 1;
    const pointX = event.offsetX * dpr;
    const pointY = event.offsetY * dpr;
    const gridRect = this.chart.getGrid().getRect();
    if (!gridRect.contain(pointX, pointY)) {
      return;
    }
    const trackManager = this.chart.getTrackManager();
    const time = trackManager.getTimeAtPoint(pointX, pointY);
    this.model.setCenterTime(time);
    this.chart.emit("selectionChanged", this.model.getWindow());
    this.render();
  }

  enable(): void {
    this.model.mergeOptions({ enabled: true });
  }

  disable(): void {
    this.model.mergeOptions({ enabled: false });
  }

  getRect(): LayoutRect {
    return this.rect;
  }

  setRect(rect: LayoutRect): void {
    this.rect = rect;
  }

  resize(): void {}

  clear(): void {
    this.group.removeAll();
  }

  dispose(): void {
    this.group.removeAll();
  }

  applyThemeStyle(theme: ThemeStyle): void {
    const { highlightStyle } = theme;
    this.model.mergeOptions({
      color: highlightStyle.color,
      opacity: highlightStyle.opacity,
      borderWidth: highlightStyle.borderWidth,
    });
  }

  private getSelectionWindow(): [number, number][] {
    const [start, end] = this.model.getWindow();
    const trackManager = this.chart.getTrackManager();
    const windows: [number, number][] = [];
    for (const segment of trackManager.segments()) {
      const [segmentStart, segmentEnd] = segment;

      if (this.model.contains(segmentStart)) {
        windows.push([segmentStart, end]);
      } else if (this.model.contains(segmentEnd)) {
        windows.push([start, segmentEnd]);
      } else if (this.model.between(segmentStart, segmentEnd)) {
        windows.push([start, end]);
      }
    }
    return windows;
  }

  private getSelectionWindowRects(): zrender.BoundingRect[] {
    const rects: zrender.BoundingRect[] = [];
    const windows = this.getSelectionWindow();
    const trackManager = this.chart.getTrackManager();
    for (const window of windows) {
      const [start, end] = window;
      const trackIndex = trackManager.getTrackIndexByTime(
        start + (end - start) / 2
      );
      const segment = trackManager.getTrackExtentAt(trackIndex);
      const offsetStart = trackManager.timeToOffset(segment, start);
      const offsetEnd = trackManager.timeToOffset(segment, end);
      const startX = this.chart.getXAxis().getPixelForValue(offsetStart);
      const endX = this.chart.getXAxis().getPixelForValue(offsetEnd);

      const track = trackManager.get(segment);
      if (!track) {
        continue;
      }

      const { y, height } = track.getRect();
      const x = startX;
      const width = endX - startX;
      rects.push(new zrender.BoundingRect(x, y, width, height));
    }
    return rects;
  }

  render(): void {
    this.clear();
    const { color, opacity, borderWidth, enabled } = this.model.options;
    if (!enabled) {
      return;
    }

    const rects = this.getSelectionWindowRects();
    for (const rect of rects) {
      const { x, y, width, height } = rect;
      const rectShape = new zrender.Rect({
        shape: { x, y, width, height },
        style: {
          fill: color,
          opacity,
          lineWidth: borderWidth,
          stroke: color,
        },
      });
      rectShape.silent = true;
      this.group.add(rectShape);
    }
  }
}
