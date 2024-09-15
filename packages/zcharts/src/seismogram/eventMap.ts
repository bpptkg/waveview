import * as zrender from "zrender";
import { Channel, EventMap } from "../util/types";
import { SeismogramEventMarkerData } from "./eventMarker/eventMarkerModel";

export interface SeismogramEventMap extends EventMap {
  channelAdded: (channel: Channel) => void;
  channelRemoved: (channel: Channel) => void;
  channelMoved: (from: number, to: number) => void;
  amplitudeChanged: (range: [number, number]) => void;
  trackSelected: (index: number) => void;
  trackUnselected: () => void;
  extentChanged: (extent: [number, number]) => void;
  trackDoubleClicked: (index: number) => void;
  click: (event: zrender.ElementEvent) => void;
  contextmenu: (event: zrender.ElementEvent) => void;
  pickChanged: (pick: [number, number]) => void;
  eventMarkerContextMenu: (
    event: zrender.ElementEvent,
    marker: SeismogramEventMarkerData
  ) => void;
  eventMarkerClicked: (marker: SeismogramEventMarkerData) => void;
}
