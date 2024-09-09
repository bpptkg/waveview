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
  private yAxis: AxisView;

  constructor(chart: ChartView, options?: Partial<TrackOptions>) {
    const model = new TrackModel(options);
    super(model);
    this.rect = new zrender.BoundingRect(0, 0, 0, 0);
    this.spectrogram = new SpectrogramView(this);
    this.yAxis = new AxisView(this, { position: "left" });
    this.yAxis.setExtent(chart.getYExtent());
    this.signal = new LineSeriesView(chart.getXAxis(), this.yAxis, this);
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
  }

  hideSignal(): void {
    this.signal.hide();
  }

  hideSpectrogram(): void {
    this.spectrogram.hide();
  }

  getRect(): LayoutRect {
    return this.rect;
  }

  setRect(rect: LayoutRect): void {
    this.rect = rect;
    this.yAxis.setRect(rect);
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
    this.model.mergeOptions({
      textColor: theme.textColor,
      fontSize: theme.fontSize,
      fontFamily: theme.fontFamily,
    });
    this.signal.applyThemeStyle(theme);
  }

  render(): void {
    this.clear();
    this.renderLabels();
    this.renderSignal();
  }

  private renderSignal(): void {
    this.signal.render();
    this.group.add(this.signal.group);
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
}
