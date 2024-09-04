import { createColormap } from "@waveview/colormap";
import { Model } from "../model";
import { merge } from "../util/merge";
import { SpectrogramData } from "./data";

export interface SpectrogramOptions {
  show: boolean;
  colormap: string;
  freqMin: number;
  freqMax: number;
}

export class SpectrogramModel extends Model<SpectrogramOptions> {
  override readonly type = "spectrogram";
  private _data: SpectrogramData;
  private _colormap: string[] = [];

  static defaultOptions: SpectrogramOptions = {
    show: false,
    colormap: "viridis",
    freqMin: 0,
    freqMax: 1000,
  };

  constructor(options?: Partial<SpectrogramOptions>) {
    const opts = merge(
      options || {},
      SpectrogramModel.defaultOptions,
      true
    ) as SpectrogramOptions;
    super(opts);

    const { colormap } = this.getOptions();

    this._colormap = createColormap<"hex">({
      colormap: colormap,
      nshades: 256,
      format: "rgbaString",
      alpha: 0.5,
    });
    this._data = new SpectrogramData();
  }

  width(): number {
    return this._data.timeLength;
  }

  height(): number {
    return this._data.freqLength;
  }

  isEmpty(): boolean {
    return this._data.isEmpty();
  }

  getData(): SpectrogramData {
    return this._data;
  }

  updateData(data: SpectrogramData): void {
    this._data.clear();
    this._data = data;
  }

  clearData(): void {
    this._data.clear();
  }

  getSpectrogramValue(x: number, y: number): number {
    return this._data.get(x, y);
  }

  getColorScale(value: number): string {
    const { min, max } = this._data;
    const idx = Math.floor(((value - min) / (max - min)) * 255);
    return this._colormap[idx];
  }
}
