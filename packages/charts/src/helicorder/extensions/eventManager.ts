import { FederatedPointerEvent, Point } from "pixi.js";
import { EventManager, EventManagerConfig, Extension } from "../../util/types";
import { Helicorder } from "../helicorder";
import { HelicorderWebWorker } from "./webWorker";

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
  private handleKeyDownBound: (event: KeyboardEvent) => void;
  private onPointerDownBound: (event: FederatedPointerEvent) => void;
  private webWorker: HelicorderWebWorker;

  constructor(
    chart: Helicorder,
    webWorker: HelicorderWebWorker,
    config: HelicorderEventManagerConfig = {}
  ) {
    this.chart = chart;
    this.enabled = true;
    this.config = config;

    this.chart.app.stage.cursor = "pointer";
    this.webWorker = webWorker;
    this.handleKeyDownBound = this.handleKeyDown.bind(this);
    this.onPointerDownBound = this.onPointerDown.bind(this);
  }

  attachEventListeners(): void {
    window.addEventListener("keydown", this.handleKeyDownBound);
    this.chart.app.stage.on("pointerdown", this.onPointerDownBound);
  }

  removeEventListeners(): void {
    window.removeEventListener("keydown", this.handleKeyDownBound);
    this.chart.app.stage.off("pointerdown", this.onPointerDownBound);
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

  private onArrowUp(): void {
    if (this.config.enableArrowUp === false) {
      return;
    }
    const selection = this.chart.getSelection();
    if (selection.hasValue()) {
      this.chart.moveSelectionUp();
    } else {
      this.chart.shiftViewUp();
    }
    this.chart.refreshData();
    this.chart.render();
    this.webWorker.fetchAllTracksDataDebounced();
  }

  private onArrowDown(): void {
    if (this.config.enableArrowDown === false) {
      return;
    }
    const selection = this.chart.getSelection();
    if (selection.hasValue()) {
      this.chart.moveSelectionDown();
    } else {
      this.chart.shiftViewDown();
    }
    this.chart.refreshData();
    this.chart.render();
    this.webWorker.fetchAllTracksDataDebounced();
  }

  private onNKey(): void {
    if (this.config.enableNKey === false) {
      return;
    }
    this.chart.shiftViewToNow();
    this.chart.refreshData();
    this.chart.render();
    this.webWorker.fetchAllTracksDataDebounced();
  }

  private onPointerDown(event: FederatedPointerEvent): void {
    if (!this.enabled) {
      return;
    }
    this.handleTrackSelected(event);
    this.handleFocusBlur(event);
  }

  private handleTrackSelected(event: FederatedPointerEvent): void {
    const { x, y }: Point = event.global;
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

  private handleFocusBlur(event: FederatedPointerEvent): void {
    const { x, y }: Point = event.global;
    const rect = this.chart.getRect();
    if (
      x < rect.x ||
      x > rect.x + rect.width ||
      y < rect.y ||
      y > rect.y + rect.height
    ) {
      this.chart.blur();
    } else {
      this.chart.focus();
    }
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
  private webWorker: HelicorderWebWorker;
  private eventManager?: HelicorderEventManager;

  constructor(
    webWorker: HelicorderWebWorker,
    config: HelicorderEventManagerConfig = {}
  ) {
    this.config = config;
    this.webWorker = webWorker;
  }

  install(chart: Helicorder): void {
    this.eventManager = new HelicorderEventManager(
      chart,
      this.webWorker,
      this.config
    );
    this.eventManager.attachEventListeners();
  }

  uninstall(): void {
    if (this.eventManager) {
      this.eventManager.removeEventListeners();
    }
  }

  getAPI(): HelicorderEventManager {
    if (!this.eventManager) {
      throw new Error("Extension not installed");
    }
    return this.eventManager;
  }
}
