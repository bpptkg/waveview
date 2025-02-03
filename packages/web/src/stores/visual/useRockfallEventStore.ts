import { create } from 'zustand';
import { createSelectors } from '../../shared/createSelectors';
import { EventSize, FallDirection, ObservationForm, RockfallEvent, RockfallEventPayload } from '../../types/observation';

export interface RofckfallEventStore {
  isLavaFlow: boolean;
  observationForm: ObservationForm;
  eventSize: EventSize;
  runoutDistance: number;
  fallDirections: FallDirection[];
  amplitude: number;
  duration: number;
  note: string;
  setIsLavaFlow: (isLavaFlow: boolean) => void;
  setObservationForm: (observationForm: ObservationForm) => void;
  setEventSize: (eventSize: EventSize) => void;
  setRunoutDistance: (runoutDistance: number) => void;
  setFallDirections: (fallDirections: FallDirection[]) => void;
  addFallDirection: (fallDirection: FallDirection) => void;
  removeFallDirection: (id: string) => void;
  setAmplitude: (amplitude: number) => void;
  setDuration: (duration: number) => void;
  setNote: (note: string) => void;
  reset: () => void;
  getPayload: () => RockfallEventPayload;
  fromEvent: (event: RockfallEvent) => void;
}

export const rockfallEventStore = create<RofckfallEventStore>((set, get) => ({
  isLavaFlow: false,
  observationForm: 'not_observed',
  eventSize: 'not_observed',
  runoutDistance: 0,
  fallDirections: [],
  amplitude: 0,
  duration: 0,
  note: '',
  setIsLavaFlow: (isLavaFlow: boolean) => set({ isLavaFlow }),
  setObservationForm: (observationForm: ObservationForm) => set({ observationForm }),
  setEventSize: (eventSize: EventSize) => set({ eventSize }),
  setRunoutDistance: (runoutDistance: number) => set({ runoutDistance }),
  setFallDirections: (fallDirections: FallDirection[]) => set({ fallDirections }),
  addFallDirection: (fallDirection: FallDirection) => set({ fallDirections: [...get().fallDirections, fallDirection] }),
  removeFallDirection: (id: string) => set({ fallDirections: get().fallDirections.filter((fd) => fd.id !== id) }),
  setAmplitude: (amplitude: number) => set({ amplitude }),
  setDuration: (duration: number) => set({ duration }),
  setNote: (note: string) => set({ note }),
  reset: () =>
    set({
      isLavaFlow: false,
      observationForm: 'not_observed',
      eventSize: 'not_observed',
      runoutDistance: 0,
      fallDirections: [],
      amplitude: 0,
      duration: 0,
      note: '',
    }),
  getPayload: () => {
    const { isLavaFlow, observationForm, eventSize, runoutDistance, fallDirections, amplitude, duration, note } = get();
    return {
      is_lava_flow: isLavaFlow,
      observation_form: observationForm,
      event_size: eventSize,
      runout_distance: runoutDistance,
      fall_direction_ids: fallDirections.map((fd) => fd.id),
      amplitude,
      duration,
      note,
    };
  },
  fromEvent: (event: RockfallEvent) => {
    const { is_lava_flow, observation_form, event_size, runout_distance, fall_directions, amplitude, duration, note } = event;
    set({
      isLavaFlow: is_lava_flow || false,
      observationForm: observation_form || 'not_observed',
      eventSize: event_size || 'not_observed',
      runoutDistance: runout_distance || 0,
      fallDirections: fall_directions,
      amplitude: amplitude || 0,
      duration: duration || 0,
      note: note || '',
    });
  },
}));

export const useRockfallEventStore = createSelectors(rockfallEventStore);
