import { Volcano } from '../../types/volcano';

export interface VolcanoStore {
  currentVolcano: Volcano | null;
  allVolcanoes: Volcano[];
  /**
   * Sets the current volcano context.
   *
   * TODO: This should also change the current catalog and inventory whithin a
   * volcano context.
   */
  setCurrentVolcano: (volcano: Volcano) => void;
  /**
   * Fetches all volcanoes from the organization where the user is a member of
   * and sets the default volcano.
   */
  fetchAllVolcanoes: (slug?: string) => Promise<Volcano>;
}
