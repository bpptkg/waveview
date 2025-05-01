import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createSelectors } from '../../shared/createSelectors';
import { THEME_KEY } from './constants';
import { AppStore, Theme } from './types';

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

const appStore = create<AppStore, [['zustand/devtools', never]]>(
  devtools((set, get) => ({
    darkMode: getInitialDarkMode(),
    theme: getInitialTheme(),
    currentLanguage: { value: 'en', label: 'English' },
    supportedLanguages: [{ value: 'en', label: 'English' }],
    useUTC: false,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    isActivityBarVisible: true,
    isFullScreen: document.fullscreenElement !== null,
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
    setLanguage: (language) => set({ currentLanguage: language }),
    setUseUTC: (useUTC) => set({ useUTC }),
    setIsActivityBarVisible: (isVisible) => set({ isActivityBarVisible: isVisible }),
    toggleActivityBar: () => set((state) => ({ isActivityBarVisible: !state.isActivityBarVisible })),
    toggleFullScreen: () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      set((state) => ({ isFullScreen: !state.isFullScreen }));
    },
  }))
);

export const useAppStore = createSelectors(appStore);
