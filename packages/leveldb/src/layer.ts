import { Segment } from "./segment";
import { ONE_MINUTE } from "./types";

export interface StorageLayerOptions {
  /**
   * The block size for each segment in minutes.
   */
  size: number;
  /**
   * The sample rate for the data points in Hz.
   */
  sampleRate: number;
}

export class StorageLayer {
  readonly segments: Map<number, Segment>;
  readonly options: StorageLayerOptions;

  constructor(options: StorageLayerOptions) {
    this.segments = new Map();
    this.options = options;
  }

  get size(): number {
    return this.segments.size;
  }

  isEmpty(): boolean {
    return this.segments.size === 0;
  }

  clear(): void {
    this.segments.clear();
  }

  getSegment(timestamp: number): Segment {
    let segment = this.segments.get(timestamp);
    if (!segment) {
      segment = new Segment(timestamp, this.options.size);
      this.segments.set(timestamp, segment);
      return segment;
    }
    return segment;
  }

  getNextSegment(timestamp: number): Segment {
    const nextTimestamp = timestamp + this.options.size * ONE_MINUTE;
    return this.getSegment(nextTimestamp);
  }

  getPreviousSegment(timestamp: number): Segment {
    const previousTimestamp = timestamp - this.options.size * ONE_MINUTE;
    return this.getSegment(previousTimestamp);
  }

  setSegment(timestamp: number, segment: Segment): void {
    this.segments.set(timestamp, segment);
  }

  hasSegment(timestamp: number): boolean {
    return this.segments.has(timestamp);
  }

  deleteSegment(timestamp: number): void {
    this.segments.delete(timestamp);
  }

  /**
   * Iterates over the segments for the given time range. If the segment does
   * not exist, it will be created.
   */
  forEachSegmentInRange(
    start: number,
    end: number,
    callback: (
      segment: Segment,
      index: number,
      map: Map<number, Segment>
    ) => void
  ): void {
    const first = new Segment(start, this.options.size);
    const last = new Segment(end, this.options.size);

    for (
      let timestamp = first.timestamp;
      timestamp <= last.timestamp;
      timestamp += this.options.size * ONE_MINUTE
    ) {
      const segment = this.getSegment(timestamp);
      callback(segment, timestamp, this.segments);
    }
  }

  /**
   * Returns the data points for the given time range.
   */
  getDataPointsInRange(start: number, end: number): [number, number][] {
    const dataPoints: [number, number][] = [];
    this.forEachSegmentInRange(start, end, (segment) => {
      for (const [index, value] of segment.toArray()) {
        if (index >= start && index <= end) {
          dataPoints.push([index, value]);
        }
      }
    });
    return dataPoints;
  }

  /**
   * Checks if the segment is filled with data points for the given time range.
   */
  areSegmentsFilled(start: number, end: number): boolean {
    const first = new Segment(start, this.options.size);
    const last = new Segment(end, this.options.size);

    for (
      let timestamp = first.timestamp;
      timestamp <= last.timestamp;
      timestamp += this.options.size * ONE_MINUTE
    ) {
      const segment = this.getSegment(timestamp);
      if (!segment || !segment.filled) {
        return false;
      }
    }
    return true;
  }
}
