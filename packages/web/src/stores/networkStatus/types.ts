import { SeismicNetworkStatus } from '../../types/networkStatus';

export interface SeismicNetworkStatusStore {
  networkStatus: SeismicNetworkStatus[];
  loading: boolean;
  error: string;
  initialFetch: boolean;
  setInitialFetch: (initialFetch: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  fetchNetworkStatus: () => Promise<void>;
}
