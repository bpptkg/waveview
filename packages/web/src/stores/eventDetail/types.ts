import { SeismicEventDetail } from '../../types/event';

export interface RefreshOptions {
  clearCache?: boolean;
}

export interface EventDetailStore {
  eventId: string;
  event: SeismicEventDetail | null;
  loading: boolean;
  error: string | null;
  setEventId: (eventId: string) => void;
  hasEventId: (eventId: string) => boolean;
  fetchEvent: (eventId: string, options?: RefreshOptions) => Promise<void>;
  getStationOfFirstArrival: () => string;
  bookmarkEvent: () => Promise<void>;
  clearCache: () => void;
  deleteEvent: () => Promise<void>;
}
