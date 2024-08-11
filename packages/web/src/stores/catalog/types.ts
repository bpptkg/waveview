import { Catalog } from '../../types/catalog';

export interface CatalogStore {
  currentCatalog: Catalog | null;
  allCatalogs: Catalog[];
  setCurrentCatalog: (catalog: Catalog) => void;
  fetchAllCatalogs: () => Promise<void>;
}
