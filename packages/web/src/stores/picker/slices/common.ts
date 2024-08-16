import { SeismicEvent } from '../../../types/event';
import { PickerConfig } from '../../../types/picker';
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
   * Sets the selected chart in the helicorder workspace.
   */
  setShowEvent: (showEvent: boolean) => void;
  /**
   * Sets the selected chart in the helicorder workspace.
   */
  setSelectedChart: (chart: PickerChart) => void;
  /**
   * Fetches the picker configuration, which includes the list of default
   * channels to display in the picker.
   */
  fetchPickerConfig: () => Promise<void>;
  /**
   * Fetches the event markers within the given time range.
   */
  fetchEventMarkers: (start: number, end: number) => Promise<void>;
  /**
   * Adds an event marker to the helicorder or seismogram chart.
   */
  addEventMarker: (event: SeismicEvent) => void;
  /**
   * Removes all event markers from the helicorder or seismogram chart.
   */
  clearEventMarkers: () => void;
}
