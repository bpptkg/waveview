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
  axisLineColor: string;
  axisTickColor: string;
  splitLineColor: string;
}

export interface GridStyle {
  lineColor: string;
  lineWidth: number;
}

export interface SeriesStyle {
  lineColor: string;
  lineWidth: number;
}

export interface HighlightStyle {
  color: string;
  opacity: number;
  borderWidth: number;
}

export interface AxisPointerStyle {
  lineColor: string;
  lineWidth: number;
  textColor: string;
  fontSize: number;
  backgroundColor: string;
}

export interface PickerStyle {
  color: string;
  opacity: number;
  borderWidth: number;
}

export interface ThemeStyle {
  backgroundColor: string;
  foregroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  gridStyle: GridStyle;
  axisStyle: AxisStyle;
  seriesStyle: SeriesStyle;
  highlightStyle: HighlightStyle;
  axisPointerStyle: AxisPointerStyle;
  pickerStyle: PickerStyle;
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
