import * as PIXI from "pixi.js";
import { RenderableGroup } from "../util/types";
import { Helicorder } from "./helicorder";

export class Footer implements RenderableGroup {
  readonly group = new PIXI.Container();
  private readonly _localTime: PIXI.Text;
  private readonly _timeInMinutes: PIXI.Text;
  private readonly _utcTime: PIXI.Text;

  constructor(readonly chart: Helicorder) {
    this.chart = chart;

    this._localTime = new PIXI.Text({
      text: "Local",
      style: {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "#000",
        align: "right",
      },
      anchor: { x: 1, y: 0 },
    });

    this._timeInMinutes = new PIXI.Text({
      text: "Time in minutes",
      style: {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "#000",
        align: "center",
      },
      anchor: { x: 0.5, y: 0 },
    });

    this._utcTime = new PIXI.Text({
      text: "UTC",
      style: {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "#000",
        align: "left",
      },
      anchor: { x: 0, y: 0 },
    });

    this.group.addChild(this._localTime);
    this.group.addChild(this._timeInMinutes);
    this.group.addChild(this._utcTime);
  }

  render(): void {
    const margin = 8;

    const { x, y, width, height } = this.chart.getGrid().getRect();

    this._localTime.position.set(x - margin, y + height + margin);
    this._timeInMinutes.position.set(x + width / 2, y + height + margin);
    this._utcTime.position.set(x + width + margin, y + height + margin);
  }
}
