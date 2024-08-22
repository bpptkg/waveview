import { EventType } from '../types/event';

export const defaultLight = '#ff3a30';
export const defaultDark = '#ff443a';

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function getEventTypeColor(eventType: EventType, darkMode: boolean): string {
  if (isString(eventType.color_dark) && isString(eventType.color_light)) {
    return darkMode ? eventType.color_dark : eventType.color_light;
  }
  return darkMode ? defaultDark : defaultLight;
}
