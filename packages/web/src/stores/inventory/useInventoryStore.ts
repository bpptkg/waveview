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
    /**
     * Fetches the inventory of the current organization.
     */
    fetchInventory: async () => {
      const currentOrganization = useOrganizationStore.getState().currentOrganization;
      if (!currentOrganization) {
        return;
      }
      const url = apiVersion.getInventory.v1(currentOrganization.id);
      const response = await api(url);
      const inventory: Inventory = await response.json();
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
    getChannelById: (channelId) => {
      const channels = get().channels();
      return channels.find((channel) => channel.id === channelId);
    },
    getStationById: (stationId) => {
      const stations = get().stations();
      return stations.find((station) => station.id === stationId);
    },
  };
});

export const useInventoryStore = createSelectors(inventoryStore);
