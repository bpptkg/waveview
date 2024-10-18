import { BandpassFilterOptions, FilterOperationOptions, HighpassFilterOptions, LowpassFilterOptions } from '../types/filter';
import { formatTimezonedDate } from './time';

export interface FormatNumberOptions {
  precision?: number;
  unit?: string;
}

export function formatNumber(number: unknown, options: FormatNumberOptions = {}): string {
  const { precision, unit } = options;
  if (typeof number === 'number') {
    const isNumberFinite = Number.isFinite(number);
    const isNumberNaN = Number.isNaN(number);
    if (!isNumberFinite || isNumberNaN) {
      return '';
    }

    let numberFormatted = '';
    if (precision !== undefined) {
      numberFormatted = number.toFixed(precision);
    } else {
      numberFormatted = number.toString();
    }
    if (unit) {
      numberFormatted += `${unit}`;
    }
    return numberFormatted;
  }
  return '';
}

export interface FormatTimeOptions {
  useUTC?: boolean;
  template?: string;
}

export function formatTime(time: string | number | Date | undefined, options: FormatTimeOptions = {}): string {
  const { useUTC = false, template = 'yyyy-MM-dd HH:mm:ss.SSS' } = options;
  if (typeof time === 'undefined' || time === null) {
    return '';
  }
  return formatTimezonedDate(time, template, useUTC);
}

export function shortUUID(uuid: string | null | undefined): string {
  if (!uuid) {
    return '';
  }
  return uuid.slice(0, 8);
}

export function numberFormatterFactory(digits = 0) {
  return (v: number) => (isFinite(v) ? v.toFixed(digits) : '-');
}

export interface FormatFilterTextOptions {
  defaultText?: string;
}

export function formatFilterText(appliedFilter: FilterOperationOptions | null | undefined, options?: FormatFilterTextOptions): string {
  const { defaultText = '' } = options || {};
  if (!appliedFilter) {
    return defaultText;
  }
  let text = '';
  const { filterType, filterOptions } = appliedFilter;
  if (filterType === 'bandpass') {
    const bandpass = filterOptions as BandpassFilterOptions;
    text = `BP ${bandpass.freqmin}-${bandpass.freqmax} Hz order ${bandpass.order}`;
  } else if (filterType === 'lowpass') {
    const lowpass = filterOptions as LowpassFilterOptions;
    text = `LP ${lowpass.freq} Hz order ${lowpass.order}`;
  } else if (filterType === 'highpass') {
    const highpass = filterOptions as HighpassFilterOptions;
    text = `HP ${highpass.freq} Hz order ${highpass.order}`;
  }
  return text;
}
