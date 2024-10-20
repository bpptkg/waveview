import { Channel, EventMap } from "../util/types";
import { EventMarkerOptions } from "./eventMarker/eventMarkerModel";

export interface HelicorderEventMap extends EventMap {
  /**
   * Fired when the channel changes.
   */
  channelChanged: (channel: Channel) => void;
  /**
   * Fired when the offset date changes.
   */
  offsetChanged: (offset: number) => void;
  /**
   * Fired when the amplitude range changes.
   */
  amplitudeChanged: (range: [number, number]) => void;
  /**
   * Fired when selection window changes.
   */
  selectionChanged: (range: [number, number]) => void;
  /**
   * Fired when the event marker is clicked.
   */
  eventMarkerClicked: (marker: EventMarkerOptions) => void;
  /**
   * Fired when the loading state changes.
   */
  loading: (loading: boolean) => void;
}
