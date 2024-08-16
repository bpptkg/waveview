import { SeismicEventDetail } from '../../types/event';

export interface RefreshOptions {
  clearCache?: boolean;
}

export interface EventDetailStore {
  eventId: string;
  event: SeismicEventDetail | null;
  loading: boolean;
  error: string | null;
  /**
   * Sets the event ID.
   */
  setEventId: (eventId: string) => void;
  /**
   * Checks if the store has the event ID.
   */
  hasEventId: (eventId: string) => boolean;
  /**
   * Fetches the event details from the API. If the event is already in the
   * cache, it will be used instead.
   */
  fetchEvent: (eventId: string, options?: RefreshOptions) => Promise<void>;
  /**
   * Returns the station code of the first arrival of the event.
   */
  getStationOfFirstArrival: () => string;
  /**
   * Bookmark or unbookmark the event.
   */
  bookmarkEvent: () => Promise<void>;
  /**
   * Clears the cache.
   */
  clearCache: () => void;
  /**
   * Deletes the event.
   */
  deleteEvent: () => Promise<void>;
}
