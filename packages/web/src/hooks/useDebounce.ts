import { useCallback, useEffect, useRef } from 'react';
import { debounce } from '../shared/debounce';

export const useDebounce = (fn: CallableFunction, delay: number) => {
  const ref = useRef<CallableFunction>();
  ref.current = fn;

  useEffect(() => {
    const debounced = debounce((...args: any[]) => ref.current?.(...args), delay);
    return () => debounced();
  }, [delay]);

  const wrapper = useCallback((...args: any[]) => ref.current?.(...args), []);
  return wrapper;
};
