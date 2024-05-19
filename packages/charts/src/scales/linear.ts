import { Scale, ScaleOptions, Tick } from "../model/scale";
import { Range } from "../types/range";

import { isFinite, isNullOrUndef } from "../util/common";
import { formatNumber } from "../util/intl";
import {
  almostEquals,
  almostWhole,
  decimalPlaces,
  niceNum,
  toRadians,
} from "../util/math";

export interface BuildTickOptions {
  bounds: "ticks" | "data";
  step?: number;
  min?: number;
  max?: number;
  precision?: number;
  count?: number;
  maxTicks: number;
  maxDigits: number;
  includeBounds: boolean;
  horizontal: boolean;
  minRotation: number;
}

/**
 * Generate a set of linear ticks for an axis
 * 1. If generationOptions.min, generationOptions.max, and generationOptions.step are defined:
 *    if (max - min) / step is an integer, ticks are generated as [min, min + step, ..., max]
 *    Note that the generationOptions.maxCount setting is respected in this scenario
 *
 * 2. If generationOptions.min, generationOptions.max, and generationOptions.count is defined
 *    spacing = (max - min) / count
 *    Ticks are generated as [min, min + spacing, ..., max]
 *
 * 3. If generationOptions.count is defined
 *    spacing = (niceMax - niceMin) / count
 *
 * 4. Compute optimal spacing of ticks using niceNum algorithm
 *
 * @param generationOptions the options used to generate the ticks
 * @param dataRange the range of the data
 * @returns {object[]} array of tick objects
 */
export function generateTicks(
  generationOptions: BuildTickOptions,
  dataRange: Range
): Tick[] {
  const ticks: Tick[] = [];
  // To get a "nice" value for the tick spacing, we will use the appropriately named
  // "nice number" algorithm. See https://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
  // for details.

  const MIN_SPACING = 1e-14;
  const {
    bounds,
    step,
    min,
    max,
    precision,
    count,
    maxTicks,
    maxDigits,
    includeBounds,
  } = generationOptions;
  const unit = step || 1;
  const maxSpaces = maxTicks - 1;
  const { min: rmin, max: rmax } = dataRange;
  const minDefined = !isNullOrUndef(min);
  const maxDefined = !isNullOrUndef(max);
  const countDefined = !isNullOrUndef(count);
  const minSpacing = (rmax - rmin) / (maxDigits + 1);
  let spacing = niceNum((rmax - rmin) / maxSpaces / unit) * unit;
  let factor, niceMin, niceMax, numSpaces;

  // Beyond MIN_SPACING floating point numbers being to lose precision
  // such that we can't do the math necessary to generate ticks
  if (spacing < MIN_SPACING && !minDefined && !maxDefined) {
    return [{ value: rmin, major: false }, { value: rmax, major: false }];
  }

  numSpaces = Math.ceil(rmax / spacing) - Math.floor(rmin / spacing);
  if (numSpaces > maxSpaces) {
    // If the calculated num of spaces exceeds maxNumSpaces, recalculate it
    spacing = niceNum((numSpaces * spacing) / maxSpaces / unit) * unit;
  }

  if (!isNullOrUndef(precision)) {
    // If the user specified a precision, round to that number of decimal places
    factor = Math.pow(10, precision);
    spacing = Math.ceil(spacing * factor) / factor;
  }

  if (bounds === "ticks") {
    niceMin = Math.floor(rmin / spacing) * spacing;
    niceMax = Math.ceil(rmax / spacing) * spacing;
  } else {
    niceMin = rmin;
    niceMax = rmax;
  }

  if (
    minDefined &&
    maxDefined &&
    step &&
    almostWhole((max - min) / step, spacing / 1000)
  ) {
    // Case 1: If min, max and stepSize are set and they make an evenly spaced scale use it.
    // spacing = step;
    // numSpaces = (max - min) / spacing;
    // Note that we round here to handle the case where almostWhole translated an FP error
    numSpaces = Math.round(Math.min((max - min) / spacing, maxTicks));
    spacing = (max - min) / numSpaces;
    niceMin = min;
    niceMax = max;
  } else if (countDefined) {
    // Cases 2 & 3, we have a count specified. Handle optional user defined edges to the range.
    // Sometimes these are no-ops, but it makes the code a lot clearer
    // and when a user defined range is specified, we want the correct ticks
    niceMin = minDefined ? min : niceMin;
    niceMax = maxDefined ? max : niceMax;
    numSpaces = count - 1;
    spacing = (niceMax - niceMin) / numSpaces;
  } else {
    // Case 4
    numSpaces = (niceMax - niceMin) / spacing;

    // If very close to our rounded value, use it.
    if (almostEquals(numSpaces, Math.round(numSpaces), spacing / 1000)) {
      numSpaces = Math.round(numSpaces);
    } else {
      numSpaces = Math.ceil(numSpaces);
    }
  }

  // The spacing will have changed in cases 1, 2, and 3 so the factor cannot be computed
  // until this point
  const decPlaces = Math.max(decimalPlaces(spacing), decimalPlaces(niceMin));
  factor = Math.pow(10, isNullOrUndef(precision) ? decPlaces : precision);
  niceMin = Math.round(niceMin * factor) / factor;
  niceMax = Math.round(niceMax * factor) / factor;

  let j = 0;
  if (minDefined) {
    if (includeBounds && niceMin !== min) {
      ticks.push({ value: min, major: false });

      if (niceMin < min) {
        j++; // Skip niceMin
      }
      // If the next nice tick is close to min, skip it
      if (
        almostEquals(
          Math.round((niceMin + j * spacing) * factor) / factor,
          min,
          relativeLabelSize(min, minSpacing, generationOptions)
        )
      ) {
        j++;
      }
    } else if (niceMin < min) {
      j++;
    }
  }

  for (; j < numSpaces; ++j) {
    const tickValue = Math.round((niceMin + j * spacing) * factor) / factor;
    if (maxDefined && tickValue > max) {
      break;
    }
    ticks.push({ value: tickValue, major: false });
  }

  if (maxDefined && includeBounds && niceMax !== max) {
    // If the previous tick is too close to max, replace it with max, else add max
    if (
      ticks.length &&
      almostEquals(
        ticks[ticks.length - 1].value,
        max,
        relativeLabelSize(max, minSpacing, generationOptions)
      )
    ) {
      ticks[ticks.length - 1].value = max;
    } else {
      ticks.push({ value: max, major: false });
    }
  } else if (!maxDefined || niceMax === max) {
    ticks.push({ value: niceMax, major: false });
  }

  return ticks;
}

