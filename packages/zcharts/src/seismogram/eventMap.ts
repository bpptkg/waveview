import { ElementEvent } from "zrender";
import { Channel, EventMap } from "../util/types";
import { EventMarkerOptions } from "./eventMarker/eventMarkerModel";

export interface SeismogramEventMap extends EventMap {
  channelAdded: (channel: Channel) => void;
  channelRemoved: (channel: Channel) => void;
  channelMoved: (from: number, to: number) => void;
  amplitudeChanged: (range: [number, number]) => void;
  trackSelected: (index: number) => void;
  trackUnselected: () => void;
  extentChanged: (extent: [number, number]) => void;
  trackDoubleClicked: (index: number) => void;
  pickChanged: (pick: [number, number]) => void;
  trackContextMenu: (event: ElementEvent, index: number) => void;
  eventMarkerContextMenu: (
    event: ElementEvent,
    marker: EventMarkerOptions
  ) => void;
  loading: (loading: boolean) => void;
}
