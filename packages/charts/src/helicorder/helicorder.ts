import * as PIXI from "pixi.js";
import { Axis } from "../axis/axis";
import { AxisModel } from "../axis/axisModel";
import { Channel, EMPTY_CHANNEL } from "../data/channel";
import { DataProvider } from "../data/dataProvider";
import { Grid } from "../grid/grid";
import { GridModel } from "../grid/gridModel";
import { ChartOptions } from "../model/chartModel";
import { LineSeries } from "../series/line";
import { Track } from "../track/track";
import { TrackModel } from "../track/trackModel";
import { merge } from "../util/merge";
import { formatDate } from "../util/time";
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
    interval: 30,
    duration: 12,
    offsetDate: new Date(),
    forceCenter: true,
    useUTC: false,
    verticalScaling: "global",
  };
}

export interface HelicorderChartType extends ChartType<HelicorderChartOptions> {
  update(): void;
  getTrackCount(): number;
  setChannel(channel: Channel): void;
  getChannel(): Channel;
  getTrackExtentAt(index: number): [number, number];
  increaseAmplitude(by: number): void;
  decreaseAmplitude(by: number): void;
  shiftViewUp(): void;
  shiftViewDown(): void;
  setOffsetDate(date: Date): void;
}

export class Helicorder
  extends ChartView<HelicorderChartOptions>
  implements HelicorderChartType
{
  override readonly type = "helicorder";

  private readonly tracks: Track[] = [];
  private readonly xAxis: Axis;
  private readonly dataProvider: DataProvider;
  private _channel: Channel;
  private readonly grid: Grid;

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
    this._channel = EMPTY_CHANNEL;

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
      type: "linear",
    });
    this.xAxis = new Axis(axisModel, this.grid.getRect());
    this.xAxis.setExtent([0, opts.interval]);
    this.addComponent(this.xAxis);

    const trackCount = this.getTrackCount();
    for (let i = 0; i < trackCount; i++) {
      const track = this.createTrack(i);
      this.tracks.push(track);
      this.addComponent(track);
    }
  }

  override getGrid(): Grid {
    return this.grid;
  }

  getTrackCount() {
    const { interval, duration } = this.model.getOptions();
    return Math.ceil((duration * 60) / interval) + 1;
  }

  setChannel(channel: Channel): void {
    this._channel = channel;
    this.update();
  }

  getChannel(): Channel {
    return this._channel;
  }

  increaseAmplitude(by: number): void {
    for (const track of this.tracks) {
      track.increaseAmplitude(by);
    }
    this.render();
  }

  decreaseAmplitude(by: number): void {
    for (const track of this.tracks) {
      track.decreaseAmplitude(by);
    }
    this.render();
  }

  shiftViewUp(): void {
    const { interval } = this.model.getOptions();
    const offsetDate = new Date(
      this.model.getOptions().offsetDate.getTime() - interval * 60000
    );
    this.model.mergeOptions({ offsetDate });
    this.update();
  }

  shiftViewDown(): void {
    const { interval } = this.model.getOptions();
    const offsetDate = new Date(
      this.model.getOptions().offsetDate.getTime() + interval * 60000
    );
    this.model.mergeOptions({ offsetDate });
    this.update();
  }

  setOffsetDate(date: Date): void {
    this.model.mergeOptions({ offsetDate: date });
    this.update();
  }

  update(): void {
    const extremes: number[] = [];
    const seriesData: SeriesData[] = [];

    for (let i = 0; i < this.tracks.length; i++) {
      const [start, end] = this.getTrackExtentAt(i);
      const data = this.dataProvider.getData(this._channel, start, end);
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
        this.timeToOffset(i, d[0]),
        d[1] / normalizationFactor,
      ]);

      const series = new LineSeries(this, {
        data: normalizedData,
      });
      const track = this.tracks[i];
      if (track) {
        const [start, end] = this.getTrackExtentAt(
          this.getTrackCount() - i - 1
        );
        const leftLabel = formatDate(
          start,
          i === 0 ? "{MM}-{dd} {HH}:{mm}" : "{HH}:{mm}",
          false
        );
        const rightLabel = formatDate(end, "{HH}:{mm}", true);
        track.getModel().mergeOptions({ leftLabel, rightLabel });
        track.setSingleSeries(series);
        track.setYExtent([-1, 1]);
      }
    }

    this.render();
  }

  getTrackExtentAt(index: number): [number, number] {
    const { interval, offsetDate } = this.model.getOptions();

    const segment = interval * 60000;
    const startOf = (value: number) => value - (value % segment);
    const endOf = (value: number) => value + segment - (value % segment);

    return [
      startOf(offsetDate.getTime() - index * interval * 60000),
      endOf(offsetDate.getTime() - index * interval * 60000),
    ];
  }

  private createTrack(index: number): Track {
    const trackCount = this.getTrackCount();
    const rect = this.getRectForTrack(index, trackCount);
    const model = new TrackModel(this);
    const grid = new Grid(new GridModel(this), rect);
    const yAxis = new Axis(
      new AxisModel(this, {
        position: "left",
        show: true,
      }),
      grid.getRect()
    );
    const track = new Track(model, grid.getRect(), this.xAxis, yAxis);
    return track;
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

  private timeToOffset(trackIndex: number, time: number): number {
    const { interval } = this.model.getOptions();
    const [start, end] = this.getTrackExtentAt(trackIndex);
    return ((time - start) / (end - start)) * interval;
  }
}
