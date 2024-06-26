import { Series } from "@waveview/ndarray";
import { StreamIdentifier } from "@waveview/stream";
import * as PIXI from "pixi.js";
import { Axis } from "../axis/axis";
import { DataStore } from "../data/dataStore";
import { Grid } from "../grid/grid";
import { GridOptions } from "../grid/gridModel";
import { AreaMarkerOptions } from "../marker/area";
import { LineMarkerOptions } from "../marker/line";
import { ChartOptions } from "../model/chartModel";
import darkTheme from "../theme/dark";
import { Track } from "../track/track";
import { merge } from "../util/merge";
import { EventMap, LayoutRect, SeriesData } from "../util/types";
import { ChartType, ChartView } from "../view/chartView";
import { AxisPointer } from "./axisPointer";
import { TrackManager } from "./trackManager";

export interface SeismogramChartOptions extends ChartOptions {
  /**
   * The start time of the chart in UNIX timestamp.
   */
  startTime?: number;
  /**
   * The end time of the chart in UNIX timestamp.
   */
  endTime?: number;
  /**
   * The interval of the chart in minutes if `startTime` and `endTime` are not
   * provided.
   */
  interval: number;
  /**
   * Whether to force the chart to center the data.
   */
  forceCenter: boolean;
  /**
   * Whether to use UTC time.
   */
  useUTC: boolean;
  /**
   * Vertical scaling of the helicorder chart. ``local`` scales each track
   * independently, while ``global`` scales all tracks together.
   */
  verticalScaling: "local" | "global";
  /**
   * The grid options.
   */
  grid: Partial<GridOptions>;
  /**
   * Local timezone name of the seismogram chart.
   */
  timezone: string;
  /**
   * The list of channel IDs.
   */
  channels: string[];
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
  getChannels(): string[];
  setChannels(channels: string[]): void;
  getChannelCount(): number;
  getChannelAt(index: number): string;
  addChannel(channelId: string): void;
  removeChannel(index: number): void;
  moveChannel(from: number, to: number): void;
  moveChannelUp(index: number): void;
  moveChannelDown(index: number): void;
  increaseAmplitude(by: number): void;
  decreaseAmplitude(by: number): void;
  resetAmplitude(): void;
  scrollLeft(by: number): void;
  scrollRight(by: number): void;
  scrollTo(date: number): void;
  scrollToNow(): void;
  zoomIn(center: number, by: number): void;
  zoomOut(center: number, by: number): void;
  getChannelCount(): number;
  addLineMarker(value: number, options?: Partial<LineMarkerOptions>): void;
  removeLineMarker(value: number): void;
  addAreaMarker(
    start: number,
    end: number,
    options?: Partial<AreaMarkerOptions>
  ): void;
  removeAreaMarker(start: number, end: number): void;
  showVisibleMarkers(): void;
  hideVisibleMarkers(): void;
  selectChannel(index: number): void;
  unselectChannel(): void;
  moveSelectionUp(): void;
  moveSelectionDown(): void;
  getChannelIndexAtPosition(y: number): number;
  getTrackCount(): number;
  getTrackAt(index: number): Track;
  getTrackIndexByChannelId(id: string): number;
  getChartExtent(): [number, number];
  getXAxis(): Axis;
  getYExtent(): [number, number];
  getTracks(): Track[];
  setChannelData(index: number, data: SeriesData): void;
  refreshData(): void;
  clearData(): void;
  getDataStore(): DataStore<SeriesData>;
  setUseUTC(useUTC: boolean): void;
}

export interface SeismogramEventMap extends EventMap {
  channelAdded: (id: string) => void;
  channelRemoved: (id: string) => void;
  channelMoved: (from: number, to: number) => void;
  amplitudeChanged: (range: [number, number]) => void;
  trackSelected: (index: number) => void;
  trackUnselected: () => void;
  extentChanged: (extent: [number, number]) => void;
  resize: (width: number, height: number) => void;
  focus: () => void;
  blur: () => void;
  trackDoubleClicked: (index: number) => void;
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
  private _lastClickTime: number = 0;

