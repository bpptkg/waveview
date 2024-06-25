import React from 'react';
import { TabValue } from './AppBarTab/AppBarTab.types';

export interface TabContextValue {
  selected: TabValue;
  handleTabClick: (value: TabValue) => void;
}

export const AppBarContext = React.createContext<TabContextValue | null>(null);
export const AppBarContextProvider = AppBarContext.Provider;
