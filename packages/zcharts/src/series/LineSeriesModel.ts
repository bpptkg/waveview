import { Model } from "../core/model";

export type LineSeriesData = [number, number][];

export interface LineSeriesOptions {
  name: string;
  color: string;
  width: number;
}

export class LineSeriesModel extends Model<LineSeriesOptions> {
  private _data: LineSeriesData;

  static defaultOptions: LineSeriesOptions = {
    name: "",
    color: "#000",
    width: 1,
  };

  constructor(options?: LineSeriesOptions) {
    const opts = { ...LineSeriesModel.defaultOptions, ...options };
    super(opts);

    this._data = [];
  }

  isEmpty(): boolean {
    return this._data.length === 0;
  }

  getData(): LineSeriesData {
    return this._data;
  }

  setData(data: LineSeriesData): void {
    this._data = data;
  }

  clearData(): void {
    this._data = [];
  }

  getXRange(): [number, number] {
    return [
      this._data.reduce((min, [x]) => Math.min(min, x), Infinity),
      this._data.reduce((max, [x]) => Math.max(max, x), -Infinity),
    ];
  }

  getYRange(): [number, number] {
    return [
      this._data.reduce((min, [, y]) => Math.min(min, y), Infinity),
      this._data.reduce((max, [, y]) => Math.max(max, y), -Infinity),
    ];
  }
}
