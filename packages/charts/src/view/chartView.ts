import * as PIXI from "pixi.js";
import { Grid } from "../grid/grid";
import { ChartModel, ChartOptions } from "../model/chartModel";
import darkTheme from "../theme/dark";
import lightTheme from "../theme/light";
import {
  Extension,
  LayoutRect,
  RenderableGroup,
  ThemeMode,
  ThemeStyle,
} from "../util/types";
import { View } from "./view";

export interface ChartType<T extends ChartOptions> {
  type: string;
  dom: HTMLCanvasElement;
  app: PIXI.Application;
  width: number;
  height: number;
  getOptions(): ChartOptions;
  getModel(): ChartModel<T>;
  getWidth(): number;
  getHeight(): number;
  init(): Promise<void>;
  render(): void;
  resize(width: number, height: number): void;
  dispose(): void;
  toDataURL(type?: string, quality?: number): string;
  focus(): void;
  blur(): void;
  isFocused(): boolean;
  getRect(): LayoutRect;
  setRect(rect: LayoutRect): void;
  addComponent(component: RenderableGroup): void;
  removeComponent(component: RenderableGroup): void;
  getGrid(): Grid;
  use(extension: Extension<ChartType<T>>): void;
  setTheme(theme: ThemeMode): void;
  getTheme(): ThemeStyle;
}

export abstract class ChartView<T extends ChartOptions = ChartOptions>
  extends View<ChartModel<T>>
  implements ChartType<T>
{
  override type = "chart";

  protected _rect: LayoutRect;
  protected _views: RenderableGroup[] = [];
  protected _isFocused = false;
  protected _mask = new PIXI.Graphics();
  protected _currentTheme: ThemeStyle = lightTheme;

  readonly dom: HTMLCanvasElement;
  readonly app: PIXI.Application = new PIXI.Application();
  readonly content = new PIXI.Container();

  constructor(dom: HTMLCanvasElement, options?: T) {
    const model = new ChartModel(options);
    super(model);

    this.dom = dom;
    this._rect = new PIXI.Rectangle(0, 0, dom.width, dom.height);
  }

  getOptions(): T {
    return this.model.getOptions() as T;
  }

  get width(): number {
    return this.dom.width;
  }

  get height(): number {
    return this.dom.height;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  async init(): Promise<void> {
    const options = this.model.getOptions();

    await this.app.init({
      canvas: this.dom,
      backgroundColor: options.backgroundColor,
      antialias: options.antialias,
      autoDensity: options.autoDensity,
      resolution: options.devicePixelRatio,
      width: this.dom.width,
      height: this.dom.height,
      resizeTo: options.resizeTo,
    });

    this.app.stage.addChild(this.group);
    this.app.stage.interactive = true;
    this.app.stage.sortableChildren = true;
    this.app.stage.hitArea = new PIXI.Rectangle(
      0,
      0,
      this.dom.width,
      this.dom.height
    );

    const rect = this.getGrid().getRect();
    this._mask.rect(rect.x, rect.y, rect.width, rect.height).fill({
      color: "0xfff",
    });
    this.app.stage.addChild(this._mask);
    this.app.stage.addChild(this.content);
    this.content.mask = this._mask;
  }

  getRect(): LayoutRect {
    return this._rect;
  }

  setRect(rect: LayoutRect): void {
    this._rect = rect;
  }

  abstract getGrid(): Grid;

  render(): void {
    for (const view of this._views) {
      view.render();
    }
    this.app.renderer.render(this.app.stage);
  }

  addComponent(component: RenderableGroup): void {
    this._views.push(component);
    this.group.addChild(component.group);
  }

  removeComponent(component: RenderableGroup): void {
    const index = this._views.indexOf(component);
    if (index >= 0) {
      this._views.splice(index, 1);
      this.group.removeChild(component.group);
    }
  }

  abstract resize(width: number, height: number): void;

  dispose(): void {
    for (const view of this._views) {
      view.dispose();
    }
    this.app.destroy(true);
  }

  toDataURL(type?: string, quality?: number): string {
    return this.dom.toDataURL(type, quality);
  }

  focus(): void {
    this._isFocused = true;
  }

  blur(): void {
    this._isFocused = false;
  }

  isFocused(): boolean {
    return this._isFocused;
  }

  use(extension: Extension<ChartView<T>>): void {
    extension.install(this);
  }

  setTheme(theme: ThemeMode): void {
    this._currentTheme = theme === "light" ? lightTheme : darkTheme;
    this.applyThemeStyles();
  }

  getTheme(): ThemeStyle {
    return this._currentTheme;
  }

  abstract applyThemeStyles(): void;
}
