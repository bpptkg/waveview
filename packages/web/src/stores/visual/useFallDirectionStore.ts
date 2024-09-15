import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { FallDirection } from '../../types/observation';
import { CustomError } from '../../types/response';
import { useOrganizationStore } from '../organization';
import { useVolcanoStore } from '../volcano/useVolcanoStore';

export interface FallDirectionStore {
  allFallDirections: FallDirection[];
  setAllFallDirections: (allFallDirections: FallDirection[]) => void;
  fetchAllFallDirections: () => Promise<void>;
}

const fallDirectionStore = create<FallDirectionStore>((set) => ({
  allFallDirections: [],
  setAllFallDirections: (allFallDirections: FallDirection[]) => set({ allFallDirections }),
  fetchAllFallDirections: async () => {
    const { currentOrganization } = useOrganizationStore.getState();
    if (!currentOrganization) {
      throw new CustomError('Organization is not set');
    }
    const { currentVolcano } = useVolcanoStore.getState();
    if (!currentVolcano) {
      throw new CustomError('Volcano is not set');
    }
    const response = await api(apiVersion.listFallDirection.v1(currentOrganization.id, currentVolcano.id));
    if (!response.ok) {
      throw new CustomError('Failed to fetch fall directions');
    }
    const allFallDirections: FallDirection[] = await response.json();
    set({ allFallDirections });
  },
}));

export const useFallDirectionStore = createSelectors(fallDirectionStore);
