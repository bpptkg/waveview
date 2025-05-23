import { Series } from "@waveview/ndarray";
import { BoundingRect } from "zrender";
import { merge } from "zrender/lib/core/util";
import { AxisView } from "../axis/axisView";
import { ChartView } from "../core/chartView";
import { EventEmitter } from "../core/eventEmitter";
import { ResizeOptions } from "../core/view";
import { GridView } from "../grid/gridView";
import { PickerView } from "../picker/pickerView";
import { SpectrogramData } from "../spectrogram/spectrogramModel";
import { TrackView } from "../track/trackView";
import { almostEquals } from "../util/math";
import { ONE_MINUTE, ONE_SECOND } from "../util/time";
import {
  AddMarkerOptions,
  Channel,
  LayoutRect,
  SeriesData,
} from "../util/types";
import { AxisPointerView } from "./axisPointer/axisPointerView";
import { getDefaultOptions, SeismogramOptions } from "./chartOptions";
import { DataStore } from "./dataStore";
import { SeismogramEventMap } from "./eventMap";
import { EventMarkerOptions } from "./eventMarker/eventMarkerModel";
import { EventMarkerView } from "./eventMarker/eventMarkerView";
import {
  OffscreenRenderContext,
  OffscreenRenderResult,
  OffscreenRenderTrackContext,
} from "./offscreen";
import { OffscreenSignalView } from "./offscreenSignal/offscreenSignalView";
import { TrackManager } from "./trackManager";

export interface SeismogramRenderOptions {
  /**
   * Refresh the offscreen rendering. Set to `true` to rerender the signal on
   * the offscreen canvas.
   */
  refreshSignal?: boolean;
}

/**
 * A seismogram is a type of chart used primarily in seismology to display a
 * continuous record of ground motion or seismic data. This chart is composed of
 * multiple tracks, each representing a channel of data.
 */
export class Seismogram extends ChartView<SeismogramOptions> {
  override type: string = "seismogram";
  private eventEmitter: EventEmitter<SeismogramEventMap>;
  private yExtent: [number, number] = [-1, 1];
  private grid: GridView;
  private xAxis: AxisView;
  private trackManager: TrackManager;
  private axisPointer: AxisPointerView;
  private picker: PickerView;
  private markers: EventMarkerView[] = [];
  private channelDataStore: DataStore<SeriesData> = new DataStore();
  private spectrogramDataStore: DataStore<SpectrogramData> = new DataStore();
  private focused = false;
  private signalShown = true;
  private spectrogramShown = false;
  private inExpandMode = false;
  private expandIndex = -1;
  private worker: Worker | null = null;
  private offscreenSignal: OffscreenSignalView;
  private rendering = false;

  constructor(dom: HTMLElement, options?: Partial<SeismogramOptions>) {
    const opts = merge(
      getDefaultOptions(),
      options || {},
      true
    ) as SeismogramOptions;
    super(dom, opts);

    this.eventEmitter = new EventEmitter<SeismogramEventMap>();
    this.trackManager = new TrackManager(this);

    this.grid = new GridView(this, opts.grid);
    this.grid.hide();
    this.addComponent(this.grid);

    const { startTime, endTime, useUTC } = opts;
    this.xAxis = new AxisView(this.grid, this, {
      position: "top",
      type: "time",
      useUTC,
      draggable: true,
    });
    if (startTime && endTime) {
      this.xAxis.setExtent([startTime, endTime]);
    } else {
      const end = Date.now();
      const start = end - opts.interval * ONE_MINUTE;
      this.xAxis.setExtent([start, end]);
    }
    this.xAxis.on("extentChanged", (extent) => {
      this.eventEmitter.emit("extentChanged", extent);
    });
    this.addComponent(this.xAxis);

    this.axisPointer = new AxisPointerView(this.xAxis, this);
    this.axisPointer.attachEventListeners();
    this.addComponent(this.axisPointer);

    this.picker = new PickerView(this);
    this.picker.on("change", (extent) => {
      this.emit("pickChanged", extent);
    });
    this.addComponent(this.picker);

    if (opts.darkMode) {
      this.setTheme("dark");
    } else {
      this.setTheme("light");
    }

    for (const channel of opts.channels) {
      this.addChannelInternal(channel);
    }

    if (typeof Worker !== "undefined") {
      this.worker = new Worker(
        new URL("../workers/seismogram.worker.ts", import.meta.url),
        { type: "module" }
      );
      this.worker.onmessage = this.onWorkerMessage.bind(this);
    }
    this.offscreenSignal = new OffscreenSignalView(this);
    this.addComponent(this.offscreenSignal);

    const { markers } = opts;
    if (markers) {
      this.addEventMarkers(markers);
    }

    const { showSpecrogram, showSignal } = opts;
    if (showSpecrogram) {
      this.showSpectrograms();
    }
    if (showSignal) {
      this.showSignals();
    } else {
      this.hideSignals();
    }
  }

