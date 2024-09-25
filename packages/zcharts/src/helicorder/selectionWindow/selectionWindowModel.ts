import { Model } from "../../core/model";
import { ONE_MINUTE } from "../../util/time";

export interface SelectionWindowOptions {
  /**
   * Window size in minutes.
   */
  size: number;
  /**
   * Window start time in epoch milliseconds.
   */
  startTime: number;
  /**
   * Window color.
   */
  color: string;
  /**
   * Window opacity.
   */
  opacity: number;
  /**
   * Window border width.
   */
  borderWidth: number;
  /**
   * Window enable flag.
   */
  enabled: boolean;
  /**
   * Start time offset in seconds.
   */
  offset: number;
}

export class SelectionWindowModel extends Model<SelectionWindowOptions> {
  static readonly defaultOptions: SelectionWindowOptions = {
    size: 5,
    startTime: 0,
    color: "#FFFF00",
    opacity: 0.75,
    borderWidth: 1,
    enabled: true,
    offset: 10,
  };

  constructor(options?: Partial<SelectionWindowOptions>) {
    const opts = {
      ...SelectionWindowModel.defaultOptions,
      ...options,
    } as SelectionWindowOptions;
    super(opts);
  }

  getSize(): number {
    return this.options.size;
  }

  setSize(size: number): void {
    this.options.size = size;
  }

  getStartTime(): number {
    return this.options.startTime;
  }

  setStartTime(startTime: number): void {
    this.options.startTime = startTime;
  }

  setCenterTime(centerTime: number): void {
    const { size } = this.options;
    this.setStartTime(centerTime - (size * ONE_MINUTE) / 2);
  }

  getCenterTime(): number {
    const { size } = this.options;
    return this.getStartTime() + size * ONE_MINUTE;
  }

  getEndTime(): number {
    const { size, startTime } = this.options;
    return startTime + size * ONE_MINUTE;
  }

  getWindow(): [number, number] {
    return [this.getStartTime(), this.getEndTime()];
  }

  contains(time: number): boolean {
    const [start, end] = this.getWindow();
    return time >= start && time <= end;
  }

  between(start: number, end: number): boolean {
    const [windowStart, windowEnd] = this.getWindow();
    return start <= windowStart && end >= windowEnd;
  }

  add(size: number): void {
    const startTime = this.getStartTime();
    +size * ONE_MINUTE;
    this.setStartTime(startTime);
  }

  subtract(size: number): void {
    const startTime = this.getStartTime();
    -size * ONE_MINUTE;
    this.setStartTime(startTime);
  }
}
