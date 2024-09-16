import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { DEMXYZInfo } from '../../types/dem';
import { CustomError } from '../../types/response';
import { useOrganizationStore } from '../organization';
import { useVolcanoStore } from '../volcano/useVolcanoStore';
import { DEMXYZStore } from './types';

export class LocalStorageCache {
  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  get(key: string): string | null {
    return localStorage.getItem(key);
  }

  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
}

export const cache = new LocalStorageCache();

export function getCacheKey(id: string): string {
  return `wv:demxyz:${id}`;
}

const demXyzStore = create<DEMXYZStore>((set) => {
  return {
    demxyz: null,
    loading: false,
    error: '',

    fetchDemXyz: async () => {
      const { currentOrganization } = useOrganizationStore.getState();
      if (!currentOrganization) {
        throw new CustomError('Organization is not set');
      }

      const { currentVolcano } = useVolcanoStore.getState();
      if (!currentVolcano) {
        throw new CustomError('Volcano is not set');
      }

      set({ loading: true });
      try {
        const response = await api(apiVersion.getDemXyz.v1(currentOrganization.id, currentVolcano.id));
        const data: DEMXYZInfo = await response.json();
        set({ demxyz: data });
      } catch (error: unknown) {
        const err = error as Error;
        set({ error: err.message });
      } finally {
        set({ loading: false });
      }
    },
  };
});

export const useDemXyzStore = createSelectors(demXyzStore);