  setChannels(channels: Channel[]): void {
    this.channelDataStore.clear();
    this.spectrogramDataStore.clear();

    for (const track of this.trackManager.tracks()) {
      this.removeComponent(track);
      track.dispose();
    }
    this.trackManager.clear();

    for (const channel of channels) {
      this.addChannelInternal(channel);
    }
    this.updateTracksRect();
  }

  addChannel(channel: Channel): void {
    this.addChannelInternal(channel);
    this.emit("channelAdded", channel);
  }

  removeChannel(index: number): void {
    const channel = this.removeChannelInternal(index);
    this.emit("channelRemoved", channel);
  }

  getChannels(): Channel[] {
    const channels: Channel[] = [];
    for (const channel of this.trackManager.channels()) {
      channels.push(channel);
    }
    return channels;
  }

  moveChannel(from: number, to: number): void {
    this.trackManager.move(from, to);
    this.updateTracksRect();
    this.eventEmitter.emit("channelMoved", from, to);
  }

  moveChannelUp(index: number): void {
    if (index > 0) {
      this.moveChannel(index, index - 1);
    }
  }

  moveChannelDown(index: number): void {
    if (index < this.trackManager.count() - 1) {
      this.moveChannel(index, index + 1);
    }
  }

  increaseAmplitude(by: number): void {
    const [ymin, ymax] = this.getYExtent();
    const dy = (ymax - ymin) * by;
    this.yExtent = [ymin + dy, ymax - dy];

    for (const track of this.trackManager.tracks()) {
      track.getSignal().setYExtent(this.yExtent);
    }
    this.emit("amplitudeChanged", this.yExtent);
  }

  decreaseAmplitude(by: number): void {
    this.increaseAmplitude(-by);
  }

  resetAmplitude(): void {
    this.yExtent = [-1, 1];
    for (const track of this.trackManager.tracks()) {
      track.getSignal().setYExtent(this.yExtent);
    }
    this.emit("amplitudeChanged", this.yExtent);
  }

  scrollLeft(by: number): void {
    this.xAxis.scrollLeft(by);
  }

  scrollRight(by: number): void {
    this.xAxis.scrollRight(by);
  }

  scrollToTime(time: number): void {
    this.xAxis.scrollTo(time);
  }

  scrollToNow(): void {
    const now = Date.now();
    this.xAxis.scrollTo(now);
  }

  zoomIn(at: number, by: number): void {
    this.xAxis.zoomIn(at, by);
  }

  zoomOut(at: number, by: number): void {
    this.xAxis.zoomOut(at, by);
  }

  setUseUTC(useUTC: boolean): void {
    this.getModel().mergeOptions({ useUTC });
    this.getXAxis().getModel().setUseUTC(useUTC);
  }

  setScaling(scaling: "global" | "local"): void {
    this.getModel().mergeOptions({ scaling });
  }

  setChannelData(channelId: string, data: SeriesData): void {
    this.channelDataStore.set(channelId, data);
  }

  getChannelData(channelId: string): SeriesData {
    const seriesData = this.channelDataStore.get(channelId);
    if (!seriesData) {
      return {
        series: Series.empty(),
        min: 0,
        max: 0,
        count: 0,
      };
    }
    return seriesData;
  }

  isChannelDataEmpty(channelId: string): boolean {
    return !this.channelDataStore.has(channelId);
  }

  clearChannelData(): void {
    this.channelDataStore.clear();
  }

  setSpectrogramData(channelId: string, data: SpectrogramData): void {
    const track = this.trackManager.getTrackByChannelId(channelId);
    if (!track) {
      return;
    }
    track.getRightYAxis().setExtent([0, data.freqMax]);
    track.getSpectrogram().setData(data);
    this.spectrogramDataStore.set(channelId, data);
  }

  getSpectrogramData(channelId: string): SpectrogramData {
    const data = this.spectrogramDataStore.get(channelId);
    if (!data) {
      return new SpectrogramData();
    }
    return data;
  }

