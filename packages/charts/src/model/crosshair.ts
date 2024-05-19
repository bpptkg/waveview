import * as PIXI from "pixi.js";
import { Axis } from "./axis";
import { Chart } from "./chart";
// @ts-ignore
import { InteractionEvent } from "pixi.js";

export class Crosshair {
  readonly chart: Chart;
  readonly axis: Axis;
  readonly group: PIXI.Container = new PIXI.Container();
  private _position: PIXI.Point = new PIXI.Point();

  constructor(chart: Chart, axis: Axis) {
    this.chart = chart;
    this.axis = axis;
    this.chart.app.stage.on("pointermove", this._onPointerMove.bind(this));
  }

  _onPointerMove(event: InteractionEvent): void {
    const position = event.data.getLocalPosition(this.chart.app.stage);
    this._position = position;
    this.render();
  }

  get position(): PIXI.Point {
    return this._position;
  }

  clear(): void {
    this.group.removeChildren();
  }

  render(): void {
    this.clear();

    const { x1, y1, x2, y2 } = this.chart.getLayout().getContentArea();
    const { x, y } = this._position;
    if (x < x1 || x > x2 || y < y1 || y > y2) {
      return;
    }

    const line = new PIXI.Graphics();
    line.moveTo(x, y1).lineTo(x, y2).stroke({
      color: "#000",
      width: 1,
    });
    this.group.addChild(line);

    const value = this.axis.getScale().getValueForPixel(x);
    const padding = 5;
    const label = new PIXI.Container();
    const valueFormatted = new Date(value).toISOString();
    const text = new PIXI.Text({
      text: valueFormatted,
      style: {
        fill: "#fff",
        fontSize: 12,
        align: "center",
      },
      anchor: { x: 0.5, y: 1.1 },
      x: x,
      y: y1,
    });
    const background = new PIXI.Graphics();
    background
      .rect(
        x - text.width / 2 - padding,
        y1 - text.height - padding,
        text.width + padding * 2,
        text.height + padding
      )
      .fill({
        color: "#000",
        alignment: 0,
      });
    label.addChild(background);
    label.addChild(text);

    this.group.addChild(label);
  }
}
