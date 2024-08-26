import { useRef } from 'react';

export function useLatest<T>(val: T) {
  const ref = useRef(val);
  ref.current = val;
  return ref;
}
