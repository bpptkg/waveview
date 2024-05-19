import * as PIXI from "pixi.js";
import { LinearScale } from "../scales/linear";
import LogarithmicScale from "../scales/logarithmic";
import { TimeScale } from "../scales/time";
import { drawDash } from "../util/dashline";
import { Layout } from "./layout";
import { Scale, ScaleOptions } from "./scale";
import { Indicator } from "./indicator";

export type AxisPosition = "top" | "right" | "bottom" | "left";
export interface AxisTickOptions {
  show: boolean;
  length: number;
  inside: boolean;
}

export interface MinorTickOptions {
  show: boolean;
  length: number;
  splitNumber: number;
}

export interface AxisLabelOptions {
  show: boolean;
  inside: boolean;
  margin: number;
  formatter: (value: number) => string;
}

export interface SplitLineOptions {
  show: boolean;
}

export interface AxisOptions {
  position?: AxisPosition;
  type?: "linear" | "time" | "log";
  show?: boolean;
  min?: number;
  max?: number;
  name?: string;
  nameGap?: number;
  axisTick?: Partial<AxisTickOptions>;
  minorTick?: Partial<MinorTickOptions>;
  axisLabel?: Partial<AxisLabelOptions>;
  splitLine?: Partial<SplitLineOptions>;
}

export class Axis {
  readonly options: AxisOptions;
  readonly parentLayout: Layout;
  readonly layout: Layout;
  readonly scale: Scale;
  readonly group: PIXI.Container = new PIXI.Container();
  private _indicators: Indicator[] = [];

  constructor(layout: Layout, options: Partial<AxisOptions>) {
    this.options = options;

    let scaleOptions: ScaleOptions = {
      orientation:
        options.position === "top" || options.position === "bottom"
          ? "horizontal"
          : "vertical",
      userMin: options.min,
      userMax: options.max,
    };

    const { type } = this.options;
    if (type === "linear") {
      this.scale = new LinearScale(this, scaleOptions);
    } else if (type === "time") {
      this.scale = new TimeScale(this, scaleOptions);
    } else if (type === "log") {
      this.scale = new LogarithmicScale(this, scaleOptions);
    } else {
      throw new Error("Invalid axis type");
    }

    this.parentLayout = layout;
    const box = layout;
    const position = this.options.position;
    if (position === "bottom") {
      this.layout = new Layout({
        x1: box.x1 + box.padding.left,
        y1: box.y2 - box.padding.bottom,
        x2: box.x2 - box.padding.right,
        y2: box.y2,
      });
    } else if (position === "top") {
      this.layout = new Layout({
        x1: box.x1 + box.padding.left,
        y1: box.y1,
        x2: box.x2 - box.padding.right,
        y2: box.y1 + box.padding.top,
      });
    } else if (position === "left") {
      this.layout = new Layout({
        x1: box.x1,
        y1: box.y1 + box.padding.top,
        x2: box.x1 + box.padding.left,
        y2: box.y2 - box.padding.bottom,
      });
    } else if (position === "right") {
      this.layout = new Layout({
        x1: box.x2 - box.padding.right,
        y1: box.y1 + box.padding.top,
        x2: box.x2,
        y2: box.y2 - box.padding.bottom,
      });
    } else {
      throw new Error("Invalid axis position");
    }
  }

  getLayout(): Layout {
    return this.layout;
  }

  getParentLayout(): Layout {
    return this.parentLayout;
  }

  getScale(): Scale {
    return this.scale;
  }

  getWidth(): number {
    return this.layout.width;
  }

  getHeight(): number {
    return this.layout.height;
  }

  clear(): void {
    this.group.removeChildren();
  }

  addIncidator(indicator: Indicator): void {
    this._indicators.push(indicator);
  }

  removeIndicator(index: number): void {
    this._indicators.splice(index, 1);
  }

  hideAllIndicators(): void {
    this._indicators.forEach((indicator) => {
      indicator.hide();
    });
  }

  showAllIndicators(): void {
    this._indicators.forEach((indicator) => {
      indicator.show();
    });
  }

  render(): void {
    this.clear();

    this._drawIndicators();
    this._drawSplitLine();
    this._drawAxisLine();
    this._drawAxisTick();
    this._drawMinorAxisTick();
  }

  private _drawAxisLine(): void {
    const { show = true } = this.options;
    if (!show) {
      return;
    }

    const box = this.layout.getContentArea();
    let x1, y1, x2, y2;
    if (this.options.position == "bottom") {
      x1 = box.x1;
      y1 = box.y1;
      x2 = box.x2;
      y2 = box.y1;
    } else if (this.options.position == "top") {
      x1 = box.x1;
      y1 = box.y2;
      x2 = box.x2;
      y2 = box.y2;
    } else if (this.options.position == "left") {
      x1 = box.x2;
      y1 = box.y1;
      x2 = box.x2;
      y2 = box.y2;
    } else if (this.options.position == "right") {
      x1 = box.x1;
      y1 = box.y1;
      x2 = box.x1;
      y2 = box.y2;
    } else {
      throw new Error("Invalid axis position");
    }

    const line = new PIXI.Graphics();
    line.moveTo(x1, y1).lineTo(x2, y2).stroke({
      color: "#000",
      width: 1,
    });

    this.group.addChild(line);
  }

