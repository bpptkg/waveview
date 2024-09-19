import { ElementEvent } from "zrender";
import { EventMap } from "../util/types";
import { TrackView } from "./trackView";

export interface TrackEventMap extends EventMap {
  contextmenu: (event: ElementEvent, track: TrackView) => void;
  doubleClick: (event: ElementEvent, track: TrackView) => void;
}
