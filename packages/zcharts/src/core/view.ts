import { Group } from "zrender";
import { LayoutRect, ThemeStyle } from "../util/types";
import { Model } from "./model";

export abstract class View<T extends Model = Model> {
  readonly type: string = "view";
  readonly model: T;
  readonly group: Group = new Group();

  constructor(model: T) {
    this.model = model;
  }

  getModel(): T {
    return this.model;
  }

  show(): void {
    this.group.show();
  }

  hide(): void {
    this.group.hide();
  }

  abstract getRect(): LayoutRect;

  abstract setRect(rect: LayoutRect): void;

  abstract resize(): void;

  abstract clear(): void;

  abstract render(): void;

  abstract dispose(): void;

  abstract applyThemeStyle(theme: ThemeStyle): void;
}
