import * as PIXI from "pixi.js";
import { Axis } from "../axis/axis";
import { Grid } from "../grid/grid";
import { SeriesModel } from "../model/series";
import { LineSeries, LineSeriesView } from "../series/line";
import { LayoutRect } from "../util/types";
import { View } from "../view/view";
import { TrackModel } from "./trackModel";

export class Track extends View<TrackModel> {
  override type = "track";
  private readonly _rect: LayoutRect;
  private _series: SeriesModel[] = [];
  readonly xAxis: Axis;
  readonly yAxis: Axis;

  constructor(model: TrackModel, grid: Grid, xAxis: Axis, yAxis: Axis) {
    super(model);

    this._rect = grid.getRect();
    this.xAxis = xAxis;
    this.yAxis = yAxis;
  }

  override getRect(): LayoutRect {
    return this._rect;
  }

  override render(): void {
    this.group.removeChildren();
    this.renderGrid();
    this.renderSeries();
  }

  getXRange(): [number, number] {
    let min = Infinity;
    let max = -Infinity;
    for (const series of this._series) {
      const [seriesMin, seriesMax] = series.getXRange();
      min = Math.min(min, seriesMin);
      max = Math.max(max, seriesMax);
    }
    return [min, max];
  }

  getYRange(): [number, number] {
    let min = Infinity;
    let max = -Infinity;
    for (const series of this._series) {
      const { yRange } = series.getOptions();
      if (yRange) {
        min = Math.min(min, yRange[0]);
        max = Math.max(max, yRange[1]);
        continue;
      }

      const [seriesMin, seriesMax] = series.getYRange();
      min = Math.min(min, seriesMin);
      max = Math.max(max, seriesMax);
    }
    return [min, max];
  }

  addSeries(series: SeriesModel): void {
    this._series.push(series);
  }

  removeSeries(series: SeriesModel): void {
    const index = this._series.indexOf(series);
    if (index !== -1) {
      this._series.splice(index, 1);
    }
  }

  setSingleSeries(series: SeriesModel): void {
    this._series = [series];
  }

  clearSeries(): void {
    this._series = [];
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
    for (const series of this._series) {
      if (series.type === "line") {
        const lineSeries = series as LineSeries;
        const view = new LineSeriesView(
          lineSeries,
          this.grid,
          this.xAxis,
          this.yAxis
        );
        view.render();
        this.group.addChild(view.group);
      }
    }
  }
}
