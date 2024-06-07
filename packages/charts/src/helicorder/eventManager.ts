import { EventManager } from "../util/types";
import { Helicorder } from "./helicorder";
// @ts-ignore
import { InteractionEvent, Point } from "pixi.js";

export class HelicorderEventManager implements EventManager {
  private chart: Helicorder;
  private enabled: boolean;

  constructor(chart: Helicorder) {
    this.chart = chart;
    this.enabled = true;

    this.chart.app.stage.on("pointerdown", this.onPointerDown.bind(this));
    this.chart.app.stage.cursor = "pointer";
  }

  onPointerDown(event: InteractionEvent): void {
    if (!this.enabled) {
      return;
    }
    const position: Point = event.data.getLocalPosition(this.chart.app.stage);
    const trackIndex = this.chart.getTrackIndexAtPosition(position.y);
    this.chart.selectTrack(trackIndex);
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }
}
