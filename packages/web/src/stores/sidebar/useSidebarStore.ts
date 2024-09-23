import { create } from 'zustand';
import { createSelectors } from '../../shared/createSelectors';
import { SidebarStore } from './types';

const sidebarStore = create<SidebarStore>((set) => ({
  selectedTab: 'eventEditor',
  showSidebar: true,
  showHelicorder: true,
  setSelectedTab: (selectedTab) => set({ selectedTab }),
  setShowSidebar: (showSidebar) => set({ showSidebar }),
  setShowHelicorder: (showHelicorder) => set({ showHelicorder }),
}));

export const useSidebarStore = createSelectors(sidebarStore);
