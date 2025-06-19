import { EventMap } from "../util/types";

export interface PickerEventMap extends EventMap {
  /**
   * Fires when the pick range is changed.
   */
  change: (range: [number, number]) => void;
  /**
   * Fires when the start time is picked.
   */
  start: (start: number) => void;
  /**
   * Fires when the end time is picked.
   */
  end: (end: number) => void;
}
