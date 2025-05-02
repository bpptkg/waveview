import { Series } from "@waveview/ndarray";
import { BoundingRect } from "zrender";
import { TrackView } from "../track/trackView";
import { formatDate, ONE_MINUTE } from "../util/time";
import { LayoutRect, SeriesData } from "../util/types";
import { DataStore, Segment } from "./dataStore";
import { Helicorder } from "./helicorder";

export interface SetTrackDataOptions {
  range: [number, number];
}

/**
 * TrackManager manages the tracks in the helicorder.
 */
export class TrackManager {
  private helicorder: Helicorder;
  private trackStore: Map<string, TrackView> = new Map();
  private dataStore: DataStore<SeriesData> = new DataStore();

  constructor(helicorder: Helicorder) {
    this.helicorder = helicorder;
  }

  /**
   * Get the data store for the tracks.
   */
  getDataStore(): DataStore<SeriesData> {
    return this.dataStore;
  }

  /**
   * Add a track to the manager for the given segment.
   */
  add(segment: Segment, track: TrackView): void {
    const key = JSON.stringify(segment);
    this.trackStore.set(key, track);
  }

  /**
   * Remove a track from the manager for the given segment.
   */
  remove(segment: Segment): void {
    const key = JSON.stringify(segment);
    this.trackStore.delete(key);
  }

  /**
   * Get the track for the given segment.
   */
  get(segment: Segment): TrackView | undefined {
    const key = JSON.stringify(segment);
    return this.trackStore.get(key);
  }

  /**
   * Check if the manager has a track for the given segment.
   */
  has(segment: Segment): boolean {
    const key = JSON.stringify(segment);
    return this.trackStore.has(key);
  }

  /**
   * Clear all tracks and data from the manager.
   */
  clear(): void {
    this.trackStore.clear();
    this.clearData();
  }

  /**
   * Get the number of tracks in the manager. Note that this is not the same as
   * the number of segments in the data store. The number of tracks is
   * determined by the duration and interval of the helicorder sufficient to
   * display the data.
   */
  count(): number {
    const model = this.helicorder.getModel();
    const { interval, duration } = model.getOptions();
    return Math.ceil((duration * 60) / interval) + 1;
  }

  /**
   * Get the track rectangle for the given segment.
   */
  getTrackRectBySegment(segment: Segment): LayoutRect {
    const [start, end] = segment;
    const time = start + (end - start) / 2;
    const trackIndex = this.getTrackIndexByTime(time);
    return this.getRectForTrack(trackIndex, this.count() - 1);
  }

  /**
   * Get the track index for the given time.
   */
  getTrackIndexByTime(time: number): number {
    const model = this.helicorder.getModel();
    const { interval, offsetDate } = model.getOptions();
    const segment = interval * ONE_MINUTE;
    const endOf = (value: number) => value + segment - (value % segment);
    const end = endOf(offsetDate);
    const diff = end - time;
    return Math.floor(diff / segment);
  }

  /**
   * Get the track index for the given position.
   */
  getTrackIndexByPosition(y: number): number {
    const { y: gridY, height } = this.helicorder.getGrid().getRect();
    const trackHeight = height / this.count();
    const row = Math.floor((y - gridY) / trackHeight);
    return this.count() - row - 1;
  }

  /**
   * Get the track for the given index.
   */
  getTrackByIndex(index: number): TrackView | undefined {
    const segment = this.getTrackExtentAt(index);
    return this.get(segment);
  }

  /**
   * Get the track for the given time.
   */
  getTrackByTime(time: number): TrackView | undefined {
    const index = this.getTrackIndexByTime(time);
    return this.getTrackByIndex(index);
  }

  /**
   * Get the track for the given Y position.
   */
  getTrackByPosition(y: number): TrackView | undefined {
    const { y: gridY, height } = this.helicorder.getGrid().getRect();
    const trackHeight = height / this.count();
    const row = Math.floor((y - gridY) / trackHeight);
    const segment = this.getTrackExtentAt(this.count() - row - 1);
    return this.get(segment);
  }

  /**
   * Get the extent of the track, i.e. segment at the given index.
   */
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

  /**
   * Get the extents or segments of all the tracks.
   */
  getTrackExtents(): [number, number][] {
    const extents: [number, number][] = [];
    for (let i = 0; i < this.count(); i++) {
      const [start, end] = this.getTrackExtentAt(i);
      extents.push([start, end]);
    }
    return extents;
  }

