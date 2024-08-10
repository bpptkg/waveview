import { EventType } from '../../types/event';

export interface EventTypeStore {
  eventTypes: EventType[];
  fetchEventTypes: () => Promise<void>;
}
