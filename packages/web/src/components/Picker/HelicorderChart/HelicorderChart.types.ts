import { Channel, Helicorder, HelicorderChartOptions } from '@waveview/charts';

export interface HelicorderChartProps {
  /**
   * The class name to be applied to the root element.
   */
  className?: string;
  /**
   * The initial options to be applied to the chart.
   */
  initOptions?: Partial<HelicorderChartOptions>;
  /**
   * Callback fired when a track is selected.
   */
  onTrackSelected?: (index: number) => void;
  /**
   * Callback fired when a track is deselected.
   */
  onTrackDeselected?: () => void;
  /**
   * Callback fired when the chart is focused.
   */
  onFocus?: () => void;
  /**
   * Callback fired when the chart is blurred.
   */
  onBlur?: () => void;
  /**
   * Callback fired when the offset date is changed.
   */
  onOffsetChange?: (date: number) => void;
  /**
   * Callback fired when the selection is changed.
   */
  onSelectionChange?: (value: number) => void;
  /**
   * Callback fired when the chart is ready.
   */
  onReady?: () => void;
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
  getTrackExtent: (index: number) => [number, number];
  focus: () => void;
  blur: () => void;
  isFocused: () => boolean;
  selectTrack: (index: number) => void;
  setSelection: (value: number) => void;
  addEventMarker: (value: number, color: string) => void;
  removeEventMarker: (value: number) => void;
  showAllEventMarkers: () => void;
  hideAllEventMarkers: () => void;
  dispose: () => void;
}
