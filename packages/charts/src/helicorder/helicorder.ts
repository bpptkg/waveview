import { Series } from "@waveview/ndarray";
import * as PIXI from "pixi.js";
import { Axis } from "../axis/axis";
import { Channel } from "../data/channel";
import { DataStore } from "../data/dataStore";
import { Grid } from "../grid/grid";
import { GridOptions } from "../grid/gridModel";
import { ChartOptions } from "../model/chartModel";
import darkTheme from "../theme/dark";
import { Track } from "../track/track";
import { TrackOptions } from "../track/trackModel";
import { almostEquals } from "../util/math";
import { merge } from "../util/merge";
import { ONE_HOUR, ONE_MINUTE, formatDate } from "../util/time";
import { EventMap, LayoutRect, SeriesData } from "../util/types";
import { ChartType, ChartView } from "../view/chartView";
import { EventMarker, EventMarkerOptions } from "./eventMarker";
import { Footer } from "./footer";
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
  offsetDate: number;
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
  /**
   * Timezone of the helicorder chart.
   */
  timezone: string;
}

function getDefaultOptions(): HelicorderChartOptions {
  return {
    channelId: "",
    interval: 30,
    duration: 12,
    offsetDate: Date.now(),
    forceCenter: true,
    useUTC: false,
    verticalScaling: "global",
    grid: {
      top: 50,
      right: 80,
      bottom: 50,
      left: 80,
    },
    timezone: "UTC",
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
  setOffsetDate(date: number): void;
  addEventMarker(value: number, options?: Partial<EventMarkerOptions>): void;
  removeEventMarker(value: number): void;
  showVisibleMarkers(): void;
  hideVisibleMarkers(): void;
  selectTrack(index: number): void;
  deselectTrack(): void;
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
  refreshData(): void;
  getXAxis(): Axis;
  getYExtent(): [number, number];
  getChartExtent(): [number, number];
  getDataStore(): DataStore<SeriesData>;
  getTrackId(extent: [number, number]): string;
  setInterval(interval: number): void;
  setDuration(duration: number): void;
}

export interface HelicorderEventMap extends EventMap {
  channelChanged: (channel: Channel) => void;
  offsetChanged: (offset: number) => void;
  intervalChanged: (interval: number) => void;
  durationChanged: (duration: number) => void;
  amplitudeChanged: (range: [number, number]) => void;
  trackSelected: (index: number) => void;
  trackDeselected: () => void;
  viewShiftedUp: (range: [number, number]) => void;
  viewShiftedDown: (range: [number, number]) => void;
  viewShiftedToNow: () => void;
  viewShiftedToTime: (time: number) => void;
  focus: () => void;
  blur: () => void;
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
  private readonly _footer: Footer;
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

    this.updateTracks();

    this._selection = new Selection(this._xAxis, this);
    this.addComponent(this._selection);

    this._footer = new Footer(this);
    this.addComponent(this._footer);

    if (opts.darkMode) {
      this._currentTheme = darkTheme;
    }
    this.applyComponentThemeStyles();
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

  shiftViewUp(): [number, number] {
    const { interval } = this.model.getOptions();
    const offsetDate =
      this.model.getOptions().offsetDate - interval * ONE_MINUTE;
    this.setOffsetDate(offsetDate);

    const trackIndex = this.getTrackIndexAtTime(offsetDate);
    const extent = this.getTrackExtentAt(trackIndex);
    this.emit("viewShiftedUp", extent);
    return extent;
  }

  shiftViewDown(): [number, number] {
    const { interval } = this.model.getOptions();
    const offsetDate =
      this.model.getOptions().offsetDate + interval * ONE_MINUTE;
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
    this.model.mergeOptions({ offsetDate: date, forceCenter: false });
    this.emit("offsetChanged", date);
  }

  setInterval(interval: number): void {
    this.model.mergeOptions({ interval });
    this._xAxis.setExtent([0, interval]);
    this.updateTracks();
  }

  setDuration(duration: number): void {
    this.model.mergeOptions({ duration });
    this.updateTracks();
  }

  addEventMarker(value: number, options?: Partial<EventMarkerOptions>): void {
    const marker = new EventMarker(this._xAxis, this, {
      value: value,
      ...options,
    });
    this._markers.push(marker);
    this.addComponent(marker);
  }

  removeEventMarker(value: number): void {
    const index = this._markers.findIndex(
      (marker) => marker.getValue() === value
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
    const value = (start + end) / 2;
    const prevValue = this._selection.getValue();
    if (almostEquals(value, prevValue, 1)) {
      return;
    }
    this._selection.setValue((start + end) / 2);
    this.emit("trackSelected", trackIndex);
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

  setTrackData(data: SeriesData, start: number, end: number): void {
    const key = createTrackId(start, end);
    this._dataStore.set(key, data);
  }

  getTrackData(start: number, end: number): SeriesData {
    const key = createTrackId(start, end);
    const data = this._dataStore.get(key);
    return data || Series.empty();
  }

  getTrackExtents(): [number, number][] {
    const extents: [number, number][] = [];
    for (let i = 0; i < this._tracks.length; i++) {
      const [start, end] = this.getTrackExtentAt(i);
      extents.push([start, end]);
    }
    return extents;
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
      const trackIndex = this.getTrackCount() - i - 1;
      const [start, end] = this.getTrackExtentAt(trackIndex);

      const track = this._tracks[i];
      if (track) {
        const data = this.getTrackData(start, end);
        const norm = data.scalarDivide(normFactor);
        norm.setIndex(
          norm.index.map((value: number) =>
            this.timeToOffset(trackIndex, value)
          )
        );
        track.getSeries().getModel().setData(norm);
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
      startOf(offsetDate - index * interval * ONE_MINUTE),
      endOf(offsetDate - index * interval * ONE_MINUTE),
    ];
  }

  getChartExtent(): [number, number] {
    const { duration, offsetDate } = this.model.getOptions();
    const start = offsetDate - duration * ONE_HOUR;
    const end = offsetDate;
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
    const end = endOf(offsetDate);
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

  override resize(width: number, height: number): void {
    this._rect.width = width;
    this._rect.height = height;
    this._grid.setRect(this.getRect());
    this._xAxis.setRect(this._grid.getRect());
    for (let i = 0; i < this._tracks.length; i++) {
      const track = this._tracks[i];
      track.setRect(this.getRectForTrack(i, this.getTrackCount()));
    }
    this._selection.setRect(this._xAxis.getRect());
    const rect = this._grid.getRect();
    this._mask.clear();
    this._mask.rect(rect.x, rect.y, rect.width, rect.height).fill({
      color: "0xfff",
    });
    this.app.stage.hitArea = new PIXI.Rectangle(0, 0, width, height);
    this.app.renderer.resize(width, height);
  }

  private applyComponentThemeStyles(): void {
    const theme = this.getTheme();
    this.model.mergeOptions({
      backgroundColor: theme.backgroundColor,
    });
    this._xAxis.applyThemeStyle(theme);
    this._grid.applyThemeStyle(theme);
    this._footer.applyThemeStyle(theme);
    this._selection.applyThemeStyle(theme);
    for (const track of this._tracks) {
      track.applyThemeStyle(theme);
    }
  }

  override applyThemeStyles(): void {
    this.applyComponentThemeStyles();
    const theme = this.getTheme();
    this.app.renderer.background.color = theme.backgroundColor;
  }

  private createTrack(index: number, options?: Partial<TrackOptions>): Track {
    const trackCount = this.getTrackCount();
    const rect = this.getRectForTrack(index, trackCount);
    const yAxis = new Axis(rect, { position: "left" });
    yAxis.setExtent(this.getYExtent());
    const track = new Track(rect, this._xAxis, yAxis, this, options);
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

  private updateTracks(): void {
    const requiredTrackCount = this.getTrackCount();
    const currentTrackCount = this._tracks.length;
    const repeat = Math.max(Math.ceil(requiredTrackCount / 25), 1);

    if (requiredTrackCount <= currentTrackCount) {
      this._tracks.slice(0, requiredTrackCount).forEach((track, index) => {
        track.setRect(this.getRectForTrack(index, requiredTrackCount));
      });
      this._tracks
        .slice(requiredTrackCount)
        .forEach((track) => this.removeTrack(track));
    } else {
      this._tracks.forEach((track, index) => {
        track.setRect(this.getRectForTrack(index, requiredTrackCount));
      });
      for (let i = currentTrackCount; i < requiredTrackCount; i++) {
        const track = this.createTrack(i);
        this._tracks.push(track);
        this.addComponent(track);
      }
    }

    const isMidnight = (time: number) => {
      const date = new Date(time);
      return date.getHours() === 0 && date.getMinutes() === 0;
    };

    const isUTCMidnight = (time: number) => {
      const date = new Date(time);
      return date.getUTCHours() === 0 && date.getUTCMinutes() === 0;
    };

    const adjustLabel = (index: number, label: string): string => {
      return index % repeat === 0 ? label : "";
    };

    for (let i = 0; i < this._tracks.length; i++) {
      const trackIndex = this.getTrackCount() - i - 1;
      const [start, end] = this.getTrackExtentAt(trackIndex);

      const track = this._tracks[i];
      if (track) {
        const formatStringLocal = adjustLabel(
          i,
          i === 0 || isMidnight(start) ? "{MM}-{dd} {HH}:{mm}" : "{HH}:{mm}"
        );
        const formatStringUTC = adjustLabel(
          i,
          i === 0 || isUTCMidnight(end) ? "{HH}:{mm} {MM}-{dd}" : "{HH}:{mm}"
        );

        const leftLabel = formatDate(start, formatStringLocal, false);
        const rightLabel = formatDate(end, formatStringUTC, true);
        track.getModel().mergeOptions({ leftLabel, rightLabel });
      }
    }
  }

  private removeTrack(track: Track): void {
    this.removeComponent(track);
    const index = this._tracks.indexOf(track);
    if (index !== -1) {
      this._tracks.splice(index, 1);
      track.dispose();
    }
  }
}
