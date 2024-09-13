import { EventEmitter } from '@waveview/zcharts';
import { SeismicEvent } from '../../types/event';

export interface SeismicEventRegistryMap {
  eventAdded: (event: SeismicEvent) => void;
  eventUpdated: (event: SeismicEvent) => void;
  eventRemoved: (eventId: string) => void;
}

export class SeismicEventRegistry {
  private events: SeismicEvent[] = [];
  private eventEmitter = new EventEmitter();
  silent = false;

  clear(): void {
    this.events.length = 0;
  }

  set(events: SeismicEvent[]): void {
    this.clear();
    this.events = events;
  }

  get(): SeismicEvent[] {
    return this.events;
  }

  addEvent(event: SeismicEvent): void {
    this.events.push(event);
    if (!this.silent) {
      this.emit('eventAdded', event);
    }
  }

  updateEvent(event: SeismicEvent): void {
    const index = this.events.findIndex((e) => e.id === event.id);
    if (index === -1) {
      return;
    }
    this.events[index] = event;
    if (!this.silent) {
      this.emit('eventUpdated', event);
    }
  }

  removeEvent(eventId: string): void {
    const index = this.events.findIndex((e) => e.id === eventId);
    if (index === -1) {
      return;
    }
    const event = this.events[index];
    this.events.splice(index, 1);
    if (!this.silent) {
      this.emit('eventRemoved', event.id);
    }
  }

  on<K extends keyof SeismicEventRegistryMap>(event: K, listener: SeismicEventRegistryMap[K]): void {
    this.eventEmitter.on(event, listener);
  }

  off<K extends keyof SeismicEventRegistryMap>(event: K, listener: SeismicEventRegistryMap[K]): void {
    this.eventEmitter.off(event, listener);
  }

  emit<K extends keyof SeismicEventRegistryMap>(event: K, ...args: Parameters<SeismicEventRegistryMap[K]>): void {
    this.eventEmitter.emit(event, ...args);
  }
}
