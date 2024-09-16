import React from 'react';
import { AppBarTabProps } from './AppBarTab.types';
import { useAppBarTab } from './useAppBarTab';
import { useAppBarTabStyles } from './useAppBarTabStyles';

export const AppBarTab: React.ForwardRefExoticComponent<AppBarTabProps & React.RefAttributes<HTMLElement>> = React.forwardRef(
  (props, ref: React.Ref<HTMLElement>) => {
    const state = useAppBarTab(props, ref);
    const styles = useAppBarTabStyles();

    const { onClick, context } = state;

    function handleTabClick() {
      if (state.disabled) {
        return;
      }
      if (selected) {
        return;
      }
      context?.handleTabClick(state.value);
      onClick?.();
    }

    const selected = state.selected;

    return (
      <state.root className={styles.root} onClick={handleTabClick}>
        {selected ? <state.icon className={styles.iconSelected} /> : <state.icon className={styles.icon} />}
        {!state.iconOnly && <state.content className={selected ? styles.contentSelected : styles.content}>{state.children}</state.content>}
        {selected && <state.indicator className={styles.indicator} />}
      </state.root>
    );
  }
);
