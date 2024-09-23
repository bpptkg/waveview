export type SidebarTab = 'eventEditor' | 'filterToolbox';

export interface SidebarStore {
  selectedTab: SidebarTab;
  showSidebar: boolean;
  showHelicorder: boolean;
  setSelectedTab: (tab: SidebarTab) => void;
  setShowSidebar: (showSidebar: boolean) => void;
  setShowHelicorder: (showHelicorder: boolean) => void;
}
