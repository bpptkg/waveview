import { Channel } from '../../../types/channel';
import { StationWithChannel } from '../../../types/station';

export interface ChannelConfig {
  channel: Channel;
  color?: string;
}

export interface SeismogramSlice {
  /**
   * The last extent of the selected time range in the seismogram chart.
   */
  lastSeismogramExtent: [number, number];
  /**
   * The toolbar items that are currently checked in the seismogram chart.
   */
  seismogramToolbarCheckedValues: Record<string, string[]>;
  /**
   * Whether the seismogram chart is in expand mode.
   */
  isExpandMode: boolean;
  /**
   * The index of the expanded channel in the seismogram chart.
   */
  expandedChannelIndex: number | null;
  /**
   * List of default channels configured.
   */
  selectedChannels: ChannelConfig[];
  setSelectedChannels: (channels: ChannelConfig[]) => void;
  setLastSeismogramExtent: (extent: [number, number]) => void;
  seismogramToolbarSetCheckedValues: (name: string, checkedValues: string[]) => void;
  seismogramToolbarAddCheckedValue: (name: string, item: string) => void;
  seismogramToolbarRemoveCheckedValue: (name: string, item: string) => void;
  setExpandMode: (isExpandMode: boolean) => void;
  getChannelById: (id: string) => Channel | undefined;
  getSelectedStations: () => StationWithChannel[];
  getChannelsConfig: () => ChannelConfig[];
}
