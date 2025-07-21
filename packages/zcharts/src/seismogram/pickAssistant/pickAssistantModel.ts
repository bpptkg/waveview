import { Model } from "../../core/model";
import { ModelOptions } from "../../util/types";

export interface PickAssistantOptions extends ModelOptions {
  start: number;
  end: number;
  color?: string;
  startLineColor?: string;
  endLineColor?: string;
  opacity?: number;
  lineWidth?: number;
  lineType?: "solid" | "dashed" | "dotted";
  lineDash?: number[];
  lineCap?: "butt" | "round" | "square";
  lineJoin?: "bevel" | "round" | "miter";
}

export class PickAssistantModel extends Model<PickAssistantOptions> {
  static defaultOptions(): PickAssistantOptions {
    return {
      start: 0,
      end: 0,
      color: "#FF0000",
      startLineColor: "#FF3A30",
      endLineColor: "#0040DD",
      lineWidth: 2,
      lineType: "solid",
      lineDash: [5, 5],
      opacity: 1,
      lineCap: "round",
      lineJoin: "round",
    };
  }

  constructor(options: Partial<PickAssistantOptions>) {
    const opts = { ...PickAssistantModel.defaultOptions(), ...options };
    super(opts);
  }

  isEmpty(): boolean {
    return this.options.start === 0 && this.options.end === 0;
  }

  clear(): void {
    this.mergeOptions({ start: 0, end: 0 });
  }
}
