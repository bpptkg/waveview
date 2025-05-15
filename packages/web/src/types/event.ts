import { MediaType } from './media';
import { ObservationEvent, ObservationPayload } from './observation';
import { User } from './user';

export type EvaluationMode = 'automatic' | 'manual';
export type EvaluationStatus = 'preliminary' | 'confirmed' | 'reviewed' | 'final' | 'rejected';
export type ObservationType = 'explosion' | 'pyroclastic_flow' | 'rockfall' | 'tectonic' | 'volcanic_emission' | 'lahar' | 'sound';

export interface EventType {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description: string;
  color: string;
  color_light: string;
  color_dark: string;
  created_at: number;
  updated_at: number;
  observation_type: ObservationType;
}

export interface Attachment {
  id: string;
  event_id: string;
  media_type: MediaType;
  file: string;
  thumbnail: string;
  name: string;
  size: number;
  uploaded_at: string;
  author: User;
}

export interface Origin {
  id: string;
  event_id: string;
  time: string;
  latitude: number;
  longitude: number;
  depth: number;
  method: string;
  earth_model: string;
  evaluation_mode: string;
  evaluation_status: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  is_preferred: boolean;
}

export interface Magnitude {
  id: string;
  event_id: string;
  magnitude: number;
  type: string;
  method: string;
  station_count: number;
  azimuthal_gap: number;
  evaluation_status: string;
  is_preferred: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
}

export interface ManualAmplitude {
  channel_id: string;
  amplitude: number | null;
  type: string;
  label: string;
  method: string;
  category: string;
  time: string;
  begin: number;
  end: number;
  unit: string;
  is_preferred: boolean;
}

export interface Amplitude {
  id: string;
  amplitude: number;
  type: string;
  duration: number;
  category: string;
  time: string;
  begin: number;
  end: number;
  snr: number;
  unit: string;
  waveform_id: string;
  method: string;
  evaluation_mode: string;
  is_preferred: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
  label: string;
}

export interface SeismicEvent {
  id: string;
  catalog_id: string;
  station_of_first_arrival_id: string;
  time: string;
  duration: number;
  type: EventType;
  type_certainty: string;
  note: string;
  method: string;
  evaluation_mode: string;
  evaluation_status: string;
  created_at: string;
  updated_at: string;
  author: User;
  collaborators: User[];
  origins: Origin[];
  magnitudes: Magnitude[];
  amplitudes: Amplitude[];
  preferred_origin: Origin | null;
  preferred_magnitude: Magnitude | null;
  preferred_amplitude: Amplitude | null;
  is_bookmarked: boolean;
}

export interface SeismicEventDetail extends SeismicEvent {
  attachments: Attachment[];
  amplitudes: Amplitude[];
  magnitudes: Magnitude[];
  origins: Origin[];
  observation: ObservationEvent | null;
}

export interface PaginatedSeismicEvents {
  count: number;
  next: string | null;
  previous: string | null;
  results: SeismicEvent[];
}

export interface EventBookmarkResponse {
  event_id: string;
  is_bookmarked: boolean;
}

export interface EventPayload {
  station_of_first_arrival_id: string;
  time: string;
  duration: number;
  type_id: string;
  note: string;
  method: string;
  evaluation_mode: EvaluationMode;
  evaluation_status: EvaluationStatus;
  attachment_ids: string[];
  observation: ObservationPayload | null;
  use_outlier_filter: boolean;
  amplitude_manual_inputs: ManualAmplitude[];
}

export interface EventQueryParams {
  page?: number;
  page_size?: number;
  ordering?: 'asc' | 'desc';
  start?: string;
  end?: string;
  event_types?: string;
  is_bookmarked?: 'true' | 'false';
}
