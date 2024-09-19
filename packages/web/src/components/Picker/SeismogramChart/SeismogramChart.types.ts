import { Channel, ElementEvent, Seismogram, SeismogramEventMarkerOptions, SeismogramOptions } from '@waveview/zcharts';
import { FilterOperationOptions } from '../../../types/filter';

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
   * Callback fired when the user clicks on an event marker.
   */
  onEventMarkerContextMenu?: (event: ElementEvent, marker: SeismogramEventMarkerOptions) => void;
}

export interface SeismogramChartRef {
  getInstance: () => Seismogram;
  setChannels: (channels: Channel[]) => void;
  addChannel: (channel: Channel) => void;
  removeChannel: (index: number) => void;
  moveChannelUp: (index: number) => void;
  moveChannelDown: (index: number) => void;
  zoomIn: (by: number) => void;
  zoomOut: (by: number) => void;
  scrollLeft: (by: number) => void;
  scrollRight: (by: number) => void;
  increaseAmplitude: (by: number) => void;
  decreaseAmplitude: (by: number) => void;
  resetAmplitude: () => void;
  setExtent: (extent: [number, number]) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  focus(): void;
  blur(): void;
  isFocused(): boolean;
  setUseUTC: (useUTC: boolean) => void;
  enablePickMode: () => void;
  disablePickMode: () => void;
  isPickModeEnabled: () => boolean;
  setPickRange: (range: [number, number]) => void;
  clearPickRange(): void;
  addEventMarker: (marker: SeismogramEventMarkerOptions) => void;
  addEventMarkers: (markers: SeismogramEventMarkerOptions[]) => void;
  removeEventMarker: (start: number, end: number) => void;
  showEventMarkers: () => void;
  hideEventMarkers: () => void;
  clearEventMarkers: () => void;
  getChartExtent: () => [number, number];
  fetchAllChannelsData: () => void;
  applyFilter: (options: FilterOperationOptions) => void;
  resetFilter: () => void;
  showSpectrogram: () => void;
  hideSpectrogram: () => void;
  showSignal: () => void;
  hideSignal: () => void;
  dispose: () => void;
  render: () => void;
  toDataURL: (type?: string, quality?: number) => string;
  expandView: (index: number) => void;
  restoreView: () => void;
}
