import { Volcano } from '../../types/volcano';

export interface VolcanoStore {
  currentVolcano: Volcano | null;
  allVolcanoes: Volcano[];
  setCurrentVolcano: (volcano: Volcano) => void;
  setCurrentVolcanoById: (id: string) => void;
  fetchAllVolcanoes: () => Promise<void>;
}
