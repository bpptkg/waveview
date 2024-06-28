export interface SeismicEvent {
  id: string;
  startTime: number;
  endTime: number;
  stationOfFirstArrival: string;
  eventType: string;
  note: string;
}
