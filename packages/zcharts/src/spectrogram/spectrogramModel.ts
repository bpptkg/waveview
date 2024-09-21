import { Model } from "../core/model";

export interface SpectrogramOptions {
  show: boolean;
}

export interface SpectrogramDataOptions {
  image: Uint8Array;
  timeMin: number;
  timeMax: number;
  freqMin: number;
  freqMax: number;
  timeLength: number;
  freqLength: number;
  min: number;
  max: number;
}

export class SpectrogramData {
  image: Uint8Array = new Uint8Array();
  timeMin: number = 0;
  timeMax: number = 0;
  freqMin: number = 0;
  freqMax: number = 0;
  timeLength: number = 0;
  freqLength: number = 0;
  min: number = 0;
  max: number = 0;
  private _imageURL: string = "";

  constructor(data?: SpectrogramDataOptions) {
    if (data) {
      this.set(data);
    }
  }

  clone(): SpectrogramData {
    return new SpectrogramData(this);
  }

  set(data: SpectrogramDataOptions): void {
    this.image = data.image;
    this.timeMin = data.timeMin;
    this.timeMax = data.timeMax;
    this.freqMin = data.freqMin;
    this.freqMax = data.freqMax;
    this.timeLength = data.timeLength;
    this.freqLength = data.freqLength;
    this.min = data.min;
    this.max = data.max;
    this.updateImageURL();
  }

  isEmpty(): boolean {
    return this.image.length === 0;
  }

  getImageURL(): string {
    return this._imageURL;
  }

  private updateImageURL(): void {
    let charString = "";
    for (let i = 0; i < this.image.length; i++) {
      charString += String.fromCharCode(this.image[i]);
    }
    const data = `data:image/png;base64,${btoa(charString)}`;
    this._imageURL = data;
  }
}

export class SpectrogramModel extends Model<SpectrogramOptions> {
  static readonly defaultOptions: SpectrogramOptions = {
    show: false,
  };
  private data: SpectrogramData = new SpectrogramData();

  constructor(options?: Partial<SpectrogramOptions>) {
    super({ ...SpectrogramModel.defaultOptions, ...options });
  }

  getData(): SpectrogramData {
    return this.data;
  }

  setData(data: SpectrogramData): void {
    this.data = data;
  }

  clearData(): void {
    this.data = new SpectrogramData();
  }

  isEmpty(): boolean {
    return this.data.isEmpty();
  }
}
