import { AppBarState } from './AppBar.types';
import { AppBarContextProvider } from './AppBarContext';

export const renderAppBar = (state: AppBarState) => {
  const { styles } = state;
  return (
    <state.root className={styles.root}>
      <AppBarContextProvider value={state.context}>{state.children}</AppBarContextProvider>
    </state.root>
  );
};