  constructor(
    dom: HTMLCanvasElement,
    options?: Partial<SeismogramChartOptions>
  ) {
    const opts = merge(
      Object.assign({}, getDefaultOptions()),
      options || {},
      true
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

    if (opts.darkMode) {
      this._currentTheme = darkTheme;
    }
    this.applyComponentThemeStyles();

    this.app.stage.on("pointerdown", this._onPointerDown, this);
    this.app.stage.on("pointermove", this._onPointerMove, this);
  }

  getChannels(): string[] {
    return this._trackManager.getChannels().map((channel) => channel.id);
  }

  setChannels(channels: string[]): void {
    this.clearAllTracks();
    for (const channel of channels) {
      this.addChannelInternal(channel);
    }
  }

  getChannelAt(index: number): string {
    return this._trackManager.getChannelByIndex(index).id;
  }

  addChannel(channelId: string): void {
    this.addChannelInternal(channelId);
    this.emit("channelAdded", channelId);
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

  setUseUTC(useUTC: boolean): void {
    this.getModel().mergeOptions({ useUTC });
    this.getXAxis().getModel().mergeOptions({ useUTC });
    this.getXAxis().getModel().getScale().mergeOptions({ useUTC });
  }

  addLineMarker(
    value: number,
    options?: Partial<Omit<LineMarkerOptions, "value">>
  ): void {
    this._xAxis.addLineMarker(value, options || {});
  }

  removeLineMarker(value: number): void {
    this._xAxis.removeLineMarker(value);
  }

  addAreaMarker(
    start: number,
    end: number,
    options?: Partial<Omit<AreaMarkerOptions, "start" | "end">>
  ): void {
    this._xAxis.addAreaMarker(start, end, options || {});
  }

  removeAreaMarker(start: number, end: number): void {
    this._xAxis.removeAreaMarker(start, end);
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
    const dy = (ymax - ymin) * by;
    this._yExtent = [ymin + dy, ymax - dy];

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

  scrollTo(date: number): void {
    this._xAxis.scrollTo(date);
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
      track.getSeries().getModel().setData(data);
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
      track.getSeries().getModel().setData(norm);
    }
  }

  clearData(): void {
    this._dataStore.clear();

    for (let i = 0; i < this._trackManager.count(); i++) {
      const track = this._trackManager.getTrackByIndex(i);
      track.getSeries().getModel().clearData();
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
    const index = Math.floor(y / trackHeight);
    return Math.min(index, trackCount - 1);
  }

  getTrackCount(): number {
    return this._trackManager.count();
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

  private applyComponentThemeStyles(): void {
    const theme = this.getTheme();
    this.model.mergeOptions({
      backgroundColor: theme.backgroundColor,
    });
    this._grid.applyThemeStyle(theme);
    this._xAxis.applyThemeStyle(theme);
    for (const track of this._trackManager.tracks()) {
      track.applyThemeStyle(theme);
    }
  }

  override applyThemeStyles(): void {
    this.applyComponentThemeStyles();
    const theme = this.getTheme();
    this.app.renderer.background.color = theme.backgroundColor;
  }

  override getGrid(): Grid {
    return this._grid;
  }

  override resize(width: number, height: number): void {
    this._rect.width = width;
    this._rect.height = height;
    this._grid.setRect(this.getRect());
    this._xAxis.setRect(this._grid.getRect());
    this._axisPointer.setRect(this._grid.getRect());
    this.updateTracksRect();
    const rect = this._grid.getRect();
    this._mask.clear();
    this._mask.rect(rect.x, rect.y, rect.width, rect.height).fill({
      color: "0xfff",
    });
    this.app.stage.hitArea = new PIXI.Rectangle(0, 0, width, height);
    this.app.renderer.resize(width, height);
    this.emit("resize", width, height);
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

  private addChannelInternal(channelId: string): string {
    const length = this._trackManager.count();
    const rect = this.getRectForTrack(length, length + 1);

    const yAxis = new Axis(rect, { position: "left" });
    yAxis.setExtent(this._yExtent);

    const channel = new StreamIdentifier({ id: channelId });

    const track = new Track(rect, this._xAxis, yAxis, this, {
      leftLabel: channel.shortName(),
    });
    const theme = this.getTheme();
    track.applyThemeStyle(theme);

    this._trackManager.add(channel, track);

    this.addComponent(track);
    this.updateTracksRect();

    return channelId;
  }

  private removeChannelInternal(index: number): string {
    const [channel, track] = this._trackManager.remove(index);
    this.removeComponent(track);
    this.updateTracksRect();
    track.dispose();
    this._dataStore.remove(channel.id);
    return channel.id;
  }

  private updateTracksRect(): void {
    const trackCount = this.getChannelCount();
    for (let i = 0; i < this._trackManager.count(); i++) {
      const track = this._trackManager.getTrackByIndex(i);
      const rect = this.getRectForTrack(i, trackCount);
      track.setRect(rect);
    }
  }

  private clearAllTracks(): void {
    for (const track of this._trackManager.tracks()) {
      this.removeComponent(track);
      track.dispose();
    }
    this._trackManager.clear();
  }

  private _onPointerDown(event: PIXI.FederatedPointerEvent): void {
    if (this._trackManager.count() === 0) {
      return;
    }

    const { x, y } = event.global;
    const trackIndex = this.getChannelIndexAtPosition(y);
    const track = this.getTrackAt(trackIndex);
    const headRect = track.getTrackHeadRect();
    if (headRect.contains(x, y)) {
      const now = Date.now();
      if (now - this._lastClickTime < 300) {
        this.emit("trackDoubleClicked", trackIndex);
      }
      this._lastClickTime = now;
    }
  }

  private _onPointerMove(event: PIXI.FederatedPointerEvent): void {
    const { x, y } = event.global;
    const rect = this.getGrid().getRect();
    const handleArea = new PIXI.Rectangle(0, rect.y, rect.x, rect.height);
    if (handleArea.contains(x, y)) {
      this.app.stage.cursor = "pointer";
    } else {
      this.app.stage.cursor = "default";
    }
  }
}
