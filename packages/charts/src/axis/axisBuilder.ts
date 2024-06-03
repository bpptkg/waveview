import * as PIXI from "pixi.js";
import { drawDash } from "../util/dashline";
import { ScaleTick } from "../util/types";
import { Axis } from "./axis";
import { AxisModel } from "./axisModel";

export class AxisBuilder {
  readonly model: AxisModel;
  readonly view: Axis;

  constructor(model: AxisModel, view: Axis) {
    this.model = model;
    this.view = view;
  }

  drawAxisLine(): void {
    const [x, y] = this.view.getOrigin();
    const { width, height } = this.view.getRect();
    let x1, x2, y1, y2;

    if (this.view.isHorizontal()) {
      x1 = x;
      x2 = x + width;
      y1 = y2 = y;
    } else {
      x1 = x2 = x;
      y1 = y;
      y2 = y + height;
    }

    const line = new PIXI.Graphics();
    line.moveTo(x1, y1).lineTo(x2, y2).stroke({
      color: "#000",
      width: 1,
    });

    this.view.group.addChild(line);
  }

  drawMajorTick(): void {
    const { show, length, inside } = this.model.getOptions().axisTick;
    if (!show) {
      return;
    }

    const ticks = this.view.getTicksPixels();
    const [x, y] = this.view.getOrigin();
    let x1, x2, y1, y2;

    const getYOffset = (y: number) => {
      if (this.view.isAxisPositionEqualTo("top")) {
        return inside ? y + length : y - length;
      } else {
        return inside ? y - length : y + length;
      }
    };

    const getXOffset = (x: number) => {
      if (this.view.isAxisPositionEqualTo("left")) {
        return inside ? x + length : x - length;
      } else {
        return inside ? x - length : x + length;
      }
    };

    for (const [index, tick] of ticks.entries()) {
      if (this.view.isHorizontal()) {
        x1 = x2 = tick.pixel;
        y1 = y;
        y2 = getYOffset(y);
      } else {
        x1 = x;
        x2 = getXOffset(x);
        y1 = y2 = tick.pixel;
      }

      if (index !== 0 && index !== ticks.length - 1) {
        this.drawSplitLine(x1, y1);
      }

      const line = new PIXI.Graphics();
      line.moveTo(x1, y1).lineTo(x2, y2).stroke({
        color: "#000",
        width: 1,
      });
      this.view.group.addChild(line);

      this.drawLabel(x1, y1, tick.tick);
    }
  }

  drawMinorTick(): void {
    const { show, length } = this.model.options.minorTick;
    const { inside } = this.model.options.axisTick;
    if (!show) {
      return;
    }

    const ticks = this.view.getMinorTicksPixels();
    const [x, y] = this.view.getOrigin();
    let x1, x2, y1, y2;

    const getYOffset = (y: number) => {
      if (this.view.isAxisPositionEqualTo("top")) {
        return inside ? y + length : y - length;
      } else {
        return inside ? y - length : y + length;
      }
    };

    const getXOffset = (x: number) => {
      if (this.view.isAxisPositionEqualTo("left")) {
        return inside ? x + length : x - length;
      } else {
        return inside ? x - length : x + length;
      }
    };

    for (const tick of ticks) {
      if (this.view.isHorizontal()) {
        x1 = x2 = tick.pixel;
        y1 = y;
        y2 = getYOffset(y);
      } else {
        x1 = x;
        x2 = getXOffset(x);
        y1 = y2 = tick.pixel;
      }

      const line = new PIXI.Graphics();
      line.moveTo(x1, y1).lineTo(x2, y2).stroke({
        color: "#000",
        width: 1,
      });
      this.view.group.addChild(line);
    }
  }

  drawLabel(x: number, y: number, tick: ScaleTick): void {
    const { show, margin, formatter } = this.model.options.axisLabel;
    if (!show) {
      return;
    }

    const label = formatter
      ? formatter(tick.value)
      : this.model.scale.getLabel(tick);

    const text = new PIXI.Text({
      text: label,
      style: {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "#000",
        align: "center",
      },
      x: x,
      y: y,
      anchor: { x: 0.5, y: 1 },
    });
    if (this.view.isAxisPositionEqualTo("bottom")) {
      text.y += margin;
    } else if (this.view.isAxisPositionEqualTo("top")) {
      text.y -= margin;
    } else if (this.view.isAxisPositionEqualTo("left")) {
      text.x -= margin;
    } else if (this.view.isAxisPositionEqualTo("right")) {
      text.x += margin;
    }
    this.view.group.addChild(text);
  }

  drawSplitLine(x: number, y: number): void {
    const { show, color, width: lineWidth } = this.model.options.splitLine;
    if (!show) {
      return;
    }

    const { width, height } = this.view.getRect();

    const graphics = new PIXI.Graphics();
    let x1, x2, y1, y2;
    if (this.view.isHorizontal()) {
      x1 = x2 = x;
      y1 = y;
      y2 = y + height;
    } else {
      x1 = x;
      x2 = x + width;
      y1 = y2 = y;
    }

    drawDash(graphics, x1, y1, x2, y2, 5, 5);
    graphics.stroke({
      color: color,
      width: lineWidth,
    });

    this.view.group.addChild(graphics);
  }
}
