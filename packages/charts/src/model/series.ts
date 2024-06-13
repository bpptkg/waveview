import { Series } from "@waveview/ndarray";
import { SeriesData, SeriesOptions } from "../util/types";
import { Model } from "./model";

export class SeriesModel<
  T extends SeriesOptions = SeriesOptions
> extends Model<T> {
  override type: string = "series";

  private _data: SeriesData;

  constructor(options?: T) {
    const opts = options || ({} as T);
    super(opts);

    this._data = Series.empty();
  }

  isEmpty(): boolean {
    return this._data.isEmpty();
  }

  getData(): SeriesData {
    return this._data;
  }

  setData(data: SeriesData): void {
    this._data = data;
  }

  clearData(): void {
    this._data = Series.empty();
  }

  getXRange(): [number, number] {
    return [this._data.index.first(), this._data.index.last()];
  }

  getYRange(): [number, number] {
    return [this._data.min(), this._data.max()];
  }
}
