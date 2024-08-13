import { SeismicEventDetail } from '../../types/event';

export interface EventDetailStore {
  eventId: string;
  event: SeismicEventDetail | null;
  loading: boolean;
  error: string | null;
  setEventId: (eventId: string) => void;
  hasEventId: (eventId: string) => boolean;
  fetchEvent: (eventId: string) => Promise<void>;
  getStationOfFirstArrival: () => string;
  bookmarkEvent: () => Promise<void>;
}
