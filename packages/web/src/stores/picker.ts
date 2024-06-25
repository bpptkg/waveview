import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createSelectors } from '../shared/createSelectors';

export type PickerWorkspace = 'helicorder' | 'seismogram';
export type PickerChart = 'helicorder' | 'seismogram';
export type SeismogramCheckedValue = 'zoom-rectangle' | 'pick-mode';

export interface PickerState {
  /**
   * The workspace that is currently selected.
   */
  workspace: PickerWorkspace;
  /**
   * The channel ID of the helicorder chart, e.g. `VG.MELAB.00.HHZ`.
   */
  channel: string;
  /**
   * List of channel IDs to display in the seismogram chart.
   */
  channels: string[];
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
  /**
   * The toolbar items that are currently checked in the seismogram chart.
   */
  seismogramToolbarCheckedValues: Record<string, string[]>;
}

export interface PickerActions {
  setWorkspace: (workspace: PickerWorkspace) => void;
  setHelicorderChannel: (channelId: string) => void;
  setHelicorderDuration: (duration: number) => void;
  setHelicorderInterval: (interval: number) => void;
  setShowEvent: (showEvent: boolean) => void;
  setHelicorderOffsetDate: (offsetDate: number) => void;
  setUseUTC: (useUTC: boolean) => void;
  setSelectedChart: (selectedChart: PickerChart) => void;
  setLastTrackExtent: (extent: [number, number]) => void;
  setLastSeismogramExtent: (extent: [number, number]) => void;
  setLastSelection: (value: number) => void;
  seismogramToolbarSetCheckedValues: (name: string, checkedValues: string[]) => void;
  seismogramToolbarAddCheckedValue: (name: string, item: string) => void;
  seismogramToolbarRemoveCheckedValue: (name: string, item: string) => void;
  addSeismogramChannel: (channelId: string) => void;
  removeSeismogramChannel: (index: number) => void;
  moveChannel: (fromIndex: number, toIndex: number) => void;
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
      channel: 'VG.MELAB.00.HHZ',
      channels: ['VG.MEPAS.00.HHZ', 'VG.MELAB.00.HHZ'],
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
      seismogramToolbarCheckedValues: {
        options: [],
      },
      setWorkspace: (workspace) => set({ workspace }),
      setHelicorderChannel: (channel) => set({ channel }),
      setHelicorderDuration: (duration) => set({ duration }),
      setHelicorderInterval: (interval) => set({ interval }),
      setHelicorderOffsetDate: (offsetDate) => set({ offsetDate }),
      setShowEvent: (showEvent) => set({ showEvent }),
      setUseUTC: (useUTC) => set({ useUTC }),
      setSelectedChart: (selectedChart) => set({ selectedChart }),
      setLastTrackExtent: (lastTrackExtent) => set({ lastTrackExtent }),
      setLastSeismogramExtent: (lastSeismogramExtent) => set({ lastSeismogramExtent }),
      setLastSelection: (lastSelection) => set({ lastSelection }),

      seismogramToolbarSetCheckedValues: (name, checkedValues) =>
        set((state) => {
          return {
            seismogramToolbarCheckedValues: {
              ...state.seismogramToolbarCheckedValues,
              [name]: checkedValues,
            },
          };
        }),

      seismogramToolbarAddCheckedValue: (name, item) =>
        set((state) => {
          const options = state.seismogramToolbarCheckedValues[name] || [];
          return {
            seismogramToolbarCheckedValues: {
              ...state.seismogramToolbarCheckedValues,
              [name]: [...options, item],
            },
          };
        }),

      seismogramToolbarRemoveCheckedValue: (name, item) =>
        set((state) => {
          const options = state.seismogramToolbarCheckedValues[name] || [];
          return {
            seismogramToolbarCheckedValues: {
              ...state.seismogramToolbarCheckedValues,
              [name]: options.filter((value) => value !== item),
            },
          };
        }),

      addSeismogramChannel: (channelId) =>
        set((state) => {
          return {
            channels: [...state.channels, channelId],
          };
        }),

      removeSeismogramChannel: (index) =>
        set((state) => {
          const channels = [...state.channels];
          channels.splice(index, 1);
          return {
            channels,
          };
        }),

      moveChannel: (fromIndex, toIndex) =>
        set((state) => {
          const channels = [...state.channels];
          const [channel] = channels.splice(fromIndex, 1);
          channels.splice(toIndex, 0, channel);
          return {
            channels,
          };
        }),
    };
  })
);

export const usePickerStore = createSelectors(pickerStore);
