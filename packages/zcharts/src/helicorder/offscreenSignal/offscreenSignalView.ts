import { View } from "../../core/view";
import { LayoutRect, ThemeStyle } from "../../util/types";
import { Helicorder } from "../helicorder";
import {
  OffscreenSignalModel,
  OffscreenSignalOptions,
} from "./offscreenSignalModel";
import * as zrender from "zrender";

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

  setImage(image: string): void {
    this.model.setImage(image);
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
    this.model.setImage("");
    this.model.setDirty(true);
  }

  dispose(): void {
    this.clear();
  }

  render(): void {
    if (this.model.isEmpty()) {
      this.group.hide();
      return;
    }
    const { x, y, width, height } = this.chart.getRect();
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
