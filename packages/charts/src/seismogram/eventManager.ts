import { EventManager, EventManagerConfig, Extension } from "../util/types";
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
  refreshDataAfterEvent?: boolean;
  fetchData?: () => void;
}

export class SeismogramEventManager implements EventManager {
  private chart: Seismogram;
  private enabled: boolean;
  private config: SeismogramEventManagerConfig;
  private handleKeyDownBound: (event: KeyboardEvent) => void;
  private onWheelBound: (event: InteractionEvent) => void;
  private onPointerDownBound: (event: InteractionEvent) => void;

  constructor(chart: Seismogram, config: SeismogramEventManagerConfig = {}) {
    this.chart = chart;
    this.enabled = true;
    this.config = config;

    this.handleKeyDownBound = this.handleKeyDown.bind(this);
    this.onWheelBound = this.onWheel.bind(this);
    this.onPointerDownBound = this.onPointerDown.bind(this);
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
    window.addEventListener("keydown", this.handleKeyDownBound);
    this.chart.app.stage.on("wheel", this.onWheelBound);
    this.chart.app.stage.on("pointerdown", this.onPointerDownBound);
  }

  detachEventListeners(): void {
    window.removeEventListener("keydown", this.handleKeyDownBound);
    this.chart.app.stage.off("wheel", this.onWheelBound);
    this.chart.app.stage.off("pointerdown", this.onPointerDownBound);
  }

  private onWheel(event: InteractionEvent): void {
    if (!this.enabled) {
      return;
    }

    if (this.config.enableWheel === false) {
      return;
    }

    const { deltaX, deltaY, shiftKey, altKey } = event.data
      .originalEvent as WheelEvent;
    const { x, y } = event.data.getLocalPosition(this.chart.app.stage);
    const { x: x0, y: y0, width, height } = this.chart.getGrid().getRect();
    if (x < x0 || x > x0 + width || y < y0 || y > y0 + height) {
      return;
    }

    const center = this.chart.getXAxis().getValueForPixel(x);
    if (shiftKey) {
      if (deltaY > 0 || deltaX > 0) {
        this.chart.zoomOut(center, 0.1);
      } else {
        this.chart.zoomIn(center, 0.1);
      }
    } else if (altKey) {
      if (deltaY > 0) {
        this.chart.decreaseAmplitude(0.1);
      } else {
        this.chart.increaseAmplitude(0.1);
      }
    } else {
      if (deltaY > 0) {
        this.chart.scrollRight(0.1);
      } else {
        this.chart.scrollLeft(0.1);
      }
    }
    this.chart.render();
    this.onFinished();
  }

  private onArrowLeft(): void {
    if (this.config.enableArrowLeft === false) {
      return;
    }
    this.chart.scrollLeft(0.1);
    this.chart.render();
    this.onFinished();
  }

  private onArrowRight(): void {
    if (this.config.enableArrowRight === false) {
      return;
    }
    this.chart.scrollRight(0.1);
    this.chart.render();
    this.onFinished();
  }

  private onArrowUp(): void {
    if (this.config.enableArrowUp === false) {
      return;
    }
    this.chart.increaseAmplitude(0.1);
    this.chart.render();
    this.onFinished();
  }

  private onArrowDown(): void {
    if (this.config.enableArrowDown === false) {
      return;
    }
    this.chart.decreaseAmplitude(0.1);
    this.chart.render();
    this.onFinished();
  }

  private onNKey(): void {
    if (this.config.enableNKey === false) {
      return;
    }
    this.chart.scrollToNow();
    this.chart.render();
    this.onFinished();
  }

  private onFinished(): void {
    const { refreshDataAfterEvent, fetchData } = this.config;
    if (refreshDataAfterEvent && fetchData) {
      fetchData();
    }
  }

  private onPointerDown(event: InteractionEvent): void {
    if (!this.enabled) {
      return;
    }
    this.handleFocusBlur(event);
  }

  private handleFocusBlur(event: InteractionEvent): void {
    const { x, y } = event.data.getLocalPosition(this.chart.app.stage);
    const rect = this.chart.getRect();
    if (
      x < rect.x ||
      x > rect.x + rect.width ||
      y < rect.y ||
      y > rect.y + rect.height
    ) {
      return;
    }
    this.chart.focus();
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  dispose(): void {
    this.detachEventListeners();
  }
}

export class SeismogramEventManagerExtension implements Extension<Seismogram> {
  private config: SeismogramEventManagerConfig;
  private instance?: SeismogramEventManager;

  constructor(config: SeismogramEventManagerConfig = {}) {
    this.config = config;
  }

  install(chart: Seismogram): void {
    this.instance = new SeismogramEventManager(chart, this.config);
    this.instance.attachEventListeners();
  }

  uninstall(): void {
    if (this.instance) {
      this.instance.dispose();
    }
  }

  getInstance(): SeismogramEventManager {
    if (!this.instance) {
      throw new Error("Extension not installed");
    }
    return this.instance;
  }
}
