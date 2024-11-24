import { FluentProvider } from '@fluentui/react-components';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import RequireDesktop from './components/Common/RequireDesktop';
import { useAppStore } from './stores/app';
import { themes } from './theme';

const App = () => {
  const { darkMode, theme, toggleTheme } = useAppStore();

  useEffect(() => {
    toggleTheme(theme);
  }, [theme, toggleTheme]);

  return (
    <FluentProvider theme={darkMode ? themes.defaultDark : themes.defaultLight} applyStylesToPortals>
      <RequireDesktop>
        <Outlet />
      </RequireDesktop>
    </FluentProvider>
  );
};

export default App;
