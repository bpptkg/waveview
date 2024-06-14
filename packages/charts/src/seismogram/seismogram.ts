import { Series } from "@waveview/ndarray";
import * as PIXI from "pixi.js";
import { Axis } from "../axis/axis";
import { Channel } from "../data/channel";
import { DataStore } from "../data/dataStore";
import { Grid } from "../grid/grid";
import { GridOptions } from "../grid/gridModel";
import { AreaMarkerOptions } from "../marker/area";
import { LineMarkerOptions } from "../marker/line";
import { ChartOptions } from "../model/chartModel";
import { Track } from "../track/track";
import { EventMap, LayoutRect, SeriesData } from "../util/types";
import { ChartType, ChartView } from "../view/chartView";
import { AxisPointer } from "./axisPointer";
import { TrackManager } from "./trackManager";

export interface SeismogramChartOptions extends ChartOptions {
  startTime?: number;
  endTime?: number;
  interval: number;
  forceCenter: boolean;
  useUTC: boolean;
  verticalScaling: "local" | "global";
  grid: Partial<GridOptions>;
  timezone: string;
  channels: Channel[];
}

function getDefaultOptions(): SeismogramChartOptions {
  return {
    startTime: undefined,
    endTime: undefined,
    interval: 30,
    forceCenter: true,
    useUTC: false,
    verticalScaling: "global",
    grid: {
      top: 50,
      right: 50,
      bottom: 50,
      left: 80,
    },
    timezone: "UTC",
    channels: [],
  };
}

export interface SeismogramChartType extends ChartType<SeismogramChartOptions> {
  getChannels(): Channel[];
  getChannelAt(index: number): Channel;
  addChannel(channel: Channel): void;
  removeChannel(index: number): void;
  moveChannel(from: number, to: number): void;
  moveChannelUp(index: number): void;
  moveChannelDown(index: number): void;
  increaseAmplitude(by: number): void;
  decreaseAmplitude(by: number): void;
  resetAmplitude(): void;
  scrollLeft(by: number): void;
  scrollRight(by: number): void;
  scrollTo(date: Date): void;
  scrollToNow(): void;
  zoomIn(center: number, by: number): void;
  zoomOut(center: number, by: number): void;
  getChannelCount(): number;
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
  selectChannel(index: number): void;
  unselectChannel(): void;
  moveSelectionUp(): void;
  moveSelectionDown(): void;
  getChannelIndexAtPosition(y: number): number;
  getTrackAt(index: number): Track;
  getTrackIndexByChannelId(id: string): number;
  getChartExtent(): [number, number];
  getXAxis(): Axis;
  getYExtent(): [number, number];
  getTracks(): Track[];
  setChannelData(index: number, data: SeriesData): void;
  refreshData(): void;
  getDataStore(): DataStore<SeriesData>;
}

export interface SeismogramEventMap extends EventMap {
  channelAdded: (channel: Channel) => void;
  channelRemoved: (channel: Channel) => void;
  channelMoved: (from: number, to: number) => void;
  amplitudeChanged: (range: [number, number]) => void;
  trackSelected: (index: number) => void;
  trackUnselected: () => void;
  extentChanged: (extent: [number, number]) => void;
}

