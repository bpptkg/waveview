import * as PIXI from "pixi.js";
import { Axis } from "../axis/axis";
import { AxisModel } from "../axis/axisModel";
import { Channel } from "../data/channel";
import { DataProvider } from "../data/dataProvider";
import { Grid } from "../grid/grid";
import { GridModel } from "../grid/gridModel";
import { AreaMarkerOptions } from "../marker/area";
import { LineMarkerOptions } from "../marker/line";
import { ChartOptions } from "../model/chartModel";
import { LineSeries } from "../series/line";
import { Track } from "../track/track";
import { TrackModel } from "../track/trackModel";
import { LayoutRect, SeriesData } from "../util/types";
import { ChartType, ChartView } from "../view/chartView";
import { AxisPointer } from "./axisPointer";

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
  updateData(): void;
  addChannel(channel: Channel): void;
  addChannels(channels: Channel[]): void;
  removeChannel(index: number): void;
  removeChannels(indexes: number[]): void;
  increaseAmplitude(by: number): void;
  decreaseAmplitude(by: number): void;
  scrollLeft(by: number): void;
  scrollRight(by: number): void;
  scrollTo(timestamp: number): void;
  zoomIn(center: number, by: number): void;
  zoomOut(center: number, by: number): void;
  getTrackCount(): number;
  addLineMarker(value: Date, options?: Partial<LineMarkerOptions>): void;
  removeLineMarker(value: Date): void;
  addAreaMarker(
    start: Date,
    end: Date,
    options?: Partial<AreaMarkerOptions>
  ): void;
  removeAreaMarker(start: Date, end: Date): void;
  showVisibleMarkers(): void;
  hideVisibleMarkers(): void;
  selectTrack(index: number): void;
  unselectTrack(): void;
  moveSelectionUp(): void;
  moveSelectionDown(): void;
  getTrackIndexAtPosition(y: number): number;
  getTrackAt(index: number): Track | undefined;
  getChartExtent(): [number, number];
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
  private _selectedTrackIndex: number = -1;
  private readonly _axisPointer: AxisPointer;

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

    const { startTime, endTime, useUTC } = opts;
    const axisModel = new AxisModel(this, {
      position: "top",
      type: "time",
      useUTC,
    });
    this.xAxis = new Axis(axisModel, this.grid.getRect());
    if (startTime && endTime) {
      this.xAxis.setExtent([startTime, endTime]);
    } else {
      const end = Date.now();
      const start = end - opts.interval * 1000 * 60;
      this.xAxis.setExtent([start, end]);
    }
    this.addComponent(this.xAxis);

    this._axisPointer = new AxisPointer(this.xAxis, this);
    this.addComponent(this._axisPointer);
  }

  addChannel(channel: Channel): void {
    this.addChannelInternal(channel);
  }

  removeChannel(index: number): void {
    this.removeChannelInternal(index);
  }

  addChannels(channels: Channel[]): void {
    channels.forEach((channel) => {
      this.addChannelInternal(channel);
    });
  }

  removeChannels(indexes: number[]): void {
    indexes.forEach((index) => {
      this.removeChannelInternal(index);
    });
  }

  addLineMarker(
    value: Date,
    options?: Partial<Omit<LineMarkerOptions, "value">>
  ): void {
    this.xAxis.addLineMarker(value.getTime(), options || {});
  }

  removeLineMarker(value: Date): void {
    this.xAxis.removeLineMarker(value.getTime());
  }

  addAreaMarker(
    start: Date,
    end: Date,
    options?: Partial<Omit<AreaMarkerOptions, "start" | "end">>
  ): void {
    this.xAxis.addAreaMarker(start.getTime(), end.getTime(), options || {});
  }

  removeAreaMarker(start: Date, end: Date): void {
    this.xAxis.removeAreaMarker(start.getTime(), end.getTime());
  }

  showVisibleMarkers(): void {
    this.xAxis.showVisibleMarkers();
  }

  hideVisibleMarkers(): void {
    this.xAxis.hideVisibleMarkers();
  }

  selectTrack(index: number): void {
    this._selectedTrackIndex = index;
    this.tracks.forEach((track) => {
      track.unhighlight();
    });
    const track = this.tracks[index];
    if (track) {
      track.highlight();
    }
  }

  unselectTrack(): void {
    this.tracks.forEach((track) => {
      track.unhighlight();
    });
  }

  moveSelectionUp(): void {
    if (this._selectedTrackIndex === -1) {
      return;
    }
    const index = this._selectedTrackIndex - 1;
    if (index < 0 || index > this.tracks.length - 1) {
      return;
    }
    const track = this.tracks[index];
    if (track) {
      this._selectedTrackIndex = index;
      this.tracks.forEach((track) => {
        track.unhighlight();
      });
      track.highlight();
    }
  }

  moveSelectionDown(): void {
    if (this._selectedTrackIndex === -1) {
      return;
    }
    const index = this._selectedTrackIndex + 1;
    if (index < 0 || index > this.tracks.length - 1) {
      return;
    }
    const track = this.tracks[index];
    if (track) {
      this._selectedTrackIndex = index;
      this.tracks.forEach((track) => {
        track.unhighlight();
      });
      track.highlight();
    }
  }

  increaseAmplitude(by: number): void {
    this.tracks.forEach((track) => {
      track.increaseAmplitude(by);
    });
  }

  decreaseAmplitude(by: number): void {
    this.tracks.forEach((track) => {
      track.decreaseAmplitude(by);
    });
  }

  scrollLeft(by: number): void {
    this.xAxis.scrollLeft(by);
  }

  scrollRight(by: number): void {
    this.xAxis.scrollRight(by);
  }

  scrollTo(timestamp: number): void {
    this.xAxis.scrollTo(timestamp);
  }

  zoomIn(at: number, by: number): void {
    this.xAxis.zoomIn(at, by);
  }

  zoomOut(at: number, by: number): void {
    this.xAxis.zoomOut(at, by);
  }

  updateData(): void {
    const { verticalScaling } = this.model.options;
    if (verticalScaling === "local") {
      throw new Error("Local scaling is not supported yet.");
    }
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
  }

  getTrackCount(): number {
    return this.tracks.length;
  }

  getTrackIndexAtPosition(y: number): number {
    const trackCount = this.getTrackCount();
    const trackHeight = this.grid.getRect().height / trackCount;
    return Math.floor(y / trackHeight);
  }

  getTrackAt(index: number): Track | undefined {
    return this.tracks[index];
  }

  getChartExtent(): [number, number] {
    return this.xAxis.getExtent();
  }

  override getGrid(): Grid {
    return this.grid;
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

  private addChannelInternal(channel: Channel): Channel {
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
    return channel;
  }

  private removeChannelInternal(index: number): void {
    this.channels.splice(index, 1);
    const track = this.tracks.splice(index, 1)[0];
    this.removeComponent(track);
    this.updateTracksRect();
  }

  private updateTracksRect(): void {
    const trackCount = this.getTrackCount();
    this.tracks.forEach((track, index) => {
      const rect = this.getRectForTrack(index, trackCount);
      track.setRect(rect);
    });
  }
}
