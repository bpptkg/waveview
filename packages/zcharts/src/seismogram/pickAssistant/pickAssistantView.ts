import * as zrender from "zrender";
import { View } from "../../core/view";
import { LayoutRect, ThemeStyle } from "../../util/types";
import { Seismogram } from "../seismogram";
import { PickAssistantModel } from "./pickAssistantModel";

export class PickAssistantView extends View<PickAssistantModel> {
  override readonly type: string = "pickAssistant";
  private rect: LayoutRect;
  private chart: Seismogram;
  private startLine: zrender.Line;
  private endLine: zrender.Line;

  constructor(chart: Seismogram, options?: Partial<PickAssistantModel>) {
    const model = new PickAssistantModel(options || {});
    super(model);
    this.rect = chart.getGrid().getRect();
    this.chart = chart;
    this.startLine = new zrender.Line();
    this.endLine = new zrender.Line();
    this.startLine.setClipPath(
      new zrender.Rect({ shape: this.chart.getGrid().getRect() })
    );
    this.endLine.setClipPath(
      new zrender.Rect({ shape: this.chart.getGrid().getRect() })
    );
  }

  setRange(start: number, end: number): void {
    this.model.mergeOptions({
      start,
      end,
    });
  }

  getRange(): [number, number] {
    const { start, end } = this.model.getOptions();
    return [start, end];
  }

  clearRange(): void {
    this.model.clear();
  }

  getRect(): LayoutRect {
    return this.rect;
  }

  setRect(rect: LayoutRect): void {
    this.rect = rect;
  }

  resize(): void {
    this.rect = this.chart.getGrid().getRect();
    this.startLine.setClipPath(new zrender.Rect({ shape: this.rect }));
    this.endLine.setClipPath(new zrender.Rect({ shape: this.rect }));
  }

  clear(): void {
    this.model.clear();
  }

  dispose(): void {
    this.clear();
  }

  render(): void {
    if (this.model.isEmpty()) {
      this.group.removeAll();
      return;
    }

    const {
      start,
      end,
      color,
      startLineColor,
      endLineColor,
      lineWidth,
      lineDash,
      lineCap,
      lineJoin,
      opacity,
    } = this.model.getOptions();
    const xAxis = this.chart.getXAxis();
    const { y, height } = xAxis.getRect();

    const x1 = xAxis.getPixelForValue(start);
    const x2 = xAxis.getPixelForValue(end);

    this.startLine.attr({
      shape: {
        x1: x1,
        y1: y,
        x2: x1,
        y2: y + height,
      },
      style: {
        stroke: startLineColor || color,
        lineWidth,
        lineDash,
        lineCap,
        lineJoin,
        opacity,
      },
      silent: true,
    });
    this.group.add(this.startLine);
    this.startLine.show();

    this.endLine.attr({
      shape: {
        x1: x2,
        y1: y,
        x2: x2,
        y2: y + height,
      },
      style: {
        stroke: endLineColor || color,
        lineWidth,
        lineDash,
        lineCap,
        lineJoin,
        opacity,
      },
      silent: true,
    });
    this.group.add(this.endLine);
    this.endLine.show();
  }

  applyThemeStyle(theme: ThemeStyle): void {
    const { pickAssistantStyle } = theme;
    this.model.mergeOptions({
      startLineColor: pickAssistantStyle.startLineColor,
      endLineColor: pickAssistantStyle.endLineColor,
      lineWidth: pickAssistantStyle.lineWidth,
      lineDash: pickAssistantStyle.lineDash,
      lineCap: pickAssistantStyle.lineCap,
      lineJoin: pickAssistantStyle.lineJoin,
      opacity: pickAssistantStyle.opacity,
    });
  }
}