  isSpectrogramDataEmpty(channelId: string): boolean {
    return !this.spectrogramDataStore.has(channelId);
  }

  clearSpectrogramData(): void {
    this.spectrogramDataStore.clear();
    for (const track of this.trackManager.tracks()) {
      track.getSpectrogram().clearData();
    }
  }

  showSignals(): void {
    this.offscreenSignal.show();
    this.signalShown = true;
  }

  hideSignals(): void {
    this.offscreenSignal.hide();
    this.signalShown = false;
  }

  isSignalVisible(): boolean {
    return this.signalShown;
  }

  showSpectrograms(): void {
    for (const track of this.trackManager.tracks()) {
      track.showSpectrogram();
    }
    this.spectrogramShown = true;
  }

  hideSpectrograms(): void {
    for (const track of this.trackManager.tracks()) {
      track.hideSpectrogram();
    }
    this.spectrogramShown = false;
  }

  isSpectrogramVisible(): boolean {
    return this.spectrogramShown;
  }

  expandView(index: number): void {
    if (index < 0 || index >= this.trackManager.count()) {
      return;
    }
    this.inExpandMode = true;
    this.expandIndex = index;
    this.updateTracksRect();
  }

  restoreView(): void {
    this.inExpandMode = false;
    this.expandIndex = -1;
    this.updateTracksRect();
  }

  isInExpandMode(): boolean {
    return this.inExpandMode;
  }

  getExpandIndex(): number {
    return this.expandIndex;
  }

  focus(): void {
    this.focused = true;
  }

  blur(): void {
    this.focused = false;
  }

  isFocused(): boolean {
    return this.focused;
  }

  addEventMarker(
    markerOptions: EventMarkerOptions,
    options?: AddMarkerOptions
  ): EventMarkerView {
    const marker = new EventMarkerView(this, markerOptions);
    this.markers.push(marker);
    this.addComponent(marker);
    const { show = true } = options || {};
    if (!show) {
      marker.hide();
    }
    return marker;
  }

  addEventMarkers(
    markersOptions: EventMarkerOptions[],
    option?: AddMarkerOptions
  ): EventMarkerView[] {
    const { show = true } = option || {};
    const addedMarkers: EventMarkerView[] = [];
    for (const options of markersOptions) {
      const marker = this.addEventMarker(options);
      addedMarkers.push(marker);
      if (!show) {
        marker.hide();
      }
    }
    return addedMarkers;
  }

  removeEventMarker(start: number, end: number): void {
    const index = this.markers.findIndex((marker) => {
      const [left, right] = marker.getModel().getWindow();
      return (
        almostEquals(left, start, ONE_SECOND) &&
        almostEquals(right, end, ONE_SECOND)
      );
    });

    if (index > -1) {
      const marker = this.markers[index];
      this.markers.splice(index, 1);
      this.removeComponent(marker);
    }
  }

  clearEventMarkers(): void {
    for (const marker of this.markers) {
      this.removeComponent(marker);
    }
    this.markers = [];
  }

  showEventMarkers(): void {
    for (const marker of this.markers) {
      marker.show();
    }
  }

  hideEventMarkers(): void {
    for (const marker of this.markers) {
      marker.hide();
    }
  }

  getTrackManager(): TrackManager {
    return this.trackManager;
  }

  getPicker(): PickerView {
    return this.picker;
  }

  getAxisPointer(): AxisPointerView {
    return this.axisPointer;
  }

  getGrid(): GridView {
    return this.grid;
  }

  getXAxis(): AxisView {
    return this.xAxis;
  }

  getYExtent(): [number, number] {
    return this.yExtent;
  }

  getChartExtent(): [number, number] {
    return this.xAxis.getExtent();
  }

  resize(options?: ResizeOptions): void {
    this.zr.resize(options);
    this.setRect(new BoundingRect(0, 0, this.getWidth(), this.getHeight()));
    for (const view of this.views) {
      view.resize();
    }
    this.updateTracksRect();
  }

  on<K extends keyof SeismogramEventMap>(
    event: K,
    listener: SeismogramEventMap[K]
  ): void {
    this.eventEmitter.on(event, listener);
  }

  off<K extends keyof SeismogramEventMap>(
    event: K,
    listener: SeismogramEventMap[K]
  ): void {
    this.eventEmitter.off(event, listener);
  }

  emit<K extends keyof SeismogramEventMap>(
    event: K,
    ...args: Parameters<SeismogramEventMap[K]>
  ): void {
    this.eventEmitter.emit(event, ...args);
  }

