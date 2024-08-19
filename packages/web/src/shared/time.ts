import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
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

export function formatTimezonedDate(date: number, template: string, useUTC: boolean): string {
  return useUTC ? formatInTimeZone(date, 'UTC', template) : format(date, template);
}
