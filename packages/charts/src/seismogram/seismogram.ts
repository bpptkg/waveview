import { Series } from "@waveview/ndarray";
import * as PIXI from "pixi.js";
import { Axis } from "../axis";
import { DataStore } from "../data/dataStore";
import { Grid } from "../grid";
import { Track } from "../track";
import { merge } from "../util/merge";
import { ONE_MINUTE } from "../util/time";
import { Channel, LayoutRect, ResizeOptions, SeriesData } from "../util/types";
import { ChartView } from "../view";
import {
  SeismogramChartOptions,
  SeismogramEventMarkerOptions,
  SeismogramLineMarkerOptions,
  getDefaultOptions,
} from "./chartOptions";
import { SeismogramEventMap } from "./eventMap";
import { TrackManager } from "./trackManager";

/**
 * A seismogram is a type of chart used primarily in seismology to display a
 * continuous record of ground motion or seismic data. This chart is composed of
 * multiple tracks, each representing a channel of data.
 */
export class Seismogram extends ChartView<
  SeismogramChartOptions,
  SeismogramEventMap
> {
  override readonly type = "seismogram";

  private readonly _xAxis: Axis;
  private readonly _grid: Grid;
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
      { ...getDefaultOptions() },
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
      const start = end - opts.interval * ONE_MINUTE;
      this._xAxis.setExtent([start, end]);
    }
    this.addComponent(this._xAxis);

    this._xAxis.on("extentChanged", (extent) => {
      this.emit("extentChanged", extent);
    });

    for (const channel of opts.channels) {
      this._addChannelInternal(channel);
    }

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

    this.app.stage.on("pointerdown", this._onPointerDown, this);
    this.app.stage.on("pointermove", this._onPointerMove, this);
  }

  getChannels(): Channel[] {
    return this._trackManager.getChannels();
  }

  setChannels(channels: Channel[]): void {
    this._clearAllTracks();
    for (const channel of channels) {
      this._addChannelInternal(channel);
    }
  }

  getChannelAt(index: number): Channel {
    return this._trackManager.getChannelByIndex(index);
  }

  addChannel(channel: Channel): void {
    this._addChannelInternal(channel);
    this.emit("channelAdded", channel);
  }

  removeChannel(index: number): void {
    const channel = this._removeChannelInternal(index);
    this.emit("channelRemoved", channel);
  }

  moveChannel(from: number, to: number): void {
    this._trackManager.moveChannel(from, to);

    this._updateTracksRect();
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

  addLineMarker(marker: SeismogramLineMarkerOptions): void {
    const { value, ...options } = marker;
    this._xAxis.addLineMarker(value, options || {});
  }

  removeLineMarker(value: number): void {
    this._xAxis.removeLineMarker(value);
  }

  addEventMarker(marker: SeismogramEventMarkerOptions): void {
    const { start, end, ...options } = marker;
    this._xAxis.addAreaMarker(start, end, options || {});
  }

  removeEventMarker(start: number, end: number): void {
    this._xAxis.removeAreaMarker(start, end);
  }

  showAllMarkers(): void {
    this._xAxis.showAllMarkers();
  }

  hideAllMarkers(): void {
    this._xAxis.hideAllMarkers();
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

  scrollToTime(time: number): void {
    this._xAxis.scrollTo(time);
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
      this._refreshLocalScaling();
    } else {
      this._refreshGlobalScaling();
    }
  }

  private _refreshLocalScaling(): void {
    for (let i = 0; i < this._trackManager.count(); i++) {
      const track = this._trackManager.getTrackByIndex(i);
      const data = this.getChannelData(i);
      track.getSeries().getModel().setData(data);
      track.fitY();
    }
  }

  private _refreshGlobalScaling(): void {
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

  show(): void {
    this.app.stage.visible = true;
  }

  hide(): void {
    this.app.stage.visible = false;
  }

  getGrid(): Grid {
    return this._grid;
  }

  resize(options?: ResizeOptions): void {
    const { width = this.dom.width, height = this.dom.height } = options || {};
    this._rect.width = width;
    this._rect.height = height;
    this._grid.setRect(this.getRect());
    this._xAxis.setRect(this._grid.getRect());
    this._updateTracksRect();
    const rect = this._grid.getRect();
    this._mask.clear();
    this._mask
      .rect(rect.x, rect.y, rect.width, rect.height)
      .fill({ color: "transparent" });
    this.app.stage.hitArea = new PIXI.Rectangle(0, 0, width, height);
    this.app.renderer.resize(width, height);
    this.emit("resize", width, height);
  }

  private _getRectForTrack(index: number, count: number): LayoutRect {
    const rect = this._grid.getRect();
    if (count === 0) {
      return rect;
    }

    const { x, y, width, height } = rect;
    const trackHeight = height / count;
    const trackY = y + index * trackHeight;

    return new PIXI.Rectangle(x, trackY, width, trackHeight);
  }

  private _addChannelInternal(channel: Channel): Channel {
    const length = this._trackManager.count();
    const rect = this._getRectForTrack(length, length + 1);

    const yAxis = new Axis(rect, { position: "left" });
    yAxis.setExtent(this._yExtent);

    const track = new Track(rect, this._xAxis, yAxis, this, {
      leftLabel: channel.label ?? channel.id,
    });
    const theme = this.getTheme();
    track.applyThemeStyle(theme);
    this._trackManager.add(channel, track);

    this.addComponent(track);
    this._updateTracksRect();

    return channel;
  }

  private _removeChannelInternal(index: number): Channel {
    const [channel, track] = this._trackManager.remove(index);
    this.removeComponent(track);
    this._updateTracksRect();
    track.dispose();
    this._dataStore.remove(channel.id);
    return channel;
  }

  private _updateTracksRect(): void {
    const trackCount = this.getChannelCount();
    for (let i = 0; i < this._trackManager.count(); i++) {
      const track = this._trackManager.getTrackByIndex(i);
      const rect = this._getRectForTrack(i, trackCount);
      track.setRect(rect);
    }
  }

  private _clearAllTracks(): void {
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
