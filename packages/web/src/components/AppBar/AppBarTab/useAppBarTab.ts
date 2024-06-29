import React, { useContext } from 'react';
import { AppBarContext } from '../AppBarContext';
import { AppBarTabProps, AppBarTabState } from './AppBarTab.types';

export const useAppBarTab = (props: AppBarTabProps, ref: React.Ref<HTMLElement>): AppBarTabState => {
  const { value, disabled = false, icon, children, iconOnly = false, onClick } = props;
  const context = useContext(AppBarContext);
  let selected = false;
  if (context?.selected) {
    selected = context.selected.startsWith(value);
  }

  return {
    root: 'button',
    content: 'span',
    indicator: 'span',
    value,
    disabled,
    icon,
    children,
    iconOnly,
    context,
    onClick,
    ref,
    selected,
  };
};
