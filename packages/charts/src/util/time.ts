import { ChartOptions } from "../model/chartModel";
import { getDefaultLocale, getLocale } from "./locale";
import { isNumber } from "./math";
import { TimeUnit } from "./types";

export const ONE_SECOND = 1000;
export const ONE_MINUTE = ONE_SECOND * 60;
export const ONE_HOUR = ONE_MINUTE * 60;
export const ONE_DAY = ONE_HOUR * 24;
export const ONE_YEAR = ONE_DAY * 365;

export type DateFormatterTemplate = { [key in TimeUnit]: string };

export const defaultFormatterTemplte: DateFormatterTemplate = {
  year: "{yyyy}",
  month: "{MMM}",
  day: "{d}",
  hour: "{HH}:{mm}",
  minute: "{HH}:{mm}",
  second: "{HH}:{mm}:{ss}",
  millisecond: "{ss}.{SSS}",
  week: "{yyyy}-{MM}-{dd}",
  quarter: "{yyyy}-{MM}-{dd}",
};

export const fullDayFormatter = "{yyyy}-{MM}-{dd}";

export function pad(str: string | number, len: number): string {
  str += "";
  return "0000".substr(0, len - (str as string).length) + str;
}

// eslint-disable-next-line
const TIME_REG =
  /^(?:(\d{4})(?:[-\/](\d{1,2})(?:[-\/](\d{1,2})(?:[T ](\d{1,2})(?::(\d{1,2})(?::(\d{1,2})(?:[.,](\d+))?)?)?(Z|[\+\-]\d\d:?\d\d)?)?)?)?)?$/; // jshint ignore:line

/**
 * @param value valid type: number | string | Date, otherwise return `new Date(NaN)`
 *   These values can be accepted:
 *   + An instance of Date, represent a time in its own time zone.
 *   + Or string in a subset of ISO 8601, only including:
 *     + only year, month, date: '2012-03', '2012-03-01', '2012-03-01 05', '2012-03-01 05:06',
 *     + separated with T or space: '2012-03-01T12:22:33.123', '2012-03-01 12:22:33.123',
 *     + time zone: '2012-03-01T12:22:33Z', '2012-03-01T12:22:33+8000', '2012-03-01T12:22:33-05:00',
 *     all of which will be treated as local time if time zone is not specified
 *     (see <https://momentjs.com/>).
 *   + Or other string format, including (all of which will be treated as local time):
 *     '2012', '2012-3-1', '2012/3/1', '2012/03/01',
 *     '2009/6/12 2:00', '2009/6/12 2:05:08', '2009/6/12 2:05:08.123'
 *   + a timestamp, which represent a time in UTC.
 * @return date Never be null/undefined. If invalid, return `new Date(NaN)`.
 */
export function parseDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  } else if (typeof value === "string") {
    // Different browsers parse date in different way, so we parse it manually.
    // Some other issues:
    // new Date('1970-01-01') is UTC,
    // new Date('1970/01/01') and new Date('1970-1-01') is local.
    // See issue #3623
    const match = TIME_REG.exec(value);

    if (!match) {
      // return Invalid Date.
      return new Date(NaN);
    }

    // Use local time when no timezone offset is specified.
    if (!match[8]) {
      // match[n] can only be string or undefined.
      // But take care of '12' + 1 => '121'.
      return new Date(
        +match[1],
        +(match[2] || 1) - 1,
        +match[3] || 1,
        +match[4] || 0,
        +(match[5] || 0),
        +match[6] || 0,
        match[7] ? +match[7].substring(0, 3) : 0
      );
    }
    // Timezoneoffset of Javascript Date has considered DST (Daylight Saving Time,
    // https://tc39.github.io/ecma262/#sec-daylight-saving-time-adjustment).
    // For example, system timezone is set as "Time Zone: America/Toronto",
    // then these code will get different result:
    // `new Date(1478411999999).getTimezoneOffset();  // get 240`
    // `new Date(1478412000000).getTimezoneOffset();  // get 300`
    // So we should not use `new Date`, but use `Date.UTC`.
    else {
      let hour = +match[4] || 0;
      if (match[8].toUpperCase() !== "Z") {
        hour -= +match[8].slice(0, 3);
      }
      return new Date(
        Date.UTC(
          +match[1],
          +(match[2] || 1) - 1,
          +match[3] || 1,
          hour,
          +(match[5] || 0),
          +match[6] || 0,
          match[7] ? +match[7].substring(0, 3) : 0
        )
      );
    }
  } else if (value == null) {
    return new Date(NaN);
  }

  return new Date(Math.round(value as number));
}

export function getUnitFromValue(
  value: number | string | Date,
  isUTC: boolean
): TimeUnit {
  const date = parseDate(value);
  const M = (date as any)[monthGetterName(isUTC)]() + 1;
  const d = (date as any)[dateGetterName(isUTC)]();
  const h = (date as any)[hoursGetterName(isUTC)]();
  const m = (date as any)[minutesGetterName(isUTC)]();
  const s = (date as any)[secondsGetterName(isUTC)]();
  const S = (date as any)[millisecondsGetterName(isUTC)]();

  const isSecond = S === 0;
  const isMinute = isSecond && s === 0;
  const isHour = isMinute && m === 0;
  const isDay = isHour && h === 0;
  const isMonth = isDay && d === 1;
  const isYear = isMonth && M === 1;

  if (isYear) {
    return "year";
  } else if (isMonth) {
    return "month";
  } else if (isDay) {
    return "day";
  } else if (isHour) {
    return "hour";
  } else if (isMinute) {
    return "minute";
  } else if (isSecond) {
    return "second";
  } else {
    return "millisecond";
  }
}