  isRendering(): boolean {
    return this.rendering;
  }

  override dispose(): void {
    this.worker?.terminate();
    this.worker = null;
    super.dispose();
  }

  override render(options?: SeismogramRenderOptions): void {
    const { refreshSignal = true } = options || {};
    this.rendering = true;
    if (refreshSignal) {
      this.refreshOffscreen();
    }
    super.render();
    this.rendering = refreshSignal;
  }

  private refreshOffscreen(): void {
    const trackManager = this.getTrackManager();
    const trackRenderContexts: OffscreenRenderTrackContext[] = [];
    for (const item of trackManager.items()) {
      const [channel, track] = item;
      if (!track.visible) {
        continue;
      }
      const signal = track.getSignal();
      let seriesData = this.getChannelData(channel.id);
      const { series, min, max } = seriesData;
      const offscreenRendertrack: OffscreenRenderTrackContext = {
        channelId: channel.id,
        trackRect: track.getRect(),
        xScaleOptions: this.xAxis.getModel().getScale().toJSON(),
        yScaleOptions: signal.getYAxis().getModel().getScale().toJSON(),
        series: series.toJSON(),
        min,
        max,
      };
      trackRenderContexts.push(offscreenRendertrack);
    }

    const { scaling } = this.getModel().getOptions();
    const color = this.getThemeStyle().foregroundColor;
    const [timeMin, timeMax] = this.getXAxis().getExtent();
    const offscreenRenderContext: OffscreenRenderContext = {
      rect: this.getRect(),
      gridRect: this.getGrid().getRect(),
      tracks: trackRenderContexts,
      pixelRatio: window.devicePixelRatio,
      scaling,
      color,
      timeMin,
      timeMax,
    };
    this.worker?.postMessage(offscreenRenderContext);
  }

  private onWorkerMessage(event: MessageEvent): void {
    const result = event.data as OffscreenRenderResult;
    requestAnimationFrame(() => {
      const { info } = result;
      info.forEach(({ channelId, normFactor }) => {
        const track = this.trackManager.getTrackByChannelId(channelId);
        if (track) {
          track.getLeftYAxis().setNormFactor(normFactor);
          track.render();
        }
      });
      this.offscreenSignal.updateData(result);
      this.rendering = false;
    });
  }

  private getRectForTrack(index: number, count: number): LayoutRect {
    const rect = this.grid.getRect();
    if (count === 0) {
      return rect;
    }

    const { x, y, width, height } = rect;
    const gap = 10;
    const spacing = gap * (count + 1);
    const trackHeight = (height - spacing) / count;
    const trackY = y + gap + index * (trackHeight + gap);

    return new BoundingRect(x, trackY, width, trackHeight);
  }

  private addChannelInternal(channel: Channel): Channel {
    const track = new TrackView(this, {
      label: channel.label ?? channel.id,
      markerColor: channel.color,
      style: "bracket",
    });
    track.getLeftYAxis().setExtent(this.getYExtent());
    track.interactive = true;
    track.on("contextmenu", (e, instance) => {
      const index = this.trackManager.indexOfTrack(instance);
      this.eventEmitter.emit("trackContextMenu", e, index);
    });
    track.on("doubleClick", (_, instance) => {
      const index = this.trackManager.indexOfTrack(instance);
      this.eventEmitter.emit("trackDoubleClicked", index);
    });
    const theme = this.getThemeStyle();
    track.applyThemeStyle(theme);
    this.trackManager.add(channel, track);

    this.addComponent(track);
    this.updateTracksRect();
    return channel;
  }

  private removeChannelInternal(index: number): Channel {
    const [channel, track] = this.trackManager.remove(index);
    this.removeComponent(track);
    track.dispose();
    this.updateTracksRect();
    return channel;
  }

  private updateTracksRect(): void {
    if (this.inExpandMode) {
      for (let i = 0; i < this.trackManager.count(); i++) {
        const track = this.trackManager.getTrackByIndex(i);
        if (i === this.expandIndex) {
          const rect = this.getRectForTrack(0, 1);
          track.setRect(rect);
          track.show();
        } else {
          track.hide();
        }
      }
    } else {
      const trackCount = this.trackManager.count();
      for (let i = 0; i < trackCount; i++) {
        const track = this.trackManager.getTrackByIndex(i);
        const rect = this.getRectForTrack(i, trackCount);
        track.setRect(rect);
        track.show();
      }
    }
  }
}
