export type ObservationForm = 'not_observed' | 'visible' | 'audible' | 'visible_and_audible';
export type EventSize = 'small' | 'medium' | 'large' | 'not_observed';
export type EmissionColor = 'white' | 'gray' | 'black' | 'yellow' | 'green' | 'blue' | 'red' | 'orange';
export type MMIScale = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII' | 'IX' | 'X' | 'XI' | 'XII';
export type VEI = number;

export interface ObservationFormOption {
  value: string;
  label: string;
}
export const ObservationFormOptions: ObservationFormOption[] = [
  { value: 'not_observed', label: 'Not observed' },
  { value: 'visible', label: 'Visible' },
  { value: 'audible', label: 'Audible' },
  { value: 'visible_and_audible', label: 'Visible and audible' },
];

export interface EventSizeOption {
  value: string;
  label: string;
}

export const EventSizeOptions: EventSizeOption[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'not_observed', label: 'Not observed' },
];

export interface EmissionColorOption {
  value: string;
  label: string;
}

export const EmissionColorOptions: EmissionColorOption[] = [
  { value: 'white', label: 'White' },
  { value: 'gray', label: 'Gray' },
  { value: 'black', label: 'Black' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'red', label: 'Red' },
  { value: 'orange', label: 'Orange' },
];

export interface MMIScaleOption {
  value: string;
  label: string;
}

export const MMIScaleOptions: MMIScaleOption[] = [
  { value: 'I', label: 'I' },
  { value: 'II', label: 'II' },
  { value: 'III', label: 'III' },
  { value: 'IV', label: 'IV' },
  { value: 'V', label: 'V' },
  { value: 'VI', label: 'VI' },
  { value: 'VII', label: 'VII' },
  { value: 'VIII', label: 'VIII' },
  { value: 'IX', label: 'IX' },
  { value: 'X', label: 'X' },
  { value: 'XI', label: 'XI' },
  { value: 'XII', label: 'XII' },
];

export interface VEIScaleOption {
  value: number;
  label: string;
}

export const VEIScaleOptions: VEIScaleOption[] = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
];

export interface ExplosionEvent {
  id: string;
  event_id: string;
  observation_form: ObservationForm;
  column_height: number;
  color: EmissionColor | '';
  intensity: number;
  vei: VEI;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface ExplosionEventPayload {
  observation_form: ObservationForm;
  column_height: number;
  color: EmissionColor | '';
  intensity: number;
  vei: VEI;
  note: string;
}

export interface FallDirection {
  id: string;
  name: string;
  description: string;
}

export interface PyroclasticFlowEvent {
  id: string;
  event_id: string;
  is_lava_flow: boolean;
  observation_form: ObservationForm;
  event_size: EventSize;
  runout_distance: number;
  fall_direction: FallDirection | null;
  amplitude: number;
  duration: number;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface PyroclasticFlowEventPayload {
  is_lava_flow: boolean;
  observation_form: ObservationForm;
  event_size: EventSize;
  runout_distance: number;
  fall_direction_id: string | null;
  amplitude: number;
  duration: number;
  note: string;
}

export interface RockfallEvent {
  id: string;
  event_id: string;
  is_lava_flow: boolean;
  observation_form: ObservationForm;
  event_size: EventSize;
  runout_distance: number;
  fall_direction: FallDirection | null;
  amplitude: number;
  duration: number;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface RockfallEventPayload {
  is_lava_flow: boolean;
  observation_form: ObservationForm;
  event_size: EventSize;
  runout_distance: number;
  fall_direction_id: string | null;
  amplitude: number;
  duration: number;
  note: string;
}

export interface TectonicEvent {
  id: string;
  event_id: string;
  mmi_scale: MMIScale;
  magnitude: number;
  depth: number;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface TectonicEventPayload {
  mmi_scale: MMIScale;
  magnitude: number;
  depth: number;
  note: string;
}

export interface VolcanicEmissionEvent {
  id: string;
  event_id: string;
  observation_form: ObservationForm;
  height: number;
  color: EmissionColor | '';
  intensity: number;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface VolcanicEmissionEventPayload {
  observation_form: ObservationForm;
  height: number;
  color: EmissionColor | '';
  intensity: number;
  note: string;
}

export type ObservationEvent = ExplosionEvent | PyroclasticFlowEvent | RockfallEvent | TectonicEvent | VolcanicEmissionEvent;

export type ObservationPayload =
  | ExplosionEventPayload
  | PyroclasticFlowEventPayload
  | RockfallEventPayload
  | TectonicEventPayload
  | VolcanicEmissionEventPayload;
