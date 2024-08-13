import { User } from './user';

export interface EventType {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description: string;
  color_light: string;
  color_dark: string;
  created_at: number;
  updated_at: number;
}

export interface Attachment {
  id: string;
  event_id: string;
  media_type: string;
  file: string;
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

export interface Amplitude {
  id: string;
  amplitude: number;
  type: string;
  duration: number;
  category: string;
  time: string;
  begin: string;
  end: string;
  snr: number;
  unit: string;
  waveform_id: string;
  method: string;
  evaluation_mode: string;
  is_preferred: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
}

export interface SeismicEvent {
  id: string;
  catalog_id: string;
  station_of_first_arrival_id: string;
  time: number;
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