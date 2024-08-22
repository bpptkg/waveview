import { formatDate } from '@waveview/charts';

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

export function formatTime(time: unknown, options: FormatTimeOptions = {}): string {
  const { useUTC = false, template = '{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}' } = options;
  if (typeof time === 'undefined' || time === null) {
    return '';
  }
  return formatDate(time, template, useUTC);
}

export function shortUUID(uuid: string): string {
  return uuid.slice(0, 8);
}
