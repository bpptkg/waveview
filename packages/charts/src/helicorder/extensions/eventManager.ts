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
  private _chart: Helicorder;
  private _enabled: boolean;
  private _config: HelicorderEventManagerConfig;
  private _handleKeyDownBound: (event: KeyboardEvent) => void;
  private _onPointerDownBound: (event: FederatedPointerEvent) => void;
  private _webWorker: HelicorderWebWorker;

  constructor(
    chart: Helicorder,
    webWorker: HelicorderWebWorker,
    config: HelicorderEventManagerConfig = {}
  ) {
    this._chart = chart;
    this._enabled = true;
    this._config = config;

    this._chart.app.stage.cursor = "pointer";
    this._webWorker = webWorker;
    this._handleKeyDownBound = this._handleKeyDown.bind(this);
    this._onPointerDownBound = this._onPointerDown.bind(this);
  }

  attachEventListeners(): void {
    window.addEventListener("keydown", this._handleKeyDownBound);
    this._chart.app.stage.on("pointerdown", this._onPointerDownBound);
  }

  removeEventListeners(): void {
    window.removeEventListener("keydown", this._handleKeyDownBound);
    this._chart.app.stage.off("pointerdown", this._onPointerDownBound);
  }

  private _handleKeyDown(event: KeyboardEvent): void {
    if (!this._enabled || !this._chart.isFocused()) {
      return;
    }

    switch (event.key) {
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

  private _onArrowUp(): void {
    if (this._config.enableArrowUp === false) {
      return;
    }
    const selection = this._chart.getSelection();
    if (selection.hasValue()) {
      this._chart.moveSelectionUp();
    } else {
      this._chart.shiftViewUp();
    }
    this._chart.refreshData();
    this._chart.render();
    this._webWorker.fetchAllTracksDataDebounced();
  }

  private _onArrowDown(): void {
    if (this._config.enableArrowDown === false) {
      return;
    }
    const selection = this._chart.getSelection();
    if (selection.hasValue()) {
      this._chart.moveSelectionDown();
    } else {
      this._chart.shiftViewDown();
    }
    this._chart.refreshData();
    this._chart.render();
    this._webWorker.fetchAllTracksDataDebounced();
  }

  private _onNKey(): void {
    if (this._config.enableNKey === false) {
      return;
    }
    this._chart.shiftViewToNow();
    this._chart.refreshData();
    this._chart.render();
    this._webWorker.fetchAllTracksDataDebounced();
  }

  private _onPointerDown(event: FederatedPointerEvent): void {
    if (!this._enabled) {
      return;
    }
    this._handleTrackSelected(event);
    this._handleFocusBlur(event);
  }

  private _handleTrackSelected(event: FederatedPointerEvent): void {
    const { x, y }: Point = event.global;
    const rect = this._chart.getGrid().getRect();
    if (
      x < rect.x ||
      x > rect.x + rect.width ||
      y < rect.y ||
      y > rect.y + rect.height
    ) {
      return;
    }
    const trackIndex = this._chart.getTrackIndexAtPosition(y);
    this._chart.selectTrack(trackIndex);
    this._chart.render();
  }

  private _handleFocusBlur(event: FederatedPointerEvent): void {
    const { x, y }: Point = event.global;
    const rect = this._chart.getRect();
    if (
      x < rect.x ||
      x > rect.x + rect.width ||
      y < rect.y ||
      y > rect.y + rect.height
    ) {
      this._chart.blur();
    } else {
      this._chart.focus();
    }
  }

  enable(): void {
    this._enabled = true;
  }

  disable(): void {
    this._enabled = false;
  }
}

export class HelicorderEventManagerExtension implements Extension<Helicorder> {
  private _config: HelicorderEventManagerConfig;
  private _webWorker: HelicorderWebWorker;
  private _eventManager?: HelicorderEventManager;

  constructor(
    webWorker: HelicorderWebWorker,
    config: HelicorderEventManagerConfig = {}
  ) {
    this._config = config;
    this._webWorker = webWorker;
  }

  install(chart: Helicorder): void {
    this._eventManager = new HelicorderEventManager(
      chart,
      this._webWorker,
      this._config
    );
    this._eventManager.attachEventListeners();
  }

  uninstall(): void {
    if (this._eventManager) {
      this._eventManager.removeEventListeners();
    }
  }

  getAPI(): HelicorderEventManager {
    if (!this._eventManager) {
      throw new Error("Extension not installed");
    }
    return this._eventManager;
  }
}
