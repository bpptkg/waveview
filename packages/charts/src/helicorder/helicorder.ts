import * as PIXI from "pixi.js";
import { Axis } from "../axis/axis";
import { AxisModel } from "../axis/axisModel";
import { DataProvider } from "../data/dataProvider";
import { Grid } from "../grid/grid";
import { GridModel } from "../grid/gridModel";
import { ChartOptions } from "../model/chartModel";
import { LineSeries, LineSeriesOptions } from "../series/line";
import { Track } from "../track/track";
import { TrackModel } from "../track/trackModel";
import { merge } from "../util/merge";
import { LayoutRect, SeriesData } from "../util/types";
import { ChartType, ChartView } from "../view/chartView";

export interface HelicorderChartOptions extends ChartOptions {
  /**
   * Interval of the helicorder chart in minutes.
   */
  interval: number;
  /**
   * Duration of the helicorder chart in hours.
   */
  duration: number;
  offsetDate: Date;
  forceCenter: boolean;
  useUTC: boolean;
  verticalScaling: "local" | "global";
}

function getDefaultOptions(): HelicorderChartOptions {
  return {
    interval: 60,
    duration: 12,
    offsetDate: new Date(),
    forceCenter: false,
    useUTC: false,
    verticalScaling: "local",
  };
}

export interface HelicorderChartType extends ChartType<HelicorderChartOptions> {
  update(): void;
  getTrackCount(): number;
}

export class Helicorder
  extends ChartView<HelicorderChartOptions>
  implements HelicorderChartType
{
  override readonly type = "helicorder";
  private readonly tracks: Track[] = [];
  private readonly xAxis: Axis;
  private readonly dataProvider: DataProvider;

  constructor(
    dom: HTMLCanvasElement,
    dataProvider: DataProvider,
    options?: Partial<HelicorderChartOptions>
  ) {
    const opts = merge(
      Object.assign({}, getDefaultOptions()),
      options || {},
      true
    ) as HelicorderChartOptions;

    super(dom, opts);

    this.dataProvider = dataProvider;

    const gridModel = new GridModel(this, {
      top: 50,
      right: 50,
      bottom: 50,
      left: 80,
    });
    const grid = new Grid(gridModel, this.getRect());
    this.addComponent(grid);

    const axisModel = new AxisModel(this, {
      position: "top",
    });
    this.xAxis = new Axis(axisModel, grid);
    this.xAxis.setExtent([0, opts.interval]);
    this.addComponent(this.xAxis);

    const trackCount = this.getTrackCount();
    for (let i = 0; i < trackCount; i++) {
      const rect = this.getRectForTrack(i, trackCount, grid.getRect());
      const model = new TrackModel(this, {
        leftLabel: `${i}`,
        rightLabel: "",
      });
      const localGridModel = new GridModel(this);
      const localGrid = new Grid(localGridModel, rect);
      const yAxis = new Axis(
        new AxisModel(this, {
          position: "left",
          show: true,
        }),
        localGrid
      );
      const track = new Track(model, localGrid, this.xAxis, yAxis);
      this.tracks.push(track);
      this.addComponent(track);
    }
  }

  getTrackCount() {
    const { interval, duration } = this.model.getOptions();
    return Math.ceil((duration * 60) / interval);
  }

  private getRectForTrack(
    index: number,
    count: number,
    rect: LayoutRect
  ): LayoutRect {
    if (count === 0) {
      return rect;
    }

    const { x, y, width, height } = rect;
    const trackHeight = height / count;
    const trackY = y + index * trackHeight;

    return new PIXI.Rectangle(x, trackY, width, trackHeight);
  }

  addSeries(index: number, options: LineSeriesOptions): void {
    const series = new LineSeries(options);
    const track = this.tracks[index];
    if (track) {
      track.addSeries(series);
    }
  }

  update(): void {
    const extremes: number[] = [];
    const seriesData: SeriesData[] = [];

    for (let i = 0; i < this.tracks.length; i++) {
      const data = this.dataProvider.getData({ index: i });
      seriesData.push(data);

      let min = Infinity;
      let max = -Infinity;

      for (let j = 0; j < data.length; j++) {
        const value = data[j][1];
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
      extremes.push(max - min);
    }

    const normalizationFactor = Math.min(...extremes);

    for (let i = 0; i < this.tracks.length; i++) {
      const normalizedData = seriesData[i].map((d) => [
        d[0],
        d[1] / normalizationFactor,
      ]);

      const series = new LineSeries({ data: normalizedData, yRange: [-1, 1] });
      const track = this.tracks[i];
      if (track) {
        track.setSingleSeries(series);
        track.fitY();
      }
    }

    this.render();
  }
}
