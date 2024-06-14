import * as PIXI from "pixi.js";
import { Axis } from "../axis/axis";
import { Channel } from "../data/channel";
import { DataStore } from "../data/dataStore";
import { Grid } from "../grid/grid";
import { GridOptions } from "../grid/gridModel";
import { ChartOptions } from "../model/chartModel";
import { Track } from "../track/track";
import { merge } from "../util/merge";
import { ONE_HOUR, ONE_MINUTE, formatDate } from "../util/time";
import { EventMap, LayoutRect, SeriesData } from "../util/types";
import { ChartType, ChartView } from "../view/chartView";
import { EventMarker, EventMarkerOptions } from "./eventMarker";
import { Selection } from "./selection";

export interface HelicorderChartOptions extends ChartOptions {
  /**
   * Channel ID of the helicorder chart.
   */
  channelId: string;
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
  /**
   * Grid options for the helicorder chart.
   */
  grid: Partial<GridOptions>;
}

function getDefaultOptions(): HelicorderChartOptions {
  return {
    channelId: "",
    interval: 30,
    duration: 12,
    offsetDate: new Date(),
    forceCenter: true,
    useUTC: false,
    verticalScaling: "global",
    grid: {
      top: 50,
      right: 50,
      bottom: 50,
      left: 80,
    },
  };
}

export interface HelicorderChartType extends ChartType<HelicorderChartOptions> {
  getTrackCount(): number;
  setChannel(channel: Channel): void;
  getChannel(): Channel;
  increaseAmplitude(by: number): void;
  decreaseAmplitude(by: number): void;
  resetAmplitude(): void;
  shiftViewUp(): [number, number];
  shiftViewDown(): [number, number];
  shiftViewToNow(): void;
  setOffsetDate(date: Date | number): void;
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
  getTracks(): Track[];
  getTrackAt(index: number): Track | undefined;
  getTrackExtentAt(index: number): [number, number];
  getTrackExtents(): [number, number][];
  getTrackData(start: number, end: number): SeriesData | undefined;
  setTrackData(data: SeriesData, start: number, end: number): void;
  updateTracks(): void;
  getXAxis(): Axis;
  getYExtent(): [number, number];
  getChartExtent(): [number, number];
  getDataStore(): DataStore<SeriesData>;
  getTrackId(extent: [number, number]): string;
}

export interface HelicorderEventMap extends EventMap {
  channelChanged: (channel: Channel) => void;
  offsetChanged: (offset: Date) => void;
  amplitudeChanged: (range: [number, number]) => void;
  trackSelected: (index: number) => void;
  trackUnselected: () => void;
  viewShiftedUp: (range: [number, number]) => void;
  viewShiftedDown: (range: [number, number]) => void;
  viewShiftedToNow: () => void;
  viewShiftedToTime: (time: number) => void;
}

export function createTrackId(start: number, end: number): string {
  return `${start}-${end}`;
}

