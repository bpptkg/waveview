import { ScaleTick } from "../util/types";
import { Scale } from "./scale";

export class TimeScale extends Scale {
  override getLabel(tick: ScaleTick): string {
    return tick.value.toString();
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

  override getTicks(): ScaleTick[] {
    return [];
  }

  override getMinorTicks(): ScaleTick[] {
    return [];
  }
}
