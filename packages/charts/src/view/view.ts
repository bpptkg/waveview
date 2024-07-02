import * as PIXI from "pixi.js";
import { EventEmitter } from "../event/eventEmitter";
import { Model } from "../model/model";
import { EventMap, LayoutRect, ResizeOptions, ThemeStyle } from "../util/types";

/**
 * View is the base class for all visual components in the chart.
 */
export abstract class View<
  T extends Model = Model,
  E extends EventMap = EventMap
> extends EventEmitter<E> {
  type = "view";
  readonly model: T;
  readonly group: PIXI.Container = new PIXI.Container();

  constructor(model: T) {
    super();
    this.model = model;
  }

  getModel(): T {
    return this.model;
  }

  abstract show(): void;

  abstract hide(): void;

  abstract getRect(): LayoutRect;

  abstract setRect(rect: LayoutRect): void;

  abstract render(): void;

  abstract dispose(): void;

  abstract resize(options?: ResizeOptions): void;

  abstract focus(): void;

  abstract blur(): void;

  abstract applyThemeStyle(theme: ThemeStyle): void;
}
