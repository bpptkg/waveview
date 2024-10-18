import { Series } from "@waveview/ndarray";
import { BoundingRect } from "zrender";
import { merge } from "zrender/lib/core/util";
import { AxisView } from "../axis/axisView";
import { ChartView } from "../core/chartView";
import { EventEmitter } from "../core/eventEmitter";
import { ResizeOptions } from "../core/view";
import { GridView } from "../grid/gridView";
import { almostEquals } from "../util/math";
import { ONE_MINUTE, ONE_SECOND } from "../util/time";
import { Channel } from "../util/types";
import { AxisPointerView } from "./axisPointer/axisPointerView";
import { getDefaultOptions, HelicorderOptions } from "./chartOptions";
import { Segment } from "./dataStore";
import { HelicorderEventMap } from "./eventMap";
import { EventMarkerOptions } from "./eventMarker/eventMarkerModel";
import { EventMarkerView } from "./eventMarker/eventMarkerView";
import {
  OffscreenRenderContext,
  OffscreenRenderResult,
  OffscreenRenderTrackContext,
} from "./offscreen";
import { OffscreenSignalView } from "./offscreenSignal/offscreenSignalView";
import { SelectionWindowView } from "./selectionWindow/selectionWindowView";
import { TrackManager } from "./trackManager";

export interface HelicorderRenderOptions {
  /**
   * Refresh the offscreen rendering. Set to `true` to rerender the signal on
   * the offscreen canvas.
   */
  refreshSignal?: boolean;
}

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
export class Helicorder extends ChartView<HelicorderOptions> {
  override readonly type: string = "helicorder";
  private eventEmitter: EventEmitter<HelicorderEventMap>;
  private readonly topXAxis: AxisView;
  private readonly grid: GridView;
  private readonly bottomXAxis: AxisView;
  private trackManager: TrackManager;
  private selectionWindow: SelectionWindowView;
  private yExtent: [number, number] = [-1, 1];
  private markers: EventMarkerView[] = [];
  private focused = false;
  private worker: Worker | null = null;
  private offscreenSignal: OffscreenSignalView;
  private rendering = false;
  private axisPointer: AxisPointerView;

  constructor(dom: HTMLElement, options?: Partial<HelicorderOptions>) {
    const opts = merge(
      getDefaultOptions(),
      options || {},
      true
    ) as HelicorderOptions;
    super(dom, opts);
    this.eventEmitter = new EventEmitter<HelicorderEventMap>();

    this.grid = new GridView(this, opts.grid);
    this.addComponent(this.grid);

    this.topXAxis = new AxisView(this.grid, {
      position: "top",
      type: "linear",
      useUTC: opts.useUTC,
    });
    this.topXAxis.setExtent([0, opts.interval]);
    this.addComponent(this.topXAxis);

    this.bottomXAxis = new AxisView(this.grid, {
      position: "bottom",
      type: "linear",
      useUTC: opts.useUTC,
    });
    this.bottomXAxis.setExtent([0, opts.interval]);
    this.addComponent(this.bottomXAxis);

    this.trackManager = new TrackManager(this);
    this.trackManager.updateTracks();

    this.selectionWindow = new SelectionWindowView(this);
    if (opts.windowSize) {
      this.selectionWindow.getModel().setSize(opts.windowSize);
    }
    if (opts.selectionWindow) {
      this.selectionWindow.getModel().setStartTime(opts.selectionWindow[0]);
    }
    this.addComponent(this.selectionWindow);

    if (opts.darkMode) {
      this.setTheme("dark");
    } else {
      this.setTheme("light");
    }

    const { useOffscrrenRendering } = opts;
    if (useOffscrrenRendering && typeof Worker !== "undefined") {
      this.worker = new Worker(
        new URL("../workers/helicorder.worker.ts", import.meta.url),
        { type: "module" }
      );
      this.worker.onmessage = this.onWorkerMessage.bind(this);
    }
    this.offscreenSignal = new OffscreenSignalView(this);
    this.addComponent(this.offscreenSignal);

    this.axisPointer = new AxisPointerView(this.topXAxis, this);
    this.axisPointer.attachEventListeners();
    this.addComponent(this.axisPointer);
  }

  setChannel(channel: Channel): void {
    this.model.mergeOptions({ channel });
    this.emit("channelChanged", channel);
  }

  getChannel(): Channel {
    const { channel } = this.model.getOptions();
    return channel;
  }

  setOffsetDate(date: number): void {
    this.model.mergeOptions({ offsetDate: date });
    this.trackManager.updateTracks();
    this.emit("offsetChanged", date);
  }

  setInterval(interval: number): void {
    this.model.mergeOptions({ interval });
    this.topXAxis.setExtent([0, interval]);
    this.bottomXAxis.setExtent([0, interval]);
    this.trackManager.updateTracks();
  }

  setDuration(duration: number): void {
    this.model.mergeOptions({ duration });
    this.trackManager.updateTracks();
  }

  setUseUTC(useUTC: boolean): void {
    this.model.mergeOptions({ useUTC });
    this.trackManager.updateTrackLabels();
  }

