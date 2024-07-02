import { Series } from "@waveview/ndarray";
import * as PIXI from "pixi.js";
import { Axis } from "../axis";
import { DataStore } from "../data/dataStore";
import { Grid } from "../grid";
import { Track, TrackOptions } from "../track";
import { almostEquals } from "../util/math";
import { merge } from "../util/merge";
import { ONE_HOUR, ONE_MINUTE, formatDate } from "../util/time";
import { Channel, LayoutRect, ResizeOptions, SeriesData } from "../util/types";
import { ChartView } from "../view";
import {
  HelicorderChartOptions,
  HelicorderEventMarkerOptions,
  getDefaultOptions,
} from "./chartOptions";
import { HelicorderEventMap } from "./eventMap";
import { EventMarker } from "./eventMarker";
import { Selection } from "./selection";
import { createTrackId } from "./util";

/**
 * A helicorder is a type of chart used primarily in seismology to display a
 * continuous record of ground motion or seismic data. This chart is designed to
 * mimic the appearance of traditional drum-based seismographs, which would use
 * paper rolls inked by a stylus to record seismic events over time.
 *
 * The track index is the index of the track in the helicorder chart, where the
 * bottom track has an index of 0 measured from the offset date and the top
 * track has an index of n - 1, where n is the total number of tracks in the
 * chart.
 */
export class Helicorder extends ChartView<
  HelicorderChartOptions,
  HelicorderEventMap
