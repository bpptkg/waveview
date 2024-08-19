export type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';

export interface PeriodItem {
  value: number;
  unit: TimeUnit;
  label: string;
}