  private _drawAxisTick(): void {
    const {
      show = true,
      length = 10,
      inside = true,
    } = this.options?.axisTick || {};
    if (!show) {
      return;
    }

    const box = this.layout.getContentArea();
    const ticks = this.scale.buildTicks().filter((tick) => tick.major);

    ticks.forEach((tick) => {
      let x1, y1, x2, y2;
      if (this.options.position == "bottom") {
        x1 = this.scale.getPixelForValue(tick.value);
        y1 = box.y1;
        x2 = x1;
        y2 = box.y1 + length;
        if (inside) {
          y2 = box.y1 - length;
        }
      } else if (this.options.position == "top") {
        x1 = this.scale.getPixelForValue(tick.value);
        y1 = box.y2;
        x2 = x1;
        y2 = box.y2 - length;
        if (inside) {
          y2 = box.y2 + length;
        }
      } else if (this.options.position == "left") {
        x1 = box.x2 - length;
        y1 = this.scale.getPixelForValue(tick.value);
        x2 = box.x2;
        y2 = y1;
        if (inside) {
          x1 = box.x2 + length;
        }
      } else if (this.options.position == "right") {
        x1 = box.x1;
        y1 = this.scale.getPixelForValue(tick.value);
        x2 = box.x1 + length;
        y2 = y1;
        if (inside) {
          x2 = box.x1 - length;
        }
      } else {
        throw new Error("Invalid axis position");
      }

      const line = new PIXI.Graphics();
      line.moveTo(x1, y1).lineTo(x2, y2).stroke({
        color: "#000",
        width: 1,
      });
      this.group.addChild(line);

      this._drawAxisLabel(x1, y1, this.scale.getLabelForValue(tick));
    });
  }

  private _drawMinorAxisTick(): void {
    const { show = true, length = 5 } = this.options.minorTick || {};
    if (!show) {
      return;
    }
    const { inside = true } = this.options?.axisTick || {};
    const box = this.layout.getContentArea();
    const minorTicks = this.scale.buildTicks().filter((tick) => !tick.major);
    let drawLabels = false;
    if (
      minorTicks.length > 0 &&
      this.scale.drawMinorTickLabels(minorTicks[0], minorTicks.length)
    ) {
      drawLabels = true;
    }

    minorTicks.forEach((tick) => {
      let x1, y1, x2, y2;
      if (this.options.position == "bottom") {
        x1 = this.scale.getPixelForValue(tick.value);
        y1 = box.y1;
        x2 = x1;
        y2 = box.y1 + length;
        if (inside) {
          y2 = box.y1 - length;
        }
      } else if (this.options.position == "top") {
        x1 = this.scale.getPixelForValue(tick.value);
        y1 = box.y2;
        x2 = x1;
        y2 = box.y2 - length;
        if (inside) {
          y2 = box.y2 + length;
        }
      } else if (this.options.position == "left") {
        x1 = box.x2 - length;
        y1 = this.scale.getPixelForValue(tick.value);
        x2 = box.x2;
        y2 = y1;
        if (inside) {
          x1 = box.x2 + length;
        }
      } else if (this.options.position == "right") {
        x1 = box.x1;
        y1 = this.scale.getPixelForValue(tick.value);
        x2 = box.x1 + length;
        y2 = y1;
        if (inside) {
          x2 = box.x1 - length;
        }
      } else {
        throw new Error("Invalid axis position");
      }

      const line = new PIXI.Graphics();
      line.moveTo(x1, y1).lineTo(x2, y2).stroke({
        color: "#000",
        width: 1,
      });

      this.group.addChild(line);
      if (drawLabels) {
        this._drawAxisLabel(x1, y1, this.scale.getLabelForValue(tick));
      }
    });
  }

  private _drawAxisLabel(x1: number, y1: number, label: string): void {
    const { show = true, margin = 5 } = this.options.axisLabel || {};
    if (!show) {
      return;
    }
    const text = new PIXI.Text({
      text: label,
      style: {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "#000",
        align: "center",
      },
      x: x1,
      y: y1,
      anchor: { x: 0.5, y: 1 },
    });
    if (this.options.position == "bottom") {
      text.y += margin;
    } else if (this.options.position == "top") {
      text.y -= margin;
    } else if (this.options.position == "left") {
      text.x -= margin;
    } else if (this.options.position == "right") {
      text.x += margin;
    }
    this.group.addChild(text);
  }

  private _drawSplitLine(): void {
    const { show = true } = this.options.splitLine || {};
    if (!show) {
      return;
    }

    const box = this.parentLayout.getContentArea();
    const ticks = this.getScale().buildTicks();
    const grid = new PIXI.Graphics();

    ticks.forEach((tick) => {
      const x1 = this.getScale().getPixelForValue(tick.value);
      const y1 = box.y1;
      const x2 = x1;
      const y2 = box.y2;
      drawDash(grid, x1, y1 + 12, x2, y2, 5, 5);
      grid.stroke({
        color: "#ccc",
        width: 1,
      });
    });
    this.group.addChild(grid);
  }

  private _drawIndicators(): void {
    this._indicators.forEach((indicator) => {
      indicator.render();
    });
  }
}
