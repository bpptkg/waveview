import { Channel } from '../../../types/channel';
import { EventType, SeismicEvent } from '../../../types/event';
import { Station } from '../../../types/station';
import { PickerChart } from '../types';

export interface CommonSlice {
  /**
   * Whether to use UTC time in the charts.
   */
  useUTC: boolean;
  /**
   * The local time zone name.
   */
  timeZone: string;
  /**
   * The selected chart in the helicorder workspace.
   */
  selectedChart: PickerChart;
  /**
   * The list of available event types fetched from the server.
   */
  eventTypes: EventType[];
  /**
   * The list of seismic events visible in the selected time range. It is used
   * to display the event markers in the helicorder and seismogram charts. The
   * events are filtered by the selected time range and updated when the time
   * range changes.
   */
  events: SeismicEvent[];
  /**
   * The list of available channels.
   */
  availableChannels: Channel[];
  /**
   * The list of available stations.
   */
  availableStations: Station[];
  /**
   * Whether to show the event marker in the helicorder or seismogram chart.
   */
  showEvent: boolean;
  fetchChannels: () => Promise<void>;
  fetchStations: () => Promise<void>;
  setShowEvent: (showEvent: boolean) => void;
  setUseUTC: (useUTC: boolean) => void;
  setSelectedChart: (chart: PickerChart) => void;
}
