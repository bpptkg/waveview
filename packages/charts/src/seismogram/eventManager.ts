import { EventManager } from "../util/types";
// @ts-ignore
import { InteractionEvent } from "pixi.js";
import { Seismogram } from "./seismogram";

export class SeismogramEventManager implements EventManager {
  private chart: Seismogram;
  private enabled: boolean;

  constructor(chart: Seismogram) {
    this.chart = chart;
    this.enabled = true;

    this.chart.app.stage.on("wheel", this.onWheel.bind(this));
  }

  onWheel(event: InteractionEvent): void {
    if (!this.enabled) {
      return;
    }

    const { deltaY } = event.data.originalEvent;
    const { x, y } = event.data.getLocalPosition(this.chart.app.stage);
    const { x: x0, y: y0, width, height } = this.chart.getGrid().getRect();
    if (x < x0 || x > x0 + width || y < y0 || y > y0 + height) {
      return;
    }

    const center = this.chart.xAxis.getValueForPixel(x);
    if (deltaY > 0) {
      this.chart.zoomOut(center, 0.05);
    } else {
      this.chart.zoomIn(center, 0.05);
    }
    this.chart.render();
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }
}
