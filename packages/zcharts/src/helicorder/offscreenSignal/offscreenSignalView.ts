import * as zrender from "zrender";
import { View } from "../../core/view";
import { LayoutRect, ThemeStyle } from "../../util/types";
import { Helicorder } from "../helicorder";
import {
  OffscreenSignalModel,
  OffscreenSignalOptions,
} from "./offscreenSignalModel";

export class OffscreenSignalView extends View<OffscreenSignalModel> {
  override readonly type: string = "offscreenSignal";
  private rect: LayoutRect;
  private chart: Helicorder;
  private image: zrender.Image;

  constructor(chart: Helicorder, options?: Partial<OffscreenSignalOptions>) {
    const model = new OffscreenSignalModel(options || {});
    super(model);
    this.rect = chart.getRect();
    this.chart = chart;
    this.image = new zrender.Image({
      z: -1,
      silent: true,
    });
    const clipRect = this.chart.getXAxis().getRect();
    this.image.setClipPath(new zrender.Rect({ shape: clipRect }));
    this.group.add(this.image);
  }

  updateData(options: OffscreenSignalOptions): void {
    const { image } = options;
    this.model.mergeOptions(options);
    this.image.setStyle({
      image,
    });
  }

  getRect(): LayoutRect {
    return this.rect;
  }

  setRect(rect: LayoutRect): void {
    this.rect = rect;
  }

  resize(): void {
    this.rect = this.chart.getRect();
    const clipRect = this.chart.getXAxis().getRect();
    this.image.setClipPath(new zrender.Rect({ shape: clipRect }));
  }

  clear(): void {
    this.model.clear();
    this.image.setStyle({
      image: "",
    });
  }

  dispose(): void {
    this.clear();
  }

  render(): void {
    if (this.model.isEmpty()) {
      this.group.hide();
      return;
    }
    const { segmentStart } = this.model.getOptions();
    const trackManager = this.chart.getTrackManager();
    const { x, y } = trackManager.getTrackRectBySegment(segmentStart);
    const { width, height } = this.chart.getGrid().getRect();
    this.image.attr({
      style: {
        x,
        y,
        width,
        height,
      },
    });
    this.group.show();
  }

  applyThemeStyle(_: ThemeStyle): void {}
}
