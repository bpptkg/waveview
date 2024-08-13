import { Channel, Seismogram, SeismogramChartOptions, SeismogramEventMarkerOptions } from '@waveview/charts';
import { FederatedPointerEvent } from 'pixi.js';

export interface SeismogramChartProps {
  /**
   * The class name to be applied to the root element.
   */
  className?: string;
  /**
   * The initial options to be applied to the chart.
   */
  initOptions?: Partial<SeismogramChartOptions>;
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
  onContextMenuRequested?: (e: FederatedPointerEvent) => void;
  /**
   * Callback fired when the user picks a range.
   */
  onPick?: (range: [number, number]) => void;
  /**
   * Callback fired when the chart is ready.
   */
  onReady?: () => void;
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
  scrollToNow: () => void;
  increaseAmplitude: (by: number) => void;
  decreaseAmplitude: (by: number) => void;
  resetAmplitude: () => void;
  setExtent: (extent: [number, number]) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  activateZoomRectangle: () => void;
  deactivateZoomRectangle: () => void;
  isZoomRectangleActive: () => boolean;
  focus(): void;
  blur(): void;
  isFocused(): boolean;
  setUseUTC: (useUTC: boolean) => void;
  activatePickMode: () => void;
  deactivatePickMode: () => void;
  isPickModeActive: () => boolean;
  setPickRange: (range: [number, number]) => void;
  clearPickRange(): void;
  addEventMarker: (marker: SeismogramEventMarkerOptions) => void;
  removeEventMarker: (start: number, end: number) => void;
  showAllMarkers: () => void;
  hideAllMarkers: () => void;
  dispose: () => void;
}
