export type PickerChart = 'helicorder' | 'seismogram';
export type SeismogramCheckedValue = 'zoom-rectangle' | 'pick-mode';
export type ComponentType = 'E' | 'N' | 'Z';

export interface PickedEvent {
  time: number;
  duration: number;
  stationOfFirstArrival: string;
  eventType: string;
  note: string;
}
