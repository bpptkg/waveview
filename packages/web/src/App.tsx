import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import RequireDesktop from './components/Common/RequireDesktop';
import WebSocketProvider from './components/WebSocket/WebSocketProvider';
import { useAppStore } from './stores/app';

const App = () => {
  const { darkMode, theme, toggleTheme } = useAppStore();

  useEffect(() => {
    toggleTheme(theme);
  }, [theme, toggleTheme]);

  return (
    <FluentProvider theme={darkMode ? webDarkTheme : webLightTheme} applyStylesToPortals>
      <RequireDesktop>
        <WebSocketProvider>
          <Outlet />
        </WebSocketProvider>
      </RequireDesktop>
    </FluentProvider>
  );
};

export default App;
