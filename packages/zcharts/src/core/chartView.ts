import * as zrender from "zrender";
import { BoundingRect, ZRenderType } from "zrender";
import { AxisView } from "../axis/axisView";
import { GridView } from "../grid/gridView";
import { getThemeManager } from "../theme/themeManager";
import { LayoutRect, ThemeName, ThemeStyle } from "../util/types";
import { ChartModel, ChartOptions } from "./chartModel";
import { View, ZChartRenderingContext } from "./view";

export abstract class ChartView<
  T extends ChartOptions = ChartOptions
> extends View<ChartModel<T>> {
  readonly dom: HTMLCanvasElement;
  readonly zr: ZRenderType;
  private rect: LayoutRect;
  private views: View[] = [];
  private currentTheme: ThemeName = "light";

  constructor(dom: HTMLCanvasElement, options?: T) {
    const model = new ChartModel(options);
    super(model);

    this.dom = dom;

    this.zr = zrender.init(dom, {
      renderer: "canvas",
    });

    if (options?.autoDensity) {
      this.autoDensity();
    }

    this.rect = new BoundingRect(0, 0, dom.width, dom.height);
  }

  private autoDensity(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.dom.getBoundingClientRect();
    this.dom.width = rect.width * dpr;
    this.dom.height = rect.height * dpr;
    this.dom.style.width = `${rect.width}px`;
    this.dom.style.height = `${rect.height}px`;
    const ctx = this.dom.getContext("2d")!;
    ctx.scale(dpr, dpr);
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
  }

  removeComponent(view: View): void {
    const index = this.views.indexOf(view);
    if (index >= 0) {
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
    return this.dom.toDataURL(type, quality);
  }

  render(): void {
    this.group.removeAll();
    const context: ZChartRenderingContext = {
      ctx: this.dom.getContext("2d")!,
      chart: this,
    };

    for (const view of this.views) {
      view.render(context);
      this.group.add(view.group);
    }
    this.zr.add(this.group);
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
