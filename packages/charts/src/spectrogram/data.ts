import { SpectrogramResponseData } from "../util/types";

export interface SpectrogramDataInitOptions {
  data: Float64Array;
  freqMin: number;
  freqMax: number;
  timeMin: number;
  timeMax: number;
  timeLength: number;
  freqLength: number;
  min: number;
  max: number;
}

export class SpectrogramData {
  private _data: Float64Array;
  private _freqMin: number;
  private _freqMax: number;
  private _timeMin: number;
  private _timeMax: number;
  private _timeLength: number;
  private _freqLength: number;
  private _min: number;
  private _max: number;

  constructor(options?: Partial<SpectrogramDataInitOptions>) {
    const opts = options || {};
    this._data = opts.data || new Float64Array();
    this._freqMin = opts.freqMin || 0;
    this._freqMax = opts.freqMax || 0;
    this._timeMin = opts.timeMin || 0;
    this._timeMax = opts.timeMax || 0;
    this._timeLength = opts.timeLength || 0;
    this._freqLength = opts.freqLength || 0;
    this._min = opts.min || 0;
    this._max = opts.max || 0;
  }

  static fromSpectrogramResponseData(
    data: SpectrogramResponseData
  ): SpectrogramData {
    return new SpectrogramData({
      data: data.data,
      freqMin: data.freqMin,
      freqMax: data.freqMax,
      timeMin: data.timeMin,
      timeMax: data.timeMax,
      timeLength: data.timeLength,
      freqLength: data.freqLength,
      min: data.min,
      max: data.max,
    });
  }

  get freqMin(): number {
    return this._freqMin;
  }

  get freqMax(): number {
    return this._freqMax;
  }

  get timeMin(): number {
    return this._timeMin;
  }

  get timeMax(): number {
    return this._timeMax;
  }

  get timeLength(): number {
    return this._timeLength;
  }

  get freqLength(): number {
    return this._freqLength;
  }

  get min(): number {
    return this._min;
  }

  get max(): number {
    return this._max;
  }

  get data(): Float64Array {
    return this._data;
  }

  isEmpty(): boolean {
    return this._data.length === 0;
  }

  get(x: number, y: number): number {
    return this._data[y * this._timeLength + x];
  }

  clear(): void {
    this._data = new Float64Array();
    this._freqMin = 0;
    this._freqMax = 0;
    this._timeMin = 0;
    this._timeMax = 0;
    this._timeLength = 0;
    this._freqLength = 0;
  }

  toString(): string {
    return `SpectrogramData: {fmin: ${this._freqMin}, fmax: ${this._freqMax}}`;
  }
}
