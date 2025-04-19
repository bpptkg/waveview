import { create } from 'zustand';
import { createSelectors } from '../../shared/createSelectors';
import { StatusBarStore } from './types';
import { ReactNode } from 'react';

const statusBarStore = create<StatusBarStore>((set) => ({
  message: null,
  setMessage: (message: ReactNode) => set({ message }),
  clearMessage: () => set({ message: '' }),
  showMessage: (message: ReactNode, duration: number = 3000) => {
    set({ message });
    setTimeout(() => {
      set({ message: null });
    }, duration);
  },
}));

export const useStatusBarStore = createSelectors(statusBarStore);
