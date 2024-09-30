import { Channel, EventMap } from "../util/types";
import { EventMarkerOptions } from "./eventMarker/eventMarkerModel";

export interface HelicorderEventMap extends EventMap {
  channelChanged: (channel: Channel) => void;
  offsetChanged: (offset: number) => void;
  intervalChanged: (interval: number) => void;
  durationChanged: (duration: number) => void;
  amplitudeChanged: (range: [number, number]) => void;
  trackSelected: (index: number) => void;
  trackDeselected: () => void;
  selectionChanged: (range: [number, number]) => void;
  eventMarkerClicked: (marker: EventMarkerOptions) => void;
}
