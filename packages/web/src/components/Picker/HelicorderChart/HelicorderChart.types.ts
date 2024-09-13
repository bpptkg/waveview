import { Channel, Helicorder, HelicorderOptions, HelicorderEventMarkerOptions } from '@waveview/zcharts';

export interface HelicorderChartProps {
  /**
   * The class name to be applied to the root element.
   */
  className?: string;
  /**
   * The initial options to be applied to the chart.
   */
  initOptions?: Partial<HelicorderOptions>;
  /**
   * Callback fired when the chart is focused.
   */
  onFocus?: () => void;
  /**
   * Callback fired when the chart is blurred.
   */
  onBlur?: () => void;
  /**
   * Callback fired when the selection is changed.
   */
  onSelectionChange?: (range: [number, number]) => void;
  onReady?: (chart: Helicorder) => void;
}

export interface HelicorderChartRef {
  getInstance: () => Helicorder;
  shiftViewUp: (by?: number) => void;
  shiftViewDown: (by?: number) => void;
  shiftViewToNow: () => void;
  increaseAmplitude: (by: number) => void;
  decreaseAmplitude: (by: number) => void;
  resetAmplitude: () => void;
  setChannel: (channel: Channel) => void;
  setUseUTC: (useUTC: boolean) => void;
  setOffsetDate: (date: number) => void;
  setInterval: (interval: number) => void;
  setDuration: (duration: number) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  getChartExtent: () => [number, number];
  focus: () => void;
  blur: () => void;
  isFocused: () => boolean;
  addEventMarker: (marker: HelicorderEventMarkerOptions) => void;
  addEventMarkers: (markers: HelicorderEventMarkerOptions[]) => void;
  removeEventMarker: (start: number, end: number) => void;
  showEventMarkers: () => void;
  hideEventMarkers: () => void;
  clearEventMarkers: () => void;
  dispose: () => void;
}
