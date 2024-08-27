import * as PIXI from "pixi.js";
import { FederatedPointerEvent } from "pixi.js";
import { Model } from "../../model";
import { EventMap, Extension, LayoutRect, ThemeStyle } from "../../util/types";
import { View } from "../../view";
import { Seismogram } from "../seismogram";

export interface ZoomRectangleOptions {
  color: string;
  opacity: number;
  borderWidth: number;
}

export class ZoomRectangleModel extends Model<ZoomRectangleOptions> {
  override readonly type: string = "zoomRectangle";

  static defaultOptions: ZoomRectangleOptions = {
    color: "#9747FF",
    opacity: 0.25,
    borderWidth: 1,
  };

  constructor(options?: Partial<ZoomRectangleOptions>) {
    super({ ...ZoomRectangleModel.defaultOptions, ...options });
  }
}

export interface ZoomRectangleEventMap extends EventMap {
  extentSelected: (extent: [number, number]) => void;
}

export class ZoomRectangle extends View<
  ZoomRectangleModel,
  ZoomRectangleEventMap
> {
  readonly chart: Seismogram;
  private _rect: LayoutRect;
  private readonly _graphics: PIXI.Graphics;
  private _isActive: boolean = false;
  private _isDragging: boolean = false;
  private _start: PIXI.Point = new PIXI.Point();
  private _end: PIXI.Point = new PIXI.Point();
  private _isVisible: boolean = false;

  private _onPointerDownBound: (event: FederatedPointerEvent) => void;
  private _onPointerMoveBound: (event: FederatedPointerEvent) => void;
  private _onPointerUpBound: () => void;

  constructor(chart: Seismogram, options?: Partial<ZoomRectangleOptions>) {
    const model = new ZoomRectangleModel(options);
    super(model);

    this._graphics = new PIXI.Graphics();
    this.group.addChild(this._graphics);

    this.chart = chart;
    this._rect = chart.getGrid().getRect().clone();

    this._onPointerDownBound = this._onPointerDown.bind(this);
    this._onPointerMoveBound = this._onPointerMove.bind(this);
    this._onPointerUpBound = this._onPointerUp.bind(this);
  }

  attachEventListeners(): void {
    this.chart.app.stage.on("pointerdown", this._onPointerDownBound);
    this.chart.app.stage.on("pointermove", this._onPointerMoveBound);
    this.chart.app.stage.on("pointerup", this._onPointerUpBound);
  }

  detachEventListeners(): void {
    this.chart.app.stage.off("pointerdown", this._onPointerDownBound);
    this.chart.app.stage.off("pointermove", this._onPointerMoveBound);
    this.chart.app.stage.off("pointerup", this._onPointerUpBound);
  }

  activate(): void {
    this._isActive = true;
  }

  deactivate(): void {
    this._isActive = false;
  }

  isActive(): boolean {
    return this._isActive;
  }

  applyThemeStyle(theme: ThemeStyle): void {
    const { color, opacity, borderWidth } = theme.highlightStyle;
    this.getModel().mergeOptions({ color, opacity, borderWidth });
  }

  show() {
    this._isVisible = true;
  }

  hide() {
    this._isVisible = false;
  }

  focus(): void {}

  blur(): void {}

  getRect(): LayoutRect {
    return this._rect;
  }

  setRect(rect: LayoutRect): void {
    this._rect = rect;
  }

  resize(): void {
    this._rect = this.chart.getGrid().getRect();
  }

  render(): void {
    this._graphics.clear();

    if (!this._isVisible) {
      return;
    }

    if (!this._isActive) {
      return;
    }

    const rect = this.chart.getGrid().getRect();

    const x1 = Math.max(Math.min(this._start.x, this._end.x), rect.x);
    const x2 = Math.min(
      Math.max(this._start.x, this._end.x),
      rect.x + rect.width
    );

    const y = rect.y;
    const width = x2 - x1;
    const height = rect.height;

    const theme = this.chart.getTheme();
    const { color, opacity, borderWidth } = theme.highlightStyle;
    this._graphics
      .rect(x1, y, width, height)
      .stroke({
        color: color,
        width: borderWidth,
      })
      .fill({
        color: color,
        alpha: opacity,
      });
  }

  override dispose(): void {
    this.chart.removeComponent(this);
    this._graphics.destroy();
    this.group.destroy();
  }

  private _onPointerDown(event: FederatedPointerEvent): void {
    if (!this._isActive) {
      return;
    }
    if (event.button !== 0) {
      return;
    }

    this._isDragging = true;
    this._isVisible = true;
    this._start = event.data.getLocalPosition(this.chart.app.stage);
  }

  private _onPointerMove(event: FederatedPointerEvent): void {
    if (!this._isActive || !this._isDragging) {
      return;
    }

    this._end = event.data.getLocalPosition(this.chart.app.stage);
    this.render();
  }

  private _onPointerUp(): void {
    if (!this._isActive || !this._isDragging) {
      return;
    }

    this._isDragging = false;
    this._isVisible = false;

    this.render();

    const rect = this.chart.getGrid().getRect();

    const x1 = Math.min(this._start.x, this._end.x);
    const x2 = Math.max(this._start.x, this._end.x);

    const isSelectionReasonablyWide = Math.abs(x2 - x1) > 5;
    if (!isSelectionReasonablyWide) {
      return;
    }

    if (x1 >= rect.x && x2 <= rect.x + rect.width) {
      const xAxis = this.chart.getXAxis();
      const start = xAxis.getValueForPixel(x1);
      const end = xAxis.getValueForPixel(x2);

      this.emit("extentSelected", [start, end]);
    }

    this._start.set(0, 0);
    this._end.set(0, 0);
  }
}

export class ZoomRectangleExtension implements Extension<Seismogram> {
  private _zoomRectangle?: ZoomRectangle;
  private _options: Partial<ZoomRectangleOptions> = {};

  constructor(options?: Partial<ZoomRectangleOptions>) {
    this._options = options || {};
  }

  install(chart: Seismogram): void {
    this._zoomRectangle = new ZoomRectangle(chart, this._options);
    this._zoomRectangle.attachEventListeners();
    chart.addComponent(this._zoomRectangle);
  }

  uninstall(): void {
    this._zoomRectangle?.detachEventListeners();
    this._zoomRectangle?.dispose();
  }

  dispose(): void {
    this._zoomRectangle?.dispose();
  }

  getAPI(): ZoomRectangle {
    if (!this._zoomRectangle) {
      throw new Error("ZoomRectangle extension not initialized");
    }
    return this._zoomRectangle;
  }
}
