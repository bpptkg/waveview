import * as zrender from "zrender";
import { AxisView } from "../axis/axisView";
import { ChartView } from "../core/chartView";
import { EventEmitter } from "../core/eventEmitter";
import { View } from "../core/view";
import { LineSeriesView } from "../series/LineSeriesView";
import { SpectrogramView } from "../spectrogram/spectrogramView";
import { LayoutRect, ThemeStyle } from "../util/types";
import { TrackEventMap } from "./trackEventMap";
import { TrackModel, TrackOptions } from "./trackModel";

export class TrackView extends View<TrackModel> {
  private spectrogram: SpectrogramView;
  private signal: LineSeriesView;
  private rect: LayoutRect;
  private leftYAxis: AxisView;
  private rightYAxis: AxisView;
  readonly chart: ChartView;
  interactive: boolean = false;
  private label: zrender.Text;
  private eventEmitter = new EventEmitter<TrackEventMap>();
  private bracketGroup: zrender.Group;

  private leftBorder: zrender.Line;
  private topTick: zrender.Line;
  private bottomTick: zrender.Line;

  constructor(chart: ChartView, options?: Partial<TrackOptions>) {
    const model = new TrackModel(options);
    super(model);
    this.rect = new zrender.BoundingRect(0, 0, 0, 0);
    this.chart = chart;

    this.label = new zrender.Text();
    this.label.on(
      "contextmenu",
      (e) => {
        e.event.preventDefault();
        this.emit("contextmenu", e, this);
      },
      this
    );
    this.label.on(
      "dblclick",
      (e) => {
        this.emit("doubleClick", e, this);
      },
      this
    );

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
        formatter(value) {
          return value.toFixed(0);
        },
      },
      name: "Hz",
      nameGap: 28,
      nameStyle: {
        fontSize: 9,
      },
    });
    this.rightYAxis.setExtent([0, 50]); // default frequency range (0-50 Hz)
    this.spectrogram = new SpectrogramView(
      chart.getXAxis(),
      this.rightYAxis,
      this
    );
    this.rightYAxis.hide();
    this.group.add(this.label);
    this.group.add(this.leftYAxis.group);
    this.group.add(this.rightYAxis.group);
    this.group.add(this.signal.group);
    this.group.add(this.spectrogram.group);

    this.leftBorder = new zrender.Line();
    this.topTick = new zrender.Line();
    this.bottomTick = new zrender.Line();
    this.bracketGroup = new zrender.Group();
    this.bracketGroup.add(this.leftBorder);
    this.bracketGroup.add(this.topTick);
    this.bracketGroup.add(this.bottomTick);
    this.group.add(this.bracketGroup);
  }

  getChart(): ChartView {
    return this.chart;
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

  getLeftYAxis(): AxisView {
    return this.leftYAxis;
  }

  getRightYAxis(): AxisView {
    return this.rightYAxis;
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
    this.signal.resize();
    this.spectrogram.resize();
    this.leftYAxis.resize();
    this.rightYAxis.resize();
  }

  clear(): void {}

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
    this.spectrogram.applyThemeStyle(theme);
    this.leftYAxis.applyThemeStyle(theme);
    this.rightYAxis.applyThemeStyle(theme);
  }

  render(): void {
    if (!this.visible) {
      this.group.hide();
      return;
    }
    this.renderLabels();
    this.renderStyle();
    this.renderSignal();
    this.renderSpectrogram();
    this.group.show();
  }

  private renderSignal(): void {
    this.signal.render();
  }

  private renderSpectrogram(): void {
    this.spectrogram.render();
    this.rightYAxis.render();
  }

  private renderLabels(): void {
    const { label, margin, textColor, fontSize, fontFamily, markerColor } =
      this.model.getOptions();

    const { x, y, height } = this.getRect();
    let fillColor = textColor;
    if (markerColor) {
      fillColor = "white";
    }

    this.label.attr({
      style: {
        text: label,
        fill: fillColor,
        fontFamily,
        fontSize,
        align: "right",
        verticalAlign: "middle",
        backgroundColor: markerColor,
        padding: [2, 2],
      },
      x: x - margin,
      y: y + height / 2,
      silent: !this.interactive,
    });
  }

  private renderStyle(): void {
    const { style } = this.model.getOptions();
    if (style === "bracket") {
      this.renderBracketStyle();
      this.bracketGroup.show();
    } else {
      this.bracketGroup.hide();
    }
  }

  private renderBracketStyle(): void {
    const { borderColor, borderWidth } = this.model.getOptions();
    const { x, y, height } = this.getRect();
    const tickLength = 5;
    this.leftBorder.attr({
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
      silent: true,
    });
    this.topTick.attr({
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
      silent: true,
    });
    this.bottomTick.attr({
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
      silent: true,
    });
  }

  on<K extends keyof TrackEventMap>(
    event: K,
    listener: TrackEventMap[K]
  ): void {
    this.eventEmitter.on(event, listener);
  }

  off<K extends keyof TrackEventMap>(
    event: K,
    listener: TrackEventMap[K]
  ): void {
    this.eventEmitter.off(event, listener);
  }

  emit<K extends keyof TrackEventMap>(
    event: K,
    ...args: Parameters<TrackEventMap[K]>
  ): void {
    this.eventEmitter.emit(event, ...args);
  }
}
