export type SidebarTab = 'eventEditor' | 'filterToolbox';

export interface SidebarStore {
  visible: boolean;
  size: number;
  defaultSize: number;
  minSize: number;
  collapseSize: number;
  selectedTab: SidebarTab;
  setSelectedTab: (tab: SidebarTab) => void;
  setVisible: (visible: boolean) => void;
  setSize: (size: number) => void;
}