export function relativeLabelSize(
  value: number,
  minSpacing: number,
  opts: BuildTickOptions
): number {
  const { horizontal, minRotation } = opts;
  const rad = toRadians(minRotation);
  const ratio = (horizontal ? Math.sin(rad) : Math.cos(rad)) || 0.001;
  const length = 0.75 * minSpacing * ("" + value).length;
  return Math.min(minSpacing / ratio, length);
}

export class LinearScale extends Scale {
  static id = "linear";

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

  getMaxTicks() {
    const { step, maxTicksLimit } = this.options.ticks || {};
    let maxTicks, maxTicksCount;
    const [min, max] = this.getExtent();

    if (step) {
      maxTicks = Math.ceil(max / step) - Math.floor(min / step) + 1;
      if (maxTicks > 1000) {
        console.warn(
          `scales.ticks.stepSize: ${step} would result generating up to ${maxTicks} ticks. Limiting to 1000.`
        );
        maxTicks = 1000;
      }
    } else {
      maxTicks = Number.POSITIVE_INFINITY;
      maxTicksCount = maxTicksLimit || 11;
    }

    if (maxTicksCount) {
      maxTicks = Math.min(maxTicksCount, maxTicks);
    }

    return maxTicks;
  }

  override buildTicks(): Tick[] {
    let maxTicks = this.getMaxTicks();
    maxTicks = Math.max(2, maxTicks);
    const [min, max] = this.getExtent();

    const start = min;
    const end = max;
    const options = this.options;
    const tickOptions = this.options.ticks || {};

    const opts: BuildTickOptions = {
      bounds: options.bounds || "data",
      step: tickOptions.step,
      min: start,
      max: end,
      precision: tickOptions.precision,
      count: tickOptions.count,
      maxTicks,
      maxDigits: this.maxDigits(),
      includeBounds: tickOptions.includeBounds !== false,
      horizontal: this.isHorizontal(),
      minRotation: tickOptions.minRotation || 0,
    };

    let ticks = generateTicks(opts, { min: start, max: end });
    const count = 5;
    if (ticks.length > 2) {
      const step = (ticks[1].value - ticks[0].value) / count;
      for (let i = 0; i < ticks.length - 1; i++) {
        const start = ticks[i].value;
        for (let j = 1; j < count; j++) {
          ticks.push({ value: start + step * j, major: false });
        }
      }
    }
    // Sort the ticks by value
    ticks = ticks.sort((a, b) => a.value - b.value);
    if (this.options.reverse) {
      ticks.reverse();
    }
    return ticks;
  }

  // override buildMinorTicks(): Tick[] {
  //   const ticks = this.buildTicks();
  //   const minorTicks: Tick[] = [];
  //   const count = 5;
  //   const step = (ticks[1].value - ticks[0].value) / count;
  //   for (let i = 0; i < ticks.length - 1; i++) {
  //     const start = ticks[i].value;
  //     for (let j = 1; j < count; j++) {
  //       minorTicks.push({ value: start + step * j });
  //     }
  //   }
  //   return minorTicks;
  // }

  override getLabelForValue(tick: Tick): string {
    const formatter = this.options.formatter;
    if (formatter) {
      return formatter(tick.value);
    }
    return formatNumber(tick.value);
  }

  override getPixelForValue(value: number): number {
    const range = this.getRange();
    if (range === 0) {
      return 0;
    }

    return this.getPixelForDecimal((value - this.min) / range);
  }

  override getValueForPixel(pixel: number): number {
    const range = this.max - this.min;
    if (range === 0) {
      return this.min;
    }

    return this.getDecimalForPixel(pixel) * range + this.min;
  }
}
