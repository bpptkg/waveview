import { niceNum } from "../util/math";
import { ScaleTick } from "../util/types";
import { Scale, ScaleOptions } from "./scale";

export interface LinearScaleOptions extends ScaleOptions {}

export class LinearScale extends Scale<LinearScaleOptions> {
  constructor(options?: LinearScaleOptions) {
    super(options);
  }

  override getLabel(tick: ScaleTick): string {
    return tick.value.toString();
  }

  override calcNiceExtent(): void {
    const [min, max] = this._extent;
    const range = niceNum(max - min);
    const spacing = niceNum(range);
    this._extent = [
      Math.floor(min / spacing) * spacing,
      Math.ceil(max / spacing) * spacing,
    ];
  }

  override getTicks(): ScaleTick[] {
    const { reverse } = this.getOptions();
    const [min, max] = this.getExtent();
    const maxTicks = 11;

    const range = niceNum(max - min);
    const spacing = niceNum(range / (maxTicks - 1));

    const ticks: ScaleTick[] = [];
    for (let value = min; value <= max; value += spacing) {
      ticks.push({ value });
    }

    if (reverse) {
      return ticks.reverse();
    }
    return ticks;
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
