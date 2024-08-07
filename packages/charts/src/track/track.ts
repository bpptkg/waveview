import * as PIXI from "pixi.js";
import { Axis } from "../axis/axis";
import { LineSeries } from "../series/line";
import { LayoutRect, ResizeOptions, ThemeStyle } from "../util/types";
import { ChartView } from "../view/chartView";
import { View } from "../view/view";
import { TrackModel, TrackOptions } from "./trackModel";

export class Track extends View<TrackModel> {
  override type = "track";
  private _rect: LayoutRect;
  private _series: LineSeries;
  private _highlighted: boolean = false;
  private readonly _leftText: PIXI.Text;
  private readonly _rightText: PIXI.Text;
  private readonly _highlight: PIXI.Graphics;

  readonly xAxis: Axis;
  readonly yAxis: Axis;
  readonly chart: ChartView;

  constructor(
    rect: LayoutRect,
    xAxis: Axis,
    yAxis: Axis,
    chart: ChartView,
    options?: Partial<TrackOptions>
  ) {
    const model = new TrackModel(options);
    super(model);

    this._rect = rect;
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.chart = chart;
    this._series = new LineSeries(this.xAxis, this.yAxis, this.chart);

    this._leftText = new PIXI.Text();
    this._rightText = new PIXI.Text();
    this._highlight = new PIXI.Graphics();

    this.group.addChild(this._leftText);
    this.group.addChild(this._rightText);
    this.group.addChild(this._highlight);

    // Add the series to the masked content container.
    this.chart.group.addChild(this._series.group);
  }

  show(): void {
    this.group.visible = true;
  }

  hide(): void {
    this.group.visible = false;
  }

  focus(): void {}

  blur(): void {}

  resize(options: ResizeOptions): void {
    const { width, height } = options;
    const { x, y } = this.getRect();
    this.setRect(new PIXI.Rectangle(x, y, width, height));
  }

  applyThemeStyle(theme: ThemeStyle): void {
    const { highlightStyle } = theme;
    this.model.mergeOptions({
      textColor: theme.textColor,
      fontSize: theme.fontSize,
      fontFamily: theme.fontFamily,
      highlight: {
        color: highlightStyle.color,
        opacity: highlightStyle.opacity,
        borderWidth: highlightStyle.borderWidth,
      },
    });
    this._series.applyThemeStyle(theme);
  }

  getXRange(): [number, number] {
    return this._series.getModel().getXRange();
  }

  getYRange(): [number, number] {
    return this._series.getModel().getYRange();
  }

  getSeries(): LineSeries {
    return this._series;
  }

  setSeries(series: LineSeries): void {
    this._series = series;
  }

  fitY(): void {
    const [ymin, ymax] = this.getYRange();
    if (isFinite(ymin) && isFinite(ymax)) {
      this.yAxis.setExtent([ymin, ymax]);
    }
  }

  fitX(): void {
    const [xmin, xmax] = this.getXRange();
    if (isFinite(xmin) && isFinite(xmax)) {
      this.xAxis.setExtent([xmin, xmax]);
    }
  }

  fitContent(): void {
    this.fitX();
    this.fitY();
  }

  setXExtent(extent: [number, number]): void {
    this.xAxis.setExtent(extent);
  }

  setYExtent(extent: [number, number]): void {
    this.yAxis.setExtent(extent);
  }

  highlight(): void {
    this._highlighted = true;
  }

  unhighlight(): void {
    this._highlighted = false;
  }

  isHighlighted(): boolean {
    return this._highlighted;
  }

  getTrackHeadRect(): LayoutRect {
    const gridRect = this.chart.getGrid().getRect();
    const rect = this.getRect();
    return new PIXI.Rectangle(0, rect.y, gridRect.x, rect.height);
  }

  getTrackTailRect(): LayoutRect {
    const chartWidth = this.chart.getRect().width;
    const gridRect = this.chart.getGrid().getRect();
    const rect = this.getRect();
    return new PIXI.Rectangle(
      gridRect.x + gridRect.width,
      rect.y,
      chartWidth - (gridRect.x + gridRect.width),
      rect.height
    );
  }

  getRect(): LayoutRect {
    return this._rect;
  }

  setRect(rect: LayoutRect): void {
    this._rect = rect;
    this.yAxis.setRect(rect);
  }

  render(): void {
    this._renderLabels();
    this._renderSeries();
    this._renderHighlight();
  }

  dispose(): void {
    this._series.dispose();
    this._leftText.destroy();
    this._rightText.destroy();
    this._highlight.destroy();
    this.group.destroy();
  }

  private _renderHighlight(): void {
    this._highlight.clear();

    if (!this._highlighted) {
      return;
    }

    const { x, y, width, height } = this.getRect();
    const { color, opacity, borderWidth } = this.model.getOptions().highlight;

    this._highlight
      .rect(x, y, width, height)
      .stroke({
        color: color,
        width: borderWidth,
      })
      .fill({
        color: color,
        alpha: opacity,
      });
  }

  private _renderLabels(): void {
    const { leftLabel, rightLabel, margin, textColor, fontSize, fontFamily } =
      this.model.getOptions();

    const { x, y, width, height } = this.getRect();

    this._leftText.text = leftLabel;
    this._leftText.position.set(x - margin, y + height / 2);
    this._leftText.anchor.set(1, 0.5);
    this._leftText.style = {
      fontFamily,
      fontSize,
      fill: textColor,
      align: "right",
    };

    this._rightText.text = rightLabel;
    this._rightText.position.set(x + width + margin, y + height / 2);
    this._rightText.anchor.set(0, 0.5);
    this._rightText.style = {
      fontFamily,
      fontSize,
      fill: textColor,
      align: "left",
    };
  }

  private _renderSeries(): void {
    this._series.render();
  }
}
