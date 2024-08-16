import { Channel } from '../../types/channel';
import { Inventory } from '../../types/inventory';
import { StationWithChannel } from '../../types/station';

export interface InventoryStore {
  inventory: Inventory | null;
  /**
   * Sets the inventory of the current organization.
   */
  setInventory: (inventory: Inventory) => void;
  /**
   * Fetches the inventory of the current organization.
   */
  fetchInventory: () => Promise<void>;
  /**
   * Returns all stations within the inventory including their channels.
   */
  stations: () => StationWithChannel[];
  /**
   * Returns all channels within the inventory.
   */
  channels: () => Channel[];
  /**
   * Find a channel by its ID.
   */
  getChannelById: (channelId: string) => Channel | undefined;
  /**
   * Find a station by its ID.
   */
  getStationById: (stationId: string) => StationWithChannel | undefined;
}
