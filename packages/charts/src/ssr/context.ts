import { Helicorder } from "../helicorder/helicorder";
import { Seismogram } from "../seismogram/seismogram";

export type Chart = Helicorder | Seismogram;

export interface Grid {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AxisExtent = [number, number];

export interface TrackData {
  rect: Grid;
  xAxisExtent: AxisExtent;
  yAxisExtent: AxisExtent;
}

export interface SSRContextData {
  chart: "helicorder" | "seismogram";
  width: number;
  height: number;
  devicePixelRatio: number;
  darkMode: boolean;
  rect: Grid;
  xAxisExtent: AxisExtent;
  yAxisExtent: AxisExtent;
  tracks: TrackData[];
}

export class SSRContext {
  readonly chart: Chart;

  constructor(chart: Chart) {
    this.chart = chart;
  }

  getContextData(): SSRContextData {
    const { chart } = this;
    const { width, height } = chart;
    const { devicePixelRatio = 1, darkMode = false } = chart.getOptions();
    const xAxisExtent = chart.getXAxis().getExtent();
    const yAxisExtent = chart.getYExtent();
    const rect = chart.getGrid().getRect();

    return {
      chart: chart.type,
      width,
      height,
      devicePixelRatio,
      rect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      },
      xAxisExtent,
      yAxisExtent,
      darkMode,
      tracks: chart.getTracks().map((track, index) => {
        const rect = track.getRect();
        return {
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          },
          xAxisExtent: (this.chart as Helicorder).getTrackExtentAt(
            this.chart.getTrackCount() - index - 1
          ),
          yAxisExtent,
        };
      }),
    };
  }
}
