export interface TimeSegment {
  segment: number;
  maxPoints: number;
}

export interface TimeRange {
  start: number;
  end: number;
}

export type StorageLevel = number;

export type TimeVector = [number, number];

export const ONE_SECOND = 1000;
export const ONE_MINUTE = ONE_SECOND * 60;
export const ONE_HOUR = ONE_MINUTE * 60;
export const ONE_DAY = ONE_HOUR * 24;
export const ONE_YEAR = ONE_DAY * 365;
