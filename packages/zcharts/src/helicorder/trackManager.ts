import { BoundingRect } from "zrender";
import { TrackView } from "../track/trackView";
import { formatDate, ONE_MINUTE } from "../util/time";
import { LayoutRect } from "../util/types";
import { DataStore, HelicorderData, Points, Segment } from "./dataStore";
import { Helicorder } from "./helicorder";

export interface SetTrackDataOptions {
  range: [number, number];
}

export class TrackManager {
  private helicorder: Helicorder;
  private _tracks: Map<string, TrackView> = new Map();
  private dataStore: DataStore<HelicorderData> = new DataStore();

  constructor(helicorder: Helicorder) {
    this.helicorder = helicorder;
  }

  add(segment: Segment, track: TrackView): void {
    const key = JSON.stringify(segment);
    this._tracks.set(key, track);
  }

  remove(segment: Segment): void {
    const key = JSON.stringify(segment);
    this._tracks.delete(key);
  }

  get(segment: Segment): TrackView | undefined {
    const key = JSON.stringify(segment);
    return this._tracks.get(key);
  }

  has(segment: Segment): boolean {
    const key = JSON.stringify(segment);
    return this._tracks.has(key);
  }

  clear(): void {
    this._tracks.clear();
  }

  count(): number {
    const model = this.helicorder.getModel();
    const { interval, duration } = model.getOptions();
    return Math.ceil((duration * 60) / interval) + 1;
  }

  getTrackIndexByTime(time: number): number {
    const model = this.helicorder.getModel();
    const { interval, offsetDate } = model.getOptions();
    const segment = interval * ONE_MINUTE;
    const endOf = (value: number) => value + segment - (value % segment);
    const end = endOf(offsetDate);
    const diff = end - time;
    return Math.floor(diff / segment);
  }

  getTrackIndexByPosition(y: number): number {
    const { y: gridY, height } = this.helicorder.getGrid().getRect();
    const trackHeight = height / this.count();
    const row = Math.floor((y - gridY) / trackHeight);
    return this.count() - row - 1;
  }

  getTrackByIndex(index: number): TrackView | undefined {
    const segment = this.getTrackExtentAt(index);
    return this.get(segment);
  }

  getTrackByTime(time: number): TrackView | undefined {
    const index = this.getTrackIndexByTime(time);
    return this.getTrackByIndex(index);
  }

  getTrackByPosition(y: number): TrackView | undefined {
    const { y: gridY, height } = this.helicorder.getGrid().getRect();
    const trackHeight = height / this.count();
    const row = Math.floor((y - gridY) / trackHeight);
    const segment = this.getTrackExtentAt(this.count() - row - 1);
    return this.get(segment);
  }

  getTrackExtentAt(index: number): [number, number] {
    const model = this.helicorder.getModel();
    const { interval, offsetDate } = model.getOptions();

    const segment = interval * ONE_MINUTE;
    const startOf = (value: number) => value - (value % segment);
    const endOf = (value: number) => value + segment - (value % segment);

    return [
      startOf(offsetDate - index * interval * ONE_MINUTE),
      endOf(offsetDate - index * interval * ONE_MINUTE),
    ];
  }

  getTrackExtents(): [number, number][] {
    const extents: [number, number][] = [];
    for (let i = 0; i < this.count(); i++) {
      const [start, end] = this.getTrackExtentAt(i);
      extents.push([start, end]);
    }
    return extents;
  }

  getChartExtent(): [number, number] {
    const first = this.getTrackExtentAt(0);
    const last = this.getTrackExtentAt(this.count() - 1);
    return [first[0], last[1]];
  }

  timeToOffset(segment: Segment, time: number): number {
    const model = this.helicorder.getModel();
    const { interval } = model.getOptions();
    const [start, end] = segment;
    return ((time - start) / (end - start)) * interval;
  }

  getTimeAtPoint(x: number, y: number): number {
    const trackIndex = this.getTrackIndexByPosition(y);
    const [start, end] = this.getTrackExtentAt(trackIndex);
    const track = this.get([start, end]);
    if (!track) {
      return 0;
    }
    const rect = track.getRect();
    const time = start + (end - start) * ((x - rect.x) / rect.width);
    return time;
  }

