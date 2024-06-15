export type Dictionary<T> = {
  [key: string]: T;
};

const protoKey = "__proto__";

export function reduce<T, S, Context>(
  arr: readonly T[],
  cb: (
    this: Context,
    previousValue: S,
    currentValue: T,
    currentIndex?: number,
    arr?: readonly T[]
  ) => S,
  memo: S,
  context?: Context
): S {
  for (let i = 0, len = arr.length; i < len; i++) {
    memo = cb.call(context!, memo, arr[i], i, arr);
  }
  return memo;
}

const TYPED_ARRAY: Record<string, boolean> = reduce(
  [
    "Int8",
    "Uint8",
    "Uint8Clamped",
    "Int16",
    "Uint16",
    "Int32",
    "Uint32",
    "Float32",
    "Float64",
  ],
  (obj, val) => {
    obj["[object " + val + "Array]"] = true;
    return obj;
  },
  {} as Record<string, boolean>
);

const objToString = Object.prototype.toString;

/**
 * Those data types can be cloned:
 *     Plain object, Array, TypedArray, number, string, null, undefined.
 * Those data types will be assigned using the original data:
 *     BUILTIN_OBJECT
 * Instance of user defined class will be cloned to a plain object, without
 * properties in prototype.
 * Other data types is not supported (not sure what will happen).
 *
 * Caution: do not support clone Date, for performance consideration.
 * (There might be a large number of date in `series.data`).
 * So date should not be modified in and out of echarts.
 */
export function clone<T>(source: T, map = new WeakMap()): T {
  if (source == null || typeof source !== "object") {
    return source;
  }

  if (map.has(source)) {
    return map.get(source);
  }

  let result: any;
  const typeStr = objToString.call(source);

  if (typeStr === "[object Array]") {
    result = [];
    map.set(source, result);
    for (let i = 0, len = (source as any[]).length; i < len; i++) {
      result[i] = clone((source as any[])[i], map);
    }
  } else if (TYPED_ARRAY[typeStr]) {
    const Ctor = source.constructor as typeof Float32Array;
    if (Ctor.from) {
      result = Ctor.from(source as unknown as ArrayLike<number>);
    } else {
      result = new Ctor((source as unknown as ArrayLike<number>).length);
      for (
        let i = 0, len = (source as unknown as ArrayLike<number>).length;
        i < len;
        i++
      ) {
        result[i] = (source as unknown as ArrayLike<number>)[i];
      }
    }
    map.set(source, result);
  } else {
    result = {};
    map.set(source, result);
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        result[key] = clone((source as { [key: string]: any })[key], map);
      }
    }
  }

  return result;
}

export function merge<T extends Dictionary<any>, S extends Dictionary<any>>(
  target: T,
  source: S,
  overwrite?: boolean
): T & S;
export function merge<T extends any, S extends any>(
  target: T,
  source: S,
  overwrite?: boolean
): T | S;
export function merge(target: any, source: any, overwrite?: boolean): any {
  // We should escapse that source is string
  // and enter for ... in ...
  if (!isObject(source) || !isObject(target)) {
    return overwrite ? clone(source) : target;
  }

  for (let key in source) {
    // Check if key is __proto__ to avoid prototype pollution
    if (source.hasOwnProperty(key) && key !== protoKey) {
      const targetProp = target[key];
      const sourceProp = source[key];

      if (
        isObject(sourceProp) &&
        isObject(targetProp) &&
        !isArray(sourceProp) &&
        !isArray(targetProp) &&
        !isDom(sourceProp) &&
        !isDom(targetProp) &&
        !isPrimitive(sourceProp) &&
        !isPrimitive(targetProp)
      ) {
        merge(targetProp, sourceProp, overwrite);
      } else if (overwrite || !(key in target)) {
        target[key] = clone(source[key]);
      }
    }
  }

  return target;
}

const primitiveKey = "__wv_primitive__";

export function isPrimitive(obj: any): boolean {
  return obj[primitiveKey];
}

export function isArray(value: any): value is any[] {
  if (Array.isArray) {
    return Array.isArray(value);
  }
  return objToString.call(value) === "[object Array]";
}

export function isFunction(value: any): value is Function {
  return typeof value === "function";
}

export function isString(value: any): value is string {
  // Faster than `objToString.call` several times in chromium and webkit.
  // And `new String()` is rarely used.
  return typeof value === "string";
}

export function isStringSafe(value: any): value is string {
  return objToString.call(value) === "[object String]";
}

export function isNumber(value: any): value is number {
  // Faster than `objToString.call` several times in chromium and webkit.
  // And `new Number()` is rarely used.
  return typeof value === "number";
}

// Usage: `isObject(xxx)` or `isObject(SomeType)(xxx)`
// Generic T can be used to avoid "ts type gruards" casting the `value` from its original
// type `Object` implicitly so that loose its original type info in the subsequent code.
export function isObject<T = unknown>(value: T): value is object & T {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  const type = typeof value;
  return type === "function" || (!!value && type === "object");
}

export function isTypedArray(value: any): boolean {
  return !!TYPED_ARRAY[objToString.call(value)];
}

export function isDom(value: any): value is HTMLElement {
  return (
    typeof value === "object" &&
    typeof value.nodeType === "number" &&
    typeof value.ownerDocument === "object"
  );
}
