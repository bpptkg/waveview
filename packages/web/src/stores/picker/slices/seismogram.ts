import { Channel } from '../../../types/channel';
import { StationWithChannel } from '../../../types/station';
import { ComponentType } from '../types';

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
   * The component type of the seismogram chart.
   */
  component: ComponentType;
  /**
   * List of channels to display in the seismogram chart.
   */
  selectedChannels: Channel[];
  setSelectedChannels: (channels: Channel[]) => void;
  setLastSeismogramExtent: (extent: [number, number]) => void;
  seismogramToolbarSetCheckedValues: (name: string, checkedValues: string[]) => void;
  seismogramToolbarAddCheckedValue: (name: string, item: string) => void;
  seismogramToolbarRemoveCheckedValue: (name: string, item: string) => void;
  addSeismogramChannel: (channel: Channel) => void;
  removeSeismogramChannel: (index: number) => void;
  moveChannel: (fromIndex: number, toIndex: number) => void;
  setExpandMode: (isExpandMode: boolean) => void;
  setComponent: (component: ComponentType) => void;
  getChannelsByStationIndex: (index: number) => Channel[];
  setExpandedChannelIndex: (index: number) => void;
  getChannelByStreamId: (streamId: string) => Channel | undefined;
  getChannelById: (id: string) => Channel | undefined;
  getSelectedStations: () => StationWithChannel[];
}