  setScaling(scaling: "global" | "local"): void {
    this.getModel().mergeOptions({ scaling });
  }

  setTrackData(segment: Segment, data: Series): void {
    this.trackManager.setTrackData(segment, data);
  }

  getTrackData(segment: Segment): Series | undefined {
    return this.trackManager.getTrackData(segment);
  }

  isTrackDataEmpty(segment: Segment): boolean {
    return this.trackManager.isTrackEmpty(segment);
  }

  clearData(): void {
    this.trackManager.clearData();
  }

  refreshData(): void {
    this.trackManager.refreshData();
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

  shiftViewUp(by: number = 1): void {
    const { interval } = this.model.getOptions();
    const offsetDate =
      this.model.getOptions().offsetDate - interval * ONE_MINUTE * by;
    this.setOffsetDate(offsetDate);
  }

  shiftViewDown(by: number = 1): void {
    const { interval } = this.model.getOptions();
    const offsetDate =
      this.model.getOptions().offsetDate + interval * ONE_MINUTE * by;
    this.setOffsetDate(offsetDate);
  }

  shiftViewToNow(): void {
    const offsetDate = Date.now();
    this.setOffsetDate(offsetDate);
  }

  shiftViewToTime(time: number): void {
    this.setOffsetDate(time);
  }

  getTrackManager(): TrackManager {
    return this.trackManager;
  }

  getSelectionWindow(): SelectionWindowView {
    return this.selectionWindow;
  }

  getGrid(): GridView {
    return this.grid;
  }

  getXAxis(): AxisView {
    return this.topXAxis;
  }

  getYExtent(): [number, number] {
    return this.yExtent;
  }

  getSegments(): [number, number][] {
    return this.trackManager.getTrackExtents();
  }

  getChartExtent(): [number, number] {
    return this.trackManager.getChartExtent();
  }

  resize(options?: ResizeOptions): void {
    this.zr.resize(options);
    this.setRect(new BoundingRect(0, 0, this.getWidth(), this.getHeight()));
    for (const view of this.views) {
      view.resize();
    }
    this.trackManager.resizeTracks();
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

  addEventMarker(options: EventMarkerOptions): EventMarkerView {
    const marker = new EventMarkerView(this, options);
    this.markers.push(marker);
    this.addComponent(marker);
    return marker;
  }

  addEventMarkers(markers: EventMarkerOptions[]): EventMarkerView[] {
    const addedMarkers: EventMarkerView[] = [];
    for (const options of markers) {
      const marker = this.addEventMarker(options);
      addedMarkers.push(marker);
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

  clearEventMarkers(): void {
    for (const marker of this.markers) {
      this.removeComponent(marker);
    }
    this.markers = [];
  }

  on<K extends keyof HelicorderEventMap>(
    event: K,
    listener: HelicorderEventMap[K]
  ): void {
    this.eventEmitter.on(event, listener);
  }

  off<K extends keyof HelicorderEventMap>(
    event: K,
    listener: HelicorderEventMap[K]
  ): void {
    this.eventEmitter.off(event, listener);
  }

  emit<K extends keyof HelicorderEventMap>(
    event: K,
    ...args: Parameters<HelicorderEventMap[K]>
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

  override render(options?: HelicorderRenderOptions): void {
    const { refreshSignal = false } = options || {};
    this.rendering = true;
    this.emit("loading", true);

    const { useOffscrrenRendering } = this.model.getOptions();
    if (useOffscrrenRendering && refreshSignal) {
      this.refreshOffscreen();
    }

    super.render();

    if (useOffscrrenRendering) {
      this.rendering = refreshSignal;
    } else {
      this.rendering = false;
    }
    if (!this.rendering) {
      this.emit("loading", false);
    }
  }

  private refreshOffscreen(): void {
    const trackManager = this.getTrackManager();
    const trackRenderContexts: OffscreenRenderTrackContext[] = [];
    for (const item of trackManager.items()) {
      const [segment, track] = item;
      const signal = track.getSignal();
      const offscreenRendertrack: OffscreenRenderTrackContext = {
        trackRect: track.getRect(),
        xScaleOptions: signal.getXAxis().getModel().getScale().toJSON(),
        yScaleOptions: signal.getYAxis().getModel().getScale().toJSON(),
        seriesData: trackManager.getTrackData(segment).toJSON(),
        segment,
      };
      trackRenderContexts.push(offscreenRendertrack);
    }

    const { interval, duration, scaling } = this.getModel().getOptions();
    const color = this.getThemeStyle().foregroundColor;
    const offscreenRenderContext: OffscreenRenderContext = {
      rect: this.getRect(),
      gridRect: this.getGrid().getRect(),
      tracks: trackRenderContexts,
      pixelRatio: window.devicePixelRatio,
      scaling,
      color,
      interval,
      duration,
    };
    this.worker?.postMessage(offscreenRenderContext);
  }

  private onWorkerMessage(event: MessageEvent): void {
    const result = event.data as OffscreenRenderResult;
    requestAnimationFrame(() => {
      this.offscreenSignal.updateData(result);
      this.rendering = false;
      this.emit("loading", false);
    });
  }
}
