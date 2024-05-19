import * as PIXI from "pixi.js";
import { isFinite } from "../util/common";
import { Axis } from "./axis";
import { Chart } from "./chart";
import { Layout } from "./layout";
import { Series } from "./series";

export interface TrackOptions {
  show?: boolean;
  leftLabel?: string;
  rightLabel?: string;
  margin?: number;
}

interface TrackRenderContext {
  group: PIXI.Container;
  yAxis: Axis;
  xAxis: Axis;
  layout: Layout;
  chart: Chart;
}

export class Track {
  readonly group: PIXI.Container = new PIXI.Container();
  private _options: TrackOptions;
  private _series: Series[] = [];

  constructor(options: TrackOptions) {
    this._options = options;
  }

  get options(): TrackOptions {
    return this._options;
  }

  setOptions(options: TrackOptions): void {
    this._options = options;
  }

  addSeries(series: Series): void {
    this._series.push(series);
  }

  getSeries(): Series[] {
    return this._series;
  }

  clearSeries(): void {
    this._series = [];
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
      const [seriesMin, seriesMax] = series.getYRange();
      min = Math.min(min, seriesMin);
      max = Math.max(max, seriesMax);
    }
    return [min, max];
  }

  clear(): void {
    this.group.removeChildren();
  }

  render(ctx: TrackRenderContext): void {
    this._drawLabel(ctx);
    this._drawSeries(ctx);
    ctx.group.addChild(this.group);
  }

  private _drawSeries(ctx: TrackRenderContext): void {
    this.getSeries().forEach((series) => {
      series.render({
        group: this.group,
        xAxis: ctx.xAxis,
        yAxis: ctx.yAxis,
      });
    });
  }

  private _drawLabel(ctx: TrackRenderContext): void {
    const { show = true, leftLabel, rightLabel, margin = 5 } = this.options;
    if (!show) {
      return;
    }
    const box = ctx.layout.getContentArea();

    if (leftLabel) {
      const text = new PIXI.Text({
        text: leftLabel,
        style: {
          fontFamily: "Arial",
          fontSize: 12,
          fill: "#000",
          align: "right",
        },
        x: box.x1 - margin,
        y: box.y1 + box.height / 2,
        anchor: { x: 1, y: 0.5 },
      });
      this.group.addChild(text);
    }

    if (rightLabel) {
      const text = new PIXI.Text({
        text: rightLabel,
        style: {
          fontFamily: "Arial",
          fontSize: 12,
          fill: "#000",
          align: "center",
        },
        x: box.x2 + margin,
        y: box.y2 - box.height / 2,
        anchor: { x: 0, y: 0.5 },
      });
      this.group.addChild(text);
    }
  }
}

export class TrackManager {
  readonly chart: Chart;
  readonly group: PIXI.Container = new PIXI.Container();
  private readonly tracks: Track[] = [];

  constructor(chart: Chart) {
    this.chart = chart;
  }

  addTrack(track: Track): void {
    this.tracks.push(track);
  }

  removeTrack(index: number): void {
    this.tracks.splice(index, 1);
  }

  getTrack(index: number): Track {
    return this.tracks[index];
  }

  getLayoutForTrack(index: number): Layout {
    const box = this.chart.getLayout().getContentArea();
    let trackLength = this.tracks.length;
    if (trackLength === 0) {
      trackLength = 1;
    }
    const width = box.width;
    const height = box.height / this.tracks.length;
    const x1 = box.x1;
    const y1 = box.y1 + index * height;
    const x2 = x1 + width;
    const y2 = y1 + height;

    const layout = new Layout({
      x1,
      y1,
      x2,
      y2,
    });
    return layout;
  }

  getTracks(): Track[] {
    return this.tracks;
  }

  clear(): void {
    this.group.removeChildren();
  }

  getXRange(): [number, number] {
    let min = Infinity;
    let max = -Infinity;
    for (const track of this.tracks) {
      const [trackMin, trackMax] = track.getXRange();
      min = Math.min(min, trackMin);
      max = Math.max(max, trackMax);
    }
    return [min, max];
  }

  render(): void {
    const [xmin, xmax] = this.getXRange();
    const xAxis = this.chart.getPrimaryAxis();
    if (isFinite(xmin) && isFinite(xmax)) {
      xAxis.getScale().setExtent(xmin, xmax);
    }

    this.getTracks().forEach((track, index) => {
      const [ymin, ymax] = track.getYRange();
      if (!isFinite(ymin) || !isFinite(ymax)) {
        return;
      }

      const layout = this.getLayoutForTrack(index);
      const delta = Math.abs(0.1 * (ymax - ymin));
      const yAxis = new Axis(layout, {
        position: "left",
        type: "linear",
        min: ymin - delta,
        max: ymax + delta,
      });
      const ctx: TrackRenderContext = {
        group: this.group,
        xAxis,
        yAxis,
        layout,
        chart: this.chart,
      };
      track.render(ctx);
    });
  }
}
