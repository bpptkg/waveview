import * as PIXI from "pixi.js";
import { Axis } from "../axis/axis";
import { AxisModel } from "../axis/axisModel";
import { Channel } from "../data/channel";
import { DataProvider } from "../data/dataProvider";
import { Grid } from "../grid/grid";
import { GridModel } from "../grid/gridModel";
import { ChartOptions } from "../model/chartModel";
import { LineSeries } from "../series/line";
import { Track } from "../track/track";
import { TrackModel } from "../track/trackModel";
import { LayoutRect, SeriesData } from "../util/types";
import { ChartType, ChartView } from "../view/chartView";

export interface SeismogramChartOptions extends ChartOptions {
  startTime?: number;
  endTime?: number;
  interval: number;
  forceCenter: boolean;
  useUTC: boolean;
  verticalScaling: "local" | "global";
}

function getDefaultOptions(): SeismogramChartOptions {
  return {
    startTime: undefined,
    endTime: undefined,
    interval: 30,
    forceCenter: true,
    useUTC: false,
    verticalScaling: "global",
  };
}

export interface SeismogramChartType extends ChartType<SeismogramChartOptions> {
  update(): void;
  addChannel(channel: Channel): void;
  removeChannel(index: number): void;
  increaseAmplitude(by: number): void;
  decreaseAmplitude(by: number): void;
  scrollLeft(by: number): void;
  scrollRight(by: number): void;
  scrollTo(timestamp: number): void;
  zoomIn(center: number, by: number): void;
  zoomOut(center: number, by: number): void;
  getTrackCount(): number;
}

export class Seismogram
  extends ChartView<SeismogramChartOptions>
  implements SeismogramChartType
{
  override readonly type = "seismogram";

  private readonly tracks: Track[] = [];
  private readonly xAxis: Axis;
  private readonly dataProvider: DataProvider;
  private readonly grid: Grid;
  private readonly channels: Channel[] = [];

  constructor(
    dom: HTMLCanvasElement,
    dataProvider: DataProvider,
    options?: Partial<SeismogramChartOptions>
  ) {
    const opts = Object.assign(
      {},
      getDefaultOptions(),
      options || {}
    ) as SeismogramChartOptions;
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

    this.grid = grid;

    const axisModel = new AxisModel(this, {
      position: "top",
    });
    this.xAxis = new Axis(axisModel, this.grid.getRect());
    const { startTime, endTime } = opts;
    if (startTime && endTime) {
      this.xAxis.setExtent([startTime, endTime]);
    } else {
      const end = Date.now();
      const start = end - opts.interval * 60;
      this.xAxis.setExtent([start, end]);
    }
    this.addComponent(this.xAxis);
  }

  getTrackCount(): number {
    return this.tracks.length;
  }

  addChannel(channel: Channel): void {
    this.channels.push(channel);

    const length = this.channels.length;
    const rect = this.getRectForTrack(length - 1, length);
    const model = new TrackModel(this, {
      leftLabel: channel.id,
    });
    const yAxis = new Axis(
      new AxisModel(this, {
        position: "left",
        show: false,
      }),
      rect
    );
    const track = new Track(model, rect, this.xAxis, yAxis);
    this.tracks.push(track);
    this.addComponent(track);
    this.updateTracksRect();
  }

  removeChannel(index: number): void {
    this.channels.splice(index, 1);
    const track = this.tracks.splice(index, 1)[0];
    this.removeComponent(track);
    this.updateTracksRect();
  }

  update(): void {
    const extremes: number[] = [];
    const seriesData: SeriesData[] = [];
    const [start, end] = this.xAxis.getExtent();

    for (let i = 0; i < this.tracks.length; i++) {
      const data = this.dataProvider.getData(this.channels[i], start, end);
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

      const series = new LineSeries(this, {
        data: normalizedData,
      });
      const track = this.tracks[i];
      if (track) {
        track.setSingleSeries(series);
        track.setYExtent([-1, 1]);
      }
    }

    this.render();
  }

  override getGrid(): Grid {
    return this.grid;
  }

  increaseAmplitude(by: number): void {
    this.tracks.forEach((track) => {
      track.increaseAmplitude(by);
    });
    this.render();
  }

  decreaseAmplitude(by: number): void {
    this.tracks.forEach((track) => {
      track.decreaseAmplitude(by);
    });
    this.render();
  }

  scrollLeft(by: number): void {
    this.xAxis.scrollLeft(by);
    this.render();
  }

  scrollRight(by: number): void {
    this.xAxis.scrollRight(by);
    this.render();
  }

  scrollTo(timestamp: number): void {
    this.xAxis.scrollTo(timestamp);
    this.render();
  }

  zoomIn(at: number, by: number): void {
    this.xAxis.zoomIn(at, by);
    this.render();
  }

  zoomOut(at: number, by: number): void {
    this.xAxis.zoomOut(at, by);
    this.render();
  }

  private getRectForTrack(index: number, count: number): LayoutRect {
    const rect = this.grid.getRect();
    if (count === 0) {
      return rect;
    }

    const { x, y, width, height } = rect;
    const trackHeight = height / count;
    const trackY = y + index * trackHeight;

    return new PIXI.Rectangle(x, trackY, width, trackHeight);
  }

  private updateTracksRect(): void {
    const trackCount = this.getTrackCount();
    this.tracks.forEach((track, index) => {
      const rect = this.getRectForTrack(index, trackCount);
      track.setRect(rect);
    });
  }
}