export function getUnitValue(
  value: number | Date,
  unit: TimeUnit,
  isUTC: boolean
): number {
  const date = isNumber(value) ? parseDate(value) : value;
  unit = unit || getUnitFromValue(value, isUTC);

  switch (unit) {
    case "year":
      return date[fullYearGetterName(isUTC)]();
    case "quarter":
      return Math.floor((date[monthGetterName(isUTC)]() + 1) / 4);
    case "month":
      return date[monthGetterName(isUTC)]();
    case "day":
      return date[dateGetterName(isUTC)]();
    case "hour":
      return date[hoursGetterName(isUTC)]();
    case "minute":
      return date[minutesGetterName(isUTC)]();
    case "second":
      return date[secondsGetterName(isUTC)]();
    case "millisecond":
      return date[millisecondsGetterName(isUTC)]();
    default:
      throw new Error("Unknown unit: " + unit);
  }
}

export function fullYearGetterName(isUTC: boolean) {
  return isUTC ? "getUTCFullYear" : "getFullYear";
}

export function monthGetterName(isUTC: boolean) {
  return isUTC ? "getUTCMonth" : "getMonth";
}

export function dateGetterName(isUTC: boolean) {
  return isUTC ? "getUTCDate" : "getDate";
}

export function hoursGetterName(isUTC: boolean) {
  return isUTC ? "getUTCHours" : "getHours";
}

export function minutesGetterName(isUTC: boolean) {
  return isUTC ? "getUTCMinutes" : "getMinutes";
}

export function secondsGetterName(isUTC: boolean) {
  return isUTC ? "getUTCSeconds" : "getSeconds";
}

export function millisecondsGetterName(isUTC: boolean) {
  return isUTC ? "getUTCMilliseconds" : "getMilliseconds";
}

export function fullYearSetterName(isUTC: boolean) {
  return isUTC ? "setUTCFullYear" : "setFullYear";
}

export function monthSetterName(isUTC: boolean) {
  return isUTC ? "setUTCMonth" : "setMonth";
}

export function dateSetterName(isUTC: boolean) {
  return isUTC ? "setUTCDate" : "setDate";
}

export function hoursSetterName(isUTC: boolean) {
  return isUTC ? "setUTCHours" : "setHours";
}

export function minutesSetterName(isUTC: boolean) {
  return isUTC ? "setUTCMinutes" : "setMinutes";
}

export function secondsSetterName(isUTC: boolean) {
  return isUTC ? "setUTCSeconds" : "setSeconds";
}

export function millisecondsSetterName(isUTC: boolean) {
  return isUTC ? "setUTCMilliseconds" : "setMilliseconds";
}

export function formatDate(
  // Note: The result based on `isUTC` are totally different, which can not be just simply
  // substituted by the result without `isUTC`. So we make the param `isUTC` mandatory.
  time: unknown,
  template: string,
  isUTC: boolean,
  lang?: string
): string {
  const date = parseDate(time);
  const y = date[fullYearGetterName(isUTC)]();
  const M = date[monthGetterName(isUTC)]() + 1;
  const q = Math.floor((M - 1) / 3) + 1;
  const d = date[dateGetterName(isUTC)]();
  const e =
    date[("get" + (isUTC ? "UTC" : "") + "Day") as "getDay" | "getUTCDay"]();
  const H = date[hoursGetterName(isUTC)]();
  const h = ((H - 1) % 12) + 1;
  const m = date[minutesGetterName(isUTC)]();
  const s = date[secondsGetterName(isUTC)]();
  const S = date[millisecondsGetterName(isUTC)]();
  const a = H >= 12 ? "pm" : "am";
  const A = a.toUpperCase();

  const locale = lang ? getLocale(lang) : getDefaultLocale();
  const timeLocale = locale.time;
  const month = timeLocale.month;
  const monthAbbr = timeLocale.monthAbbr;
  const dayOfWeek = timeLocale.dayOfWeek;
  const dayOfWeekAbbr = timeLocale.dayOfWeekAbbr;

  return (template || "")
    .replace(/{a}/g, a + "")
    .replace(/{A}/g, A + "")
    .replace(/{yyyy}/g, y + "")
    .replace(/{yy}/g, pad((y % 100) + "", 2))
    .replace(/{Q}/g, q + "")
    .replace(/{MMMM}/g, month[M - 1])
    .replace(/{MMM}/g, monthAbbr[M - 1])
    .replace(/{MM}/g, pad(M, 2))
    .replace(/{M}/g, M + "")
    .replace(/{dd}/g, pad(d, 2))
    .replace(/{d}/g, d + "")
    .replace(/{eeee}/g, dayOfWeek[e])
    .replace(/{ee}/g, dayOfWeekAbbr[e])
    .replace(/{e}/g, e + "")
    .replace(/{HH}/g, pad(H, 2))
    .replace(/{H}/g, H + "")
    .replace(/{hh}/g, pad(h + "", 2))
    .replace(/{h}/g, h + "")
    .replace(/{mm}/g, pad(m, 2))
    .replace(/{m}/g, m + "")
    .replace(/{ss}/g, pad(s, 2))
    .replace(/{s}/g, s + "")
    .replace(/{SSS}/g, pad(S, 3))
    .replace(/{S}/g, S + "");
}

export type AnyObject = Record<string, any>;

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
  format(
    this: DateAdapter<T>,
    timestamp: number,
    format: TimeUnit,
    isUTC: boolean
  ): string;
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

  format(value: number, unit: TimeUnit, isUTC: boolean): string {
    return formatDate(value, defaultFormatterTemplte[unit], isUTC);
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
        return value + (1000 - (value % 1000));
      case "minute":
        return value + (60000 - (value % 60000));
      case "hour":
        return value + (3600000 - (value % 3600000));
      case "day":
      case "week":
        return value + (86400000 - (value % 86400000));
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
