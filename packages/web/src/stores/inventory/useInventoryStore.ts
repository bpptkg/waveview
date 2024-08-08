import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { Inventory } from '../../types/inventory';
import { useOrganizationStore } from '../organization';
import { InventoryStore } from './types';

export const inventoryStore = create<InventoryStore>((set, get) => {
  return {
    inventory: null,
    setInventory: (inventory) => set({ inventory }),
    fetchInventory: async () => {
      const { organization } = useOrganizationStore.getState();
      if (!organization) {
        return;
      }
      const url = apiVersion.getInventory.v1(organization.id);
      const inventory = await api<Inventory>(url);
      set({ inventory });
    },
    stations: () => {
      const inventory = get().inventory;
      if (!inventory) {
        return [];
      }
      return inventory.networks.flatMap((network) => network.stations);
    },
    channels: () => {
      const stations = get().stations();
      return stations.flatMap((station) => station.channels);
    },
  };
});

export const useInventoryStore = createSelectors(inventoryStore);
