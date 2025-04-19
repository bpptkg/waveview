import { ReactNode } from 'react';

export interface StatusBarStore {
  message: ReactNode;
  setMessage: (message: ReactNode) => void;
  clearMessage: () => void;
  showMessage: (message: ReactNode, duration?: number) => void;
}
