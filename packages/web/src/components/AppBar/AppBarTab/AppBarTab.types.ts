import React from 'react';
import { TabContextValue } from '../AppBarContext';
import { FluentIcon } from '@fluentui/react-icons';

export type TabValue = string;

export interface AppBarTabProps {
  value: TabValue;
  icon: FluentIcon;
  disabled?: boolean;
  children?: React.ReactNode;
  iconOnly?: boolean;
  onClick?: () => void;
}

export type AppBarTabSlots = {
  root: React.ElementType;
  content: React.ElementType;
  indicator: React.ElementType;
  context: TabContextValue | null;
  ref: React.Ref<HTMLElement>;
  selected: boolean;
};

export type AppBarTabState = AppBarTabSlots & AppBarTabProps;
