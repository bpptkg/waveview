import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createSelectors } from '../shared/createSelectors';

export type PickerWorkspace = 'helicorder' | 'seismogram';
export type PickerChart = 'helicorder' | 'seismogram';

export interface PickerState {
  /**
   * The workspace that is currently selected.
   */
  workspace: PickerWorkspace;
  /**
   * The channel ID of the helicorder chart.
   */
  channelId: string;
  /**
   * The duration of the helicorder chart in hours.
   */
  duration: number;
  /**
   * The interval of the helicorder track in minutes.
   */
  interval: number;
  /**
   * Whether to show the event marker in the helicorder or seismogram chart.
   */
  showEvent: boolean;
  /**
   * The offset date of the helicorder chart.
   */
  offsetDate: number;
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
   * The last extent of the selected track in the helicorder chart.
   */
  lastTrackExtent: [number, number];
  /**
   * The last extent of the selected time range in the seismogram chart.
   */
  lastSeismogramExtent: [number, number];
  /**
   * The value of the last selection (pointer to the selected track) in the
   * helicorder chart.
   */
  lastSelection: number;
}

export interface PickerActions {
  setWorkspace: (workspace: PickerWorkspace) => void;
  setChannelId: (channelId: string) => void;
  setDuration: (duration: number) => void;
  setInterval: (interval: number) => void;
  setShowEvent: (showEvent: boolean) => void;
  setOffsetDate: (offsetDate: number) => void;
  setUseUTC: (useUTC: boolean) => void;
  setSelectedChart: (selectedChart: PickerChart) => void;
  setLastTrackExtent: (extent: [number, number]) => void;
  setLastSeismogramExtent: (extent: [number, number]) => void;
  setLastSelection: (value: number) => void;
}

export type PickerStore = PickerState & PickerActions;

function getDefaultTrackExtent(offsetDate: number): [number, number] {
  const interval = 30;
  const oneMinute = 60 * 1000;
  const segment = interval * oneMinute;
  const startOf = (value: number) => value - (value % segment);
  const endOf = (value: number) => value + segment - (value % segment);

  return [startOf(offsetDate), endOf(offsetDate)];
}

function getDefaultSeismogramExtent(now: number): [number, number] {
  const oneMinute = 60 * 1000;
  return [now - 30 * oneMinute, now];
}

const pickerStore = create<PickerStore, [['zustand/devtools', never]]>(
  devtools((set) => {
    const now = Date.now();

    return {
      workspace: 'helicorder',
      channelId: 'VG.MELAB.00.HHZ',
      duration: 12,
      interval: 30,
      showEvent: true,
      offsetDate: Date.now(),
      useUTC: false,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      selectedChart: 'helicorder',
      lastTrackExtent: getDefaultTrackExtent(now),
      lastSeismogramExtent: getDefaultSeismogramExtent(now),
      lastSelection: 0,
      setWorkspace: (workspace) => set({ workspace }),
      setChannelId: (channelId) => set({ channelId }),
      setDuration: (duration) => set({ duration }),
      setInterval: (interval) => set({ interval }),
      setShowEvent: (showEvent) => set({ showEvent }),
      setOffsetDate: (offsetDate) => set({ offsetDate }),
      setUseUTC: (useUTC) => set({ useUTC }),
      setSelectedChart: (selectedChart) => set({ selectedChart }),
      setLastTrackExtent: (lastTrackExtent) => set({ lastTrackExtent }),
      setLastSeismogramExtent: (lastSeismogramExtent) => set({ lastSeismogramExtent }),
      setLastSelection: (lastSelection) => set({ lastSelection }),
    };
  })
);

export const usePickerStore = createSelectors(pickerStore);
