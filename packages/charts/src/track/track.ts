import * as PIXI from "pixi.js";
import { Axis } from "../axis/axis";
import { SeriesModel } from "../model/series";
import { LineSeries, LineSeriesView } from "../series/line";
import { LayoutRect } from "../util/types";
import { View } from "../view/view";
import { TrackModel, TrackOptions } from "./trackModel";

export class Track extends View<TrackModel> {
  override type = "track";
  private _rect: LayoutRect;
  private _series: SeriesModel;
  private _highlighted: boolean = false;

  readonly xAxis: Axis;
  readonly yAxis: Axis;

  constructor(
    rect: LayoutRect,
    xAxis: Axis,
    yAxis: Axis,
    options?: Partial<TrackOptions>
  ) {
    const model = new TrackModel(options);
    super(model);

    this._rect = rect;
    this._series = new SeriesModel();
    this.xAxis = xAxis;
    this.yAxis = yAxis;
  }

  getXRange(): [number, number] {
    return this._series.getXRange();
  }

  getYRange(): [number, number] {
    return this._series.getYRange();
  }

  getSeries(): SeriesModel {
    return this._series;
  }

  setSeries(series: SeriesModel): void {
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

  override getRect(): LayoutRect {
    return this._rect;
  }

  override setRect(rect: LayoutRect): void {
    this._rect = rect;
    this.yAxis.setRect(rect);
  }

  override render(): void {
    this.clear();
    this.renderGrid();
    this.renderSeries();
    this.renderHighlight();
  }

  private renderHighlight(): void {
    if (!this._highlighted) {
      return;
    }

    const { x, y, width, height } = this.getRect();
    const { color, opacity, borderWidth } = this.model.getOptions().highlight;

    const graphics = new PIXI.Graphics();
    graphics
      .rect(x, y, width, height)
      .stroke({
        color: color,
        width: borderWidth,
      })
      .fill({
        color: color,
        alpha: opacity,
      });
    this.group.addChild(graphics);
  }

  private renderGrid(): void {
    const { show, leftLabel, rightLabel, margin } = this.model.getOptions();

    if (!show) {
      return;
    }

    const { x, y, width, height } = this.getRect();

    if (leftLabel) {
      const leftText = new PIXI.Text({
        text: leftLabel,
        style: {
          fontFamily: "Arial",
          fontSize: 12,
          fill: "#000",
          align: "right",
        },
        x: x - margin,
        y: y + height / 2,
        anchor: { x: 1, y: 0.5 },
      });
      this.group.addChild(leftText);
    }

    if (rightLabel) {
      const rightText = new PIXI.Text({
        text: rightLabel,
        style: {
          fontFamily: "Arial",
          fontSize: 12,
          fill: "#000",
          align: "center",
        },
        x: x + width + margin,
        y: y + height - height / 2,
        anchor: { x: 0, y: 0.5 },
      });
      this.group.addChild(rightText);
    }
  }

  private renderSeries(): void {
    const lineSeries = this._series as LineSeries;
    const view = new LineSeriesView(
      lineSeries,
      this.getRect(),
      this.xAxis,
      this.yAxis
    );
    view.render();
    this.group.addChild(view.group);
  }
}
