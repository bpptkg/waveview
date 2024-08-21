import { DEMXYZInfo } from '../../types/dem';

export interface DEMXYZStore {
  demxyz: DEMXYZInfo | null;
  loading: boolean;
  error: string;
  fetchDemXyz: () => Promise<void>;
}
