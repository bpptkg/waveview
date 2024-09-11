import * as zrender from "zrender";
import { Channel, EventMap } from "../util/types";

export interface HelicorderEventMap extends EventMap {
  channelChanged: (channel: Channel) => void;
  offsetChanged: (offset: number) => void;
  intervalChanged: (interval: number) => void;
  durationChanged: (duration: number) => void;
  amplitudeChanged: (range: [number, number]) => void;
  trackSelected: (index: number) => void;
  trackDeselected: () => void;
  selectionChanged: (range: [number, number]) => void;
  click: (event: zrender.ElementEvent) => void;
}