export class Seismogram
  extends ChartView<SeismogramChartOptions>
  implements SeismogramChartType
{
  override readonly type = "seismogram";

  private readonly _xAxis: Axis;
  private readonly _grid: Grid;
  private readonly _axisPointer: AxisPointer;
  private _selectedTrackIndex: number = -1;
  private _trackManager: TrackManager = new TrackManager();
  private _yExtent: [number, number] = [-1, 1];
  private _dataStore: DataStore<SeriesData> = new DataStore();

  constructor(
    dom: HTMLCanvasElement,
    options?: Partial<SeismogramChartOptions>
  ) {
    const opts = Object.assign(
      {},
      getDefaultOptions(),
      options || {}
    ) as SeismogramChartOptions;
    super(dom, opts);

    this._grid = new Grid(this.getRect(), opts.grid);
    this.addComponent(this._grid);

    const { startTime, endTime, useUTC } = opts;
    this._xAxis = new Axis(this._grid.getRect(), {
      position: "top",
      type: "time",
      useUTC,
    });
    if (startTime && endTime) {
      this._xAxis.setExtent([startTime, endTime]);
    } else {
      const end = Date.now();
      const start = end - opts.interval * 1000 * 60;
      this._xAxis.setExtent([start, end]);
    }
    this.addComponent(this._xAxis);

    this._axisPointer = new AxisPointer(this._xAxis, this);
    this.addComponent(this._axisPointer);

    this._xAxis.on("extentChanged", (extent) => {
      this.emit("extentChanged", extent);
    });

    for (const channel of opts.channels) {
      this.addChannelInternal(channel);
    }
  }

  getChannels(): Channel[] {
    return this._trackManager.getChannels();
  }

  getChannelAt(index: number): Channel {
    return this._trackManager.getChannelByIndex(index);
  }

  addChannel(channel: Channel): void {
    this.addChannelInternal(channel);
    this.emit("channelAdded", channel);
  }

  removeChannel(index: number): void {
    const channel = this.removeChannelInternal(index);
    this.emit("channelRemoved", channel);
  }

  moveChannel(from: number, to: number): void {
    this._trackManager.moveChannel(from, to);

    this.updateTracksRect();
    this.emit("channelMoved", from, to);
  }

  moveChannelUp(index: number): void {
    if (index === 0) {
      return;
    }
    this.moveChannel(index, index - 1);
  }

  moveChannelDown(index: number): void {
    if (index === this._trackManager.count() - 1) {
      return;
    }
    this.moveChannel(index, index + 1);
  }

  addLineMarker(
    value: Date,
    options?: Partial<Omit<LineMarkerOptions, "value">>
  ): void {
    this._xAxis.addLineMarker(value.getTime(), options || {});
  }

  removeLineMarker(value: Date): void {
    this._xAxis.removeLineMarker(value.getTime());
  }

  addAreaMarker(
    start: Date,
    end: Date,
    options?: Partial<Omit<AreaMarkerOptions, "start" | "end">>
  ): void {
    this._xAxis.addAreaMarker(start.getTime(), end.getTime(), options || {});
  }

  removeAreaMarker(start: Date, end: Date): void {
    this._xAxis.removeAreaMarker(start.getTime(), end.getTime());
  }

  showVisibleMarkers(): void {
    this._xAxis.showVisibleMarkers();
  }

  hideVisibleMarkers(): void {
    this._xAxis.hideVisibleMarkers();
  }

  selectChannel(index: number): void {
    this._selectedTrackIndex = index;
    for (const track of this._trackManager.tracks()) {
      track.unhighlight();
    }
    const track = this._trackManager.getTrackByIndex(index);
    if (track) {
      track.highlight();
      this.emit("trackSelected", index);
    }
  }

  unselectChannel(): void {
    for (const track of this._trackManager.tracks()) {
      track.unhighlight();
    }
    this._selectedTrackIndex = -1;
    this.emit("trackUnselected");
  }

  moveSelectionUp(): void {
    if (this._selectedTrackIndex === -1) {
      return;
    }
    const index = this._selectedTrackIndex - 1;
    if (index >= 0) {
      this.selectChannel(index);
    }
  }

  moveSelectionDown(): void {
    if (this._selectedTrackIndex === -1) {
      return;
    }
    const index = this._selectedTrackIndex + 1;
    if (index < this._trackManager.count()) {
      this.selectChannel(index);
    }
  }

  increaseAmplitude(by: number): void {
    const [ymin, ymax] = this.getYExtent();
    const dy = -(ymax - ymin) * by;
    this._yExtent = [ymin + dy, ymax + dy];

    for (const track of this._trackManager.tracks()) {
      track.setYExtent(this._yExtent);
    }
    this.emit("amplitudeChanged", this._yExtent);
  }

  decreaseAmplitude(by: number): void {
    this.increaseAmplitude(-by);
  }

  resetAmplitude(): void {
    this._yExtent = [-1, 1];
    for (const track of this._trackManager.tracks()) {
      track.setYExtent(this._yExtent);
    }
    this.emit("amplitudeChanged", this._yExtent);
  }

  scrollLeft(by: number): void {
    this._xAxis.scrollLeft(by);
  }

  scrollRight(by: number): void {
    this._xAxis.scrollRight(by);
  }

  scrollTo(date: Date): void {
    this._xAxis.scrollTo(date.getTime());
  }

  scrollToNow(): void {
    const now = Date.now();
    this._xAxis.scrollTo(now);
  }

  zoomIn(at: number, by: number): void {
    this._xAxis.zoomIn(at, by);
  }

  zoomOut(at: number, by: number): void {
    this._xAxis.zoomOut(at, by);
  }

  setChannelData(index: number, data: SeriesData): void {
    const channel = this._trackManager.getChannelByIndex(index);
    this._dataStore.set(channel.id, data);
  }

  getChannelData(index: number): SeriesData {
    const channel = this._trackManager.getChannelByIndex(index);
    const data = this._dataStore.get(channel.id);
    return data || Series.empty();
  }

  refreshData(): void {
    const { verticalScaling } = this.model.options;

    if (verticalScaling === "local") {
      this.refreshLocalScaling();
    } else {
      this.refreshGlobalScaling();
    }
  }

  private refreshLocalScaling(): void {
    for (let i = 0; i < this._trackManager.count(); i++) {
      const track = this._trackManager.getTrackByIndex(i);
      const data = this.getChannelData(i);
      track.getSeries().setData(data);
      track.fitY();
    }
  }

  private refreshGlobalScaling(): void {
    let normFactor = Infinity;
    for (let i = 0; i < this._trackManager.count(); i++) {
      const series = this.getChannelData(i);
      if (series.isEmpty()) {
        continue;
      }

      const factor = series.max() - series.min();
      normFactor = Math.min(normFactor, factor);
    }

    for (let i = 0; i < this._trackManager.count(); i++) {
      const track = this._trackManager.getTrackByIndex(i);
      const data = this.getChannelData(i);
      const norm = data.scalarDivide(normFactor);
      track.getSeries().setData(norm);
    }
  }

  getXAxis(): Axis {
    return this._xAxis;
  }

  getYExtent(): [number, number] {
    return this._yExtent;
  }

  getTracks(): Track[] {
    return this._trackManager.getTracks();
  }

  getChannelCount(): number {
    return this._trackManager.count();
  }

  getChannelIndexAtPosition(y: number): number {
    const trackCount = this.getChannelCount();
    const trackHeight = this._grid.getRect().height / trackCount;
    return Math.floor(y / trackHeight);
  }

  getTrackAt(index: number): Track {
    return this._trackManager.getTrackByIndex(index);
  }

  getTrackIndexByChannelId(id: string): number {
    return this._trackManager.findChannelIndex(id);
  }

  getChartExtent(): [number, number] {
    return this._xAxis.getExtent();
  }

  getDataStore(): DataStore<SeriesData> {
    return this._dataStore;
  }

  override getGrid(): Grid {
    return this._grid;
  }

  private getRectForTrack(index: number, count: number): LayoutRect {
    const rect = this._grid.getRect();
    if (count === 0) {
      return rect;
    }

    const { x, y, width, height } = rect;
    const trackHeight = height / count;
    const trackY = y + index * trackHeight;

    return new PIXI.Rectangle(x, trackY, width, trackHeight);
  }

  private addChannelInternal(channel: Channel): Channel {
    const length = this._trackManager.count();
    const rect = this.getRectForTrack(length, length + 1);

    const yAxis = new Axis(rect, { position: "left" });
    yAxis.setExtent(this._yExtent);

    const track = new Track(rect, this._xAxis, yAxis, this, {
      leftLabel: channel.id,
    });
    this._trackManager.add(channel, track);

    this.addComponent(track);
    this.updateTracksRect();

    return channel;
  }

  private removeChannelInternal(index: number): Channel {
    const [channel, track] = this._trackManager.remove(index);

    this.removeComponent(track);
    this.updateTracksRect();
    return channel;
  }

  private updateTracksRect(): void {
    const trackCount = this.getChannelCount();
    for (let i = 0; i < this._trackManager.count(); i++) {
      const track = this._trackManager.getTrackByIndex(i);
      const rect = this.getRectForTrack(i, trackCount);
      track.setRect(rect);
    }
  }
}
