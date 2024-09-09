import { Model } from "../core/model";

export interface SpectrogramOptions {
  show: boolean;
}

export type SpectrogramData = string;

export class SpectrogramModel extends Model<SpectrogramOptions> {
  static readonly defaultOptions: SpectrogramOptions = {
    show: false,
  };
  private data: SpectrogramData = "";

  constructor(options?: Partial<SpectrogramOptions>) {
    super({ ...SpectrogramModel.defaultOptions, ...options });
  }

  getData(): SpectrogramData {
    return this.data;
  }

  setData(data: SpectrogramData): void {
    this.data = data;
  }

  isEmpty(): boolean {
    return this.data === "";
  }
}
