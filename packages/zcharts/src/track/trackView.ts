import * as zrender from "zrender";
import { AxisView } from "../axis/axisView";
import { ChartView } from "../core/chartView";
import { View } from "../core/view";
import { LineSeriesView } from "../series/LineSeriesView";
import { SpectrogramView } from "../spectrogram/spectrogramView";
import { LayoutRect, ThemeStyle } from "../util/types";
import { TrackModel, TrackOptions } from "./trackModel";

export class TrackView extends View<TrackModel> {
  private spectrogram: SpectrogramView;
  private signal: LineSeriesView;
  private rect: LayoutRect;
  private leftYAxis: AxisView;
  private rightYAxis: AxisView;
  readonly chart: ChartView;

  constructor(chart: ChartView, options?: Partial<TrackOptions>) {
    const model = new TrackModel(options);
    super(model);
    this.rect = new zrender.BoundingRect(0, 0, 0, 0);
    this.chart = chart;

    this.leftYAxis = new AxisView(this, { position: "left" });
    this.leftYAxis.setExtent(chart.getYExtent());
    this.signal = new LineSeriesView(chart.getXAxis(), this.leftYAxis, this);

    this.rightYAxis = new AxisView(this, {
      position: "right",
      minorTick: {
        show: false,
      },
      axisTick: {
        inside: false,
        length: 5,
      },
      axisLabel: {
        fontSize: 9,
        reverse: true,
      },
      name: "Hz",
      nameGap: 25,
      nameStyle: {
        fontSize: 9,
      },
    });
    this.rightYAxis.setExtent([0, 50]);
    this.spectrogram = new SpectrogramView(
      chart.getXAxis(),
      this.rightYAxis,
      this
    );
    this.rightYAxis.hide();
  }

  getSignal(): LineSeriesView {
    return this.signal;
  }

  getSpectrogram(): SpectrogramView {
    return this.spectrogram;
  }

  showSignal(): void {
    this.signal.show();
  }

  showSpectrogram(): void {
    this.spectrogram.show();
    this.rightYAxis.show();
  }

  hideSignal(): void {
    this.signal.hide();
  }

  hideSpectrogram(): void {
    this.spectrogram.hide();
    this.rightYAxis.hide();
  }

  getRect(): LayoutRect {
    return this.rect;
  }

  setRect(rect: LayoutRect): void {
    this.rect = rect;
    this.leftYAxis.setRect(rect);
    this.rightYAxis.setRect(rect);
  }

  resize(): void {
    this.setRect(this.rect);
  }

  clear(): void {
    this.group.removeAll();
  }

  dispose(): void {
    this.spectrogram.dispose();
    this.signal.dispose();
  }

  applyThemeStyle(theme: ThemeStyle): void {
    const { lineColor, lineWidth } = theme.gridStyle;
    this.model.mergeOptions({
      textColor: theme.textColor,
      fontSize: theme.fontSize,
      fontFamily: theme.fontFamily,
      borderColor: lineColor,
      borderWidth: lineWidth,
    });
    this.signal.applyThemeStyle(theme);
  }

  render(): void {
    this.clear();
    this.renderLabels();
    this.renderStyle();
    this.renderSignal();
    this.renderSpectrogram();
  }

  private renderSignal(): void {
    this.signal.render();
    this.group.add(this.signal.group);
  }

  private renderSpectrogram(): void {
    this.spectrogram.render();
    this.rightYAxis.render();
    this.group.add(this.rightYAxis.group);
    this.group.add(this.spectrogram.group);
  }

  private renderLabels(): void {
    const { label, margin, textColor, fontSize, fontFamily } =
      this.model.getOptions();

    const { x, y, height } = this.getRect();

    const text = new zrender.Text({
      style: {
        text: label,
        fill: textColor,
        fontFamily,
        fontSize,
        align: "right",
        verticalAlign: "middle",
      },
      x: x - margin,
      y: y + height / 2,
    });
    text.silent = true;
    this.group.add(text);
  }

  private renderStyle(): void {
    const { style } = this.model.getOptions();
    if (style === "bracket") {
      this.renderBracketStyle();
    }
  }

  private renderBracketStyle(): void {
    const { borderColor, borderWidth } = this.model.getOptions();
    const { x, y, height } = this.getRect();
    const tickLength = 5;
    const leftBorder = new zrender.Line({
      shape: {
        x1: x,
        y1: y,
        x2: x,
        y2: y + height,
      },
      style: {
        stroke: borderColor,
        lineWidth: borderWidth,
      },
    });
    const topTick = new zrender.Line({
      shape: {
        x1: x,
        y1: y,
        x2: x + tickLength,
        y2: y,
      },
      style: {
        stroke: borderColor,
        lineWidth: borderWidth,
      },
    });
    const bottomTick = new zrender.Line({
      shape: {
        x1: x,
        y1: y + height,
        x2: x + tickLength,
        y2: y + height,
      },
      style: {
        stroke: borderColor,
        lineWidth: borderWidth,
      },
    });
    this.group.add(leftBorder);
    this.group.add(topTick);
    this.group.add(bottomTick);
  }
}
