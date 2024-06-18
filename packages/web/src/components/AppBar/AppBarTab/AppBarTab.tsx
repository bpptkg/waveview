import React from 'react';
import { AppBarTabProps } from './AppBarTab.types';
import { renderAppBarTab } from './renderAppBarTab';
import { useAppBarTab } from './useAppBarTab';
import { useAppBarTabStyles } from './useAppBarTabStyles';

export const AppBarTab: React.ForwardRefExoticComponent<AppBarTabProps & React.RefAttributes<HTMLElement>> = React.forwardRef(
  (props, ref: React.Ref<HTMLElement>) => {
    const state = useAppBarTab(props, ref);
    const styles = useAppBarTabStyles(state)
    return renderAppBarTab(state, styles);
  }
);
