import * as PIXI from "pixi.js";
import { DateAdapter, DefaultDateAdapter, TimeUnit } from "../adapters/date";
import { Axis } from "../model/axis";
import { Scale, ScaleOptions, Tick } from "../model/scale";
import { Range } from "../types/range";
import { isFinite, isNullOrUndef } from "../util/common";

function getTextSize(text: string): { width: number; height: number } {
  const graphics = new PIXI.Text({
    text,
    style: {
      fontSize: "12px",
      fontFamily: "Arial",
    },
  });
  return { width: graphics.width, height: graphics.height };
}

export interface TimeTick extends Tick {
  unit: TimeUnit;
}

interface Interval {
  common: boolean;
  size: number;
  steps: number;
}

const INTERVALS: Record<TimeUnit, Interval> = {
  millisecond: { common: true, size: 1, steps: 1000 },
  second: { common: true, size: 1000, steps: 60 },
  minute: { common: true, size: 60000, steps: 60 },
  hour: { common: true, size: 3600000, steps: 24 },
  day: { common: true, size: 86400000, steps: 30 },
  week: { common: false, size: 604800000, steps: 4 },
  month: { common: true, size: 2.628e9, steps: 12 },
  quarter: { common: false, size: 7.884e9, steps: 4 },
  year: { common: true, size: 3.154e10, steps: 1 },
};

const UNITS: TimeUnit[] = Object.keys(INTERVALS) as TimeUnit[];

function determineUnitForFormatting(
  scale: TimeScale,
  numTicks: number,
  minUnit: TimeUnit,
  min: number,
  max: number
): TimeUnit {
  for (let i = UNITS.length - 1; i >= UNITS.indexOf(minUnit); i--) {
    const unit = UNITS[i];
    if (
      INTERVALS[unit].common &&
      scale.adapter.diff(max, min, unit) >= numTicks - 1
    ) {
      return unit;
    }
  }
  return UNITS[minUnit ? UNITS.indexOf(minUnit) : 0];
}

function determineMajorUnit(unit: TimeUnit): TimeUnit | undefined {
  for (let i = UNITS.indexOf(unit) + 1, ilen = UNITS.length; i < ilen; ++i) {
    if (INTERVALS[UNITS[i]].common) {
      return UNITS[i];
    }
  }
}

function setMajorTicks(
  scale: TimeScale,
  ticks: TimeTick[],
  map: Record<number, number>,
  majorUnit: TimeUnit
): TimeTick[] {
  const adapter = scale.adapter;
  const first = +adapter.startOf(ticks[0].value, majorUnit);
  const last = ticks[ticks.length - 1].value;
  let major, index;

  for (
    major = first;
    major <= last;
    major = +adapter.add(major, 1, majorUnit)
  ) {
    index = map[major];
    if (index >= 0) {
      ticks[index].major = true;
      ticks[index].unit = majorUnit;
    }
  }
  return ticks;
}

function getTimestampsForTicks(
  scale: TimeScale,
  min: number,
  max: number,
  unit: TimeUnit,
  includeBounds: boolean = false
): number[] {
  const adapter = scale.adapter;
  const timestamps: number[] = [];
  const first = adapter.startOf(min, unit);
  const last = adapter.endOf(max, unit);
  const limit = 200;
  let count = +adapter.diff(last, first, unit);
  const stepSize = Math.max(1, Math.ceil(count / limit));

  let time = first;

  do {
    timestamps.push(time);
    time = +adapter.add(time, stepSize, unit);
  } while (time <= last);

  if (includeBounds && timestamps[timestamps.length - 1] !== last) {
    timestamps.push(last);
  }
  return timestamps.filter((value) => value >= min && value <= max);
}

function ticksFromTimestamps(
  scale: TimeScale,
  values: number[],
  unit: TimeUnit,
  majorUnit?: TimeUnit
): TimeTick[] {
  const ticks: TimeTick[] = [];
  const map: Record<number, number> = {};
  const ilen = values.length;
  let i, value;

  for (i = 0; i < ilen; ++i) {
    value = values[i];
    map[value] = i;

    ticks.push({
      value,
      major: false,
      unit: unit,
    });
  }

  // We set the major ticks separately from the above loop because calling startOf for every tick
  // is expensive when there is a large number of ticks
  //   return ticks;
  return ilen === 0 || !majorUnit
    ? ticks
    : setMajorTicks(scale, ticks, map, majorUnit);
}

export class TimeScale extends Scale {
  static id = "time";
  readonly adapter: DateAdapter;

  constructor(axis: Axis, options: ScaleOptions) {
    super(axis, options);
    this.adapter = new DefaultDateAdapter({});
  }

  override determineDataLimits(options: ScaleOptions): Range {
    const { dataMin, dataMax, userMin, userMax } = options;
    const today = new Date().getTime();
    const yesterday = today - 1e3 * 60 * 60 * 10;

    let min = dataMin;
    if (!isNullOrUndef(userMin)) {
      min = userMin;
    } else {
      min = isFinite(min) ? min : yesterday;
    }

    let max = dataMax;
    if (!isNullOrUndef(userMax)) {
      max = userMax;
    } else {
      max = isFinite(max) ? max : today;
    }

    min = Math.min(min, max);
    max = Math.max(min, max);

    return { min, max };
  }

  override buildTicks(): TimeTick[] {
    const unit = determineUnitForFormatting(
      this,
      11,
      "millisecond",
      this.min,
      this.max
    );
    const majorUnit = determineMajorUnit(unit);
    const ticks = ticksFromTimestamps(
      this,
      getTimestampsForTicks(this, this.min, this.max, unit),
      unit,
      majorUnit ?? unit
    );
    return ticks;
  }

  override getLabelForValue(tick: TimeTick): string {
    return this.adapter.format(tick.value, tick.unit);
  }

  override getPixelForValue(value: number): number {
    const range = this.getRange();
    if (range === 0) {
      return 0;
    }

    return this.getPixelForDecimal((value - this.min) / range);
  }

  override getValueForPixel(pixel: number): number {
    const range = this.getRange();
    if (range === 0) {
      return this.min;
    }

    return this.getDecimalForPixel(pixel) * range + this.min;
  }

  override drawMinorTickLabels(tick: TimeTick, numTicks: number): boolean {
    const label = this.getLabelForValue(tick);
    const width = this.axis.getWidth();
    const height = this.axis.getHeight();
    const size = getTextSize(label);
    const length = this.isHorizontal() ? width : height;
    const capacity = Math.floor(length / (size.width + 5));
    return capacity > numTicks;
  }
}