  /**
   * Get the X axis pixel offset for the given time.
   */
  getPixelForTime(segment: Segment, time: number): number {
    const offsetSeconds = this.timeToOffset(segment, time);
    return this.helicorder.getXAxis().getPixelForValue(offsetSeconds);
  }

  *segments(): Generator<Segment> {
    for (let i = 0; i < this.count(); i++) {
      yield this.getTrackExtentAt(i);
    }
  }

  *tracks(): Generator<TrackView> {
    for (const track of this._tracks.values()) {
      yield track;
    }
  }

  private getNormFactor(): number {
    let normFactor = Infinity;
    for (const segment of this.segments()) {
      const heliData = this.dataStore.get(segment);
      if (heliData) {
        const { range } = heliData;
        const [min, max] = range;
        normFactor = Math.min(normFactor, Math.abs(max - min));
      }
    }
    return isFinite(normFactor) ? normFactor : 1;
  }

  setTrackData(
    segment: Segment,
    data: Points,
    options?: SetTrackDataOptions
  ): void {
    let range = options?.range;
    if (!range) {
      range = data.reduce(
        (acc, val) => {
          acc[0] = Math.min(acc[0], val[1]);
          acc[1] = Math.max(acc[1], val[1]);
          return acc;
        },
        [Infinity, -Infinity]
      ) as [number, number];
    }
    this.dataStore.set(segment, { data, range });
    this.refreshData();
  }

  getTrackData(segment: Segment): HelicorderData | undefined {
    return this.dataStore.get(segment);
  }

  sliceData(segment: Segment, start: number, end: number): Points {
    const heliData = this.dataStore.get(segment);
    if (!heliData) {
      return [];
    }
    const { data } = heliData;
    return data.filter(([time]) => time >= start && time <= end);
  }

  /**
   * Get the min and max values for the data in the given range.
   */
  getDataRange(start: number, end: number): [number, number] {
    const segment = this.getTrackExtentAt(
      this.getTrackIndexByTime(start + (end - start) / 2)
    );
    const data = this.sliceData(segment, start, end);
    const min = data.reduce((acc, val) => Math.min(acc, val[1]), Infinity);
    const max = data.reduce((acc, val) => Math.max(acc, val[1]), -Infinity);

    return [min, max];
  }

  refreshData(): void {
    const normFactor = this.getNormFactor();
    for (const segment of this.segments()) {
      const track = this.get(segment);
      if (track) {
        const heliData = this.dataStore.get(segment);
        if (heliData) {
          const { data } = heliData;
          const norm: [number, number][] = [];
          for (const [x, y] of data) {
            norm.push([this.timeToOffset(segment, x), y / normFactor]);
          }
          track.getSignal().setData(norm);
        }
      }
    }
  }

  updateTrackLabels(): void {
    const model = this.helicorder.getModel();
    const { useUTC } = model.getOptions();
    const trackCount = this.count();
    const maxLabelCount = 25;
    const repeat = Math.max(Math.ceil(trackCount / maxLabelCount), 1);

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

    for (const segment of this.segments()) {
      const track = this.get(segment);
      if (track) {
        const [start] = segment;
        const formatString = adjustLabel(
          this.getTrackIndexByTime(start),
          isMidnight(start) ? "{MM}-{dd} {HH}:{mm}" : "{HH}:{mm}"
        );

        const label = formatDate(start, formatString, useUTC);
        track.getModel().mergeOptions({ label });
      }
    }
  }

  /**
   * Get the rectange for the track at the given index.
   */
  getRectForTrack(index: number, count: number): LayoutRect {
    const grid = this.helicorder.getGrid();
    const rect = grid.getRect();
    if (count === 0) {
      return rect;
    }

    const { x, y, width, height } = rect;
    const trackHeight = height / count;
    const trackY = y + (count - index) * trackHeight;

    return new BoundingRect(x, trackY, width, trackHeight);
  }

  updateTracks(): void {
    for (const track of this.tracks()) {
      this.helicorder.removeComponent(track);
    }
    this.clear();

    for (const segment of this.segments()) {
      const track = new TrackView(this.helicorder);
      const [start] = segment;
      const trackIndex = this.getTrackIndexByTime(start);
      const rect = this.getRectForTrack(trackIndex, this.count());
      track.setRect(rect);
      this.add(segment, track);
      this.helicorder.addComponent(track);
    }

    this.updateTrackLabels();
    this.refreshData();
  }
}
