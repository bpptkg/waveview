import * as PIXI from "pixi.js";
import { LayoutRect } from "../util/types";
import { View } from "../view/view";
import { GridModel, GridOptions } from "./gridModel";

export class Grid extends View<GridModel> {
  override type = "grid";
  private _rect: LayoutRect;

  constructor(rect: LayoutRect, options?: Partial<GridOptions>) {
    const model = new GridModel(options);
    super(model);

    this._rect = rect;
  }

  override getRect(): LayoutRect {
    const { x, y, width, height } = this._rect;
    const { top, right, bottom, left } = this.model.getOptions();
    return new PIXI.Rectangle(
      x + left,
      y + top,
      width - left - right,
      height - top - bottom
    );
  }

  override setRect(rect: LayoutRect): void {
    this._rect = rect;
  }

  override render(): void {
    this.clear();

    const { show, backgroundColor, borderColor, borderWidth } =
      this.model.getOptions();

    if (!show) {
      return;
    }

    const { x, y, width, height } = this.getRect();
    const graphics = new PIXI.Graphics();
    graphics
      .rect(x, y, width, height)
      .stroke({
        color: borderColor,
        width: borderWidth,
      })
      .fill({
        color: backgroundColor,
      });
    this.group.addChild(graphics);
  }
}
