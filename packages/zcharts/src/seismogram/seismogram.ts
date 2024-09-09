import { BoundingRect } from "zrender";
import { merge } from "zrender/lib/core/util";
import { AxisView } from "../axis/axisView";
import { ChartView } from "../core/chartView";
import { EventEmitter } from "../core/eventEmitter";
import { GridView } from "../grid/gridView";
import { TrackView } from "../track/trackView";
import { almostEquals } from "../util/math";
import { ONE_MINUTE, ONE_SECOND } from "../util/time";
import { Channel, LayoutRect } from "../util/types";
import { AxisPointer } from "./axisPointer";
import { getDefaultOptions, SeismogramOptions } from "./chartOptions";
import { SeismogramEventMap } from "./eventMap";
import { EventMarkerOptions } from "./eventMarker/eventMarkerModel";
import { EventMarkerView } from "./eventMarker/eventMarkerView";
import { TrackManager } from "./trackManager";

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
  private trackManager: TrackManager = new TrackManager();
  private axisPointer: AxisPointer;
  private markers: EventMarkerView[] = [];

  constructor(dom: HTMLCanvasElement, options?: Partial<SeismogramOptions>) {
    const opts = merge(options, getDefaultOptions()) as SeismogramOptions;
    super(dom, opts);

    this.eventEmitter = new EventEmitter<SeismogramEventMap>();

    this.grid = new GridView(this, opts.grid);
    this.addComponent(this.grid);

    const { startTime, endTime, useUTC } = opts;
    this.xAxis = new AxisView(this.grid, {
      position: "top",
      type: "time",
      useUTC,
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

    this.axisPointer = new AxisPointer(this.xAxis, this);
    this.axisPointer.attachEventListeners();
    this.addComponent(this.axisPointer);
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
    this.trackManager.move(from, to);
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

  setChannelData(index: number, data: [number, number][]): void {
    const track = this.trackManager.getTrackByIndex(index);
    track.getSignal().setData(data);
  }

  getChannelData(index: number): [number, number][] {
    const track = this.trackManager.getTrackByIndex(index);
    return track.getSignal().getData();
  }

  showSignal(index: number): void {
    const track = this.trackManager.getTrackByIndex(index);
    track.showSignal();
  }

  hideSignal(index: number): void {
    const track = this.trackManager.getTrackByIndex(index);
    track.hideSignal();
  }

  showSignals(): void {
    for (const track of this.trackManager.tracks()) {
      track.showSignal();
    }
  }

  hideSignals(): void {
    for (const track of this.trackManager.tracks()) {
      track.hideSignal();
    }
  }

  showSpectrogram(index: number): void {
    const track = this.trackManager.getTrackByIndex(index);
    track.showSpectrogram();
  }

  hideSpectrogram(index: number): void {
    const track = this.trackManager.getTrackByIndex(index);
    track.hideSpectrogram();
  }

  showSpectrograms(): void {
    for (const track of this.trackManager.tracks()) {
      track.showSpectrogram();
    }
  }

  hideSpectrograms(): void {
    for (const track of this.trackManager.tracks()) {
      track.hideSpectrogram();
    }
  }

  addEventMarker(options: EventMarkerOptions): EventMarkerView {
    const marker = new EventMarkerView(this, options);
    this.markers.push(marker);
    this.addComponent(marker);
    return marker;
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

  getTrackManager(): TrackManager {
    return this.trackManager;
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

  resize(): void {
    const { width, height } = this.getRect();
    this.zr.resize({
      width,
      height,
    });
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

  private getRectForTrack(index: number, count: number): LayoutRect {
    const rect = this.grid.getRect();
    if (count === 0) {
      return rect;
    }

    const { x, y, width, height } = rect;
    const trackHeight = height / count;
    const trackY = y + index * trackHeight;

    return new BoundingRect(x, trackY, width, trackHeight);
  }

  private addChannelInternal(channel: Channel): Channel {
    const track = new TrackView(this, {
      label: channel.label ?? channel.id,
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
    const trackCount = this.trackManager.count();
    for (let i = 0; i < trackCount; i++) {
      const track = this.trackManager.getTrackByIndex(i);
      const rect = this.getRectForTrack(i, trackCount);
      track.setRect(rect);
    }
  }
}
