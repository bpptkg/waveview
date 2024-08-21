import { Hypocenter } from '../../types/hypocenter';

export interface HypocenterStore {
  hypocenter: Hypocenter | null;
  loading: boolean;
  error: string;
  fetchHypocenter: () => Promise<void>;
}
