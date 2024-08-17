import { EventType } from '../types/event';

export const defaultLight = '#ff3a30';
export const defaultDark = '#ff443a';

export function getEventTypeColor(eventType: EventType, darkMode: boolean): string {
  if (eventType.color_dark === undefined || eventType.color_light === undefined) {
    return darkMode ? defaultDark : defaultLight;
  }
  return darkMode ? eventType.color_dark : eventType.color_light;
}
