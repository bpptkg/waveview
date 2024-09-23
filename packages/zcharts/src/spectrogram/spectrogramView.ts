import * as zrender from "zrender";
import { AxisView } from "../axis/axisView";
import { View } from "../core/view";
import { TrackView } from "../track/trackView";
import { LayoutRect, ThemeStyle } from "../util/types";
import {
  SpectrogramData,
  SpectrogramModel,
  SpectrogramOptions,
} from "./spectrogramModel";

export class SpectrogramView extends View<SpectrogramModel> {
  private rect: LayoutRect;
  private track: TrackView;
  // @ts-ignore
  private xAxis: AxisView;
  // @ts-ignore
  private yAxis: AxisView;
  private image: zrender.Image;

  constructor(
    xAxis: AxisView,
    yAxis: AxisView,
    track: TrackView,
    options?: SpectrogramOptions
  ) {
    const model = new SpectrogramModel(options);
    super(model);
    this.rect = track.getRect();
    this.track = track;
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.image = new zrender.Image({
      z: -1,
      silent: true,
    });
    const clipRect = this.xAxis.getRect();
    this.image.setClipPath(new zrender.Rect({ shape: clipRect }));
    this.group.add(this.image);
  }

  setData(data: SpectrogramData): void {
    this.model.setData(data);
    this.image.setStyle({
      image: data.getImageURL(),
    });
  }

  getData(): SpectrogramData {
    return this.model.getData();
  }

  clearData(): void {
    this.model.clearData();
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
    this.setRect(this.track.getRect());
  }

  clear(): void {}

  render() {
    if (!this.visible) {
      this.group.hide();
      return;
    }

    const data = this.model.getData();
    const x1 = this.xAxis.getPixelForValue(data.timeMin);
    const x2 = this.xAxis.getPixelForValue(data.timeMax);
    const y1 = this.yAxis.getPixelForValue(data.freqMin);
    const y2 = this.yAxis.getPixelForValue(data.freqMax);

    this.image.attr({
      style: {
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1,
      },
    });
    this.group.show();
    const clipRect = this.xAxis.getRect();
    this.image.setClipPath(new zrender.Rect({ shape: clipRect }));
  }

  dispose(): void {}

  applyThemeStyle(_: ThemeStyle): void {}
}
