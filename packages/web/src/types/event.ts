export interface EventType {
  id: string;
  code: string;
  name: string;
}

export interface SeismicEvent {
  id: string;
  time: number;
  duration: number;
  station_of_first_arrival: string;
  event_type: EventType;
  note: string;
}
