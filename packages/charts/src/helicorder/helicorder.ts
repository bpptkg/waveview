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
import { EventMarker, EventMarkerOptions } from "./eventMarker";
import { Selection } from "./selection";

export interface HelicorderChartOptions extends ChartOptions {
  /**
   * Interval of the helicorder chart in minutes.
   */
  interval: number;
  /**
   * Duration of the helicorder chart in hours.
   */
  duration: number;
  /**
   * Offset date of the helicorder chart.
   */
  offsetDate: Date;
  /**
   * Force center the signal in the helicorder chart.
   */
  forceCenter: boolean;
  /**
   * Use UTC time for the helicorder chart.
   */
  useUTC: boolean;
  /**
   * Vertical scaling of the helicorder chart. ``local`` scales each track
   * independently, while ``global`` scales all tracks together.
   */
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
  updateData(): void;
  getTrackCount(): number;
  setChannel(channel: Channel): void;
  getChannel(): Channel;
  getTrackExtentAt(index: number): [number, number];
  increaseAmplitude(by: number): void;
  decreaseAmplitude(by: number): void;
  shiftViewUp(): void;
  shiftViewDown(): void;
  shiftViewToNow(): void;
  setOffsetDate(date: Date): void;
  addEventMarker(value: Date, options?: Partial<EventMarkerOptions>): void;
  removeEventMarker(value: Date): void;
  showVisibleMarkers(): void;
  hideVisibleMarkers(): void;
  selectTrack(index: number): void;
  unselectTrack(): void;
  moveSelectionUp(): void;
  moveSelectionDown(): void;
  getTrackIndexAtPosition(y: number): number;
  getTrackIndexAtTime(time: number): number;
  timeToOffset(trackIndex: number, time: number): number;
  getTrackAt(index: number): Track | undefined;
  getTrackExtentAt(index: number): [number, number];
  getChartExtent(): [number, number];
}

export class Helicorder
  extends ChartView<HelicorderChartOptions>
  implements HelicorderChartType
{
  override readonly type = "helicorder";

  private readonly tracks: Track[] = [];
  private readonly xAxis: Axis;
  private readonly grid: Grid;
  private readonly dataProvider: DataProvider;
  private _channel: Channel;
  private _markers: EventMarker[] = [];
  private readonly _selection: Selection;

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

    this._selection = new Selection(this.xAxis, this);
    this.addComponent(this._selection);
  }

  setChannel(channel: Channel): void {
    this._channel = channel;
  }

  getChannel(): Channel {
    return this._channel;
  }

  increaseAmplitude(by: number): void {
    for (const track of this.tracks) {
      track.increaseAmplitude(by);
    }
  }

  decreaseAmplitude(by: number): void {
    for (const track of this.tracks) {
      track.decreaseAmplitude(by);
    }
  }

  shiftViewUp(): void {
    const { interval } = this.model.getOptions();
    const offsetDate = new Date(
      this.model.getOptions().offsetDate.getTime() - interval * 60000
    );
    this.model.mergeOptions({ offsetDate });
  }

  shiftViewDown(): void {
    const { interval } = this.model.getOptions();
    const offsetDate = new Date(
      this.model.getOptions().offsetDate.getTime() + interval * 60000
    );
    this.model.mergeOptions({ offsetDate });
  }

  shiftViewToNow(): void {
    const offsetDate = new Date();
    this.model.mergeOptions({ offsetDate });
  }

  setOffsetDate(date: Date): void {
    this.model.mergeOptions({ offsetDate: date });
  }

  addEventMarker(value: Date, options?: Partial<EventMarkerOptions>): void {
    const marker = new EventMarker(this.xAxis, this, {
      value: value.getTime(),
      ...options,
    });
    this._markers.push(marker);
    this.addComponent(marker);
  }

  removeEventMarker(value: Date): void {
    const index = this._markers.findIndex(
      (marker) => marker.getValue() === value.getTime()
    );
    if (index !== -1) {
      const marker = this._markers.splice(index, 1)[0];
      this.removeComponent(marker);
    }
  }

  getVisibleMarkers(): EventMarker[] {
    const [start, end] = this.getChartExtent();
    return this._markers.filter((marker) => {
      const value = marker.getValue();
      return value >= start && value <= end;
    });
  }

  showVisibleMarkers(): void {
    this.getVisibleMarkers().forEach((marker) => marker.show());
  }

  hideVisibleMarkers(): void {
    this.getVisibleMarkers().forEach((marker) => marker.hide());
  }

  selectTrack(index: number): void {
    const [start, end] = this.getTrackExtentAt(
      this.getTrackCount() - index - 1
    );
    this._selection.setValue((start + end) / 2);
  }

  unselectTrack(): void {
    this._selection.reset();
  }

  moveSelectionUp(): void {
    this._selection.moveUp();
  }

  moveSelectionDown(): void {
    this._selection.moveDown();
  }

  updateData(): void {
    const { verticalScaling } = this.model.getOptions();
    if (verticalScaling === "local") {
      throw new Error("Local scaling is not supported yet");
    }

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
  }

  getTrackCount() {
    const { interval, duration } = this.model.getOptions();
    return Math.ceil((duration * 60) / interval) + 1;
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

  getChartExtent(): [number, number] {
    const { duration, offsetDate } = this.model.getOptions();
    const start = offsetDate.getTime() - duration * 3600000;
    const end = offsetDate.getTime();
    return [start, end];
  }

  getTrackIndexAtPosition(y: number): number {
    const { y: gridY, height } = this.grid.getRect();
    const trackHeight = height / this.getTrackCount();
    return Math.floor((y - gridY) / trackHeight);
  }

  getTrackIndexAtTime(time: number): number {
    const { interval, offsetDate } = this.model.getOptions();
    const segment = interval * 60000;
    const endOf = (value: number) => value + segment - (value % segment);
    const end = endOf(offsetDate.getTime());
    const diff = end - time;
    return Math.floor(diff / segment);
  }

  timeToOffset(trackIndex: number, time: number): number {
    const { interval } = this.model.getOptions();
    const [start, end] = this.getTrackExtentAt(trackIndex);
    return ((time - start) / (end - start)) * interval;
  }

  getTrackAt(index: number): Track | undefined {
    return this.tracks[this.getTrackCount() - index - 1];
  }

  override getGrid(): Grid {
    return this.grid;
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
}
