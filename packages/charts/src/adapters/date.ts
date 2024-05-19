import { format } from "date-fns";
import type { ChartOptions } from "../model/chart";
import type { AnyObject } from "../types/object";

export type TimeUnit =
  | "millisecond"
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year";

export interface DateAdapter<T extends AnyObject = AnyObject> {
  readonly options: T;
  /**
   * Will called with chart options after adapter creation.
   */
  init(this: DateAdapter<T>, chartOptions: ChartOptions): void;
  /**
   * Returns a map of time formats for the supported formatting units defined
   * in Unit as well as 'datetime' representing a detailed date/time string.
   */
  formats(this: DateAdapter<T>): Record<string, string>;
  /**
   * Parses the given `value` and return the associated timestamp.
   * @param value - the value to parse (usually comes from the data)
   * @param [format] - the expected data format
   */
  parse(this: DateAdapter<T>, value: unknown, format?: TimeUnit): number | null;
  /**
   * Returns the formatted date in the specified `format` for a given `timestamp`.
   * @param timestamp - the timestamp to format
   * @param format - the date/time token
   */
  format(this: DateAdapter<T>, timestamp: number, format: TimeUnit): string;
  /**
   * Adds the specified `amount` of `unit` to the given `timestamp`.
   * @param timestamp - the input timestamp
   * @param amount - the amount to add
   * @param unit - the unit as string
   */
  add(
    this: DateAdapter<T>,
    timestamp: number,
    amount: number,
    unit: TimeUnit
  ): number;
  /**
   * Returns the number of `unit` between the given timestamps.
   * @param a - the input timestamp (reference)
   * @param b - the timestamp to subtract
   * @param unit - the unit as string
   */
  diff(this: DateAdapter<T>, a: number, b: number, unit: TimeUnit): number;
  /**
   * Returns start of `unit` for the given `timestamp`.
   * @param timestamp - the input timestamp
   * @param unit - the unit as string
   * @param [weekday] - the ISO day of the week with 1 being Monday
   * and 7 being Sunday (only needed if param *unit* is `isoWeek`).
   */
  startOf(
    this: DateAdapter<T>,
    timestamp: number,
    unit: TimeUnit | "isoWeek",
    weekday?: number
  ): number;
  /**
   * Returns end of `unit` for the given `timestamp`.
   * @param timestamp - the input timestamp
   * @param unit - the unit as string
   */
  endOf(
    this: DateAdapter<T>,
    timestamp: number,
    unit: TimeUnit | "isoWeek"
  ): number;
}

function abstract<T = void>(): T {
  throw new Error(
    "This method is not implemented: Check that a complete date adapter is provided."
  );
}

/**
 * Date adapter (current used by the time scale) to handle time related logic.
 */
export class DefaultDateAdapter implements DateAdapter {
  /**
   * Override default date adapter methods.
   * Accepts type parameter to define options type.
   */
  static override<T extends AnyObject = AnyObject>(
    members: Partial<Omit<DateAdapter<T>, "options">>
  ) {
    Object.assign(DefaultDateAdapter.prototype, members);
  }

  readonly options: AnyObject;

  constructor(options: AnyObject) {
    this.options = options || {};
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {}

  formats(): Record<string, string> {
    return abstract();
  }

  parse(): number | null {
    return abstract();
  }

  format(value: number, unit: TimeUnit): string {
    const date = new Date(value);
    switch (unit) {
      case "millisecond":
        return format(date, ".SSS");
      case "second":
        return format(date, ":ss");
      case "minute":
        return format(date, "HH:mm");
      case "hour":
        return format(date, "HH mm");
      case "day":
        return format(date, "eee dd");
      case "week":
        return format(date, "MMM dd");
      case "month":
        return format(date, "MMMM");
      case "quarter":
        return format(date, "Q");
      case "year":
        return format(date, "yyyy");
    }
  }

  add(a: number, delta: number, unit: TimeUnit): number {
    switch (unit) {
      case "millisecond":
        return a + delta;
      case "second":
        return a + delta * 1000;
      case "minute":
        return a + delta * 60000;
      case "hour":
        return a + delta * 3600000;
      case "day":
        return a + delta * 86400000;
      case "week":
        return a + delta * 604800000;
      case "month":
        return this.add(a, delta, "day");
      case "quarter":
        return this.add(a, delta * 3, "month");
      case "year":
        return this.add(a, delta, "day");
    }
  }

  monthDiff(a: number, b: number): number {
    return (
      (new Date(b).getFullYear() - new Date(a).getFullYear()) * 12 +
      new Date(b).getMonth() -
      new Date(a).getMonth()
    );
  }

  yearDiff(a: number, b: number): number {
    return new Date(b).getFullYear() - new Date(a).getFullYear();
  }

  diff(a: number, b: number, unit: TimeUnit): number {
    const delta = a - b;
    switch (unit) {
      case "millisecond":
        return delta;
      case "second":
        return Math.round(delta / 1000);
      case "minute":
        return Math.round(delta / 60000);
      case "hour":
        return Math.round(delta / 3600000);
      case "day":
        return Math.round(delta / 86400000);
      case "week":
        return Math.round(delta / 604800000);
      case "month":
        return this.monthDiff(a, b);
      case "quarter":
        return this.monthDiff(a, b) / 3;
      case "year":
        return this.yearDiff(a, b);
    }
  }

  startOf(value: number, unit: TimeUnit): number {
    switch (unit) {
      case "millisecond":
        return value;
      case "second":
        return value - (value % 1000);
      case "minute":
        return value - (value % 60000);
      case "hour":
        return value - (value % 3600000);
      case "day":
      case "week":
        return value - (value % 86400000);
      case "month":
        return value - (value % 2592000000);
      case "quarter":
        return value - (value % 7776000000);
      case "year":
        return value - (value % 31536000000);
    }
  }

  endOf(value: number, unit: TimeUnit): number {
    switch (unit) {
      case "millisecond":
        return value;
      case "second":
        return value + (999 - (value % 1000));
      case "minute":
        return value + (59999 - (value % 60000));
      case "hour":
        return value + (3599999 - (value % 3600000));
      case "day":
      case "week":
        return value + (86399999 - (value % 86400000));
      case "month":
        const date = new Date(value);
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getTime();
      case "quarter":
        return this.endOf(this.add(value, 1, "month"), "month");
      case "year":
        return new Date(new Date(value).getFullYear() + 1, 0, 0).getTime();
    }
  }
}
