import { AddMarkerOptions, Channel, ElementEvent, Seismogram, SeismogramEventMarkerOptions, SeismogramOptions } from '@waveview/zcharts';
import { SeismogramRenderOptions } from '../../../../../zcharts/src/seismogram/seismogram';
import { FilterOperationOptions } from '../../../types/filter';
import { ScalingType } from '../../../types/scaling';
import { RefreshOptions, SeismogramWebWorkerOptions } from './SeismogramWebWorker';

export interface SeismogramChartProps {
  /**
   * The class name to be applied to the root element.
   */
  className?: string;
  /**
   * The initial options to be applied to the chart.
   */
  initOptions?: Partial<SeismogramOptions>;
  /**
   * If set, show filtered spectrogram signal instead of raw signal.
   */
  appliedFilter?: FilterOperationOptions | null;
  /**
   * Callback fired when the chart is focused.
   */
  onFocus?: () => void;
  /**
   * Callback fired when the chart is blurred.
   */
  onBlur?: () => void;
  /**
   * Callback fired when the extent is changed.
   */
  onExtentChange?: (extent: [number, number]) => void;
  /**
   * Callback fired when a channel is removed.
   */
  onRemoveChannel?: (index: number) => void;
  /**
   * Callback fired when a channel is moved up.
   */
  onMoveChannelUp?: (index: number) => void;
  /**
   * Callback fired when a channel is moved down.
   */
  onMoveChannelDown?: (index: number) => void;
  /**
   * Callback fired when a channel is added.
   */
  onTrackDoubleClick?: (index: number) => void;
  /**
   * Callback fired when context menu is requested.
   */
  onContextMenuRequested?: (event: ElementEvent) => void;
  /**
   * Callback fired when the user scrolls the mouse wheel.
   */
  onMouseWheel?: (event: ElementEvent) => void;
  /**
   * Callback fired when the user picks a range.
   */
  onPick?: (range: [number, number]) => void;
  /**
   * Callback fired when the chart is ready.
   */
  onReady?: (chart: Seismogram) => void;
  /**
   * Callback fired when the user request context menu on an event marker.
   */
  onEventMarkerContextMenu?: (event: ElementEvent, marker: SeismogramEventMarkerOptions) => void;
  /**
   * Callback fired when the user request context menu on a track.
   */
  onTrackContextMenu?: (event: ElementEvent, index: number) => void;
  /**
   * Callback fired when the chart is loading or fetching data.
   */
  onLoading?: (loading: boolean) => void;
  /**
   * Callback fired when the start time is picked.
   */
  onStartPicked?: (start: number) => void;
}

export interface SetExtentOptions {
  /**
   * Whether to automatically zoom the chart to the first minute of the
   * selection window.
   */
  autoZoom?: boolean;
}

export interface SeismogramChartRef {
  addChannel: (channel: Channel) => void;
  addEventMarker: (markerOptions: SeismogramEventMarkerOptions, options?: AddMarkerOptions) => void;
  addEventMarkers: (markersOptions: SeismogramEventMarkerOptions[], options?: AddMarkerOptions) => void;
  applyFilter: (options: FilterOperationOptions) => void;
  blur(): void;
  clearChannelData: () => void;
  clearEventMarkers: () => void;
  clearPickAssistantRange: () => void;
  clearPickRange(): void;
  clearSpectrogramData: () => void;
  decreaseAmplitude: (by: number) => void;
  disablePickMode: () => void;
  dispose: () => void;
  enablePickMode: () => void;
  expandView: (index: number) => void;
  fetchAllChannelsData: (options?: RefreshOptions) => void;
  fitToWindow: () => void;
  focus(): void;
  getChartExtent: () => [number, number];
  getFirstArrivalChannelId: () => string | undefined;
  getInstance: () => Seismogram;
  hideEventMarkers: () => void;
  hideSignal: () => void;
  hideSpectrogram: () => void;
  increaseAmplitude: (by: number) => void;
  isFocused(): boolean;
  isPickModeEnabled: () => boolean;
  moveChannelDown: (index: number) => void;
  moveChannelUp: (index: number) => void;
  removeChannel: (index: number) => void;
  removeEventMarker: (start: number, end: number) => void;
  render: (options?: SeismogramRenderOptions) => void;
  resetAmplitude: () => void;
  resetFilter: () => void;
  restoreView: () => void;
  scrollLeft: (by: number) => void;
  scrollRight: (by: number) => void;
  setChannels: (channels: Channel[]) => void;
  setExtent: (extent: [number, number], options?: SetExtentOptions) => void;
  setForceCenter: (forceCenter: boolean) => void;
  setPickAssistantRange: (start: number, end: number) => void;
  setPickRange: (range: [number, number]) => void;
  setScaling: (scaling: ScalingType) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setUseUTC: (useUTC: boolean) => void;
  setWorkerOptions: (options: SeismogramWebWorkerOptions) => void;
  showEventMarkers: () => void;
  showSignal: () => void;
  showSpectrogram: () => void;
  toDataURL: (type?: string, quality?: number) => string;
  zoomFirstMinute: () => void;
  zoomIn: (by: number) => void;
  zoomOut: (by: number) => void;
}
