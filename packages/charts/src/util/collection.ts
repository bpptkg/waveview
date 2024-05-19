/**
 * Binary search
 * @param table - the table search. must be sorted!
 * @param value - value to find
 * @param cmp
 * @private
 */
export function _lookup(
  table: number[],
  value: number,
  cmp?: (value: number) => boolean
): { lo: number; hi: number };
export function _lookup<T>(
  table: T[],
  value: number,
  cmp: (value: number) => boolean
): { lo: number; hi: number };
export function _lookup(
  table: unknown[],
  value: number,
  cmp?: (value: number) => boolean
) {
  cmp = cmp || ((index) => (table as number[])[index] < value);
  let hi = table.length - 1;
  let lo = 0;
  let mid: number;

  while (hi - lo > 1) {
    mid = (lo + hi) >> 1;
    if (cmp(mid)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return { lo, hi };
}

/**
 * Binary search
 * @param table - the table search. must be sorted!
 * @param key - property name for the value in each entry
 * @param value - value to find
 * @param last - lookup last index
 * @private
 */
export const _lookupByKey = (
  table: Record<string, number>[],
  key: string,
  value: number,
  last?: boolean
) =>
  _lookup(
    table,
    value,
    last
      ? (index) => {
          const ti = table[index][key];
          return (
            ti < value || (ti === value && table[index + 1][key] === value)
          );
        }
      : (index) => table[index][key] < value
  );

/**
 * Reverse binary search
 * @param table - the table search. must be sorted!
 * @param key - property name for the value in each entry
 * @param value - value to find
 * @private
 */
export const _rlookupByKey = (
  table: Record<string, number>[],
  key: string,
  value: number
) => _lookup(table, value, (index) => table[index][key] >= value);

/**
 * Return subset of `values` between `min` and `max` inclusive.
 * Values are assumed to be in sorted order.
 * @param values - sorted array of values
 * @param min - min value
 * @param max - max value
 */
export function _filterBetween(values: number[], min: number, max: number) {
  let start = 0;
  let end = values.length;

  while (start < end && values[start] < min) {
    start++;
  }
  while (end > start && values[end - 1] > max) {
    end--;
  }

  return start > 0 || end < values.length ? values.slice(start, end) : values;
}
