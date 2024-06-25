import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createSelectors } from '../shared/createSelectors';

export type Theme = 'light' | 'dark' | 'system';

export type AppState = {
  darkMode: boolean;
  theme: Theme;
  toggleTheme: (theme: Theme) => void;
};

const THEME_KEY = 'wv:theme';

function getInitialTheme(): Theme {
  const theme = localStorage.getItem(THEME_KEY) as Theme | null;
  if (theme === 'light' || theme === 'dark' || theme === 'system') {
    return theme;
  }
  return 'system';
}

function getInitialDarkMode(): boolean {
  const theme = getInitialTheme();
  if (theme === 'light') {
    return false;
  } else if (theme === 'dark') {
    return true;
  } else if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
}

const appStore = create<AppState, [['zustand/devtools', never]]>(
  devtools((set, get) => ({
    darkMode: getInitialDarkMode(),
    theme: getInitialTheme(),
    toggleTheme: (theme?: Theme) => {
      if (!theme) {
        theme = theme ?? get().theme;
      }
      localStorage.setItem(THEME_KEY, theme);
      set({ theme });

      let darkMode = false;
      if (theme === 'light') {
        darkMode = false;
      } else if (theme === 'dark') {
        darkMode = true;
      } else if (theme === 'system') {
        darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      set({ darkMode });

      if (darkMode) {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    },
  }))
);

export const useAppStore = createSelectors(appStore);
