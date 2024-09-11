import * as zrender from "zrender";
import { BoundingRect, ZRenderType } from "zrender";
import { AxisView } from "../axis/axisView";
import { GridView } from "../grid/gridView";
import { getThemeManager } from "../theme/themeManager";
import { LayoutRect, ThemeName, ThemeStyle } from "../util/types";
import { ChartModel, ChartOptions } from "./chartModel";
import { View } from "./view";

export abstract class ChartView<
  T extends ChartOptions = ChartOptions
> extends View<ChartModel<T>> {
  readonly dom: HTMLElement;
  readonly zr: ZRenderType;
  protected rect: LayoutRect;
  protected views: View[] = [];
  protected currentTheme: ThemeName = "light";

  constructor(dom: HTMLElement, options?: T) {
    const model = new ChartModel(options);
    super(model);

    this.dom = dom;

    this.zr = zrender.init(dom, {
      renderer: "canvas",
    });
    this.zr.add(this.group);

    this.rect = new BoundingRect(0, 0, this.getWidth(), this.getHeight());
  }

  getWidth(): number {
    const width = this.zr.getWidth();
    return width || this.dom.clientWidth;
  }

  getHeight(): number {
    const height = this.zr.getHeight();
    return height || this.dom.clientHeight;
  }

  getRect(): LayoutRect {
    return this.rect;
  }

  setRect(rect: LayoutRect): void {
    this.rect = rect;
  }

  addComponent(view: View): void {
    this.views.push(view);
    this.zr.add(view.group);
  }

  removeComponent(view: View): void {
    const index = this.views.indexOf(view);
    if (index >= 0) {
      this.zr.remove(view.group);
      this.views.splice(index, 1);
    }
  }

  getComponents(): View[] {
    return this.views;
  }

  filterComponents(predicate: (view: View) => boolean): View[] {
    return this.views.filter(predicate);
  }

  clear() {
    this.zr.clear();
  }

  dispose(): void {
    this.zr.dispose();
  }

  toDataURL(type?: string, quality?: number): string {
    const canvas = this.dom.querySelector("canvas");
    return canvas?.toDataURL(type, quality) || "";
  }

  render(): void {
    for (const view of this.views) {
      view.render();
    }
  }

  refresh(): void {
    this.zr.refresh();
  }

  getThemeStyle(): ThemeStyle {
    return getThemeManager().getTheme(this.currentTheme);
  }

  setTheme(theme: ThemeName): void {
    this.currentTheme = theme;
    this.applyThemeStyle(this.getThemeStyle());
  }

  applyThemeStyle(theme: ThemeStyle): void {
    this.model.mergeOptions({
      backgroundColor: theme.backgroundColor,
    } as Partial<T>);
    for (const view of this.views) {
      view.applyThemeStyle(theme);
    }
    this.zr.setBackgroundColor(theme.backgroundColor);
  }

  abstract getGrid(): GridView;

  abstract getXAxis(): AxisView;

  abstract getYExtent(): [number, number];
}
