import { merge } from "zrender/lib/core/util";
import { AxisView } from "../axis/axisView";
import { ChartView } from "../core/chartView";
import { EventEmitter } from "../core/eventEmitter";
import { GridView } from "../grid/gridView";
import { ONE_MINUTE } from "../util/time";
import { Channel } from "../util/types";
import { getDefaultOptions, HelicorderOptions } from "./chartOptions";
import { HelicorderEventMap } from "./eventMap";
import { SetTrackDataOptions, TrackManager } from "./trackManager";

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
  private eventEmitter: EventEmitter<HelicorderEventMap>;
  private readonly xAxis: AxisView;
  private readonly grid: GridView;
  private trackManager: TrackManager;
  private yExtent: [number, number] = [-1, 1];

  constructor(dom: HTMLCanvasElement, options?: Partial<HelicorderOptions>) {
    const opts = merge(options, getDefaultOptions()) as HelicorderOptions;
    super(dom, opts);
    this.eventEmitter = new EventEmitter<HelicorderEventMap>();

    this.grid = new GridView(this, opts.grid);
    this.addComponent(this.grid);

    this.xAxis = new AxisView(this.grid, {
      position: "top",
      type: "linear",
      useUTC: opts.useUTC,
    });
    this.xAxis.setExtent([0, opts.interval]);
    this.addComponent(this.xAxis);

    this.trackManager = new TrackManager(this);
    this.trackManager.updateTracks();
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
    this.xAxis.setExtent([0, interval]);
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

  setTrackData(
    segment: [number, number],
    data: [number, number][],
    options?: SetTrackDataOptions
  ): void {
    this.trackManager.setTrackData(segment, data, options);
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

  getGrid(): GridView {
    return this.grid;
  }

  getXAxis(): AxisView {
    return this.xAxis;
  }

  getYExtent(): [number, number] {
    return this.yExtent;
  }

  getSegments(): [number, number][] {
    return this.trackManager.getTrackExtents();
  }

  resize(): void {
    const { width, height } = this.getRect();
    this.zr.resize({
      width,
      height,
    });
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
}
