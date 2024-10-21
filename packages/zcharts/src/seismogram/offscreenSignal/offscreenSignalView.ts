import * as zrender from "zrender";
import { View } from "../../core/view";
import { LayoutRect, ThemeStyle } from "../../util/types";
import { Seismogram } from "../seismogram";
import {
  OffscreenSignalModel,
  OffscreenSignalOptions,
} from "./offscreenSignalModel";

export class OffscreenSignalView extends View<OffscreenSignalModel> {
  override readonly type: string = "offscreenSignal";
  private rect: LayoutRect;
  private chart: Seismogram;
  private image: zrender.Image;

  constructor(chart: Seismogram, options?: Partial<OffscreenSignalOptions>) {
    const model = new OffscreenSignalModel(options || {});
    super(model);
    this.rect = chart.getRect();
    this.chart = chart;
    this.image = new zrender.Image({
      z: 0,
      silent: true,
    });
    const clipRect = this.chart.getXAxis().getRect();
    this.image.setClipPath(new zrender.Rect({ shape: clipRect }));
    this.group.add(this.image);
  }

  updateData(options: OffscreenSignalOptions): void {
    const { image: src } = options;
    this.model.mergeOptions(options);

    const image = new Image();
    image.src = src;
    image.onload = () => {
      const { x, y, width, height } = this.getImageRect();
      this.image.attr({
        style: {
          image,
          x,
          y,
          width,
          height,
        },
      });
      this.group.show();
    };
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
    this.image.setStyle({
      image: "",
    });
    this.model.clear();
  }

  dispose(): void {
    this.clear();
  }

  private getImageRect(): LayoutRect {
    const { y, height } = this.chart.getGrid().getRect();
    const xAxis = this.chart.getXAxis();
    const { start, end } = this.model.getOptions();
    const x1 = xAxis.getPixelForValue(start);
    const x2 = xAxis.getPixelForValue(end);
    const width = x2 - x1;

    return new zrender.BoundingRect(x1, y, width, height);
  }

  render(): void {
    if (this.model.isEmpty() || !this.visible) {
      this.group.hide();
      return;
    }

    const { x, y, width, height } = this.getImageRect();
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
