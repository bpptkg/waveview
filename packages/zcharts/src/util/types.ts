import { Series } from "@waveview/ndarray";
import { BoundingRect } from "zrender";

export type ModelOptions = Record<string, any>;

export type LayoutRect = BoundingRect;

export interface EventMap {
  [event: string]: (...args: any[]) => void;
}

export interface ScaleTick {
  value: number;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface Point {
  x: number;
  y: number;
}

export type TimeUnit =
  | "millisecond"
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year";

export interface ThemeRegistry {
  [key: string]: ThemeStyle;
}

export type ThemeName = keyof ThemeRegistry;

export interface AxisStyle {
  /**
   * The color of the axis line.
   */
  axisLineColor: string;
  /**
   * The color of the axis tick.
   */
  axisTickColor: string;
  /**
   * The color of the axis split line.
   */
  splitLineColor: string;
}

export interface GridStyle {
  /**
   * The color of the grid line.
   */
  lineColor: string;
  /**
   * The width of the grid line.
   */
  lineWidth: number;
}

export interface SeriesStyle {
  /**
   * The color of the series line.
   */
  lineColor: string;
  /**
   * The width of the series line.
   */
  lineWidth: number;
}

export interface HighlightStyle {
  /**
   * The color of the highlight area.
   */
  color: string;
  /**
   * The opacity of the highlight area.
   */
  opacity: number;
  /**
   * The width of the highlight border.
   */
  borderWidth: number;
}

export interface AxisPointerStyle {
  /**
   * The color of the axis pointer line.
   */
  lineColor: string;
  /**
   * The width of the axis pointer line.
   */
  lineWidth: number;
  /**
   * The color of the axis pointer label.
   */
  textColor: string;
  /**
   * The font size of the axis pointer label.
   */
  fontSize: number;
  /**
   * The background color of the axis pointer label.
   */
  backgroundColor: string;
}

export interface PickerStyle {
  /**
   * The color of the picker area.
   */
  color: string;
  /**
   * The opacity of the picker area.
   */
  opacity: number;
  /**
   * The width of the picker border.
   */
  borderWidth: number;
}

export interface PickAssistantStyle {
  color: string;
  opacity: number;
  lineWidth: number;
  lineType: "solid" | "dashed" | "dotted";
  lineDash: number[];
  lineCap: "butt" | "round" | "square";
  lineJoin: "bevel" | "round" | "miter";
}

export interface ThemeStyle {
  /**
   * The background color of the chart.
   */
  backgroundColor: string;
  /**
   * The color of the chart foreground.
   */
  foregroundColor: string;
  /**
   * The color of the chart text.
   */
  textColor: string;
  /**
   * The font size of the chart text.
   */
  fontSize: number;
  /**
   * The font family of the chart text.
   */
  fontFamily: string;
  /**
   * The grid style of the chart.
   */
  gridStyle: GridStyle;
  /**
   * The axis style of the chart.
   */
  axisStyle: AxisStyle;
  /**
   * The series style of the chart.
   */
  seriesStyle: SeriesStyle;
  /**
   * The highlight style of the chart.
   */
  highlightStyle: HighlightStyle;
  /**
   * The axis pointer style of the chart.
   */
  axisPointerStyle: AxisPointerStyle;
  /**
   * The picker style of the chart.
   */
  pickerStyle: PickerStyle;
  /**
   * The pick assistant style of the chart.
   */
  pickAssistantStyle: PickAssistantStyle;
}

export interface Channel {
  /**
   * Unique identifier for the channel.
   */
  id: string;
  /**
   * Name of the channel.
   */
  label?: string;
  /**
   * Sublabel of the channel.
   */
  sublabel?: string;
  /**
   * Description of the channel.
   */
  color?: string;
}

export interface AddMarkerOptions {
  show?: boolean;
}

export interface SeriesData {
  /**
   * The series data.
   */
  series: Series;
  /**
   * Minimum value of the series.
   */
  min: number;
  /**
   * Maximum value of the series.
   */
  max: number;
  /**
   * Count of the series.
   */
  count: number;
}

export interface SpectrogramData {
  /**
   * The spectrogram image data. The image data is stored as a 1D array of 8-bit
   * unsigned integers. The image data is stored in row-major order.
   */
  image: Uint8Array;
  /**
   * The minimum time value of the spectrogram in Unix time.
   */
  timeMin: number;
  /**
   * The maximum time value of the spectrogram in Unix time.
   */
  timeMax: number;
  /**
   * The minimum frequency value of the spectrogram.
   */
  freqMin: number;
  /**
   * The maximum frequency value of the spectrogram.
   */
  freqMax: number;
  /**
   * The number of time bins in the spectrogram.
   */
  timeLength: number;
  /**
   * The number of frequency bins in the spectrogram.
   */
  freqLength: number;
  /**
   * The minimum value of the spectrogram.
   */
  min: number;
  /**
   * The maximum value of the spectrogram.
   */
  max: number;
  /**
   * The URL of the spectrogram image.
   */
  imageURL: string;
}
