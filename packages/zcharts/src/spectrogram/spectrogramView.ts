import * as zrender from "zrender";
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

  constructor(track: TrackView, options?: SpectrogramOptions) {
    const model = new SpectrogramModel(options);
    super(model);
    this.rect = track.getRect();
    this.track = track;
  }

  setData(data: SpectrogramData): void {
    this.model.setData(data);
  }

  getData(): SpectrogramData {
    return this.model.getData();
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

  clear(): void {
    this.group.removeAll();
  }

  render() {
    this.clear();
    const { show } = this.model.getOptions();
    if (!show) {
      return;
    }

    const { x, y, width, height } = this.track.getRect();
    const image = this.model.getData();
    const specgram = new zrender.Image({
      style: {
        x,
        y,
        width,
        height,
        image,
      },
    });
    this.group.add(specgram);
  }

  dispose(): void {}

  applyThemeStyle(_: ThemeStyle): void {}
}
