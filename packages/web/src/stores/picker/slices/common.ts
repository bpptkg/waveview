import { PickerConfig } from '../../../types/picker';
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
   * Whether to show the event marker in the helicorder or seismogram chart.
   */
  showEvent: boolean;
  pickerConfig: PickerConfig | null;
  setShowEvent: (showEvent: boolean) => void;
  setUseUTC: (useUTC: boolean) => void;
  setSelectedChart: (chart: PickerChart) => void;
  fetchPickerConfig: () => Promise<void>;
}
