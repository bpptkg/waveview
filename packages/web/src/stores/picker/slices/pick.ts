import { PickedEvent } from '../types';

export interface PickSlice {
  /**
   * The start time of the pick range.
   */
  pickStart: number;
  /**
   * The end time of the pick range.
   */
  pickEnd: number;
  isPickEmpty: () => boolean;
  clearPick: () => void;
  setPickStart: (start: number) => void;
  setPickEnd: (end: number) => void;
  setPickRange: (range: [number, number]) => void;
  savePickedEvent: (event: PickedEvent) => void;
}
