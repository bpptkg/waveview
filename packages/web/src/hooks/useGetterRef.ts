import { useRef } from 'react';

export function useGetterRef<T>(init: () => T) {
  const ref = useRef<T | null>(null);
  const getterRef = useRef(() => {
    if (ref.current === null) {
      ref.current = init();
    }
    return ref.current;
  });

  return [ref, getterRef.current] as const;
}
