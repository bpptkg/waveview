import { Catalog } from '../../types/catalog';
import { SeismicEvent } from '../../types/event';

export type OrderingType = 'asc' | 'desc';

export interface FilterData {
  eventTypes?: string[];
  startDate?: number;
  endDate?: number;
  isBookmarked?: boolean;
  ordering?: OrderingType;
}

export interface CatalogStore {
  currentCatalog: Catalog | null;
  allCatalogs: Catalog[];
  events: SeismicEvent[];
  nextEventsUrl: string | null;
  loading: boolean;
  filterData: FilterData;
  initialFetch: boolean;
  /**
   * Sets the current catalog.
   */
  setCurrentCatalog: (catalog: Catalog) => void;
  /**
   * Sets the loading state.
   */
  setLoading: (loading: boolean) => void;
  /**
   * Sets the initial fetch state.
   */
  setInitialFetch: (initialFetch: boolean) => void;
  /**
   * Fetches all catalogs from the organization where the user is a member of
   * and sets the default catalog.
   */
  fetchAllCatalogs: () => Promise<void>;
  /**
   * Sets the next events URL to fetch the next page of events.
   */
  setNextEventsUrl: (url: string | null) => void;
  /**
   * Fetches the events from the current catalog at page 1.
   */
  fetchEvents: () => Promise<void>;
  /**
   * Fetches the next page of events from the current catalog.
   */
  fetchNextEvents: () => Promise<void>;
  /**
   * True if there are more events to fetch.
   */
  hasNextEvents: () => boolean;
  /**
   * Removes an event from the list of events.
   */
  removeEvent: (eventId: string) => void;
  /**
   * Update event in the list of events.
   */
  updateEvent: (event: SeismicEvent) => void;
  /**
   * Sets the filter data.
   */
  setFilterData: (data: FilterData) => void;
}
