export type PickerChart = 'helicorder' | 'seismogram';
export type SeismogramCheckedValue = 'zoom-rectangle' | 'pick-mode';
export type ComponentType = 'E' | 'N' | 'Z';

export interface PickedEvent {
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
}
