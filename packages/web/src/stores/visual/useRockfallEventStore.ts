import { create } from 'zustand';
import { createSelectors } from '../../shared/createSelectors';
import { EventSize, ObservationForm, RockfallEvent, RockfallEventPayload } from '../../types/observation';

export interface RofckfallEventStore {
  isLavaFlow: boolean;
  observationForm: ObservationForm;
  eventSize: EventSize;
  runoutDistance: number;
  fallDirection?: string;
  amplitude: number;
  duration: number;
  note: string;
  setIsLavaFlow: (isLavaFlow: boolean) => void;
  setObservationForm: (observationForm: ObservationForm) => void;
  setEventSize: (eventSize: EventSize) => void;
  setRunoutDistance: (runoutDistance: number) => void;
  setFallDirection: (fallDirection: string) => void;
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
  fallDirection: undefined,
  amplitude: 0,
  duration: 0,
  note: '',
  setIsLavaFlow: (isLavaFlow: boolean) => set({ isLavaFlow }),
  setObservationForm: (observationForm: ObservationForm) => set({ observationForm }),
  setEventSize: (eventSize: EventSize) => set({ eventSize }),
  setRunoutDistance: (runoutDistance: number) => set({ runoutDistance }),
  setFallDirection: (fallDirection: string) => set({ fallDirection }),
  setAmplitude: (amplitude: number) => set({ amplitude }),
  setDuration: (duration: number) => set({ duration }),
  setNote: (note: string) => set({ note }),
  reset: () =>
    set({
      isLavaFlow: false,
      observationForm: 'not_observed',
      eventSize: 'not_observed',
      runoutDistance: 0,
      fallDirection: undefined,
      amplitude: 0,
      duration: 0,
      note: '',
    }),
  getPayload: () => {
    const { isLavaFlow, observationForm, eventSize, runoutDistance, fallDirection, amplitude, duration, note } = get();
    return {
      is_lava_flow: isLavaFlow,
      observation_form: observationForm,
      event_size: eventSize,
      runout_distance: runoutDistance,
      fall_direction_id: fallDirection ?? null,
      amplitude,
      duration,
      note,
    };
  },
  fromEvent: (event: RockfallEvent) => {
    const { is_lava_flow, observation_form, event_size, runout_distance, fall_direction, amplitude, duration, note } = event;
    set({
      isLavaFlow: is_lava_flow,
      observationForm: observation_form,
      eventSize: event_size,
      runoutDistance: runout_distance,
      fallDirection: fall_direction?.id,
      amplitude,
      duration,
      note,
    });
  },
}));

export const useRockfallEventStore = createSelectors(rockfallEventStore);
