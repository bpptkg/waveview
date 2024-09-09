import { View } from "../core/view";
import { LayoutRect, ThemeStyle } from "../util/types";
import { SpectrogramModel, SpectrogramOptions } from "./spectrogramModel";

export class SpectrogramView extends View<SpectrogramModel> {
  private rect: LayoutRect;
  constructor(track: View, options?: SpectrogramOptions) {
    const model = new SpectrogramModel(options);
    super(model);
    this.rect = track.getRect();
  }

  getRect(): LayoutRect {
    return this.rect;
  }

  setRect(rect: LayoutRect): void {
    this.rect = rect;
  }

  resize(): void {
    this.setRect(this.rect);
  }

  clear(): void {}

  render() {}

  dispose(): void {}

  applyThemeStyle(theme: ThemeStyle): void {}
}
