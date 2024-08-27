import { Model } from "../model/model";
import { ModelOptions } from "../util/types";

export interface PickerOptions extends ModelOptions {
  /**
   * The start of the range in UNIX timestamp.
   */
  start: number;
  /**
   * The end of the range in UNIX timestamp.
   */
  end: number;
  /**
   * Whether the picker is enabled. Default is `true`.
   */
  enable: boolean;
  /**
   * The precision value of the picker duration. Default is `2`.
   */
  precision: number;
}

export class PickerModel extends Model<PickerOptions> {
  override readonly type = "picker";

  static defaultOptions: PickerOptions = {
    enable: false,
    start: 0,
    end: 0,
    precision: 2,
  };

  constructor(options?: Partial<PickerOptions>) {
    super({ ...PickerModel.defaultOptions, ...options });
  }

  reset(): void {
    this.mergeOptions({ ...PickerModel.defaultOptions });
  }

  isEmpty(): boolean {
    return this.options.start === 0 || this.options.end === 0;
  }

  setStart(start: number): void {
    this.mergeOptions({ start });
  }

  setEnd(end: number): void {
    this.mergeOptions({ end });
  }

  setRange(range: [number, number]): void {
    const start = Math.min(range[0], range[1]);
    const end = Math.max(range[0], range[1]);
    this.mergeOptions({ start, end });
  }

  getRange(): [number, number] {
    const { start, end } = this.options;
    if (this.isEmpty()) {
      return [0, 0];
    } else {
      return [Math.min(start, end), Math.max(start, end)];
    }
  }

  clearRange(): void {
    this.mergeOptions({ start: 0, end: 0 });
  }

  enable(): void {
    this.mergeOptions({ enable: true });
  }

  disable(): void {
    this.mergeOptions({ enable: false });
  }

  isEnabled(): boolean {
    return this.options.enable;
  }
}
