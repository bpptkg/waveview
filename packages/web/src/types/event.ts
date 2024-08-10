export interface EventType {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description: string;
  color_light: string;
  color_dark: string;
  created_at: number;
  updated_at: number;
}

export interface SeismicEvent {
  id: string;
  time: number;
  duration: number;
  station_of_first_arrival: string;
  event_type: EventType;
  note: string;
}
