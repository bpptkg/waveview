import { Channel } from '../../types/channel';
import { Inventory } from '../../types/inventory';
import { StationWithChannel } from '../../types/station';

export interface InventoryStore {
  inventory: Inventory | null;
  setInventory: (inventory: Inventory) => void;
  fetchInventory: () => Promise<void>;
  stations: () => StationWithChannel[];
  channels: () => Channel[];
  getChannelById: (channelId: string) => Channel | undefined;
  getStationById: (stationId: string) => StationWithChannel | undefined;
}
