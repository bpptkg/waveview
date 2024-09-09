import * as zrender from "zrender";
import { View } from "../../core/view";
import { LayoutRect, ThemeStyle } from "../../util/types";
import { Helicorder } from "../helicorder";
import { EventMarkerModel, EventMarkerOptions } from "./eventMarkerModel";

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

  render(): void {
    this.clear();
    const { show, start, end, color, opacity } = this.getModel().getOptions();
    if (!show) {
      return;
    }
    const trackManager = this.chart.getTrackManager();
    const track = trackManager.getTrackByTime(start + (end - start) / 2);
    if (!track) {
      return;
    }
    const { y, height } = track.getRect();
    let c1 = trackManager.getPixelForTime(start);
    let c2 = trackManager.getPixelForTime(end);
    if (c1 > c2) {
      [c1, c2] = [c2, c1];
    }

    const rect = new zrender.Rect({
      shape: {
        x: c1,
        y: y,
        width: c2 - c1,
        height: height,
      },
      style: {
        fill: color,
        opacity,
      },
    });
    rect.silent = true;
    this.group.add(rect);
  }
}
