import { EventManager, EventManagerConfig } from "../util/types";
// @ts-ignore
import { InteractionEvent } from "pixi.js";
import { Seismogram } from "./seismogram";

export interface SeismogramEventManagerConfig extends EventManagerConfig {
  enableArrowLeft?: boolean;
  enableArrowRight?: boolean;
  enableArrowUp?: boolean;
  enableArrowDown?: boolean;
  enableNKey?: boolean;
  enableWheel?: boolean;
}

export class SeismogramEventManager implements EventManager {
  private chart: Seismogram;
  private enabled: boolean;
  private config: SeismogramEventManagerConfig;

  constructor(chart: Seismogram, config: SeismogramEventManagerConfig = {}) {
    this.chart = chart;
    this.enabled = true;
    this.config = config;
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled || !this.chart.isFocused()) {
      return;
    }

    switch (event.key) {
      case "ArrowLeft":
        this.onArrowLeft();
        break;
      case "ArrowRight":
        this.onArrowRight();
        break;
      case "ArrowUp":
        this.onArrowUp();
        break;
      case "ArrowDown":
        this.onArrowDown();
        break;
      case "N":
      case "n":
        this.onNKey();
        break;
      default:
        break;
    }
  }

  attachEventListeners(): void {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.chart.app.stage.on("wheel", this.onWheel.bind(this));
  }

  detachEventListeners(): void {
    window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    this.chart.app.stage.off("wheel", this.onWheel.bind(this));
  }

  onWheel(event: InteractionEvent): void {
    if (!this.enabled) {
      return;
    }

    if (this.config.enableWheel === false) {
      return;
    }

    const { deltaX, deltaY, shiftKey } = event.data.originalEvent as WheelEvent;
    const { x, y } = event.data.getLocalPosition(this.chart.app.stage);
    const { x: x0, y: y0, width, height } = this.chart.getGrid().getRect();
    if (x < x0 || x > x0 + width || y < y0 || y > y0 + height) {
      return;
    }

    const center = this.chart.xAxis.getValueForPixel(x);
    if (shiftKey) {
      if (deltaY > 0 || deltaX > 0) {
        this.chart.scrollRight(0.1);
      } else {
        this.chart.scrollLeft(0.1);
      }
    } else {
      if (deltaY > 0) {
        this.chart.zoomOut(center, 0.05);
      } else {
        this.chart.zoomIn(center, 0.05);
      }
    }
    this.chart.render();
  }

  onArrowLeft(): void {
    if (this.config.enableArrowLeft === false) {
      return;
    }
    this.chart.scrollLeft(0.05);
    this.chart.render();
  }

  onArrowRight(): void {
    if (this.config.enableArrowRight === false) {
      return;
    }
    this.chart.scrollRight(0.05);
    this.chart.render();
  }

  onArrowUp(): void {
    if (this.config.enableArrowUp === false) {
      return;
    }
    this.chart.increaseAmplitude(0.05);
    this.chart.render();
  }

  onArrowDown(): void {
    if (this.config.enableArrowDown === false) {
      return;
    }
    this.chart.decreaseAmplitude(0.05);
    this.chart.render();
  }

  onNKey(): void {
    if (this.config.enableNKey === false) {
      return;
    }
    this.chart.scrollToNow();
    this.chart.render();
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }
}
