import { EventMap } from "../util/types";

export interface PickerEventMap extends EventMap {
  /**
   * Fires when the pick range is changed.
   */
  change: (range: [number, number]) => void;
}
