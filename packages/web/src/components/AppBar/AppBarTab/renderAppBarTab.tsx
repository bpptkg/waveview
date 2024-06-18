import { AppBarTabState } from './AppBarTab.types';

export const renderAppBarTab = (state: AppBarTabState, styles: Record<string, string>) => {
  const { onClick, context } = state;

  function handleTabClick() {
    context?.handleTabClick(state.value as number);
    onClick?.();
  }

  const selected = state.value === state.context?.selected;

  return (
    <state.root className={styles.root} onClick={handleTabClick}>
      {selected ? <state.icon primaryFill={styles.primaryFill} /> : <state.icon />}
      {!state.iconOnly && <state.content className={styles.content}>{state.children}</state.content>}
      {selected && <state.indicator className={styles.indicator} />}
    </state.root>
  );
};
