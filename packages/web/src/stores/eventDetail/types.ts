import { SeismicEvent } from '../../types/event';

export interface EventDetailStore {
  eventId: string;
  event: SeismicEvent | null;
  loading: boolean;
  error: string | null;
  setEventId: (eventId: string) => void;
  hasEventId: (eventId: string) => boolean;
  fetchEvent: (eventId: string) => Promise<void>;
  getStationOfFirstArrival: () => string;
}
