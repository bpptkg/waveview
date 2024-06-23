import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createSelectors } from '../shared/createSelectors';

export type PickerWorkspace = 'helicorder' | 'seismogram';
export type PickerChart = 'helicorder' | 'seismogram';

export interface PickerState {
  workspace: PickerWorkspace;
  channelId: string;
  duration: number;
  interval: number;
  showEvent: boolean;
  offsetDate: number;
  useUTC: boolean;
  timeZone: string;
  selectedChart: PickerChart;
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
}

export type PickerStore = PickerState & PickerActions;

const pickerStore = create<PickerStore, [['zustand/devtools', never]]>(
  devtools((set) => ({
    workspace: 'helicorder',
    channelId: 'VG.MELAB.00.HHZ',
    duration: 12,
    interval: 30,
    showEvent: true,
    offsetDate: Date.now(),
    useUTC: false,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    selectedChart: 'helicorder',
    setWorkspace: (workspace) => set({ workspace }),
    setChannelId: (channelId) => set({ channelId }),
    setDuration: (duration) => set({ duration }),
    setInterval: (interval) => set({ interval }),
    setShowEvent: (showEvent) => set({ showEvent }),
    setOffsetDate: (offsetDate) => set({ offsetDate }),
    setUseUTC: (useUTC) => set({ useUTC }),
    setSelectedChart: (selectedChart) => set({ selectedChart }),
  }))
);

export const usePickerStore = createSelectors(pickerStore);