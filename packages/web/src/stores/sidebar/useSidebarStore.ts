import { create } from 'zustand';
import { createSelectors } from '../../shared/createSelectors';
import { SidebarStore } from './types';

const sidebarStore = create<SidebarStore>((set) => ({
  visible: false,
  size: 20,
  defaultSize: 20,
  minSize: 15,
  collapseSize: 5,
  selectedTab: 'eventEditor',
  setSelectedTab: (selectedTab) => set({ selectedTab }),
  setVisible: (visible) => set({ visible }),
  setSize: (size) => set({ size }),
}));

export const useSidebarStore = createSelectors(sidebarStore);
