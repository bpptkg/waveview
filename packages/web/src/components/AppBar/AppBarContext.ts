import React from 'react';

export interface TabContextValue {
  selected: number;
  handleTabClick: (value: number) => void;
}

export const AppBarContext = React.createContext<TabContextValue | null>(null);
export const AppBarContextProvider = AppBarContext.Provider;
