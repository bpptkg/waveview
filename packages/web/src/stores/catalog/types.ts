import { Catalog } from '../../types/catalog';
import { SeismicEvent } from '../../types/event';

export interface CatalogStore {
  currentCatalog: Catalog | null;
  allCatalogs: Catalog[];
  events: SeismicEvent[];
  nextEventsUrl: string | null;
  setCurrentCatalog: (catalog: Catalog) => void;
  fetchAllCatalogs: () => Promise<void>;
  setNextEventsUrl: (url: string | null) => void;
  fetchEvents: () => Promise<void>;
  fetchNextEvents: () => Promise<void>;
  hasNextEvents: () => boolean;
  removeEvent: (eventId: string) => void;
}
