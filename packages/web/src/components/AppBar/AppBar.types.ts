import React from 'react';
import { TabContextValue } from './AppBarContext';
import { TabValue } from './AppBarTab/AppBarTab.types';

export interface AppBarProps {
  children?: React.ReactNode;
  as?: React.ElementType;
  vertical?: boolean;
  selectedValue?: TabValue;
}

export type AppBarState = AppBarProps & {
  root: React.ElementType;
  styles: Record<string, string>;
  context: TabContextValue;
  ref: React.Ref<HTMLElement>;
};
