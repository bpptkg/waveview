import { DateAdapter, DefaultDateAdapter, ONE_MINUTE } from "../util/time";
import { ScaleTick, TimeUnit } from "../util/types";
import { GetTicksOptions, Scale, ScaleOptions } from "./scale";

export interface TimeScaleTick extends ScaleTick {
  unit: TimeUnit;
  major?: boolean;
}

export interface TimeScaleOptions extends ScaleOptions {
  useUTC?: boolean;
  locale?: string;
}

export class TimeScale extends Scale<TimeScaleOptions> {
  readonly adapter: DateAdapter = new DefaultDateAdapter({});

  constructor(options?: TimeScaleOptions) {
    super(options);
    if (options?.min !== undefined && options?.max !== undefined) {
      this.setExtent([options.min, options.max]);
    } else {
      const end = Date.now();
      const start = end - 5 * ONE_MINUTE;
      this.setExtent([start, end]);
    }
  }

  static fromJSON(options: TimeScaleOptions): TimeScale {
    return new TimeScale(options);
  }

  override getLabel(tick: TimeScaleTick): string {
    const { useUTC = false, locale } = this.getOptions();
    return this.adapter.format(tick.value, tick.unit, useUTC, locale);
  }

  override calcNiceExtent(): void {
    const [min, max] = this.getExtent();
    const range = max - min;
    const spacing = Math.pow(10, Math.floor(Math.log10(range)));
    this._extent = [
      Math.floor(min / spacing) * spacing,
      Math.ceil(max / spacing) * spacing,
    ];
  }

  override getTicks(options?: GetTicksOptions): ScaleTick[] {
    const { width = 100 } = options || {};

    const [min, max] = this.getExtent();
    const axisWidth = width;
    const { majorTicks, minorTicks, majorUnit, minorUnit } = calculateTimeTicks(
      min,
      max,
      axisWidth
    );
    const ticks: TimeScaleTick[] = majorTicks.map((tick) => ({
      value: tick,
      unit: majorUnit,
      major: true,
    }));
    const minorTickMap: Record<number, boolean> = {};
    minorTicks.forEach((tick) => {
      minorTickMap[tick] = true;
    });
    ticks.forEach((tick) => {
      if (minorTickMap[tick.value]) {
        tick.major = false;
        tick.unit = minorUnit;
      }
    });
    return ticks;
  }

  override getMinorTicks(_: number, options?: GetTicksOptions): ScaleTick[] {
    const { width = 100 } = options || {};
    const [min, max] = this.getExtent();
    const axisWidth = width;
    const { minorTicks, minorUnit } = calculateTimeTicks(min, max, axisWidth);
    return minorTicks.map((tick) => ({
      value: tick,
      unit: minorUnit,
      major: false,
    }));
  }

  override toJSON(): TimeScaleOptions {
    const { useUTC, locale } = this.getOptions();
    const [min, max] = this.getExtent();
    return {
      useUTC,
      min,
      max,
      locale,
    };
  }
}

interface TimeInterval {
  unit: TimeUnit;
  duration: number; // in milliseconds
}

interface TimeTicksResult {
  majorTicks: number[];
  minorTicks: number[];
  majorInterval: number;
  minorInterval: number;
  majorUnit: TimeUnit;
  minorUnit: TimeUnit;
}

function calculateTimeTicks(
  min: number,
  max: number,
  axisWidth: number
): TimeTicksResult {
  const targetMajorTickCount = Math.max(Math.floor(axisWidth / 100), 2);
  const range = max - min;
  const roughMajorInterval = range / targetMajorTickCount;

  const intervals: TimeInterval[] = [
    { unit: "millisecond", duration: 1 },
    { unit: "millisecond", duration: 2 },
    { unit: "millisecond", duration: 5 },
    { unit: "millisecond", duration: 10 },
    { unit: "millisecond", duration: 20 },
    { unit: "millisecond", duration: 50 },
    { unit: "millisecond", duration: 100 },
    { unit: "second", duration: 1000 },
    { unit: "second", duration: 5000 },
    { unit: "second", duration: 15000 },
    { unit: "second", duration: 30000 },
    { unit: "minute", duration: 60000 },
    { unit: "minute", duration: 300000 },
    { unit: "minute", duration: 900000 },
    { unit: "minute", duration: 1800000 },
    { unit: "hour", duration: 3600000 },
    { unit: "hour", duration: 10800000 },
    { unit: "hour", duration: 21600000 },
    { unit: "hour", duration: 43200000 },
    { unit: "day", duration: 86400000 },
    { unit: "week", duration: 604800000 },
    { unit: "month", duration: 2592000000 },
    { unit: "quarter", duration: 7776000000 },
    { unit: "year", duration: 31536000000 },
  ];

  // Choose major interval
  let major = intervals[0];
  for (const interval of intervals) {
    if (interval.duration >= roughMajorInterval) {
      major = interval;
      break;
    }
  }

  // Target minor ticks: at least 5x major, but cap to avoid too many ticks and
  // to avoid too small intervals
  let maxMinorTickCount = 100;
  let targetMinorInterval = (max - min) / maxMinorTickCount;

  let minor = intervals[0];
  for (const interval of intervals) {
    if (interval.duration >= targetMinorInterval) {
      minor = interval;
      break;
    }
  }

  // Align ticks
  const majorTicks: number[] = [];
  const minorTicks: number[] = [];

  const alignedMajorStart = Math.ceil(min / major.duration) * major.duration;
  const alignedMinorStart = Math.ceil(min / minor.duration) * minor.duration;

  for (let t = alignedMinorStart; t <= max; t += minor.duration) {
    minorTicks.push(t);
  }

  for (let t = alignedMajorStart; t <= max; t += major.duration) {
    majorTicks.push(t);
  }

  return {
    majorTicks,
    minorTicks,
    majorInterval: major.duration,
    minorInterval: minor.duration,
    majorUnit: major.unit,
    minorUnit: minor.unit,
  };
}