> {
  override readonly type = "helicorder";

  private readonly _xAxis: Axis;
  private readonly _grid: Grid;
  private readonly _selection: Selection;
  private _tracks: Track[] = [];
  private _channel: Channel;
  private _markers: EventMarker[] = [];
  private _dataStore = new DataStore<SeriesData>();
  private _yExtent: [number, number] = [-1, 1];

  constructor(
    dom: HTMLCanvasElement,
    options?: Partial<HelicorderChartOptions>
  ) {
    const opts = merge(
      { ...getDefaultOptions() },
      options || {},
      true
    ) as HelicorderChartOptions;
    super(dom, opts);

    this._channel = opts.channel;

    this._grid = new Grid(this.getRect(), opts.grid);
    this.addComponent(this._grid);

    this._xAxis = new Axis(this._grid.getRect(), {
      position: "top",
      type: "linear",
    });
    this._xAxis.setExtent([0, opts.interval]);
    this.addComponent(this._xAxis);

    this._updateTracks();

    this._selection = new Selection(this._xAxis, this, {
      value: opts.selection || 0,
    });
    this.addComponent(this._selection);

    if (opts.darkMode) {
      this._currentTheme = "dark";
      const theme = this.getTheme();
      this.model.mergeOptions({
        backgroundColor: theme.backgroundColor,
      });
      for (const view of this._views) {
        view.applyThemeStyle(theme);
      }
    }
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
    const dy = (ymax - ymin) * by;
    this._yExtent = [ymin + dy, ymax - dy];

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

  shiftViewUp(by: number = 1): [number, number] {
    const { interval } = this.model.getOptions();
    const offsetDate =
      this.model.getOptions().offsetDate - interval * ONE_MINUTE * by;
    this.setOffsetDate(offsetDate);

    const trackIndex = this.getTrackIndexAtTime(offsetDate);
    const extent = this.getTrackExtentAt(trackIndex);
    this.emit("viewShiftedUp", extent);
    return extent;
  }

  shiftViewDown(by: number = 1): [number, number] {
    const { interval } = this.model.getOptions();
    const offsetDate =
      this.model.getOptions().offsetDate + interval * ONE_MINUTE * by;
    this.setOffsetDate(offsetDate);

    const trackIndex = this.getTrackIndexAtTime(offsetDate);
    const extent = this.getTrackExtentAt(trackIndex);
    this.emit("viewShiftedDown", extent);
    return extent;
  }

  shiftViewToNow(): void {
    const offsetDate = Date.now();
    this.setOffsetDate(offsetDate);
    this.emit("viewShiftedToNow");
  }

  shiftViewToTime(time: number): void {
    this.setOffsetDate(time);
    this.emit("viewShiftedToTime", time);
  }

  setOffsetDate(date: number): void {
    this.model.mergeOptions({ offsetDate: date });
    this._updateTrackLabels();
    this.emit("offsetChanged", date);
  }

  setInterval(interval: number): void {
    this.model.mergeOptions({ interval });
    this._xAxis.setExtent([0, interval]);
    this._updateTracks();
  }

  setDuration(duration: number): void {
    this.model.mergeOptions({ duration });
    this._updateTracks();
  }

  setUseUTC(useUTC: boolean): void {
    this.model.mergeOptions({ useUTC });
    this._updateTrackLabels();
  }

  addEventMarker(marker: HelicorderEventMarkerOptions): void {
    const eventMarker = new EventMarker(this._xAxis, this, {
      ...marker,
    });
    this._markers.push(eventMarker);
    this.addComponent(eventMarker);
  }

  removeEventMarker(value: number): void {
    const index = this._markers.findIndex((marker) =>
      almostEquals(marker.getValue(), value, 1)
    );
    if (index !== -1) {
      const marker = this._markers.splice(index, 1)[0];
      this.removeComponent(marker);
    }
  }

  getVisibleEventMarkers(): EventMarker[] {
    const [start, end] = this.getChartExtent();
    return this._markers.filter((marker) => {
      const value = marker.getValue();
      return value >= start && value <= end;
    });
  }

  showAllEventMarkers(): void {
    this._markers.forEach((marker) => marker.show());
  }

  hideAllEventMarkers(): void {
    this._markers.forEach((marker) => marker.hide());
  }

  selectTrack(index: number): void {
    const [start, end] = this.getTrackExtentAt(index);
    const value = (start + end) / 2;
    const prevValue = this._selection.getValue();
    if (almostEquals(value, prevValue, 1)) {
      return;
    }
    this._selection.setValue((start + end) / 2);
    this.emit("trackSelected", index);
  }

  deselectTrack(): void {
    this._selection.reset();
    this.emit("trackDeselected");
  }

  moveSelectionUp(): void {
    this._selection.moveUp();
    this.emit("trackSelected", this._selection.getTrackIndex());
  }

  moveSelectionDown(): void {
    this._selection.moveDown();
    this.emit("trackSelected", this._selection.getTrackIndex());
  }

  getSelection(): Selection {
    return this._selection;
  }

  setTrackData(data: SeriesData, start: number, end: number): void {
    const key = createTrackId(start, end);
    this._dataStore.set(key, data);
  }

  getTrackData(start: number, end: number): SeriesData {
    const key = createTrackId(start, end);
    const data = this._dataStore.get(key);
    return data || Series.empty();
  }

  refreshData(): void {
    let normFactor = Infinity;
    for (let i = 0; i < this._tracks.length; i++) {
      const [start, end] = this.getTrackExtentAt(i);
      const series = this.getTrackData(start, end);
      if (series.isEmpty()) {
        continue;
      }
      const factor = series.max() - series.min();
      normFactor = Math.min(normFactor, factor);
    }

    for (let i = 0; i < this._tracks.length; i++) {
      const index = this.rowToTrackIndex(i);
      const [start, end] = this.getTrackExtentAt(index);

      const track = this._tracks[i];
      if (track) {
        const data = this.getTrackData(start, end);
        const norm = data.scalarDivide(normFactor);
        norm.setIndex(
          norm.index.map((value: number) => this.timeToOffset(index, value))
        );
        track.getSeries().getModel().setData(norm);
      }
    }
  }

  getDataStore(): DataStore<SeriesData> {
    return this._dataStore;
  }

  getTracks(): Track[] {
    return this._tracks;
  }

  getTrackId(extent: [number, number]): string {
    return createTrackId(extent[0], extent[1]);
  }

  getTrackCount() {
    const { interval, duration } = this.model.getOptions();
    return Math.ceil((duration * 60) / interval) + 1;
  }

  rowToTrackIndex(row: number): number {
    return this.getTrackCount() - row - 1;
  }

  trackIndexToRow(index: number): number {
    return this.getTrackCount() - index - 1;
  }

  getTrackAt(index: number): Track | undefined {
    const row = this.rowToTrackIndex(index);
    return this._tracks[row];
  }

  getTrackIndexAtPosition(y: number): number {
    const { y: gridY, height } = this.getGrid().getRect();
    const trackHeight = height / this.getTrackCount();
    const row = Math.floor((y - gridY) / trackHeight);
    return this.rowToTrackIndex(row);
  }

  getTrackIndexAtTime(time: number): number {
    const { interval, offsetDate } = this.model.getOptions();
    const segment = interval * ONE_MINUTE;
    const endOf = (value: number) => value + segment - (value % segment);
    const end = endOf(offsetDate);
    const diff = end - time;
    return Math.floor(diff / segment);
  }

  timeToOffset(index: number, time: number): number {
    const { interval } = this.model.getOptions();
    const [start, end] = this.getTrackExtentAt(index);
    return ((time - start) / (end - start)) * interval;
  }

  getChartExtent(): [number, number] {
    const { duration, offsetDate } = this.model.getOptions();
    const start = offsetDate - duration * ONE_HOUR;
    const end = offsetDate;
    return [start, end];
  }

  getTrackExtents(): [number, number][] {
    const extents: [number, number][] = [];
    for (let i = 0; i < this._tracks.length; i++) {
      const [start, end] = this.getTrackExtentAt(i);
      extents.push([start, end]);
    }
    return extents;
  }

  getTrackExtentAt(index: number): [number, number] {
    const { interval, offsetDate } = this.model.getOptions();

    const segment = interval * ONE_MINUTE;
    const startOf = (value: number) => value - (value % segment);
    const endOf = (value: number) => value + segment - (value % segment);

    return [
      startOf(offsetDate - index * interval * ONE_MINUTE),
      endOf(offsetDate - index * interval * ONE_MINUTE),
    ];
  }

  getYExtent(): [number, number] {
    return this._yExtent;
  }

  getXAxis(): Axis {
    return this._xAxis;
  }

  getGrid(): Grid {
    return this._grid;
  }

  show(): void {
    this.app.stage.visible = true;
  }

  hide(): void {
    this.app.stage.visible = false;
  }

  resize(options?: ResizeOptions): void {
    const { width = this.dom.width, height = this.dom.height } = options || {};
    this._rect.width = width;
    this._rect.height = height;
    this._grid.setRect(this.getRect());
    this._xAxis.setRect(this._grid.getRect());
    for (let i = 0; i < this._tracks.length; i++) {
      const track = this._tracks[i];
      track.setRect(this._getRectForTrack(i, this.getTrackCount()));
    }
    this._selection.setRect(this._xAxis.getRect());
    const rect = this._grid.getRect();
    this._mask.clear();
    this._mask.rect(rect.x, rect.y, rect.width, rect.height);
    this.app.stage.hitArea = new PIXI.Rectangle(0, 0, width, height);
    this.app.renderer.resize(width, height);
  }

  private _createTrack(index: number, options?: Partial<TrackOptions>): Track {
    const trackCount = this.getTrackCount();
    const rect = this._getRectForTrack(index, trackCount);
    const yAxis = new Axis(rect, { position: "left" });
    yAxis.setExtent(this.getYExtent());
    const track = new Track(rect, this._xAxis, yAxis, this, options);
    return track;
  }

  private _getRectForTrack(index: number, count: number): LayoutRect {
    const rect = this.getGrid().getRect();
    if (count === 0) {
      return rect;
    }

    const { x, y, width, height } = rect;
    const trackHeight = height / count;
    const trackY = y + index * trackHeight;

    return new PIXI.Rectangle(x, trackY, width, trackHeight);
  }

  private _updateTracks(): void {
    const requiredTrackCount = this.getTrackCount();
    const currentTrackCount = this._tracks.length;

    if (requiredTrackCount <= currentTrackCount) {
      this._tracks.slice(0, requiredTrackCount).forEach((track, index) => {
        track.setRect(this._getRectForTrack(index, requiredTrackCount));
      });
      this._tracks
        .slice(requiredTrackCount)
        .forEach((track) => this._removeTrack(track));
    } else {
      this._tracks.forEach((track, index) => {
        track.setRect(this._getRectForTrack(index, requiredTrackCount));
      });
      for (let i = currentTrackCount; i < requiredTrackCount; i++) {
        const track = this._createTrack(i);
        this._tracks.push(track);
        this.addComponent(track);
      }
    }

    this._updateTrackLabels();
  }

  private _updateTrackLabels(): void {
    const { useUTC } = this.getOptions();
    const requiredTrackCount = this.getTrackCount();
    const repeat = Math.max(Math.ceil(requiredTrackCount / 25), 1);

    const isMidnightLocal = (time: number) => {
      const date = new Date(time);
      return date.getHours() === 0 && date.getMinutes() === 0;
    };

    const isMidnightUTC = (time: number) => {
      const date = new Date(time);
      return date.getUTCHours() === 0 && date.getUTCMinutes() === 0;
    };

    const isMidnight = (time: number) => {
      return useUTC ? isMidnightUTC(time) : isMidnightLocal(time);
    };

    const adjustLabel = (index: number, label: string): string => {
      return index % repeat === 0 ? label : "";
    };

    for (let i = 0; i < this._tracks.length; i++) {
      const index = this.rowToTrackIndex(i);
      const [start] = this.getTrackExtentAt(index);

      const track = this._tracks[i];
      if (track) {
        const formatString = adjustLabel(
          i,
          i === 0 || isMidnight(start) ? "{MM}-{dd} {HH}:{mm}" : "{HH}:{mm}"
        );

        const leftLabel = formatDate(start, formatString, useUTC);
        track.getModel().mergeOptions({ leftLabel });
      }
    }
  }

  private _removeTrack(track: Track): void {
    this.removeComponent(track);
    const index = this._tracks.indexOf(track);
    if (index !== -1) {
      this._tracks.splice(index, 1);
      track.dispose();
    }
  }
}
