import React from 'react';
import { AppBarProps } from './AppBar.types';
import { renderAppBar } from './renderAppBar';
import { useAppBar } from './useAppBar';

export const AppBar: React.ForwardRefExoticComponent<AppBarProps & React.RefAttributes<HTMLElement>> = React.forwardRef(
  (props, ref: React.Ref<HTMLElement>) => {
    const state = useAppBar(props, ref);
    return renderAppBar(state);
  }
);
