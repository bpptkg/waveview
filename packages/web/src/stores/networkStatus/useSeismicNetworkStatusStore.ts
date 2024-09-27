import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { CustomError } from '../../types/response';
import { useOrganizationStore } from '../organization';
import { SeismicNetworkStatusStore } from './types';

const seismicNetworkStatusStore = create<SeismicNetworkStatusStore>((set) => ({
  networkStatus: [],
  loading: false,
  error: '',
  initialFetch: false,
  setInitialFetch: (initialFetch) => set({ initialFetch }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  fetchNetworkStatus: async () => {
    const { currentOrganization } = useOrganizationStore.getState();
    if (!currentOrganization) {
      throw new CustomError('Organization is not set');
    }
    set({ loading: true });
    try {
      const response = await api(apiVersion.getSeismicNetworkStatus.v1(currentOrganization.id));
      if (!response.ok) {
        throw new CustomError('Failed to fetch seismic network status');
      }
      const networkStatus = await response.json();
      set({ networkStatus, loading: false });
    } catch (error) {
      const err = error as Error;
      set({ error: err.message, loading: false });
    }
  },
}));

export const useSeismicNetworkStatusStore = createSelectors(seismicNetworkStatusStore);
