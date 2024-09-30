import { Channel, Helicorder, HelicorderEventMarkerOptions, HelicorderOptions } from '@waveview/zcharts';
import { RefreshOptions } from './HelicorderWebWorker';

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
  /**
   * Callback fired when the chart is ready.
   */
  onReady?: (chart: Helicorder) => void;
  /**
   * Callback fired when the user click on an event marker.
   */
  onEventMarkerClick?: (marker: HelicorderEventMarkerOptions) => void;
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
  getChannel: () => Channel;
  setUseUTC: (useUTC: boolean) => void;
  setOffsetDate: (date: number) => void;
  setInterval: (interval: number) => void;
  setDuration: (duration: number) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setForceCenter: (forceCenter: boolean) => void;
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
  render(): void;
  toDataURL: (type?: string, quality?: number) => string;
  fetchAllData: (options?: RefreshOptions) => void;
  setWindowSize: (size: number) => void;
}
