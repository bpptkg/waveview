import * as PIXI from "pixi.js";
import { Axis } from "../axis";
import { Track } from "../track";
import { LayoutRect, ThemeStyle } from "../util/types";
import { View } from "../view";
import { SpectrogramData } from "./data";
import { SpectrogramModel, SpectrogramOptions } from "./model";

export class Spectrogram extends View<SpectrogramModel> {
  override readonly type = "spectrogram";
  private _rect: LayoutRect;
  readonly track: Track;
  readonly yAxis: Axis;

  private readonly _graphics: PIXI.Graphics;

  constructor(track: Track, options?: Partial<SpectrogramOptions>) {
    const model = new SpectrogramModel(options);
    super(model);

    this._rect = track.xAxis.getRect();
    this.track = track;
    this.yAxis = new Axis(this, { position: "right" });

    this._graphics = new PIXI.Graphics();

    this.group.addChild(this._graphics);
    this.group.addChild(this.yAxis.group);
    this.group.interactive = false;
    this.group.zIndex = -10;
  }

  show(): void {
    this.model.mergeOptions({ show: true });
  }

  hide(): void {
    this.model.mergeOptions({ show: false });
  }

  focus(): void {}

  blur(): void {}

  resize(): void {
    const rect = this.track.getRect();
    this.setRect(rect);
    this.yAxis.resize();
  }

  override getRect(): LayoutRect {
    return this._rect.clone();
  }

  override setRect(rect: LayoutRect): void {
    this._rect = rect;
  }

  applyThemeStyle(_: ThemeStyle): void {}

  clear(): void {
    this._graphics.clear();
  }

  override render(): void {
    this.clear();
    const { show } = this.model.getOptions();
    if (!show) {
      return;
    }
    if (this.model.isEmpty()) {
      return;
    }

    const data = this.model.getData();
    this.yAxis.setExtent([data.freqMin, data.freqMax]);
    this.yAxis.render();

    const rows = this.model.height();
    const cols = this.model.width();
    const { x, y, width, height } = this.track.getRect();

    const downsampleFactor = 1;
    const cellWidth = (width / cols) * downsampleFactor;
    const cellHeight = (height / rows) * downsampleFactor;

    for (let i = 0; i < rows; i += downsampleFactor) {
      for (let j = 0; j < cols; j += downsampleFactor) {
        const value = this.model.getSpectrogramValue(j, i);
        const color = this.model.getColorScale(value);
        this._graphics
          .rect(x + j * cellWidth, y + i * cellHeight, cellWidth, cellHeight)
          .fill({
            color: color,
          });
      }
    }
  }

  override dispose(): void {
    this._graphics.destroy();
    this.group.destroy();
    this.model.clearData();
  }

  setData(data: SpectrogramData): void {
    this.model.updateData(data);
  }

  getData(): SpectrogramData {
    return this.model.getData();
  }

  clearData(): void {
    this.model.clearData();
  }
}
