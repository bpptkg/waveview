import { ONE_MINUTE } from "./types";

/**
 * Segment is a time-based data container. It stores data points for a specific
 * time range. The time range is defined by the timestamp and the size. The
 * timestamp is the start of the segment and the end is calculated by adding the
 * size to the timestamp. The size is the duration of the segment in minutes.
 */
export class Segment {
  readonly data: Map<number, number>;
  private _timestamp: number;
  readonly size: number;
  filled = false;

  constructor(timestamp: number, size: number) {
    this.size = size;
    this._timestamp = this._normalize(timestamp);
    this.data = new Map();
  }

  private _normalize(timestamp: number): number {
    const minutes = Math.floor(timestamp / ONE_MINUTE);
    const normalizedMinutes = Math.floor(minutes / this.size) * this.size;
    return normalizedMinutes * ONE_MINUTE;
  }

  get timestamp(): number {
    return this._timestamp;
  }

  set timestamp(value: number) {
    this._timestamp = this._normalize(value);
  }

  get start(): number {
    return this._timestamp;
  }

  get end(): number {
    return this._timestamp + this.size * ONE_MINUTE;
  }

  get length(): number {
    return this.data.size;
  }

  get(index: number): number | undefined {
    return this.data.get(index);
  }

  set(index: number, value: number): void {
    if (index < this.start || index >= this.end) {
      throw new Error("Index out of range");
    }
    this.data.set(index, value);
  }

  has(index: number): boolean {
    return this.data.has(index);
  }

  clear(): void {
    this.data.clear();
    this.filled = false;
  }

  toArray(): [number, number][] {
    return Array.from(this.data.entries()).sort(([a], [b]) => a - b);
  }

  indexMin(): number {
    let min = Infinity;
    for (const index of this.data.keys()) {
      if (index < min) {
        min = index;
      }
    }
    return min;
  }

  indexMax(): number {
    let max = -Infinity;
    for (const index of this.data.keys()) {
      if (index > max) {
        max = index;
      }
    }
    return max;
  }

  dataMin(): number {
    let min = Infinity;
    for (const value of this.data.values()) {
      if (value < min) {
        min = value;
      }
    }
    return min;
  }

  dataMax(): number {
    let max = -Infinity;
    for (const value of this.data.values()) {
      if (value > max) {
        max = value;
      }
    }
    return max;
  }

  containsNow(): boolean {
    const now = Date.now();
    return now >= this.start && now <= this.end;
  }
}