  /**
   * Get the extent of the chart, i.e. the first and last segment.
   */
  getChartExtent(): [number, number] {
    const last = this.getTrackExtentAt(0);
    const first = this.getTrackExtentAt(this.count() - 1);
    return [first[0], last[1]];
  }

  /**
   * Convert the time to offset in the track. For example, if the segment is
   * [start, end] and the time is in between, the offset will be the fraction of
   * the interval, i.e. (time - start) / (end - start).
   */
  timeToOffset(segment: Segment, time: number): number {
    const model = this.helicorder.getModel();
    const { interval } = model.getOptions();
    const [start, end] = segment;
    return ((time - start) / (end - start)) * interval;
  }

  /**
   * Get the time at the given point in the helicorder chart.
   */
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

  /**
   * Iterate over all the segments in the manager.
   */
  *segments(): Generator<Segment> {
    for (let i = 0; i < this.count(); i++) {
      yield this.getTrackExtentAt(i);
    }
  }

  /**
   * Iterate over all the tracks in the manager.
   */
  *tracks(): Generator<TrackView> {
    for (const track of this.trackStore.values()) {
      yield track;
    }
  }

  /**
   * Iterate over all the items in the manager.
   */
  *items(): Generator<[Segment, TrackView]> {
    for (const [key, track] of this.trackStore.entries()) {
      yield [JSON.parse(key), track];
    }
  }

  /**
   * Set the data for the given segment.
   */
  setTrackData(segment: Segment, data: SeriesData): void {
    this.dataStore.set(segment, data);
  }

  /**
   * Get the data for the given segment. If the data is not available, an empty
   * series is returned.
   */
  getTrackData(segment: Segment): SeriesData {
    const seriesData = this.dataStore.get(segment);
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

  /**
   * Check if the data for the given segment is empty.
   */
  isTrackEmpty(segment: Segment): boolean {
    const { count } = this.getTrackData(segment);
    return count === 0;
  }

  /**
   * Slice the data from start to end for the given segment.
   */
  sliceData(segment: Segment, start: number, end: number): SeriesData {
    const { series } = this.getTrackData(segment);
    const sliced = series.slice(start, end);
    return {
      series: sliced,
      min: sliced.min(),
      max: sliced.max(),
      count: sliced.length,
    };
  }

  /**
   * Get the min and max values for the data in the given range.
   */
  getDataRange(start: number, end: number): [number, number] {
    const segment = this.getTrackExtentAt(
      this.getTrackIndexByTime(start + (end - start) / 2)
    );
    const { min, max } = this.sliceData(segment, start, end);
    return [min, max];
  }

  /**
   * Clear the data for all the tracks.
   */
  clearData(): void {
    this.dataStore.clear();
    for (const track of this.tracks()) {
      track.getSignal().getModel().clearData();
    }
  }

  /**
   * Update the track labels based on the time and the number of tracks. You may
   * want to call this method when timezone changes or when the number of tracks
   * changes.
   */
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
        const [start, end] = segment;
        const trackIndex = this.getTrackIndexByTime(start + (end - start) / 2);
        const formatString = adjustLabel(
          trackIndex,
          isMidnight(start) || trackIndex === this.count() - 1
            ? "{MM}-{dd} {HH}:{mm}"
            : "{HH}:{mm}"
        );

        const label = formatDate(start, formatString, useUTC);
        track.getModel().mergeOptions({ label });
      }
    }
  }

  /**
   * Get the rectangle for the track at the given index.
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

  /**
   * Update the tracks in the manager. This method should be called when there
   * is a change in the the offset date, interval, or duration of the
   * helicorder.
   */
  updateTracks(): void {
    for (const track of this.tracks()) {
      this.helicorder.removeComponent(track);
    }
    this.clear();

    for (const segment of this.segments()) {
      const track = new TrackView(this.helicorder);
      track.getLeftYAxis().setExtent(this.helicorder.getYExtent());
      track.applyThemeStyle(this.helicorder.getThemeStyle());
      const [start] = segment;
      const trackIndex = this.getTrackIndexByTime(start);
      const rect = this.getRectForTrack(trackIndex, this.count());
      track.setRect(rect);
      this.add(segment, track);
      this.helicorder.addComponent(track);
    }

    this.updateTrackLabels();
  }

  /**
   * Resize the tracks in the manager. This method should be called when the
   * size of the helicorder changes.
   */
  resizeTracks(): void {
    for (const segment of this.segments()) {
      const track = this.get(segment);
      if (track) {
        const rect = this.getRectForTrack(
          this.getTrackIndexByTime(segment[0]),
          this.count()
        );
        track.setRect(rect);
      }
    }
  }
}
