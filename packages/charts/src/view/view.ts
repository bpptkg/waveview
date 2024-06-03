import * as PIXI from "pixi.js";
import { Model } from "../model/model";
import { LayoutRect } from "../util/types";

export abstract class View<T extends Model = Model> {
  type = "view";
  readonly model: T;
  readonly group: PIXI.Container = new PIXI.Container();

  constructor(model: T) {
    this.model = model;
  }

  getModel(): T {
    return this.model;
  }

  abstract getRect(): LayoutRect;

  abstract render(): void;
}
