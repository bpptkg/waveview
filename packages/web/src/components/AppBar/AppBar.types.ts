import React from 'react';
import { TabContextValue } from './AppBarContext';

export interface AppBarProps {
  children?: React.ReactNode;
  as?: React.ElementType;
  vertical?: boolean;
  selectedValue?: number;
}

export type AppBarState = AppBarProps & {
  root: React.ElementType;
  styles: Record<string, string>;
  context: TabContextValue;
  ref: React.Ref<HTMLElement>;
};
