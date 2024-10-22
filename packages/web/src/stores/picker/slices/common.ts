import { SeismicEvent } from '../../../types/event';
import { FilterOperationOptions } from '../../../types/filter';
import { PickerConfig, PickerConfigPayload } from '../../../types/picker';
import { PickerChart } from '../types';

export interface CommonSlice {
  /**
   * The selected chart in the helicorder workspace.
   */
  selectedChart: PickerChart;
  /**
   * Whether to show the event marker in the helicorder or seismogram chart.
   */
  showEvent: boolean;
  /**
   * The picker configuration, which includes the list of default channels to
   * display in the picker.
   */
  pickerConfig: PickerConfig | null;
  /**
   * The list of event markers to display in the helicorder or seismogram chart.
   */
  eventMarkers: SeismicEvent[];
  /**
   * Force center signal in the chart.
   */
  forceCenter: boolean;
  /**
   * True to open picker settings dialog.
   */
  pickerSettingsOpen: boolean;
  /**
   * True if the picker is loading (fetching picker configuration, event
   * markers, etc). This is used to show a loading spinner in the picker. This
   * is not used to indicate the loading state of the helicorder or seismogram
   * chart.
   */
  loading: boolean;
  /**
   * Set picker settings dialog.
   */
  setPickerSettingsOpen: (open: boolean) => void;
  /**
   * Set force center signal.
   */
  setForceCenter: (forceCenter: boolean) => void;
  /**
   * Sets the selected chart in the helicorder workspace.
   */
  setShowEvent: (showEvent: boolean) => void;
  /**
   * Sets the selected chart in the helicorder workspace.
   */
  setSelectedChart: (chart: PickerChart) => void;
  /**
   * Sets the picker configuration.
   */
  setPickerConfig: (config: PickerConfig) => void;
  /**
   * Fetches the picker configuration, which includes the list of default
   * channels to display in the picker.
   */
  fetchPickerConfig: () => Promise<void>;
  /**
   * Saves the picker configuration.
   */
  savePickerConfig: (payload: PickerConfigPayload) => Promise<void>;
  /**
   * Resets the picker configuration to the default state.
   */
  resetPickerConfig: () => Promise<void>;
  /**
   * Fetches the event markers within the given time range.
   */
  fetchEventMarkers: (start: number, end: number) => Promise<void>;
  /**
   * Adds an event marker to the helicorder or seismogram chart.
   */
  addEventMarker: (event: SeismicEvent) => void;
  /**
   * Removes an event marker from the helicorder or seismogram chart.
   */
  removeEventMarker: (eventId: string) => void;
  /**
   * Removes all event markers from the helicorder or seismogram chart.
   */
  clearEventMarkers: () => void;
  /**
   * Sets the list of event markers to display in the helicorder or seismogram
   * chart.
   */
  setEventMarkers: (eventMarkers: SeismicEvent[]) => void;
  /**
   * Get seismogram filter options.
   */
  getSeismogramFilterOptions: () => FilterOperationOptions[];
  /**
   * Get helicorder filter options.
   */
  getHelicorderFilterOptions: () => FilterOperationOptions[];
  /**
   * Set the loading state of the picker.
   */
  setLoading: (loading: boolean) => void;
  /**
   * Reset the picker state.
   */
  resetPickerState: () => void;
}
