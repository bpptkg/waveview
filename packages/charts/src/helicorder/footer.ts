import * as PIXI from "pixi.js";
import { RenderableGroup } from "../util/types";
import { Helicorder } from "./helicorder";

export class Footer implements RenderableGroup {
  readonly group: PIXI.Container = new PIXI.Container();
  constructor(readonly chart: Helicorder) {
    this.chart = chart;
  }

  render(): void {
    const margin = 8;
    this.group.removeChildren();
    const { x, y, width, height } = this.chart.getGrid().getRect();
    const localTime = new PIXI.Text({
      text: "Local",
      style: {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "#000",
        align: "right",
      },
      x: x - margin,
      y: y + height + margin,
      anchor: { x: 1, y: 0 },
    });

    const timeInMinues = new PIXI.Text({
      text: "Time in minutes",
      style: {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "#000",
        align: "center",
      },
      x: x + width / 2,
      y: y + height + margin,
      anchor: { x: 0.5, y: 0 },
    });

    const utcTime = new PIXI.Text({
      text: "UTC",
      style: {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "#000",
        align: "left",
      },
      x: x + width + margin,
      y: y + height + margin,
      anchor: { x: 0, y: 0 },
    });

    this.group.addChild(localTime);
    this.group.addChild(timeInMinues);
    this.group.addChild(utcTime);
  }
}
