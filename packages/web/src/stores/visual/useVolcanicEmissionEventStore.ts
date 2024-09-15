import { create } from 'zustand';
import { createSelectors } from '../../shared/createSelectors';
import { EmissionColor, ObservationForm, VolcanicEmissionEvent, VolcanicEmissionEventPayload } from '../../types/observation';

export interface VolcanicEmissionEventStore {
  observationForm: ObservationForm;
  height: number;
  color: EmissionColor | '';
  intensity: number;
  note: string;
  setObservationForm: (observationForm: ObservationForm) => void;
  setHeight: (height: number) => void;
  setColor: (color: EmissionColor) => void;
  setIntensity: (intensity: number) => void;
  setNote: (note: string) => void;
  reset: () => void;
  getPayload: () => VolcanicEmissionEventPayload;
  fromEvent: (event: VolcanicEmissionEvent) => void;
}

const volcanicEmissionEventStore = create<VolcanicEmissionEventStore>((set, get) => ({
  observationForm: 'not_observed',
  height: 0,
  color: 'white',
  intensity: 0,
  note: '',
  setObservationForm: (observationForm: ObservationForm) => set({ observationForm }),
  setHeight: (height: number) => set({ height }),
  setColor: (color: EmissionColor) => set({ color }),
  setIntensity: (intensity: number) => set({ intensity }),
  setNote: (note: string) => set({ note }),
  reset: () =>
    set({
      observationForm: 'not_observed',
      height: 0,
      color: '',
      intensity: 0,
      note: '',
    }),
  getPayload: () => {
    const { observationForm, height, color, intensity, note } = get();
    return { observation_form: observationForm, height, color, intensity, note };
  },
  fromEvent: (event: VolcanicEmissionEvent) => {
    const { observation_form, height, color, intensity, note } = event;
    set({ observationForm: observation_form, height, color, intensity, note });
  },
}));

export const useVolcanicEmissionEventStore = createSelectors(volcanicEmissionEventStore);
