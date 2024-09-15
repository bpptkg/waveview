import { create } from 'zustand';
import { createSelectors } from '../../shared/createSelectors';
import { EmissionColor, ExplosionEvent, ExplosionEventPayload, ObservationForm } from '../../types/observation';

export interface ExplosionEventStore {
  observationForm: ObservationForm;
  columnHeight: number;
  color: EmissionColor | '';
  intensity: number;
  vei: number;
  note: string;
  setObservationForm: (observationForm: ObservationForm) => void;
  setColumnHeight: (columnHeight: number) => void;
  setColor: (color: EmissionColor) => void;
  setIntensity: (intensity: number) => void;
  setVei: (vei: number) => void;
  setNote: (note: string) => void;
  reset: () => void;
  getPayload: () => ExplosionEventPayload;
  fromEvent: (event: ExplosionEvent) => void;
}

export const explosionEventStore = create<ExplosionEventStore>((set, get) => ({
  observationForm: 'not_observed',
  columnHeight: 0,
  color: '',
  intensity: 0,
  vei: 0,
  note: '',
  setObservationForm: (observationForm: ObservationForm) => set({ observationForm }),
  setColumnHeight: (columnHeight: number) => set({ columnHeight }),
  setColor: (color: EmissionColor) => set({ color }),
  setIntensity: (intensity: number) => set({ intensity }),
  setVei: (vei: number) => set({ vei }),
  setNote: (note: string) => set({ note }),
  reset: () =>
    set({
      observationForm: 'not_observed',
      columnHeight: 0,
      color: '',
      intensity: 0,
      vei: 0,
      note: '',
    }),
  getPayload: () => {
    const { observationForm, columnHeight, color, intensity, vei, note } = get();
    return { observation_form: observationForm, column_height: columnHeight, color, intensity, vei, note };
  },
  fromEvent: (event: ExplosionEvent) => {
    const { observation_form, column_height, color, intensity, vei, note } = event;
    set({ observationForm: observation_form, columnHeight: column_height, color, intensity, vei, note });
  },
}));

export const useExplosionEventStore = createSelectors(explosionEventStore);
