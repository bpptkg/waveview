import { SeismicEventDetail } from '../../../types/event';
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
  editedEvent?: SeismicEventDetail;
  setEditedEvent: (event: SeismicEventDetail) => void;
  resetEditedEvent: () => void;
  isPickEmpty: () => boolean;
  clearPick: () => void;
  setPickStart: (start: number) => void;
  setPickEnd: (end: number) => void;
  setPickRange: (range: [number, number]) => void;
  savePickedEvent: (event: PickedEvent) => Promise<SeismicEventDetail>;
  fetchEditedEvent: (eventId: string) => Promise<SeismicEventDetail>;
}
