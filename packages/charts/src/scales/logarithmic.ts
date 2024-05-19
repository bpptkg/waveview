import { Scale, ScaleOptions, Tick } from "../model/scale";
import { Range } from "../types/range";
import { finiteOrDefault, isFinite, isNullOrUndef } from "../util/common";
import { formatNumber } from "../util/intl";
import { log10 } from "../util/math";

const log10Floor = (v: number): number => Math.floor(log10(v));

function isMajor(tickVal: number): boolean {
  const remain = tickVal / Math.pow(10, log10Floor(tickVal));
  return remain === 1;
}

function steps(min: number, max: number, rangeExp: number): number {
  const rangeStep = Math.pow(10, rangeExp);
  const start = Math.floor(min / rangeStep);
  const end = Math.ceil(max / rangeStep);
  return end - start;
}

function startExp(min: number, max: number): number {
  const range = max - min;
  let rangeExp = log10Floor(range);
  while (steps(min, max, rangeExp) > 10) {
    rangeExp++;
  }
  while (steps(min, max, rangeExp) < 10) {
    rangeExp--;
  }
  return Math.min(rangeExp, log10Floor(min));
}

export interface GenerationOptions {
  min?: number;
  max?: number;
}

export interface LogTick extends Tick {
  major: boolean;
  significand: number;
}

/**
 * Generate a set of logarithmic ticks
 * @param generationOptions the options used to generate the ticks
 * @param dataRange the range of the data
 * @returns {object[]} array of tick objects
 */
function generateTicks(
  generationOptions: GenerationOptions,
  { min, max }: Range
): LogTick[] {
  min = finiteOrDefault(generationOptions.min, min);
  const ticks: LogTick[] = [];
  const minExp = log10Floor(min);
  let exp = startExp(min, max);
  let precision = exp < 0 ? Math.pow(10, Math.abs(exp)) : 1;
  const stepSize = Math.pow(10, exp);
  const base = minExp > exp ? Math.pow(10, minExp) : 0;
  const start = Math.round((min - base) * precision) / precision;
  const offset = Math.floor((min - base) / stepSize / 10) * stepSize * 10;
  let significand = Math.floor((start - offset) / Math.pow(10, exp));
  let value = finiteOrDefault(
    generationOptions.min,
    Math.round((base + offset + significand * Math.pow(10, exp)) * precision) /
      precision
  );
  while (value < max) {
    ticks.push({ value, major: isMajor(value), significand });
    if (significand >= 10) {
      significand = significand < 15 ? 15 : 20;
    } else {
      significand++;
    }
    if (significand >= 20) {
      exp++;
      significand = 2;
      precision = exp >= 0 ? 1 : precision;
    }
    value =
      Math.round(
        (base + offset + significand * Math.pow(10, exp)) * precision
      ) / precision;
  }
  const lastTick = finiteOrDefault(generationOptions.max, value);
  ticks.push({ value: lastTick, major: isMajor(lastTick), significand });

  return ticks;
}

export default class LogarithmicScale extends Scale {
  static id = "logarithmic";

  override determineDataLimits(options: ScaleOptions): Range {
    const { dataMin, dataMax, userMin, userMax, beginAtZero } = options;
    let min = dataMin;
    if (!isNullOrUndef(userMin)) {
      min = userMin;
    } else {
      min = isFinite(min) ? min : 0;
    }
    if (beginAtZero) {
      min = Math.min(min, 0);
    }

    let max = dataMax;
    if (!isNullOrUndef(userMax)) {
      max = userMax;
    } else {
      max = isFinite(max) ? max : 1;
    }

    min = Math.min(min, max);
    max = Math.max(min, max);

    return { min, max };
  }

  override buildTicks() {
    const generationOptions = {
      min: this.min,
      max: this.max,
    };
    const ticks = generateTicks(generationOptions, this);
    return ticks;
  }

  override getLabelForValue(tick: Tick): string {
    const value = tick.value;
    const formatter = this.options.formatter;
    if (formatter) {
      return formatter(value);
    }
    return value === undefined ? "0" : formatNumber(value);
  }

  override getPixelForValue(value: number): number {
    const start = this.min;
    const startValue = log10(start);
    const valueRange = log10(this.max) - log10(start);

    if (value === undefined || value === 0) {
      value = this.min;
    }
    if (value === null || isNaN(value)) {
      return NaN;
    }
    return this.getPixelForDecimal(
      value === this.min ? 0 : (log10(value) - startValue) / valueRange
    );
  }

  override getValueForPixel(pixel: number): number {
    const start = this.min;
    const startValue = log10(start);
    const valueRange = log10(this.max) - log10(start);

    const decimal = this.getDecimalForPixel(pixel);
    return Math.pow(10, startValue + decimal * valueRange);
  }
}
