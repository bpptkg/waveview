import { useEffect } from 'react';

export const useUnmount = (callback: () => void) => {
  useEffect(() => {
    return () => {
      callback();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
