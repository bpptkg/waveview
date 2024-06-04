import { SeriesData, SeriesOptions } from "../util/types";
import { Model } from "./model";

export class SeriesModel<
  T extends SeriesOptions = SeriesOptions
> extends Model<T> {
  override type: string = "series";
  private _data: SeriesData = [];
  private _ymin: number = -Infinity;
  private _ymax: number = Infinity;

  constructor(options: T) {
    super(options);

    this._data = options.data || [];
  }

  appendData(data: SeriesData): void {
    for (const point of data) {
      this._data.push(point);
    }
  }

  isEmpty(): boolean {
    return this._data.length === 0;
  }

  getData(): SeriesData {
    return this._data;
  }

  setData(data: SeriesData): void {
    this._data = data;
  }

  clearData(): void {
    this._data = [];
  }

  getXRange(): [number, number] {
    let min = Infinity;
    let max = -Infinity;
    if (this._data.length > 1) {
      return [this._data[0][0], this._data[this._data.length - 1][0]];
    }
    return [min, max];
  }

  getYRange(): [number, number] {
    if (!isFinite(this._ymin) || !isFinite(this._ymax)) {
      let min = Infinity;
      let max = -Infinity;
      for (const point of this._data) {
        min = Math.min(min, point[1]);
        max = Math.max(max, point[1]);
      }
      this._ymin = min;
      this._ymax = max;
    }
    return [this._ymin, this._ymax];
  }
}
