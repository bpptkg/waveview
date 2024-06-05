import { DateAdapter, DefaultDateAdapter } from "../util/time";
import { ScaleTick, TimeUnit } from "../util/types";
import { Scale, ScaleOptions } from "./scale";

export interface TimeScaleTick extends ScaleTick {
  unit: TimeUnit;
  major?: boolean;
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

function determineUnit(
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
  ticks: TimeScaleTick[],
  map: Record<number, number>,
  majorUnit: TimeUnit
): TimeScaleTick[] {
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

export interface TimeScaleOptions extends ScaleOptions {
  isUTC?: boolean;
}

export class TimeScale extends Scale<TimeScaleOptions> {
  readonly adapter: DateAdapter = new DefaultDateAdapter({});

  constructor(options?: TimeScaleOptions) {
    super(options);
  }

  override getLabel(tick: TimeScaleTick): string {
    const { isUTC = false } = this.getOptions();
    return this.adapter.format(tick.value, tick.unit, isUTC);
    // return ''
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

  override getTicks(): TimeScaleTick[] {
    const { reverse } = this.getOptions();
    const [min, max] = this.getExtent();
    const numTicks = 11;
    const minUnit: TimeUnit = "millisecond";
    const unit = determineUnit(this, numTicks, minUnit, min, max);
    const majorUnit = determineMajorUnit(unit);
    const ticks: TimeScaleTick[] = [];
    let tick: number;
    const map: Record<number, number> = {};

    const totalRange = this.adapter.diff(max, min, unit);
    const interval = Math.floor(totalRange / (numTicks - 1));

    for (let i = 0; i < numTicks; i++) {
      tick = +this.adapter.add(min, interval * i, unit);

      ticks.push({ value: tick, unit, major: false });
      map[tick] = i;
    }

    if (reverse) {
      ticks.reverse();
    }
    return majorUnit ? setMajorTicks(this, ticks, map, majorUnit) : ticks;
  }

  override getMinorTicks(splitNumber: number): ScaleTick[] {
    let ticks = this.getTicks();
    const minorTicks: ScaleTick[] = [];
    if (ticks.length > 2) {
      const step = (ticks[1].value - ticks[0].value) / splitNumber;
      for (let i = 0; i < ticks.length - 1; i++) {
        const start = ticks[i].value;
        for (let j = 1; j < splitNumber; j++) {
          minorTicks.push({ value: start + step * j });
        }
      }
    }
    return minorTicks;
  }
}
