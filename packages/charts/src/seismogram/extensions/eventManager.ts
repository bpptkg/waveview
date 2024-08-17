import { FederatedPointerEvent, FederatedWheelEvent } from "pixi.js";
import { EventManager, EventManagerConfig, Extension } from "../../util/types";
import { Seismogram } from "../seismogram";

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
  private _chart: Seismogram;
  private _enabled: boolean;
  private _config: SeismogramEventManagerConfig;
  private _handleKeyDownBound: (event: KeyboardEvent) => void;
  private _onWheelBound: (event: FederatedWheelEvent) => void;
  private _onPointerDownBound: (event: FederatedPointerEvent) => void;

  constructor(chart: Seismogram, config: SeismogramEventManagerConfig = {}) {
    this._chart = chart;
    this._enabled = true;
    this._config = config;

    this._handleKeyDownBound = this._handleKeyDown.bind(this);
    this._onWheelBound = this._onWheel.bind(this);
    this._onPointerDownBound = this._onPointerDown.bind(this);
  }

  private _handleKeyDown(event: KeyboardEvent): void {
    if (!this._enabled || !this._chart.isFocused()) {
      return;
    }

    switch (event.key) {
      case "ArrowLeft":
        this._onArrowLeft();
        break;
      case "ArrowRight":
        this._onArrowRight();
        break;
      case "ArrowUp":
        this._onArrowUp();
        break;
      case "ArrowDown":
        this._onArrowDown();
        break;
      case "N":
      case "n":
        this._onNKey();
        break;
      default:
        break;
    }
  }

  attachEventListeners(): void {
    window.addEventListener("keydown", this._handleKeyDownBound);
    this._chart.app.stage.on("wheel", this._onWheelBound);
    this._chart.app.stage.on("pointerdown", this._onPointerDownBound);
  }

  detachEventListeners(): void {
    window.removeEventListener("keydown", this._handleKeyDownBound);
    this._chart.app.stage.off("wheel", this._onWheelBound);
    this._chart.app.stage.off("pointerdown", this._onPointerDownBound);
  }

  private _onWheel(event: FederatedWheelEvent): void {
    if (!this._enabled) {
      return;
    }

    if (this._config.enableWheel === false) {
      return;
    }

    const { deltaX, deltaY, shiftKey, altKey } = event;
    const { x, y } = event.global;
    const { x: x0, y: y0, width, height } = this._chart.getGrid().getRect();
    if (x < x0 || x > x0 + width || y < y0 || y > y0 + height) {
      return;
    }

    const sensitivity = 0.01;
    const scaledDeltaX = deltaX * sensitivity;
    const scaledDeltaY = deltaY * sensitivity;

    const center = this._chart.getXAxis().getValueForPixel(x);
    if (shiftKey) {
      if (scaledDeltaY > 0 || scaledDeltaX > 0) {
        this._chart.zoomOut(center, 0.1);
      } else {
        this._chart.zoomIn(center, 0.1);
      }
    } else if (altKey) {
      if (scaledDeltaY > 0) {
        this._chart.decreaseAmplitude(0.1);
      } else {
        this._chart.increaseAmplitude(0.1);
      }
    } else {
      if (scaledDeltaY > 0) {
        this._chart.scrollRight(0.1);
      } else {
        this._chart.scrollLeft(0.1);
      }
    }
    this._chart.render();
    this._onFinished();
  }

  private _onArrowLeft(): void {
    if (this._config.enableArrowLeft === false) {
      return;
    }
    this._chart.scrollLeft(0.1);
    this._chart.render();
    this._onFinished();
  }

  private _onArrowRight(): void {
    if (this._config.enableArrowRight === false) {
      return;
    }
    this._chart.scrollRight(0.1);
    this._chart.render();
    this._onFinished();
  }

  private _onArrowUp(): void {
    if (this._config.enableArrowUp === false) {
      return;
    }
    this._chart.increaseAmplitude(0.1);
    this._chart.render();
    this._onFinished();
  }

  private _onArrowDown(): void {
    if (this._config.enableArrowDown === false) {
      return;
    }
    this._chart.decreaseAmplitude(0.1);
    this._chart.render();
    this._onFinished();
  }

  private _onNKey(): void {
    if (this._config.enableNKey === false) {
      return;
    }
    this._chart.scrollToNow();
    this._chart.render();
    this._onFinished();
  }

  private _onFinished(): void {
    const { refreshDataAfterEvent, fetchData } = this._config;
    if (refreshDataAfterEvent && fetchData) {
      fetchData();
    }
  }

  private _onPointerDown(event: FederatedPointerEvent): void {
    if (!this._enabled) {
      return;
    }
    this._handleFocusBlur(event);
  }

  private _handleFocusBlur(event: FederatedPointerEvent): void {
    const { x, y } = event.data.getLocalPosition(this._chart.app.stage);
    const rect = this._chart.getRect();
    if (
      x < rect.x ||
      x > rect.x + rect.width ||
      y < rect.y ||
      y > rect.y + rect.height
    ) {
      return;
    }
    this._chart.focus();
  }

  enable(): void {
    this._enabled = true;
  }

  disable(): void {
    this._enabled = false;
  }

  dispose(): void {
    this.detachEventListeners();
  }
}

export class SeismogramEventManagerExtension implements Extension<Seismogram> {
  private _config: SeismogramEventManagerConfig;
  private _instance?: SeismogramEventManager;

  constructor(config: SeismogramEventManagerConfig = {}) {
    this._config = config;
  }

  install(chart: Seismogram): void {
    this._instance = new SeismogramEventManager(chart, this._config);
    this._instance.attachEventListeners();
  }

  uninstall(): void {
    if (this._instance) {
      this._instance.dispose();
    }
  }

  getAPI(): SeismogramEventManager {
    if (!this._instance) {
      throw new Error("Extension not installed");
    }
    return this._instance;
  }
}
