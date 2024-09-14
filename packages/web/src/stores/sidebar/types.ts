export interface SidebarStore {
  visible: boolean;
  size: number;
  defaultSize: number;
  minSize: number;
  collapseSize: number;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  setVisible: (visible: boolean) => void;
  setSize: (size: number) => void;
}
