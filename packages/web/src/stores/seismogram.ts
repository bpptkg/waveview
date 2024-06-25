import { create } from 'zustand';
import { createSelectors } from '../shared/createSelectors';

export interface SeismogramState {
  offsetDate: number;
  lastExtent: [number, number];
}

export interface SeismogramActions {
  setLastExtent: (extent: [number, number]) => void;
  setOffsetDate: (date: number) => void;
}

export type SeismogramStore = SeismogramState & SeismogramActions;

const seismogramWorkspaceStore = create<SeismogramStore>((set) => ({
  offsetDate: Date.now(),
  lastExtent: [0, 0],
  setOffsetDate: (date) => set({ offsetDate: date }),
  setLastExtent: (extent) => set({ lastExtent: extent }),
}));

export const useSeismogramStore = createSelectors(seismogramWorkspaceStore);
