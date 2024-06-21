import * as PIXI from "pixi.js";
import { LayoutRect, ThemeStyle } from "../util/types";
import { View } from "../view/view";
import { GridModel, GridOptions } from "./gridModel";

export class Grid extends View<GridModel> {
  override readonly type = "grid";
  private _rect: LayoutRect;
  private readonly _graphics: PIXI.Graphics;

  constructor(rect: LayoutRect, options?: Partial<GridOptions>) {
    const model = new GridModel(options);
    super(model);

    this._rect = rect;
    this._graphics = new PIXI.Graphics();
    this.group.addChild(this._graphics);
  }

  applyThemeStyle(theme: ThemeStyle): void {
    const { gridStyle } = theme;
    this.model.mergeOptions({
      borderColor: gridStyle.lineColor,
      borderWidth: gridStyle.lineWidth,
    });
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
    this._graphics.clear();

    const { show, backgroundColor, borderColor, borderWidth } =
      this.model.getOptions();

    if (!show) {
      return;
    }

    const { x, y, width, height } = this.getRect();
    this._graphics
      .rect(x, y, width, height)
      .stroke({
        color: borderColor,
        width: borderWidth,
      })
      .fill({
        color: backgroundColor,
      });
  }

  override dispose(): void {
    this._graphics.destroy();
    this.group.destroy();
  }
}
