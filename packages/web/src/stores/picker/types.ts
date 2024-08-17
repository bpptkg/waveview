import { EvaluationMode, EvaluationStatus } from '../../types/event';

export type PickerChart = 'helicorder' | 'seismogram';
export type SeismogramCheckedValue = 'zoom-rectangle' | 'pick-mode';
export type ComponentType = 'E' | 'N' | 'Z';

export interface PickedEvent {
  /**
   * Event ID of the event. If not provided, a new event will be created.
   */
  eventId?: string;
  /**
   * The time of the event in milliseconds since the Unix epoch.
   */
  time: number;
  /**
   * The duration of the event in seconds.
   */
  duration: number;
  /**
   * Station ID of the first arrival.
   */
  stationOfFirstArrival: string;
  /**
   * Event type ID of the event.
   */
  eventType: string;
  /**
   * Additional note for the event.
   */
  note: string;
  /**
   *  The method used to create the event.
   */
  method: string;
  /**
   * The evaluation mode of the event.
   */
  evaluation_mode: EvaluationMode;
  /**
   * The evaluation status of the event.
   */
  evaluation_status: EvaluationStatus;
  /**
   * Attachment IDs associated with the event.
   */
  attachment_ids: string[];
}
