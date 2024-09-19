import { create } from 'zustand';
import { createSelectors } from '../../shared/createSelectors';
import { MMIScale, TectonicEvent, TectonicEventPayload } from '../../types/observation';

export interface TectonicEventStore {
  mmiScale: MMIScale;
  magnitude: number;
  depth: number;
  note: string;
  setMmiScale: (mmiScale: MMIScale) => void;
  setMagnitude: (magnitude: number) => void;
  setDepth: (depth: number) => void;
  setNote: (note: string) => void;
  reset: () => void;
  getPayload: () => TectonicEventPayload;
  fromEvent: (event: TectonicEvent) => void;
}

export const tectonicEventStore = create<TectonicEventStore>((set, get) => ({
  mmiScale: 'I',
  magnitude: 0,
  depth: 0,
  note: '',
  setMmiScale: (mmiScale: MMIScale) => set({ mmiScale }),
  setMagnitude: (magnitude: number) => set({ magnitude }),
  setDepth: (depth: number) => set({ depth }),
  setNote: (note: string) => set({ note }),
  reset: () =>
    set({
      mmiScale: 'I',
      magnitude: 0,
      depth: 0,
      note: '',
    }),
  getPayload: () => {
    const { mmiScale, magnitude, depth, note } = get();
    return { mmi_scale: mmiScale, magnitude, depth, note };
  },
  fromEvent: (event: TectonicEvent) => {
    const { mmi_scale, magnitude, depth, note } = event;
    set({ mmiScale: mmi_scale || 'I', magnitude: magnitude || 0, depth: depth || 0, note: note || '' });
  },
}));

export const useTectonicEventStore = createSelectors(tectonicEventStore);
