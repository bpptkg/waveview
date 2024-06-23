import * as PIXI from "pixi.js";
import { Model } from "../model/model";
import { EventMap, Extension, LayoutRect } from "../util/types";
import { View } from "../view/view";
import { Seismogram } from "./seismogram";
// @ts-ignore
import { InteractionEvent } from "pixi.js";

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

export class ZoomRectangle extends View<ZoomRectangleModel> {
  readonly chart: Seismogram;
  private _rect: LayoutRect;
  private readonly _graphics: PIXI.Graphics;
  private _isActive: boolean = false;
  private _isDragging: boolean = false;
  private _start: PIXI.Point = new PIXI.Point();
  private _end: PIXI.Point = new PIXI.Point();
  private _isVisible: boolean = false;

  private onPointerDownBound: (event: InteractionEvent) => void;
  private onPointerMoveBound: (event: InteractionEvent) => void;
  private onPointerUpBound: () => void;

  constructor(chart: Seismogram, options?: Partial<ZoomRectangleOptions>) {
    const model = new ZoomRectangleModel(options);
    super(model);

    this._graphics = new PIXI.Graphics();
    this.group.addChild(this._graphics);

    this.chart = chart;
    this._rect = chart.getGrid().getRect().clone();

    this.onPointerDownBound = this.onPointerDown.bind(this);
    this.onPointerMoveBound = this.onPointerMove.bind(this);
    this.onPointerUpBound = this.onPointerUp.bind(this);
  }

  attachEventListeners(): void {
    this.chart.app.stage.on("pointerdown", this.onPointerDownBound);
    this.chart.app.stage.on("pointermove", this.onPointerMoveBound);
    this.chart.app.stage.on("pointerup", this.onPointerUpBound);
  }

  detachEventListeners(): void {
    this.chart.app.stage.off("pointerdown", this.onPointerDownBound);
    this.chart.app.stage.off("pointermove", this.onPointerMoveBound);
    this.chart.app.stage.off("pointerup", this.onPointerUpBound);
  }

  activate(): void {
    this._isActive = true;
  }

  deactivate(): void {
    this._isActive = false;
  }

  override getRect(): LayoutRect {
    return this._rect;
  }

  override setRect(rect: LayoutRect): void {
    this._rect = rect;
  }

  override render(): void {
    this._graphics.clear();

    if (!this._isVisible) {
      return;
    }

    const x1 = Math.min(this._start.x, this._end.x);
    const x2 = Math.max(this._start.x, this._end.x);

    const rect = this.chart.getGrid().getRect();
    const y = rect.y;
    const width = x2 - x1;
    const height = rect.height;

    const { color, opacity, borderWidth } = this.model.options;
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

  private onPointerDown(event: InteractionEvent): void {
    if (!this._isActive) {
      return;
    }

    this._isDragging = true;
    this._isVisible = true;
    this._start = event.data.getLocalPosition(this.chart.app.stage);
  }

  private onPointerMove(event: InteractionEvent): void {
    if (!this._isActive || !this._isDragging) {
      return;
    }

    this._end = event.data.getLocalPosition(this.chart.app.stage);
    this.render();
  }

  private onPointerUp(): void {
    if (!this._isActive || !this._isDragging) {
      return;
    }

    this._isDragging = false;
    this._isVisible = false;
    this.render();

    const xAxis = this.chart.getXAxis();
    const start = xAxis.getValueForPixel(this._start.x);
    const end = xAxis.getValueForPixel(this._end.x);
    this.emit("extentSelected", [start, end]);
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

  activate(): void {
    this._zoomRectangle?.activate();
  }

  deactivate(): void {
    this._zoomRectangle?.deactivate();
  }

  dispose(): void {
    this._zoomRectangle?.dispose();
  }

  getInstance(): ZoomRectangle {
    if (!this._zoomRectangle) {
      throw new Error("ZoomRectangle extension not initialized");
    }
    return this._zoomRectangle;
  }
}
