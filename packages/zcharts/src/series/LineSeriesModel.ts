import { Series } from "@waveview/ndarray";
import { Model } from "../core/model";

export type LineSeriesData = Series;

export interface LineSeriesOptions {
  name: string;
  color: string;
  width: number;
}

export class LineSeriesModel extends Model<LineSeriesOptions> {
  private data: LineSeriesData;

  static readonly defaultOptions: LineSeriesOptions = {
    name: "",
    color: "#000",
    width: 1,
  };

  constructor(options?: LineSeriesOptions) {
    const opts = { ...LineSeriesModel.defaultOptions, ...options };
    super(opts);

    this.data = Series.empty();
  }

  isEmpty(): boolean {
    return this.data.isEmpty();
  }

  getData(): LineSeriesData {
    return this.data;
  }

  setData(data: LineSeriesData): void {
    this.data = data;
  }

  clearData(): void {
    this.data = Series.empty();
  }

  getXRange(): [number, number] {
    return [this.data.index.first(), this.data.index.last()];
  }

  getYRange(): [number, number] {
    return [this.data.min(), this.data.max()];
  }
}
