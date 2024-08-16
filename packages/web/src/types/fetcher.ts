import { SeismicEvent } from './event';

export interface EventRequestData {
  requestId: string;
  start: string;
  end: string;
  organizationId: string;
  catalogId: string;
  accessToken: string;
}

export interface EventResponseData {
  requestId: string;
  events: SeismicEvent[];
}
