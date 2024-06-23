import { EventManager, EventManagerConfig, Extension } from "../util/types";
import { Helicorder } from "./helicorder";
// @ts-ignore
import { InteractionEvent, Point } from "pixi.js";

export interface HelicorderEventManagerConfig extends EventManagerConfig {
  enableArrowUp?: boolean;
  enableArrowDown?: boolean;
  enableNKey?: boolean;
  enableWheel?: boolean;
}

export class HelicorderEventManager implements EventManager {
  private chart: Helicorder;
  private enabled: boolean;
  private config: HelicorderEventManagerConfig;

  constructor(chart: Helicorder, config: HelicorderEventManagerConfig = {}) {
    this.chart = chart;
    this.enabled = true;
    this.config = config;

    this.chart.app.stage.cursor = "pointer";
  }

  attachEventListeners(): void {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.chart.app.stage.on("pointerdown", this.onPointerDown.bind(this));
  }

  removeEventListeners(): void {
    window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    this.chart.app.stage.off("pointerdown", this.onPointerDown.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled || !this.chart.isFocused()) {
      return;
    }

    switch (event.key) {
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

  onArrowUp(): void {
    if (this.config.enableArrowUp === false) {
      return;
    }
    this.chart.shiftViewUp();
    this.chart.render();
  }

  onArrowDown(): void {
    if (this.config.enableArrowDown === false) {
      return;
    }
    this.chart.shiftViewDown();
    this.chart.render();
  }

  onNKey(): void {
    if (this.config.enableNKey === false) {
      return;
    }
    this.chart.shiftViewToNow();
    this.chart.render();
  }

  onPointerDown(event: InteractionEvent): void {
    if (!this.enabled) {
      return;
    }
    const { x, y }: Point = event.data.getLocalPosition(this.chart.app.stage);
    const rect = this.chart.getGrid().getRect();
    if (
      x < rect.x ||
      x > rect.x + rect.width ||
      y < rect.y ||
      y > rect.y + rect.height
    ) {
      return;
    }
    const trackIndex = this.chart.getTrackIndexAtPosition(y);
    this.chart.selectTrack(trackIndex);
    this.chart.render();
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }
}

export class HelicorderEventManagerExtension implements Extension<Helicorder> {
  private config: HelicorderEventManagerConfig;
  private eventManager?: HelicorderEventManager;

  constructor(config: HelicorderEventManagerConfig = {}) {
    this.config = config;
  }

  install(chart: Helicorder): void {
    this.eventManager = new HelicorderEventManager(chart, this.config);
    this.eventManager.attachEventListeners();
  }

  uninstall(): void {
    if (this.eventManager) {
      this.eventManager.removeEventListeners();
    }
  }

  getInstance(): HelicorderEventManager {
    if (!this.eventManager) {
      throw new Error("Extension not installed");
    }
    return this.eventManager;
  }
}
