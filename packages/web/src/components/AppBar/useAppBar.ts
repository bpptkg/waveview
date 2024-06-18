import React from 'react';
import { AppBarProps, AppBarState } from './AppBar.types';
import { TabContextValue } from './AppBarContext';
import { useAppBarStyles } from './useAppBarStyles';

export const useAppBar = (props: AppBarProps, ref: React.Ref<HTMLElement>): AppBarState => {
  const { vertical = true, selectedValue = 0, as = 'nav', children } = props;

  const styles = useAppBarStyles();

  const [selectedTab, setSelectedTab] = React.useState(selectedValue);
  const handleTabClick = (value: number) => {
    setSelectedTab(value);
  };

  const context: TabContextValue = {
    selected: selectedTab,
    handleTabClick,
  };

  return {
    root: as,
    children,
    vertical,
    styles,
    context,
    ref,
  };
};
