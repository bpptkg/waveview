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
  pickerConfig: PickerConfig | null;
  setShowEvent: (showEvent: boolean) => void;
  setSelectedChart: (chart: PickerChart) => void;
  fetchPickerConfig: () => Promise<void>;
}
