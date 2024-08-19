import { EventType } from './event';

export interface SeismicityCount {
  timestamp: string;
  count: number;
}

export interface SeismicityData {
  event_type: EventType;
  data: SeismicityCount[];
}

export type Sampling = 'hour' | 'day' | 'week' | 'month' | 'year';
