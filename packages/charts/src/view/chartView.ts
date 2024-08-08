import * as PIXI from "pixi.js";
import { Grid } from "../grid/grid";
import { ChartModel, ChartOptions } from "../model/chartModel";
import { ThemeManager } from "../theme/themeManager";
import {
  EventMap,
  Extension,
  LayoutRect,
  ThemeName,
  ThemeStyle,
} from "../util/types";
import { uid } from "../util/uid";
import { View } from "./view";

export interface ChartEventMap extends EventMap {
  focus: () => void;
  blur: () => void;
}

/**
 * A base class for creating a chart view.
 */
export abstract class ChartView<
  T extends ChartOptions = ChartOptions,
  E extends ChartEventMap = ChartEventMap
> extends View<ChartModel<T>, E> {
  override type = "chart";

  protected _rect: LayoutRect;
  protected _mask = new PIXI.Graphics();
  protected _views: View[] = [];
  protected _currentTheme: ThemeName = "light";
  protected _isFocused = false;
  protected _extensions: Extension<this>[] = [];

  readonly uid: number = uid();
  readonly dom: HTMLCanvasElement;
  readonly app: PIXI.Application = new PIXI.Application();

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

    this.app.stage.interactive = true;
    this.app.stage.sortableChildren = true;
    this.app.stage.hitArea = new PIXI.Rectangle(
      0,
      0,
      this.dom.width,
      this.dom.height
    );

    const rect = this.getGrid().getRect();
    this._mask.rect(rect.x, rect.y, rect.width, rect.height);
    this.app.stage.addChild(this._mask);
    this.app.stage.addChild(this.group);
    // this.group.mask = this._mask;
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

  addComponent(component: View): void {
    this._views.push(component);
    this.app.stage.addChild(component.group);
  }

  removeComponent(component: View): void {
    const index = this._views.indexOf(component);
    if (index >= 0) {
      this._views.splice(index, 1);
      this.app.stage.removeChild(component.group);
    }
  }

  dispose(): void {
    // Dispose all views
    for (const view of this._views) {
      view.dispose();
    }
    this._views = [];

    // Dispose all extensions
    for (const extension of this._extensions) {
      extension.uninstall(this);
    }
    this._extensions = [];

    // Remove all event listeners
    this.removeAllEventListeners();

    // Destroy PIXI objects
    this._mask.destroy({ children: true });
    this.group.destroy({ children: true });
    this.app.destroy(true);
  }

  toDataURL(type?: string, quality?: number): string {
    return this.dom.toDataURL(type, quality);
  }

  focus(): void {
    this._isFocused = true;
    this.emit("focus");
  }

  blur(): void {
    this._isFocused = false;
    this.emit("blur");
  }

  isFocused(): boolean {
    return this._isFocused;
  }

  use(extension: Extension<ChartView<T>>): void {
    extension.install(this);
    this._extensions.push(extension);
  }

  getTheme(): ThemeStyle {
    return ThemeManager.getInstance().getTheme(this._currentTheme);
  }

  setTheme(theme: ThemeName): void {
    this._currentTheme = theme;
    this.applyThemeStyle(this.getTheme());
  }

  override applyThemeStyle(theme: ThemeStyle): void {
    this.model.mergeOptions({
      backgroundColor: theme.backgroundColor,
    } as Partial<T>);
    for (const view of this._views) {
      view.applyThemeStyle(theme);
    }
    this.app.renderer.background.color = theme.backgroundColor;
  }
}
