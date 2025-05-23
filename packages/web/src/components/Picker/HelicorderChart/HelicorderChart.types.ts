import { AddMarkerOptions, Channel, Helicorder, HelicorderEventMarkerOptions, HelicorderOptions } from '@waveview/zcharts';
import { HelicorderRenderOptions } from '../../../../../zcharts/src/helicorder/helicorder';
import { FilterOperationOptions } from '../../../types/filter';
import { ScalingType } from '../../../types/scaling';
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
   * If set, show filtered spectrogram signal instead of raw signal.
   */
  appliedFilter?: FilterOperationOptions | null;
  /**
   * Callback fired when the offset date is changed.
   */
  onOffsetDateChange?: (date: number) => void;
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
  /**
   * Callback fired when the chart is loading data or rendering.
   */
  onLoading?: (loading: boolean) => void;
}

export interface HelicorderChartRef {
  addEventMarker: (markerOptions: HelicorderEventMarkerOptions, options?: AddMarkerOptions) => void;
  addEventMarkers: (markersOptions: HelicorderEventMarkerOptions[], options?: AddMarkerOptions) => void;
  applyFilter: (options: FilterOperationOptions | null) => void;
  blur: () => void;
  clearData: () => void;
  clearEventMarkers: () => void;
  decreaseAmplitude: (by: number) => void;
  dispose: () => void;
  fetchAllData: (options?: RefreshOptions) => void;
  focus: () => void;
  getChannel: () => Channel | undefined;
  getChartExtent: () => [number, number];
  getInstance: () => Helicorder;
  hideEventMarkers: () => void;
  increaseAmplitude: (by: number) => void;
  isFocused: () => boolean;
  nextSelection: () => void;
  previousSelection: () => void;
  removeEventMarker: (start: number, end: number) => void;
  render(options?: HelicorderRenderOptions): void;
  resetAmplitude: () => void;
  setChannel: (channel: Channel) => void;
  setDuration: (duration: number) => void;
  setForceCenter: (forceCenter: boolean) => void;
  setInterval: (interval: number) => void;
  setOffsetDate: (date: number) => void;
  setScaling: (scaling: ScalingType) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setUseUTC: (useUTC: boolean) => void;
  setWindowSize: (size: number) => void;
  shiftViewDown: (by?: number) => void;
  shiftViewToNow: () => void;
  shiftViewUp: (by?: number) => void;
  showEventMarkers: () => void;
  toDataURL: (type?: string, quality?: number) => string;
}
