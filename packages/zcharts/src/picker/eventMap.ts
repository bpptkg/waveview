import { EventMap } from "../util/types";

export interface PickerEventMap extends EventMap {
  change: (range: [number, number]) => void;
}
