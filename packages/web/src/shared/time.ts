import { SeismicEvent, SeismicEventDetail } from '../types/event';

export function getTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export const ONE_SECOND = 1_000;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const ONE_DAY = 24 * ONE_HOUR;

export function getPickExtent(event: SeismicEvent | SeismicEventDetail) {
  const start = new Date(event.time).getTime();
  const end = start + event.duration * ONE_SECOND;
  return [start, end];
}
