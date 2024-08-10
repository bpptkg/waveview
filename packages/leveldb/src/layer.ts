import { Segment } from "./segment";
import { ONE_MINUTE } from "./types";

export interface StorageLayerOptions {
  /**
   * The block size for each segment in minutes.
   */
  size: number;
  /**
   * The maximum number of data points to store per segment.
   */
  maxPoints: number;
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

  get(timestamp: number): Segment | undefined {
    return this.segments.get(timestamp);
  }

  set(timestamp: number, segment: Segment): void {
    this.segments.set(timestamp, segment);
  }

  has(timestamp: number): boolean {
    return this.segments.has(timestamp);
  }

  delete(timestamp: number): void {
    this.segments.delete(timestamp);
  }

  getOrAdd(timestamp: number, factory: () => Segment): Segment {
    let segment = this.segments.get(timestamp);
    if (!segment) {
      segment = factory();
      this.segments.set(timestamp, segment);
    }
    return segment;
  }

  /**
   * Returns the data points for the given time range.
   */
  getDataPointsInRange(start: number, end: number): [number, number][] {
    const dataPoints: [number, number][] = [];
    this.iterateSegmentsInRange(start, end, (segment) => {
      for (const [index, value] of segment.getDataArray()) {
        if (index >= start && index <= end) {
          dataPoints.push([index, value]);
        }
      }
    });
    return dataPoints;
  }

  /**
   * Iterates over the segments for the given time range. If the segment does
   * not exist, it will be created.
   */
  iterateSegmentsInRange(
    start: number,
    end: number,
    callbackfn: (
      segment: Segment,
      key: number,
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
      const segment = this.getOrAdd(
        timestamp,
        () => new Segment(timestamp, this.options.size)
      );
      callbackfn(segment, timestamp, this.segments);
    }
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
      const segment = this.get(timestamp);
      if (!segment || !segment.filled) {
        return false;
      }
    }
    return true;
  }
}