export class Helicorder
  extends ChartView<HelicorderChartOptions>
  implements HelicorderChartType
{
  override readonly type = "helicorder";

  private readonly _xAxis: Axis;
  private readonly _grid: Grid;
  private readonly _selection: Selection;
  private _tracks: Track[] = [];
  private _channel: Channel;
  private _markers: EventMarker[] = [];
  private _dataStore = new DataStore<SeriesData>();
  private _normFactor: number = Infinity;
  private _yExtent: [number, number] = [-1, 1];

  constructor(
    dom: HTMLCanvasElement,
    options?: Partial<HelicorderChartOptions>
  ) {
    const opts = merge(
      Object.assign({}, getDefaultOptions()),
      options || {},
      true
    ) as HelicorderChartOptions;

    super(dom, opts);

    this._channel = { id: opts.channelId };

    this._grid = new Grid(this.getRect(), opts.grid);
    this.addComponent(this._grid);

    this._xAxis = new Axis(this._grid.getRect(), {
      position: "top",
      type: "linear",
    });
    this._xAxis.setExtent([0, opts.interval]);
    this.addComponent(this._xAxis);

    const trackCount = this.getTrackCount();
    for (let i = 0; i < trackCount; i++) {
      const track = this.createTrack(i);
      this._tracks.push(track);
      this.addComponent(track);
    }

    this._selection = new Selection(this._xAxis, this);
    this.addComponent(this._selection);
  }

  setChannel(channel: Channel): void {
    this._channel = channel;
    this.emit("channelChanged", channel);
  }

  getChannel(): Channel {
    return this._channel;
  }

  increaseAmplitude(by: number): void {
    const [ymin, ymax] = this.getYExtent();
    const dy = -(ymax - ymin) * by;
    this._yExtent = [ymin + dy, ymax + dy];

    for (const track of this._tracks) {
      track.setYExtent(this._yExtent);
    }

    this.emit("amplitudeChanged", this._yExtent);
  }

  decreaseAmplitude(by: number): void {
    this.increaseAmplitude(-by);
    this.emit("amplitudeChanged", this._yExtent);
  }

  resetAmplitude(): void {
    this._yExtent = [-1, 1];
    for (const track of this._tracks) {
      track.setYExtent(this._yExtent);
    }
    this.emit("amplitudeChanged", this._yExtent);
  }

  shiftViewUp(): [number, number] {
    const { interval } = this.model.getOptions();
    const offsetDate = new Date(
      this.model.getOptions().offsetDate.getTime() - interval * ONE_MINUTE
    );
    this.setOffsetDate(offsetDate);

    const trackIndex = this.getTrackIndexAtTime(offsetDate.getTime());
    const extent = this.getTrackExtentAt(trackIndex);
    this.emit("viewShiftedUp", extent);
    return extent;
  }

  shiftViewDown(): [number, number] {
    const { interval } = this.model.getOptions();
    const offsetDate = new Date(
      this.model.getOptions().offsetDate.getTime() + interval * ONE_MINUTE
    );
    this.setOffsetDate(offsetDate);

    const trackIndex = this.getTrackIndexAtTime(offsetDate.getTime());
    const extent = this.getTrackExtentAt(trackIndex);
    this.emit("viewShiftedDown", extent);
    return extent;
  }

  shiftViewToNow(): void {
    const offsetDate = new Date();
    this.setOffsetDate(offsetDate);
    this.emit("viewShiftedToNow");
  }

  shiftViewToTime(time: number): void {
    const offsetDate = new Date(time);
    this.setOffsetDate(offsetDate);
    this.emit("viewShiftedToTime", time);
  }

  setOffsetDate(date: Date | number): void {
    if (typeof date === "number") {
      date = new Date(date);
    }
    this.model.mergeOptions({ offsetDate: date });
    this.emit("offsetChanged", date);
  }

  addEventMarker(value: Date, options?: Partial<EventMarkerOptions>): void {
    const marker = new EventMarker(this._xAxis, this, {
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
    const trackIndex = this.getTrackCount() - index - 1;
    const [start, end] = this.getTrackExtentAt(trackIndex);
    this._selection.setValue((start + end) / 2);
    this.emit("trackSelected", trackIndex);
  }

  unselectTrack(): void {
    this._selection.reset();
    this.emit("trackUnselected");
  }

  moveSelectionUp(): void {
    this._selection.moveUp();
    this.emit("trackSelected", this._selection.getTrackIndex());
  }

  moveSelectionDown(): void {
    this._selection.moveDown();
    this.emit("trackSelected", this._selection.getTrackIndex());
  }

  setTrackData(data: SeriesData, start: number, end: number): void {
    const key = createTrackId(start, end);
    this._dataStore.set(key, data);

    for (const data of this._dataStore.values()) {
      const range = data.max() - data.min();
      this._normFactor = Math.min(this._normFactor, range);
    }
  }

  getTrackData(start: number, end: number): SeriesData | undefined {
    const key = createTrackId(start, end);
    const data = this._dataStore.get(key);
    return data;
  }

  getTrackExtents(): [number, number][] {
    const extents: [number, number][] = [];
    for (let i = 0; i < this._tracks.length; i++) {
      const [start, end] = this.getTrackExtentAt(i);
      extents.push([start, end]);
    }
    return extents;
  }

  updateTracks(): void {
    for (let i = 0; i < this._tracks.length; i++) {
      const trackIndex = this.getTrackCount() - i - 1;
      const [start, end] = this.getTrackExtentAt(trackIndex);
      const data = this.getTrackData(start, end);
      if (!data) {
        continue;
      }
      const slice = data.scalarDivide(this._normFactor);
      slice.setIndex(
        slice.index.map((value: number) => this.timeToOffset(trackIndex, value))
      );

      const track = this._tracks[i];
      if (track) {
        const leftLabel = formatDate(
          start,
          i === 0 ? "{MM}-{dd} {HH}:{mm}" : "{HH}:{mm}",
          false
        );
        const rightLabel = formatDate(end, "{HH}:{mm}", true);
        track.getModel().mergeOptions({ leftLabel, rightLabel });
        track.getSeries().setData(slice);
      }
    }
  }

  getXAxis(): Axis {
    return this._xAxis;
  }

  getYExtent(): [number, number] {
    return this._yExtent;
  }

  getTracks(): Track[] {
    return this._tracks;
  }

  getDataStore(): DataStore<SeriesData> {
    return this._dataStore;
  }

  getTrackId(extent: [number, number]): string {
    return createTrackId(extent[0], extent[1]);
  }

  getTrackCount() {
    const { interval, duration } = this.model.getOptions();
    return Math.ceil((duration * 60) / interval) + 1;
  }

  getTrackExtentAt(index: number): [number, number] {
    const { interval, offsetDate } = this.model.getOptions();

    const segment = interval * ONE_MINUTE;
    const startOf = (value: number) => value - (value % segment);
    const endOf = (value: number) => value + segment - (value % segment);

    return [
      startOf(offsetDate.getTime() - index * interval * ONE_MINUTE),
      endOf(offsetDate.getTime() - index * interval * ONE_MINUTE),
    ];
  }

  getChartExtent(): [number, number] {
    const { duration, offsetDate } = this.model.getOptions();
    const start = offsetDate.getTime() - duration * ONE_HOUR;
    const end = offsetDate.getTime();
    return [start, end];
  }

  getTrackIndexAtPosition(y: number): number {
    const { y: gridY, height } = this.getGrid().getRect();
    const trackHeight = height / this.getTrackCount();
    return Math.floor((y - gridY) / trackHeight);
  }

  getTrackIndexAtTime(time: number): number {
    const { interval, offsetDate } = this.model.getOptions();
    const segment = interval * ONE_MINUTE;
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
    return this._tracks[this.getTrackCount() - index - 1];
  }

  override getGrid(): Grid {
    return this._grid;
  }

  private createTrack(index: number): Track {
    const trackCount = this.getTrackCount();
    const rect = this.getRectForTrack(index, trackCount);
    const yAxis = new Axis(rect, { position: "left" });
    const track = new Track(rect, this.getXAxis(), yAxis);
    return track;
  }

  private getRectForTrack(index: number, count: number): LayoutRect {
    const rect = this.getGrid().getRect();
    if (count === 0) {
      return rect;
    }

    const { x, y, width, height } = rect;
    const trackHeight = height / count;
    const trackY = y + index * trackHeight;

    return new PIXI.Rectangle(x, trackY, width, trackHeight);
  }
}
