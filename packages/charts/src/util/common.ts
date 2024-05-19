import { AnyObject } from "../types/object";

/**
 * An empty function that can be used, for example, for optional callback.
 */
export function noop() {
  /* noop */
}

/**
 * Returns a unique id, sequentially generated from a global variable.
 */
export const uid = (() => {
  let id = 0;
  return () => id++;
})();

/**
 * Returns true if `value` is neither null nor undefined, else returns false.
 * @param value - The value to test.
 * @since 2.7.0
 */
export function isNullOrUndef(value: unknown): value is null | undefined {
  return value === null || typeof value === "undefined";
}

/**
 * Returns true if `value` is an array (including typed arrays), else returns false.
 * @param value - The value to test.
 * @function
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  if (Array.isArray && Array.isArray(value)) {
    return true;
  }
  const type = Object.prototype.toString.call(value);
  if (type.slice(0, 7) === "[object" && type.slice(-6) === "Array]") {
    return true;
  }
  return false;
}

/**
 * Returns true if `value` is an object (excluding null), else returns false.
 * @param value - The value to test.
 * @since 2.7.0
 */
export function isObject(value: unknown): value is AnyObject {
  return (
    value !== null &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
}

/**
 * Returns true if `value` is a finite number, else returns false
 * @param value  - The value to test.
 */
function isNumberFinite(value: unknown): value is number {
  return (
    (typeof value === "number" || value instanceof Number) && isFinite(+value)
  );
}
export { isNumberFinite as isFinite };

/**
 * Returns `value` if finite, else returns `defaultValue`.
 * @param value - The value to return if defined.
 * @param defaultValue - The value to return if `value` is not finite.
 */
export function finiteOrDefault(value: unknown, defaultValue: number) {
  return isNumberFinite(value) ? value : defaultValue;
}

/**
 * Returns `value` if defined, else returns `defaultValue`.
 * @param value - The value to return if defined.
 * @param defaultValue - The value to return if `value` is undefined.
 */
export function valueOrDefault<T>(value: T | undefined, defaultValue: T) {
  return typeof value === "undefined" ? defaultValue : value;
}

export const toPercentage = (value: number | string, dimension: number) =>
  typeof value === "string" && value.endsWith("%")
    ? parseFloat(value) / 100
    : +value / dimension;

export const toDimension = (value: number | string, dimension: number) =>
  typeof value === "string" && value.endsWith("%")
    ? (parseFloat(value) / 100) * dimension
    : +value;
